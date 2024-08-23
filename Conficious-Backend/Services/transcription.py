import asyncio
import threading
import json
from datetime import datetime
from RealtimeSTT import AudioToTextRecorder
from ollama import AsyncClient
import re

accumulated_sentences = []

class TranscriptionHandler:
    def __init__(self, socketio):
        self.socketio = socketio
        self.recorder = None
        self.recorder_ready = threading.Event()
        self.loop = asyncio.get_event_loop()
        self.recorder_config = {
            'spinner': False,
            'use_microphone': False,
            'model': 'medium',
            'language': 'en',
            'silero_sensitivity': 0.4,
            'webrtc_sensitivity': 2,
            'post_speech_silence_duration': 0.3,
            'min_length_of_recording': 0,
            'min_gap_between_recordings': 0,
            'enable_realtime_transcription': True,
            'realtime_processing_pause': 0,
            'realtime_model_type': 'tiny.en',
            'on_realtime_transcription_stabilized': self.text_detected,
        }

    async def emit_to_client(self, event, message):
        if self.socketio:
            self.socketio.emit(event, message)

    def text_detected(self, text):
        accumulated_sentences.append(text)
        future = asyncio.run_coroutine_threadsafe(
            self.emit_to_client(
                'audio',
                json.dumps({
                    'type': 'realtime',
                    'text': text
                })
            ),
            self.loop
        )
        future.result()
        print(f"Message sent: {text}")

    async def check_question_and_respond(self, full_sentence):
        message = {
            'role': 'user',
            'content': (f"Please analyze the following sentence and determine if it is a direct question that requires an answer. "
                        f"Your response should be exactly 'Yes' if it is a question or 'No' if it is not. "
                        f"If the sentence is rhetorical, unrelated, or cannot be answered, respond with 'No'. "
                        f"Do not provide any additional text or explanation. The sentence is: {full_sentence}")
        }
        try:
            response = await AsyncClient().chat(model='llama3.1', messages=[message], stream=False)
            response_content = response.get('message', {}).get('content', '').strip()
            cleaned_response = re.sub(r'[^\w\s]', '', response_content)
            print(f"Model response: {cleaned_response}")

            if cleaned_response.lower() == "yes":
                await self.emit_to_client(
                    'question',
                    json.dumps({
                        'text': full_sentence,
                        'timestamp': datetime.now().isoformat()
                    })
                )
                await self.generate_answer(full_sentence)
        except Exception as e:
            print(f"Error during question check: {e}")

    async def generate_answer(self, full_sentence):
        context = ' '.join(accumulated_sentences)
        print(context)
        message = {
            'role': 'user',
            'content': (f"You're assisting in transcribing a lecture. Based on the following context from the lecture, provide a concise and relevant answer to the question. "
                        f"If the question is unrelated to the context of the lecture, or the context of the lecture is still vague since its the beginning of the lecture, answer shortly, followed by a brief answer of 1-2 sentences."
                        f"\nContext: {context}"
                        f"\nQuestion: {full_sentence}")
        }

        try:
            async for part in await AsyncClient().chat(model='llama3.1', messages=[message], stream=True):
                content = part['message']['content'].strip()
                print(content, end=' ', flush=True)
                self.socketio.emit(
                    'answer',
                    json.dumps({
                        'text': content,
                    })
                )

        except Exception as e:
            print(f"Error during answer generation: {e}")

    def initialize_recorder(self):
        print("Initializing RealtimeSTT...")

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        self.recorder = AudioToTextRecorder(**self.recorder_config)
        print("RealtimeSTT initialized")
        self.recorder_ready.set()

    def recorder_thread(self):
        self.initialize_recorder()
        while True:
            try:
                full_sentence = self.recorder.text()
                if full_sentence:
                    accumulated_sentences.append(full_sentence)
                    if self.socketio:
                        self.socketio.emit(
                            'audio',
                            json.dumps({
                                'type': 'fullSentence',
                                'text': full_sentence,
                                'accumulated_sentences': accumulated_sentences
                            })
                        )
                    print(f"\rSentence: {full_sentence}")
                    self.loop.run_in_executor(None, asyncio.run, self.check_question_and_respond(full_sentence))
            except Exception as e:
                print(f"Error during transcription: {e}")

    def handle_audio(self, data):
        if not self.recorder_ready.is_set():
            print("Recorder not ready")
            return
        self.recorder.feed_audio(data)
