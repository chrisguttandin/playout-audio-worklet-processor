import { AudioWorkletNode, OfflineAudioContext } from 'standardized-audio-context';
import { beforeEach, describe, expect, it } from 'vitest';

describe('module', () => {
    let offlineAudioContext;

    beforeEach(async () => {
        offlineAudioContext = new OfflineAudioContext({ length: 256, numberOfChannels: 2, sampleRate: 44100 });

        await offlineAudioContext.audioWorklet.addModule('../../src/module.js');
    });

    describe('with one channel', () => {
        describe('with one slot', () => {
            let audioWorkletNode;
            let channelData;
            let numberOfChannels;
            let readPointerView;
            let startView;
            let stopView;
            let storageView;
            let writePointerView;

            beforeEach(() => {
                channelData = new Float32Array(Array.from({ length: 128 }, () => Math.random()));
                numberOfChannels = 1;

                // eslint-disable-next-line no-undef
                const sharedArrayBuffer = new SharedArrayBuffer(524);

                readPointerView = new Uint32Array(sharedArrayBuffer, 4, 1);
                startView = new Uint16Array(sharedArrayBuffer, 8, 1);
                stopView = new Uint16Array(sharedArrayBuffer, 10, 1);
                storageView = new Float32Array(sharedArrayBuffer, 12, 128);
                writePointerView = new Uint32Array(sharedArrayBuffer, 0, 1);
                audioWorkletNode = new AudioWorkletNode(offlineAudioContext, 'playout-audio-worklet-processor', {
                    numberOfInputs: 0,
                    numberOfOutputs: 1,
                    outputChannelCount: [numberOfChannels],
                    processorOptions: {
                        readPointerView,
                        startView,
                        stopView,
                        storageView,
                        writePointerView
                    }
                });

                audioWorkletNode.connect(offlineAudioContext.destination);
                storageView.set(channelData);
            });

            describe('with start set to 0', () => {
                describe('with an empty storage', () => {
                    it('should render silence', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(128);

                        renderedBuffer.copyFromChannel(renderedChannelData, 0);

                        for (const sample of renderedChannelData) {
                            expect(sample).to.equal(0);
                        }
                    });
                });

                describe('with readable channel data', () => {
                    beforeEach(() => {
                        writePointerView[0] = 128;
                    });

                    it('should render silence', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(128);

                        renderedBuffer.copyFromChannel(renderedChannelData, 0);

                        for (const sample of renderedChannelData) {
                            expect(sample).to.equal(0);
                        }
                    });
                });
            });

            describe('with start set to 1', () => {
                beforeEach(() => {
                    startView[0] = 1;
                });

                describe('with an empty storage', () => {
                    it('should render silence', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(128);

                        renderedBuffer.copyFromChannel(renderedChannelData, 0);

                        for (const sample of renderedChannelData) {
                            expect(sample).to.equal(0);
                        }
                    });
                });

                describe('with readable channel data', () => {
                    beforeEach(() => {
                        writePointerView[0] = 128;
                    });

                    it('should render the channel data', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(128);

                        renderedBuffer.copyFromChannel(renderedChannelData, 0);

                        for (let sampleIndex = 0; sampleIndex < 128; sampleIndex += 1) {
                            expect(renderedChannelData[sampleIndex]).to.equal(channelData[sampleIndex]);
                        }
                    });
                });
            });
        });

        describe('with two slots', () => {
            let audioWorkletNode;
            let channelData;
            let numberOfChannels;
            let readPointerView;
            let startView;
            let stopView;
            let storageView;
            let writePointerView;

            beforeEach(() => {
                channelData = new Float32Array(Array.from({ length: 256 }, () => Math.random()));
                numberOfChannels = 1;

                // eslint-disable-next-line no-undef
                const sharedArrayBuffer = new SharedArrayBuffer(1036);

                readPointerView = new Uint32Array(sharedArrayBuffer, 4, 1);
                startView = new Uint16Array(sharedArrayBuffer, 8, 1);
                stopView = new Uint16Array(sharedArrayBuffer, 10, 1);
                storageView = new Float32Array(sharedArrayBuffer, 12, 256);
                writePointerView = new Uint32Array(sharedArrayBuffer, 0, 1);
                audioWorkletNode = new AudioWorkletNode(offlineAudioContext, 'playout-audio-worklet-processor', {
                    numberOfInputs: 0,
                    numberOfOutputs: 1,
                    outputChannelCount: [numberOfChannels],
                    processorOptions: {
                        readPointerView,
                        startView,
                        stopView,
                        storageView,
                        writePointerView
                    }
                });

                audioWorkletNode.connect(offlineAudioContext.destination);
                storageView.set(channelData);
            });

            describe('with start set to 0', () => {
                describe('with an empty storage', () => {
                    it('should render silence', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(256);

                        renderedBuffer.copyFromChannel(renderedChannelData, 0);

                        for (const sample of renderedChannelData) {
                            expect(sample).to.equal(0);
                        }
                    });
                });

                describe('with readable channel data', () => {
                    beforeEach(() => {
                        writePointerView[0] = 256;
                    });

                    it('should render silence', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(256);

                        renderedBuffer.copyFromChannel(renderedChannelData, 0);

                        for (const sample of renderedChannelData) {
                            expect(sample).to.equal(0);
                        }
                    });
                });
            });

            describe('with start set to 1', () => {
                beforeEach(() => {
                    startView[0] = 1;
                });

                describe('with an empty storage', () => {
                    it('should render silence', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(256);

                        renderedBuffer.copyFromChannel(renderedChannelData, 0);

                        for (const sample of renderedChannelData) {
                            expect(sample).to.equal(0);
                        }
                    });
                });

                describe('with readable channel data', () => {
                    beforeEach(() => {
                        writePointerView[0] = 256;
                    });

                    it('should render the channel data', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(256);

                        renderedBuffer.copyFromChannel(renderedChannelData, 0);

                        for (let sampleIndex = 0; sampleIndex < 256; sampleIndex += 1) {
                            expect(renderedChannelData[sampleIndex]).to.equal(channelData[sampleIndex]);
                        }
                    });
                });
            });
        });
    });

    describe('with two channels', () => {
        describe('with one slot', () => {
            let audioWorkletNode;
            let channelData;
            let numberOfChannels;
            let readPointerView;
            let startView;
            let stopView;
            let storageView;
            let writePointerView;

            beforeEach(() => {
                channelData = new Float32Array(Array.from({ length: 256 }, () => Math.random()));
                numberOfChannels = 2;

                // eslint-disable-next-line no-undef
                const sharedArrayBuffer = new SharedArrayBuffer(1036);

                readPointerView = new Uint32Array(sharedArrayBuffer, 4, 1);
                startView = new Uint16Array(sharedArrayBuffer, 8, 1);
                stopView = new Uint16Array(sharedArrayBuffer, 10, 1);
                storageView = new Float32Array(sharedArrayBuffer, 12, 256);
                writePointerView = new Uint32Array(sharedArrayBuffer, 0, 1);
                audioWorkletNode = new AudioWorkletNode(offlineAudioContext, 'playout-audio-worklet-processor', {
                    numberOfInputs: 0,
                    numberOfOutputs: 1,
                    outputChannelCount: [numberOfChannels],
                    processorOptions: {
                        readPointerView,
                        startView,
                        stopView,
                        storageView,
                        writePointerView
                    }
                });

                audioWorkletNode.connect(offlineAudioContext.destination);
                storageView.set(channelData);
            });

            describe('with start set to 0', () => {
                describe('with an empty storage', () => {
                    it('should render silence', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(128);

                        for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex += 1) {
                            renderedBuffer.copyFromChannel(renderedChannelData, channelIndex);

                            for (const sample of renderedChannelData) {
                                expect(sample).to.equal(0);
                            }
                        }
                    });
                });

                describe('with readable channel data', () => {
                    beforeEach(() => {
                        writePointerView[0] = 128;
                    });

                    it('should render silence', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(128);

                        for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex += 1) {
                            renderedBuffer.copyFromChannel(renderedChannelData, channelIndex);

                            for (const sample of renderedChannelData) {
                                expect(sample).to.equal(0);
                            }
                        }
                    });
                });
            });

            describe('with start set to 1', () => {
                beforeEach(() => {
                    startView[0] = 1;
                });

                describe('with an empty storage', () => {
                    it('should render silence', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(128);

                        for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex += 1) {
                            renderedBuffer.copyFromChannel(renderedChannelData, channelIndex);

                            for (const sample of renderedChannelData) {
                                expect(sample).to.equal(0);
                            }
                        }
                    });
                });

                describe('with readable channel data', () => {
                    beforeEach(() => {
                        writePointerView[0] = 128;
                    });

                    it('should render the channel data', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(128);

                        for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex += 1) {
                            renderedBuffer.copyFromChannel(renderedChannelData, channelIndex);

                            for (let sampleIndex = 0; sampleIndex < 128; sampleIndex += 1) {
                                expect(renderedChannelData[sampleIndex]).to.equal(channelData[channelIndex * 128 + sampleIndex]);
                            }
                        }
                    });
                });
            });
        });

        describe('with two slots', () => {
            let audioWorkletNode;
            let channelData;
            let numberOfChannels;
            let readPointerView;
            let startView;
            let stopView;
            let storageView;
            let writePointerView;

            beforeEach(() => {
                channelData = new Float32Array(Array.from({ length: 512 }, () => Math.random()));
                numberOfChannels = 2;

                // eslint-disable-next-line no-undef
                const sharedArrayBuffer = new SharedArrayBuffer(2060);

                readPointerView = new Uint32Array(sharedArrayBuffer, 4, 1);
                startView = new Uint16Array(sharedArrayBuffer, 8, 1);
                stopView = new Uint16Array(sharedArrayBuffer, 10, 1);
                storageView = new Float32Array(sharedArrayBuffer, 12, 512);
                writePointerView = new Uint32Array(sharedArrayBuffer, 0, 1);
                audioWorkletNode = new AudioWorkletNode(offlineAudioContext, 'playout-audio-worklet-processor', {
                    numberOfInputs: 0,
                    numberOfOutputs: 1,
                    outputChannelCount: [numberOfChannels],
                    processorOptions: {
                        readPointerView,
                        startView,
                        stopView,
                        storageView,
                        writePointerView
                    }
                });

                audioWorkletNode.connect(offlineAudioContext.destination);
                storageView.set(channelData);
            });

            describe('with start set to 0', () => {
                describe('with an empty storage', () => {
                    it('should render silence', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(256);

                        for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex += 1) {
                            renderedBuffer.copyFromChannel(renderedChannelData, channelIndex);

                            for (const sample of renderedChannelData) {
                                expect(sample).to.equal(0);
                            }
                        }
                    });
                });

                describe('with readable channel data', () => {
                    beforeEach(() => {
                        writePointerView[0] = 256;
                    });

                    it('should render silence', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(256);

                        for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex += 1) {
                            renderedBuffer.copyFromChannel(renderedChannelData, channelIndex);

                            for (const sample of renderedChannelData) {
                                expect(sample).to.equal(0);
                            }
                        }
                    });
                });
            });

            describe('with start set to 1', () => {
                beforeEach(() => {
                    startView[0] = 1;
                });

                describe('with an empty storage', () => {
                    it('should render silence', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(256);

                        for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex += 1) {
                            renderedBuffer.copyFromChannel(renderedChannelData, channelIndex);

                            for (const sample of renderedChannelData) {
                                expect(sample).to.equal(0);
                            }
                        }
                    });
                });

                describe('with readable channel data', () => {
                    beforeEach(() => {
                        writePointerView[0] = 256;
                    });

                    it('should render the channel data', async () => {
                        const renderedBuffer = await offlineAudioContext.startRendering();
                        const renderedChannelData = new Float32Array(256);

                        for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex += 1) {
                            renderedBuffer.copyFromChannel(renderedChannelData, channelIndex);

                            for (let sampleIndex = 0; sampleIndex < 256; sampleIndex += 1) {
                                expect(renderedChannelData[sampleIndex]).to.equal(channelData[channelIndex * 256 + sampleIndex]);
                            }
                        }
                    });
                });
            });
        });
    });
});
