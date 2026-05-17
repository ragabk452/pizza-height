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

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
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
  // a status string. Staff rooms ("admin", "kitchen") are joined via the
  // same channel for now.
  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ): { joined: string } | { error: string } {
    if (typeof room !== 'string' || room.length === 0 || room.length > 80) {
      return { error: 'Invalid room' };
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
