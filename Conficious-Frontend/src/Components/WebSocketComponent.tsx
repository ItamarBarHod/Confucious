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
    const [aiOutput, setAiOutput] = useState(''); // Add state for AI output text

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

    const saveText = () => {
        const element = document.createElement("a");
        const file = new Blob([aiOutput], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "AI_Output.txt";
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div style={{ minHeight: '100vh', padding: '16px' }}>
            <Typography
                variant="h3"
                align="center"
                style={{
                    marginBottom: 8,
                    color: 'royalblue',
                    fontWeight: 'bold'
                }}
            >
                Confucius
            </Typography>
            <Typography
                variant="h6"
                align="center"
                style={{
                    marginBottom: 16,
                    color: 'gray',
                    fontStyle: 'italic'
                }}
            >
                AI Powered Confusion Helper
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" onClick={startRecording} disabled={isRecording}>
                    Start Recording
                </Button>
                <Button variant="contained" onClick={stopRecording} disabled={!isRecording}>
                    Stop Recording
                </Button>
            </Box>
            <Grid container spacing={2} sx={{ marginTop: 10, justifyContent: 'center' }}>
                <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: '80%',
                            height: '150px',
                            backgroundColor: '#eeeee4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            border: '2px solid #eeeee4',
                            marginBottom: '16px'
                        }}
                    >
                        <Typography variant="h6">Input from Sound stream</Typography>
                    </Box>
                    <Box
                        sx={{
                            width: '80%',
                            height: '250px',
                            backgroundColor: '#eeeee4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            border: '2px solid #eeeee4',
                            position: 'relative'
                        }}
                    >
                        <Typography variant="h6">Output from AI</Typography>
                        <Button 
                            variant="contained" 
                            onClick={saveText} 
                            sx={{ 
                                position: 'absolute', 
                                bottom: 10, 
                                right: 10 
                            }}
                        >
                            Save Text
                        </Button>
                    </Box>
                </Grid>
            </Grid>
            {isRecording && <div className="flashing-light" />} {/* Add flashing light */}
        </div>
    );
};

export default AudioRecorder;
