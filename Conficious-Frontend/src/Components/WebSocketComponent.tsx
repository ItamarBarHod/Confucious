import React, { useState } from 'react';
import socket from '../Services/WebSocketService';
import { Box, Grid, Typography, Button } from '@mui/material';

// Add the AudioWorklet setup function
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
        throw err; // Rethrow to handle in component
    }
}

const AudioRecorder: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

    const startRecording = async () => {
        try {
            const context = await startAudioWorklet();
            setAudioContext(context);
            setIsRecording(true);
        } catch (err) {
            console.error('Error starting audio worklet', err);
        }
    };

    const stopRecording = () => {
        if (audioContext) {
            audioContext.close();
            setAudioContext(null);
        }
        setIsRecording(false);
    };

    return (
        <div>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" onClick={startRecording} disabled={isRecording}>
                    Start Recording
                </Button>
                <Button variant="contained" onClick={stopRecording} disabled={!isRecording}>
                    Stop Recording
                </Button>
            </Box>
            <Grid container spacing={2} sx={{ marginTop: 10 }}>
                <Grid item xs={6}>
                    <Box
                        sx={{
                            width: '100%',
                            height: '200px',
                            backgroundColor: 'lightgray',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                        }}
                    >
                        <Typography variant="h6">Text in Box 1</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box
                        sx={{
                            width: '100%',
                            height: '200px',
                            backgroundColor: 'lightgray',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                        }}
                    >
                        <Typography variant="h6">Text in Box 2</Typography>
                    </Box>
                </Grid>
            </Grid>

        </div>
    );
};

export default AudioRecorder;
