import socket from './WebSocketService';

let context: AudioContext | null = null;
let micStream: MediaStream | null = null;
let workletNode: AudioWorkletNode | null = null;

async function startAudioWorklet(): Promise<AudioContext | null> {
    try {
        context = new AudioContext({ sampleRate: 16000 });
        await context.audioWorklet.addModule('/Worklets/audio-processor.js');

        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const micSource = context.createMediaStreamSource(micStream);

        workletNode = new AudioWorkletNode(context, 'audio-processor');
        workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
            const arrayBuffer = event.data;
            socket.emit('audio', arrayBuffer);
        };

        micSource.connect(workletNode);
        workletNode.connect(context.destination);

        return context;
    } catch (err) {
        console.error('Error in startAudioWorklet:', err);
        throw err;
    }
}

function stopAudioWorklet(): void {
    try {
        if (workletNode) {
            workletNode.disconnect();
            workletNode = null;
        }
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
            micStream = null;
        }
        if (context) {
            context.close();
            context = null;
        }
    } catch (err) {
        console.error('Error in stopAudioWorklet:', err);
        throw err;
    }
}

export { startAudioWorklet, stopAudioWorklet };
