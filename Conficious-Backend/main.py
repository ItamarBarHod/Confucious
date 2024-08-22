import asyncio
import threading
import numpy as np
from scipy.signal import resample
import json
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from RealtimeSTT import AudioToTextRecorder

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")

recorder = None
recorder_ready = threading.Event()
client_websocket = None

# global event loop for main thread
main_loop = asyncio.get_event_loop()

async def send_to_client(message):
    if client_websocket:
        await client_websocket.send(message)

def text_detected(text):
    asyncio.run_coroutine_threadsafe(
        send_to_client(
            json.dumps({
                'type': 'realtime',
                'text': text
            })
        ),
        main_loop
    )
    print(f"\r{text}", flush=True, end='')

recorder_config = {
    'spinner': False,
    'use_microphone': False,
    'model': 'large-v2',
    'language': 'en',
    'silero_sensitivity': 0.4,
    'webrtc_sensitivity': 2,
    'post_speech_silence_duration': 0.7,
    'min_length_of_recording': 0,
    'min_gap_between_recordings': 0,
    'enable_realtime_transcription': True,
    'realtime_processing_pause': 0,
    'realtime_model_type': 'tiny.en',
    'on_realtime_transcription_stabilized': text_detected,
}

def recorder_thread():
    global recorder
    print("Initializing RealtimeSTT...")
    
    # new event loop for this thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    recorder = AudioToTextRecorder(**recorder_config)
    print("RealtimeSTT initialized")
    recorder_ready.set()

    while True:
        try:
            full_sentence = recorder.text()
            asyncio.run_coroutine_threadsafe(
                send_to_client(
                    json.dumps({
                        'type': 'fullSentence',
                        'text': full_sentence
                    })
                ),
                loop
            )
            print(f"\rSentence: {full_sentence}")
        except Exception as e:
            print(f"Error during transcription: {e}")

def decode_and_resample(audio_data, original_sample_rate, target_sample_rate):
    audio_np = np.frombuffer(audio_data, dtype=np.int16)
    num_original_samples = len(audio_np)
    num_target_samples = int(num_original_samples * target_sample_rate / original_sample_rate)
    resampled_audio = resample(audio_np, num_target_samples)
    return resampled_audio.astype(np.int16).tobytes()

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('audio')
def handle_audio(data):
    if not recorder_ready.is_set():
        print("Recorder not ready")
        return
    recorder.feed_audio(data)

@app.route('/')
def index():
    return "Server is running"

if __name__ == '__main__':
    print("Starting server, please wait...")
    recorder_thread_instance = threading.Thread(target=recorder_thread)
    recorder_thread_instance.start()
    recorder_ready.wait()

    print("Server started. Press Ctrl+C to stop the server.")
    socketio.run(app, host='0.0.0.0', port=5001)
