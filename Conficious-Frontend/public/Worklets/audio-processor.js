class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length > 0) {
            const inputData = input[0];
            const outputData = new Int16Array(inputData.length);

            for (let i = 0; i < inputData.length; i++) {
                outputData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
            }

            this.port.postMessage(outputData.buffer);
        }

        return true;
    }
}

registerProcessor('audio-processor', AudioProcessor);
