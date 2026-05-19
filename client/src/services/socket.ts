import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

class SocketService {
    private socket: Socket | null = null;

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            
            this.joinUserRoom();
        });

        this.socket.on('disconnect', () => {
            
        });
    }

    joinUserRoom() {
        const storedUser = localStorage.getItem('user');
        if (storedUser && this.socket) {
            try {
                const user = JSON.parse(storedUser);
                if (user.id) {
                    
                    this.socket.emit('join:user', user.id);
                }
            } catch (err) {
                console.error('Failed to parse user for socket room:', err);
            }
        }
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.socket) this.connect();
        this.socket?.on(event, callback);
    }

    off(event: string, callback: (data: any) => void) {
        this.socket?.off(event, callback);
    }

    emit(event: string, data: any) {
        if (!this.socket) this.connect();
        this.socket?.emit(event, data);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
