import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    timeout: 1000,
});

socket.on('connect', () => {
    console.log('Connected to WebSocket server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
});

socket.on('connect_error', (err) => {
    console.error('WebSocket connection error:', err);
});

export default socket;