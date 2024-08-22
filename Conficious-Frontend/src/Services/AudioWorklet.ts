import socket from './WebSocketService';

async function startAudioWorklet() {
    try {
        const context = new AudioContext({ sampleRate: 16000 });
        await context.audioWorklet.addModule('/Worklets/audio-processor.js');

        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const micSource = context.createMediaStreamSource(micStream);

        const workletNode = new AudioWorkletNode(context, 'audio-processor');
        workletNode.port.onmessage = (event) => {
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

export default startAudioWorklet;
