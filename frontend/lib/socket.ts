import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Get or create Socket.IO client connection
 * Connects to the /notifications namespace with JWT auth
 */
export function getSocket(): Socket | null {
    if (socket?.connected) return socket;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return null;

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

    socket = io(`${backendUrl}/notifications`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
        console.log('🔌 WebSocket connected');
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('🔌 WebSocket error:', error.message);
    });

    return socket;
}

/**
 * Disconnect WebSocket (call on logout)
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
