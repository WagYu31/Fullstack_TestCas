import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Notifications WebSocket Gateway
 * Handles real-time notification delivery to connected clients.
 *
 * When migrating to microservices:
 * - This becomes a standalone WebSocket service
 * - Connected to Redis adapter for multi-instance support
 */
@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
    namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationsGateway.name);
    private connectedUsers = new Map<string, string[]>(); // userId → socketIds[]

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token =
                client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                this.logger.warn(`🔌 Client ${client.id} disconnected: no token`);
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_SECRET'),
            });

            const userId = payload.sub;
            client.data.userId = userId;

            // Join user-specific room
            client.join(`user:${userId}`);

            // Join role-specific room
            if (payload.role === 'ADMIN') {
                client.join('admins');
            }

            // Track connected users
            const sockets = this.connectedUsers.get(userId) || [];
            sockets.push(client.id);
            this.connectedUsers.set(userId, sockets);

            this.logger.log(`🔌 Connected: ${userId} (socket: ${client.id}, total: ${this.connectedUsers.size} users)`);
        } catch (error) {
            this.logger.warn(`🔌 Client ${client.id} disconnected: invalid token`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data?.userId;
        if (userId) {
            const sockets = this.connectedUsers.get(userId) || [];
            const filtered = sockets.filter((id) => id !== client.id);
            if (filtered.length === 0) {
                this.connectedUsers.delete(userId);
            } else {
                this.connectedUsers.set(userId, filtered);
            }
            this.logger.log(`🔌 Disconnected: ${userId} (socket: ${client.id})`);
        }
    }

    /**
     * Send notification to a specific user (all their connected devices)
     */
    sendToUser(userId: string, notification: any) {
        this.server.to(`user:${userId}`).emit('new-notification', notification);
        this.logger.log(`📡 Sent to user ${userId}: ${notification.title}`);
    }

    /**
     * Send notification to all admins
     */
    sendToAdmins(notification: any) {
        this.server.to('admins').emit('new-notification', notification);
        this.logger.log(`📡 Broadcast to admins: ${notification.title}`);
    }

    /**
     * Get count of online users
     */
    getOnlineCount(): number {
        return this.connectedUsers.size;
    }
}
