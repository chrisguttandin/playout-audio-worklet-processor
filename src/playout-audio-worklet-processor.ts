import { IAudioWorkletProcessor } from './interfaces';

const RENDER_QUANTUM = 128;
const MASK = 524287;

export class PlayoutAudioWorkletProcessor extends AudioWorkletProcessor implements IAudioWorkletProcessor {
    public static parameterDescriptors = [];

    private _isStarted = false;

    private _numberOfChannels: number;

    private _numberOfSlots: number;

    private _readPointerView: Uint8Array | Uint16Array | Uint32Array;

    private _slots: Float32Array[][];

    private _startView: Uint16Array;

    private _stopView: Uint16Array;

    private _writePointerView: Uint8Array | Uint16Array | Uint32Array;

    constructor({ numberOfInputs, numberOfOutputs, outputChannelCount, processorOptions }: AudioWorkletNodeOptions) {
        if (numberOfInputs !== 0) {
            throw new Error('The numberOfInputs must be 0.');
        }

        if (numberOfOutputs !== 1) {
            throw new Error('The numberOfOutputs must be 1.');
        }

        if (outputChannelCount === undefined || outputChannelCount.length !== 1) {
            throw new Error('The outputChannelCount must define a single output.');
        }

        const [numberOfChannels] = outputChannelCount;

        if (typeof processorOptions !== 'object' || processorOptions === null) {
            throw new Error();
        }

        const readPointerView = 'readPointerView' in processorOptions ? processorOptions.readPointerView : null;

        if (!(readPointerView instanceof Uint8Array || readPointerView instanceof Uint16Array || readPointerView instanceof Uint32Array)) {
            throw new Error('The readPointerView needs to be an instance of "Uint8Array", "Uint16Array", or "Uint32Array".');
        }

        if (readPointerView.length !== 1) {
            throw new Error('The readPointerView needs to have a length of 1.');
        }

        const startView = 'startView' in processorOptions ? processorOptions.startView : null;

        if (!(startView instanceof Uint16Array)) {
            throw new Error('The startView needs to be an instance of "Uint16Array".');
        }

        if (startView.length !== 1) {
            throw new Error('The startView needs to have a length of 1.');
        }

        const stopView = 'stopView' in processorOptions ? processorOptions.stopView : null;

        if (!(stopView instanceof Uint16Array)) {
            throw new Error('The stopView needs to be an instance of "Uint16Array".');
        }

        if (stopView.length !== 1) {
            throw new Error('The stopView needs to have a length of 1.');
        }

        const storageView = 'storageView' in processorOptions ? processorOptions.storageView : null;

        if (!(storageView instanceof Float32Array)) {
            throw new Error('The storageView needs to be an instance of "Float32Array".');
        }

        const numberOfFrames = storageView.length / numberOfChannels;

        if (!Number.isInteger(numberOfFrames)) {
            throw new Error('The storageView needs to have a length which is a multiple of the number of channels.');
        }

        const numberOfSlots = numberOfFrames / RENDER_QUANTUM;

        if (!Number.isInteger(numberOfSlots)) {
            throw new Error('The capacity can only be a multiple of the render quantum size.');
        }

        const writePointerView = 'writePointerView' in processorOptions ? processorOptions.writePointerView : null;

        if (
            !(writePointerView instanceof Uint8Array || writePointerView instanceof Uint16Array || writePointerView instanceof Uint32Array)
        ) {
            throw new Error('The writePointerView needs to be an instance of "Uint8Array", "Uint16Array", or "Uint32Array".');
        }

        if (writePointerView.length !== 1) {
            throw new Error('The writePointerView needs to have a length of 1.');
        }

        if (readPointerView.byteLength !== writePointerView.byteLength) {
            throw new Error('The pointer need to be of the same size.');
        }

        if (numberOfFrames >= 2 ** (readPointerView.byteLength * 8 - 1) /* - THE MASK */) {
            throw new Error('The capacity exceeds the pointer range.');
        }

        super();

        this._numberOfChannels = numberOfChannels;
        this._numberOfSlots = numberOfSlots;
        this._readPointerView = readPointerView;
        this._slots = Array.from({ length: numberOfSlots }, (_, slotIndex) => {
            const slotOffset = slotIndex * RENDER_QUANTUM;

            return Array.from(
                { length: numberOfChannels },
                // tslint:disable-next-line:no-shadowed-variable
                (_, channelIndex) => {
                    const channelOffset = slotOffset + channelIndex * numberOfSlots * RENDER_QUANTUM;

                    return storageView.subarray(channelOffset, channelOffset + RENDER_QUANTUM);
                }
            );
        });
        this._startView = startView;
        this._stopView = stopView;
        this._writePointerView = writePointerView;
    }

    public process(_: Float32Array[][], [output]: Float32Array[][]): boolean {
        if (!this._isStarted) {
            if (!this._readStart()) {
                return true;
            }

            this._isStarted = true;
        }

        const flag = !(!this._readStorage(output) && this._readStop());

        if (!flag) {
            this.port.postMessage(null);
            this.port.close();
        }

        return flag;
    }

    private _readStart(): boolean {
        const start = Atomics.load(this._startView, 0);

        return start === 1;
    }

    private _readStop(): boolean {
        const stop = Atomics.load(this._stopView, 0);

        return stop === 1;
    }

    private _readStorage(output: Float32Array[]): boolean {
        const readPointer = Atomics.load(this._readPointerView, 0) / RENDER_QUANTUM;
        // tslint:disable-next-line:no-bitwise
        const writePointer = Math.floor((Atomics.load(this._writePointerView, 0) & MASK) / RENDER_QUANTUM);

        if (writePointer === readPointer) {
            return false;
        }

        const slot = this._slots[readPointer % this._numberOfSlots];

        for (let channelIndex = 0; channelIndex < this._numberOfChannels; channelIndex += 1) {
            output[channelIndex].set(slot[channelIndex]);
        }

        Atomics.store(this._readPointerView, 0, ((readPointer + 1) % (this._numberOfSlots * 2)) * RENDER_QUANTUM);

        return true;
    }
}
