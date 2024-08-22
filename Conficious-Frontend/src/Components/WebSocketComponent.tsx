import { useEffect, useState } from 'react';
import startAudioWorklet from '../Services/AudioWorklet';
import socket from '../Services/WebSocketService';

const WebSocketComponent: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleStart = async () => {
        try {
            await startAudioWorklet();
            console.log('Audio Worklet started');
        } catch (e) {
            setError('Error starting audio worklet');
            console.error(e);
        }
    };

    const [connected, setConnected] = useState<boolean>(false);

    useEffect(() => {
        socket.on('connect', () => {
            console.log("Socket.IO connected");
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log("Socket.IO disconnected");
            setConnected(false);
        });

        socket.on('realtime', (data: any) => {
            setText(data.text);
            console.log("Realtime:", data.text);
        });

        socket.on('fullSentence', (data: any) => {
            setText(data.text);
            console.log("Full Sentence:", data.text);
        });

        socket.on('connect_error', (err) => {
            setError('Socket.IO connection error');
            console.error('Socket.IO connection error:', err);
        });

        socket.on('connect_timeout', () => {
            setError('Socket.IO connection timeout');
            console.error('Socket.IO connection timeout');
        });

        return () => {
            socket.off('realtime');
            socket.off('fullSentence');
            socket.off('connect_error');
            socket.off('connect_timeout');
        };
    }, []);


    return (
        <div>
            <button onClick={handleStart}>Start Audio</button>
            <div id="textDisplay">{text}</div>
            {error && <div>{error}</div>}
        </div>
    );
};

export default WebSocketComponent;
