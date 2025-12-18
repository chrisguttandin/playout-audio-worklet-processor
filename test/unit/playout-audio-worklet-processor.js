import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PlayoutAudioWorkletProcessor } from '../../src/playout-audio-worklet-processor';
import { spy } from 'sinon';

describe('PlayoutAudioWorkletProcessor', () => {
    afterEach(() => {
        delete self.AudioWorkletProcessor.prototype.port;
    });

    beforeEach(() => {
        self.AudioWorkletProcessor.prototype.port = { close: spy(), postMessage: spy() };
    });

    describe('constructor()', () => {
        let options;
        let readPointerView;
        let startView;
        let stopView;
        let storageView;
        let writePointerView;

        beforeEach(() => {
            // eslint-disable-next-line no-undef
            const sharedArrayBuffer = new SharedArrayBuffer(2060);

            readPointerView = new Uint32Array(sharedArrayBuffer, 4, 1);
            startView = new Uint16Array(sharedArrayBuffer, 8, 1);
            stopView = new Uint16Array(sharedArrayBuffer, 10, 1);
            storageView = new Float32Array(sharedArrayBuffer, 12, 256);
            writePointerView = new Uint32Array(sharedArrayBuffer, 0, 1);
            options = {
                numberOfInputs: 0,
                numberOfOutputs: 1,
                outputChannelCount: [2],
                processorOptions: {
                    readPointerView,
                    startView,
                    stopView,
                    storageView,
                    writePointerView
                }
            };
        });

        describe('with a numberOfInputs other than 0', () => {
            beforeEach(() => {
                options.numberOfInputs = 1;
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(Error, 'The numberOfInputs must be 0.');
            });
        });

        describe('with a numberOfOutputs other than 1', () => {
            beforeEach(() => {
                options.numberOfOutputs = 0;
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(Error, 'The numberOfOutputs must be 1.');
            });
        });

        describe('without a defined outputChannelCount', () => {
            beforeEach(() => {
                delete options.outputChannelCount;
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(
                    Error,
                    'The outputChannelCount must define a single output.'
                );
            });
        });

        describe('without a matching outputChannelCount', () => {
            beforeEach(() => {
                options.outputChannelCount = [3];
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(
                    Error,
                    'The storageView needs to have a length which is a multiple of the number of channels.'
                );
            });
        });

        describe('with a readPointerView which is an instance of Int8Array', () => {
            beforeEach(() => {
                options.processorOptions.readPointerView = new Int8Array(1);
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(
                    Error,
                    'The readPointerView needs to be an instance of "Uint8Array", "Uint16Array", or "Uint32Array".'
                );
            });
        });

        describe('with a readPointerView with an a length of 2', () => {
            beforeEach(() => {
                options.processorOptions.readPointerView = new Uint32Array(2);
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(Error, 'The readPointerView needs to have a length of 1.');
            });
        });

        describe('with a startView which is an instance of Int8Array', () => {
            beforeEach(() => {
                options.processorOptions.startView = new Int8Array(1);
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(
                    Error,
                    'The startView needs to be an instance of "Uint16Array".'
                );
            });
        });

        describe('with a startView with an a length of 2', () => {
            beforeEach(() => {
                options.processorOptions.startView = new Uint16Array(2);
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(Error, 'The startView needs to have a length of 1.');
            });
        });

        describe('with a stopView which is an instance of Int8Array', () => {
            beforeEach(() => {
                options.processorOptions.stopView = new Int8Array(1);
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(
                    Error,
                    'The stopView needs to be an instance of "Uint16Array".'
                );
            });
        });

        describe('with a stopView with an a length of 2', () => {
            beforeEach(() => {
                options.processorOptions.stopView = new Uint16Array(2);
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(Error, 'The stopView needs to have a length of 1.');
            });
        });

        describe('with a storageView which is an instance of Float64Array', () => {
            beforeEach(() => {
                options.processorOptions.storageView = new Float64Array(256);
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(
                    Error,
                    'The storageView needs to be an instance of "Float32Array".'
                );
            });
        });

        describe('with a storageView with a length which is not dividable by the render quantum', () => {
            beforeEach(() => {
                options.processorOptions.storageView = new Float32Array(192);
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(
                    Error,
                    'The capacity can only be a multiple of the render quantum size.'
                );
            });
        });

        describe('with a writePointerView which is an instance of Int8Array', () => {
            beforeEach(() => {
                options.processorOptions.writePointerView = new Int8Array(1);
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(
                    Error,
                    'The writePointerView needs to be an instance of "Uint8Array", "Uint16Array", or "Uint32Array".'
                );
            });
        });

        describe('with a writePointerView with an a length of 2', () => {
            beforeEach(() => {
                options.processorOptions.writePointerView = new Uint32Array(2);
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(
                    Error,
                    'The writePointerView needs to have a length of 1.'
                );
            });
        });

        describe('with misaligned pointers', () => {
            beforeEach(() => {
                options.processorOptions.readPointerView = new Uint8Array(1);
                options.processorOptions.writePointerView = new Uint16Array(1);
            });

            it('should throw an error', () => {
                expect(() => new PlayoutAudioWorkletProcessor(options)).to.throw(Error, 'The pointer need to be of the same size.');
            });
        });
    });

    describe('process()', () => {
        let channelData;
        let outputChannelData;
        let playoutAudioWorkletProcessor;
        let readPointerView;
        let startView;
        let stopView;
        let storageView;
        let writePointerView;

        beforeEach(() => {
            channelData = new Float32Array(Array.from({ length: 128 }, () => Math.random()));
            outputChannelData = new Float32Array(Array.from({ length: 128 }, () => Math.random()));

            // eslint-disable-next-line no-undef
            const sharedArrayBuffer = new SharedArrayBuffer(2060);

            readPointerView = new Uint32Array(sharedArrayBuffer, 4, 1);
            startView = new Uint16Array(sharedArrayBuffer, 8, 1);
            stopView = new Uint16Array(sharedArrayBuffer, 10, 1);
            storageView = new Float32Array(sharedArrayBuffer, 12, 256);
            writePointerView = new Uint32Array(sharedArrayBuffer, 0, 1);
            playoutAudioWorkletProcessor = new PlayoutAudioWorkletProcessor({
                numberOfInputs: 0,
                numberOfOutputs: 1,
                outputChannelCount: [1],
                processorOptions: {
                    readPointerView,
                    startView,
                    stopView,
                    storageView,
                    writePointerView
                }
            });

            storageView.set(channelData);
        });

        describe('with start set to 0', () => {
            it('should not render the channel data', () => {
                playoutAudioWorkletProcessor.process([[]], [[outputChannelData]]);

                for (let sampleIndex = 0; sampleIndex < 128; sampleIndex += 1) {
                    expect(outputChannelData[sampleIndex]).to.not.equal(channelData[sampleIndex]);
                }
            });

            it('should return true', () => {
                expect(playoutAudioWorkletProcessor.process([[]], [[outputChannelData]])).to.be.true;
            });
        });

        describe('with start set to 1', () => {
            beforeEach(() => {
                startView[0] = 1;
            });

            describe('with stop set to 0', () => {
                describe('with an empty storage', () => {
                    it('should not render the channel data', () => {
                        playoutAudioWorkletProcessor.process([[]], [[outputChannelData]]);

                        for (let sampleIndex = 0; sampleIndex < 128; sampleIndex += 1) {
                            expect(outputChannelData[sampleIndex]).to.not.equal(channelData[sampleIndex]);
                        }
                    });

                    it('should return true', () => {
                        expect(playoutAudioWorkletProcessor.process([[]], [[outputChannelData]])).to.be.true;
                    });

                    it('should not emit anything', () => {
                        playoutAudioWorkletProcessor.process([[]], [[outputChannelData]]);

                        expect(playoutAudioWorkletProcessor.port.postMessage).to.have.not.been.called;
                    });

                    it('should not close the MessagePort', () => {
                        playoutAudioWorkletProcessor.process([[]], [[outputChannelData]]);

                        expect(playoutAudioWorkletProcessor.port.close).to.have.not.been.called;
                    });
                });

                describe('with readable channel data', () => {
                    beforeEach(() => {
                        writePointerView[0] = 128;
                    });

                    it('should render the channel data', () => {
                        playoutAudioWorkletProcessor.process([[]], [[outputChannelData]]);

                        for (let sampleIndex = 0; sampleIndex < 128; sampleIndex += 1) {
                            expect(outputChannelData[sampleIndex]).to.equal(channelData[sampleIndex]);
                        }
                    });

                    it('should return true', () => {
                        expect(playoutAudioWorkletProcessor.process([[]], [[outputChannelData]])).to.be.true;
                    });

                    it('should not emit anything', () => {
                        playoutAudioWorkletProcessor.process([[]], [[outputChannelData]]);

                        expect(playoutAudioWorkletProcessor.port.postMessage).to.have.not.been.called;
                    });

                    it('should not close the MessagePort', () => {
                        playoutAudioWorkletProcessor.process([[]], [[outputChannelData]]);

                        expect(playoutAudioWorkletProcessor.port.close).to.have.not.been.called;
                    });
                });
            });

            describe('with stop set to 1', () => {
                beforeEach(() => {
                    stopView[0] = 1;
                });

                describe('with an empty storage', () => {
                    it('should not render the channel data', () => {
                        playoutAudioWorkletProcessor.process([[]], [[outputChannelData]]);

                        for (let sampleIndex = 0; sampleIndex < 128; sampleIndex += 1) {
                            expect(outputChannelData[sampleIndex]).to.not.equal(channelData[sampleIndex]);
                        }
                    });

                    it('should return false', () => {
                        expect(playoutAudioWorkletProcessor.process([[]], [[outputChannelData]])).to.be.false;
                    });

                    it('should emit a message', () => {
                        playoutAudioWorkletProcessor.process([[]], [[outputChannelData]]);

                        expect(playoutAudioWorkletProcessor.port.postMessage).to.have.been.calledOnce;
                        expect(playoutAudioWorkletProcessor.port.postMessage).to.have.been.calledWithExactly(null);
                    });

                    it('should not close the MessagePort', () => {
                        playoutAudioWorkletProcessor.process([[]], [[outputChannelData]]);

                        expect(playoutAudioWorkletProcessor.port.close).to.have.been.calledOnce;
                        expect(playoutAudioWorkletProcessor.port.close).to.have.been.calledWithExactly();
                    });
                });

                describe('with readable channel data', () => {
                    beforeEach(() => {
                        writePointerView[0] = 128;
                    });

                    it('should render the channel data', () => {
                        playoutAudioWorkletProcessor.process([[]], [[outputChannelData]]);

                        for (let sampleIndex = 0; sampleIndex < 128; sampleIndex += 1) {
                            expect(outputChannelData[sampleIndex]).to.equal(channelData[sampleIndex]);
                        }
                    });

                    it('should return true', () => {
                        expect(playoutAudioWorkletProcessor.process([[]], [[outputChannelData]])).to.be.true;
                    });

                    it('should not emit anything', () => {
                        playoutAudioWorkletProcessor.process([[]], [[outputChannelData]]);

                        expect(playoutAudioWorkletProcessor.port.postMessage).to.have.not.been.called;
                    });

                    it('should not close the MessagePort', () => {
                        playoutAudioWorkletProcessor.process([[]], [[outputChannelData]]);

                        expect(playoutAudioWorkletProcessor.port.close).to.have.not.been.called;
                    });
                });
            });
        });
    });
});
