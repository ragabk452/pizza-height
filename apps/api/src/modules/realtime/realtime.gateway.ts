import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
import type { UserRole } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

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

// Which staff roles are allowed to join each protected room.
const STAFF_ROOM_ROLES: Record<string, UserRole[]> = {
  admin: ['ADMIN', 'MANAGER'],
  kitchen: ['ADMIN', 'MANAGER', 'KITCHEN'],
};
const STAFF_ROOMS = new Set(Object.keys(STAFF_ROOM_ROLES));

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

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

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
  // notes/order content, so they require a verified staff JWT via the
  // `staff:join` event below.
  private static readonly MAX_ROOMS_PER_SOCKET = 20;

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ): { joined: string } | { error: string } {
    if (typeof room !== 'string' || room.length === 0 || room.length > 80) {
      return { error: 'Invalid room' };
    }
    if (STAFF_ROOMS.has(room)) {
      return { error: 'Use staff:join with a valid token to join staff rooms' };
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

  /**
   * Authenticated staff-room subscription. Payload: { token, room }.
   * Verifies the JWT, checks `type === 'staff'`, and confirms the user's
   * role is allowed for the requested room before joining.
   */
  @SubscribeMessage('staff:join')
  async handleStaffJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { token?: string; room?: string },
  ): Promise<{ joined: string } | { error: string }> {
    if (
      !payload ||
      typeof payload.token !== 'string' ||
      typeof payload.room !== 'string'
    ) {
      return { error: 'Invalid payload (expected { token, room })' };
    }
    if (!STAFF_ROOMS.has(payload.room)) {
      return { error: `Unknown staff room "${payload.room}"` };
    }
    let decoded: JwtPayload;
    try {
      decoded = await this.jwt.verifyAsync<JwtPayload>(payload.token);
    } catch {
      return { error: 'Invalid or expired token' };
    }
    if (decoded.type !== 'staff' || !decoded.role) {
      return { error: 'Staff authentication required' };
    }
    const allowedRoles = STAFF_ROOM_ROLES[payload.room];
    if (!allowedRoles.includes(decoded.role as UserRole)) {
      return { error: `Your role cannot join "${payload.room}"` };
    }
    // Re-check the DB so a deactivated / soft-deleted staff member can't
    // keep snooping room broadcasts on a still-valid (un-rotated) access
    // token. Mirrors what `JwtStrategy.validate()` does on the REST side.
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, isActive: true, deletedAt: true, role: true },
    });
    if (!user || !user.isActive || user.deletedAt) {
      return { error: 'Account inactive or removed' };
    }
    if (!allowedRoles.includes(user.role)) {
      // Role changed since the token was issued — refuse and let them
      // re-login to pick up the new permissions.
      return { error: `Your role cannot join "${payload.room}"` };
    }
    void client.join(payload.room);
    return { joined: payload.room };
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
