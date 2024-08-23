import os
import threading
from flask import Flask, request
from flask_socketio import SocketIO
from flask_cors import CORS
from dotenv import load_dotenv
from Services.transcription import TranscriptionHandler

load_dotenv()

backend_port = os.getenv('BACKEND_PORT')
frontend_url = os.path.expandvars(os.getenv('FRONTEND_URL'))

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": frontend_url}})
socketio = SocketIO(app, cors_allowed_origins=frontend_url)

transcription_handler = TranscriptionHandler(socketio)

@socketio.on('connect')
def on_connect():
    print('Client connected')

@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')

@socketio.on('audio')
def on_audio(data):
    transcription_handler.handle_audio(data)

@app.route('/')
def index():
    return "Confucious Backend"

if __name__ == '__main__':
    print("Starting server, please wait...")
    recorder_thread_instance = threading.Thread(target=transcription_handler.recorder_thread)
    recorder_thread_instance.start()
    transcription_handler.recorder_ready.wait()

    print("Server started. Press Ctrl+C to stop the server.")
    socketio.run(app, host='0.0.0.0', port=backend_port)
