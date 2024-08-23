import { useEffect, useState } from 'react';
import { Button, Typography, Box, Alert, Divider } from '@mui/material';
import startAudioWorklet from '../Services/AudioWorklet';
import socket from '../Services/WebSocketService';

const WebSocketComponent: React.FC = () => {
    const [sentences, setSentences] = useState<string[]>([]);
    const [questions, setQuestions] = useState<{ text: string, timestamp: string, answer: string }[]>([]);
    const [error, setError] = useState<string>('');
    const [connected, setConnected] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<string>('00:00');

    const handleStart = async () => {
        try {
            await startAudioWorklet();
            setIsRecording(true);
            setStartTime(Date.now());
            setElapsedTime('00:00');
            console.log('Audio Worklet started');
        } catch (e) {
            setError('Error starting audio worklet');
            console.error(e);
        }
    };

    const handleStop = () => {
        setIsRecording(false);
        setStartTime(null);
        console.log('Audio Worklet stopped');
    };

    useEffect(() => {
        if (isRecording && startTime !== null) {
            const timer = setInterval(() => {
                const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
                const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
                const seconds = (timeElapsed % 60).toString().padStart(2, '0');
                setElapsedTime(`${minutes}:${seconds}`);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isRecording, startTime]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Socket.IO connected');
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket.IO disconnected');
            setConnected(false);
        });

        socket.on('audio', (data: string) => {
            try {
                const parsedData = JSON.parse(data);
                console.log(parsedData);
                if (parsedData.type === 'fullSentence') {
                    setSentences((prevSentences) => [...prevSentences, parsedData.text]);
                    console.log('Received full sentence:', parsedData.text);
                }
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        });

        socket.on('question', (data: string) => {
            try {
                const parsedData = JSON.parse(data);
                console.log('Received question:', parsedData.text);
                setQuestions((prevQuestions) => [
                    ...prevQuestions,
                    { text: parsedData.text, timestamp: elapsedTime, answer: '' }
                ]);
            } catch (e) {
                console.error('Error parsing question message:', e);
            }
        });

        socket.on('answer', (data: string) => {
            try {
                const parsedData = JSON.parse(data);
                console.log('Received answer chunk:', parsedData.text);

                setQuestions((prevQuestions) => {
                    const updatedQuestions = [...prevQuestions];
                    if (updatedQuestions.length > 0) {
                        const lastAnswerIndex = updatedQuestions.length - 1;
                        const lastAnswer = updatedQuestions[lastAnswerIndex].answer.trim();
                        const newAnswerText = parsedData.text.trim();
                        if (!lastAnswer.endsWith(newAnswerText)) {
                            updatedQuestions[lastAnswerIndex].answer += newAnswerText + ' ';
                        }
                    }
                    return updatedQuestions;
                });
            } catch (e) {
                console.error('Error parsing answer message:', e);
            }
        });

        return () => {
            socket.off('audio');
            socket.off('question');
            socket.off('answer');
        };
    }, [elapsedTime]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '1500px', justifyContent: 'space-between' }}>
                <Box sx={{
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: 2,
                    padding: 2,
                    width: '70%',
                    backdropFilter: 'blur(10px)',
                    overflow: 'auto',
                    height: '75vh',
                    marginRight: 2,
                }}>
                    <Typography variant="h6">Lecture Transcription:</Typography>
                    <Divider />
                    <Box>
                        {sentences.map((sentence, index) => (
                            <Typography key={index} variant="body1">{sentence}</Typography>
                        ))}
                    </Box>
                </Box>
                <Box sx={{
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: 2,
                    padding: 2,
                    width: '70%',
                    backdropFilter: 'blur(10px)',
                    overflow: 'auto',
                    height: '75vh',
                    marginLeft: 2
                }}>
                    <Typography variant="h6">Detected Questions:</Typography>
                    <Divider />
                    <Box>
                        {questions.map((question, index) => (
                            <Box key={index} mt={2}>
                                <Typography variant="body1">
                                    <strong>Question:</strong> {question.text}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Timestamp:</strong> {question.timestamp}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Answer:</strong> {question.answer}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Centered Box containing Elapsed Time and Buttons */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 2
            }}>
                <Box sx={{
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: 2,
                    padding: 2,
                    alignItems: 'center',
                }}>
                    <Typography variant="body1" sx={{ marginBottom: 1, textAlign: 'center' }}>Elapsed Time: {elapsedTime}</Typography>
                    <Button onClick={handleStart} variant="contained" color="primary" disabled={isRecording} sx={{ margin: 1 }}>
                        Start Recording
                    </Button>
                    <Button onClick={handleStop} variant="contained" color="secondary" disabled={!isRecording} sx={{ margin: 1 }}>
                        Stop Recording
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ position: 'absolute', bottom: 16, left: 16 }}>{error}</Alert>}
        </Box>
    );



};

export default WebSocketComponent;
