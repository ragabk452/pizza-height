import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export const RealtimeEvents = {
  OrderCreated: 'order.created',
  OrderUpdated: 'order.updated',
  OrderStatusChanged: 'order.statusChanged',
  MenuItemUnavailable: 'menuItem.unavailable',
} as const;

// Decorator metadata is evaluated at import time, before ConfigModule loads
// .env. In dev that means we fall back to the local origins; in production
// CORS_ORIGINS is supposed to be set externally (Docker env, systemd, etc.)
// and will be picked up here. Browsers reject `origin: '*'` paired with
// `credentials: true`, and a wildcard also lets any site connect and snoop
// on the kitchen/admin broadcasts.
const SOCKET_CORS_ORIGINS = (
  process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3001'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

@WebSocketGateway({
  cors: { origin: SOCKET_CORS_ORIGINS, credentials: true },
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  afterInit() {
    this.logger.log('🛰️  Realtime gateway initialized at /realtime');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  // Customer tracking pages subscribe to `order:{orderId}` so they receive
  // status updates without authenticating the socket itself. Authorization
  // is enforced on the REST side — the worst a guesser could do is observe
  // a status string. Staff rooms ("admin", "kitchen") expose customer
  // notes/order content, so they're protected: only the API itself broadcasts
  // to them, and we refuse browser-side `join` for those rooms.
  // (Real staff socket auth lands in Sprint 5 with the admin app.)
  private static readonly STAFF_ROOMS = new Set(['admin', 'kitchen']);
  private static readonly MAX_ROOMS_PER_SOCKET = 20;

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ): { joined: string } | { error: string } {
    if (typeof room !== 'string' || room.length === 0 || room.length > 80) {
      return { error: 'Invalid room' };
    }
    if (RealtimeGateway.STAFF_ROOMS.has(room)) {
      return { error: 'Staff rooms are not joinable from the client' };
    }
    // `client.rooms` always contains the socket's own id, so the cap is +1.
    if (client.rooms.size > RealtimeGateway.MAX_ROOMS_PER_SOCKET) {
      return { error: 'Room subscription limit reached' };
    }
    void client.join(room);
    return { joined: room };
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ): { left: string } {
    void client.leave(room);
    return { left: room };
  }

  /** Broadcast to a specific room (e.g. "kitchen", "admin"). */
  broadcastToRoom(room: string, event: string, payload: unknown) {
    this.server.to(room).emit(event, payload);
  }

  /** Broadcast to all connected clients. */
  broadcast(event: string, payload: unknown) {
    this.server.emit(event, payload);
  }
}
