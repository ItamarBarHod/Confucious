<h1 align="center">Confucious - AI Webapp</h1>

## About the project

**Confucious** is an AI-powered web application designed to enhance the learning experience in academic environments. It transcribes audio in real-time, with incredible accuracy (even when paired with a supported low-end GPU), detects relevant questions within the transcription, and provides immediate answers, complete with timestamps. The tool is ideal for faculty members and students seeking to create a more interactive and efficient learning environment.

## Features

- **Real-time Audio Transcription**: Convert speech to text in real-time, allowing for accurate and timely transcription of lectures and discussions.
- **Question Detection and Answering**: Automatically detect and answer questions from the transcription, providing relevant answers and timestamps for easier reference.
- **Timestamping**: Each detected question is timestamped, making it easy to navigate through the lecture based on the queries raised.

## Technology Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Flask, Python, Flask-SocketIO
- **Real-time Communication**: WebSocket for streaming audio and real-time communication
- **AI Models**: LLaMA 3.1 via Ollama API for question detection and answering
- **Audio Processing**: Web Audio API, Audio Worklets

## Security and File Handling

- **Cross-Origin Resource Sharing (CORS)**: Flask-CORS is used to manage cross-origin requests.
- **Environment Variables**: Sensitive data like API keys and tokens are stored in environment variables to ensure security.

## An example of a simple transcription in Confucious:

![Example Image](https://github.com/ItamarBarHod/Confucious/blob/main/example.png)

# Preparation for running Confucious:

## GPU Support with CUDA (recommended)

### Updating PyTorch for CUDA Support

To upgrade your PyTorch installation to enable GPU support with CUDA, follow these instructions based on your specific CUDA version. This is useful if you wish to enhance the performance of RealtimeSTT with CUDA capabilities.

**For CUDA 11.8:**
To update PyTorch and Torchaudio to support CUDA 11.X, execute the following:

```bash
pip install torch==2.3.1+cu118 torchaudio==2.3.1 --index-url https://download.pytorch.org/whl/cu118
```

**For CUDA 12.X:**
To update PyTorch and Torchaudio to support CUDA 12.X, execute the following:

```
pip install torch==2.3.1+cu121 torchaudio==2.3.1 --index-url https://download.pytorch.org/whl/cu121
```
Replace 2.3.1 with the version of PyTorch that matches your system and requirements.

## Steps That Might Be Necessary Before

**Note:** To check if your NVIDIA GPU supports CUDA, visit the official [CUDA GPUs list](https://developer.nvidia.com/cuda-gpus).

If you haven't used CUDA models before, some additional steps might be necessary to prepare your system for CUDA support and installation of the GPU-optimized packages. This is recommended for those who require better performance and have a compatible NVIDIA GPU.

To use Confucious with GPU support via CUDA, please follow these steps:

### Install NVIDIA CUDA Toolkit:

1. Select between CUDA 11.8 or CUDA 12.X Toolkit:
   - For 12.X, visit the [NVIDIA CUDA Toolkit Archive](https://developer.nvidia.com/cuda-toolkit-archive) and select the latest version.
   - For 11.8, visit [NVIDIA CUDA Toolkit 11.8](https://developer.nvidia.com/cuda-11-8-0-download-archive).
2. Select your operating system and version.
3. Download and install the software.

### Install NVIDIA cuDNN:

1. Select between CUDA 11.8 or CUDA 12.X Toolkit:
   - For 12.X, visit [cuDNN Downloads](https://developer.nvidia.com/cudnn).
   - For 11.8, visit the [NVIDIA cuDNN Archive](https://developer.nvidia.com/rdp/cudnn-archive) and click on "Download cuDNN v8.7.0 (November 28th, 2022), for CUDA 11.x".
2. Download and install the software.

## Important Note for Backend-Only Users

If you only intend to use the backend of Confucious without the frontend, please be aware of the following:

- You need to stream audio on a WebSocket on the endpoint `audio`.
- Ensure that the audio stream is in binary format with a sample rate of **16000Hz**, **s16le** (signed 16-bit little-endian) PCM.

---

## Backend Setup

1. **Clone the Repository:**

 ```
 git clone https://github.com/your-username/Confucious.git
 cd Confucious/Confucious-Backend
 ```
   
2. **Set Up a Virtual Environment:**

```
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Backend Dependencies:**
  ```
  pip install -r requirements.txt
  ```

4. **Create a .env File:**
In the Confucious-Backend directory, create a .env file and fill in the following fields:
```
BACKEND_PORT=
VITE_PORT=
FRONTEND_URL=http://localhost:${VITE_PORT}
```
5. Run the Backend:
```
python3 main.py
```

---

## Frontend Setup
1. **Navigate to the Frontend Directory:**
```
cd ../Confucious-Frontend
```

2. **Install Frontend Dependencies:**
```
npm install
```
3. **Create a .env File:**

In the Confucious-Frontend directory, create a .env file and fill in the following fields:
```
BACKEND_PORT=
VITE_BACKEND_URL=http://localhost:${BACKEND_PORT}
```
4. **Run the Frontend:**
```
npm run dev
```

---

### Contributing
We welcome contributions! Feel free to report issues, suggest improvements, or submit pull requests to the Confucious project.
