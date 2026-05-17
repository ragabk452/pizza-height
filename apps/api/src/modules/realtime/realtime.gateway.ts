import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
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

  /** Broadcast to a specific room (e.g. "kitchen", "admin"). */
  broadcastToRoom(room: string, event: string, payload: unknown) {
    this.server.to(room).emit(event, payload);
  }

  /** Broadcast to all connected clients. */
  broadcast(event: string, payload: unknown) {
    this.server.emit(event, payload);
  }
}
