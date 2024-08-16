class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 32768; // 32 KB
        this.buffer = new Uint8Array(this.bufferSize);
        this.bufferIndex = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0][0];
        if (input) {
            // Convert Float32 to Int16
            const pcmData = new Int16Array(input.length);
            for (let i = 0; i < input.length; i++) {
                pcmData[i] = Math.min(1, Math.max(-1, input[i])) * 0x7FFF; // Scale and clamp
            }

            // Convert to Uint8Array
            const byteData = new Uint8Array(pcmData.buffer);
            this.buffer.set(byteData, this.bufferIndex);
            this.bufferIndex += byteData.length;

            // If buffer is full, send it and reset
            if (this.bufferIndex >= this.bufferSize) {
                this.port.postMessage(this.buffer.buffer);
                this.bufferIndex = 0;
            }
        }
        return true;
    }
}

registerProcessor('audio-processor', AudioProcessor);
