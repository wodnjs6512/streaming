import SocketUtils from './serverConnectionUtil';

const MEDIA_RECORDER_OPTION = { mimeType: 'video/webm;codecs=vp8' };

class VideoUtils {
    // 카메라 입력 해상도

    constructor(targetFrame) {
        this._VIDEO_WIDTH = 640;
        this._VIDEO_HEIGHT = 480;
        this.stream = null;
        this.videoElement = targetFrame;
        this._audioContext = new AudioContext();
        this.socketUtil = new SocketUtils();
        this.socketClient = this.socketUtil.serverConnect();
        this._mediaRecorder = null;
        // const videoElement: HTMLVideoElement = document.querySelector('#webCamElement');
        this.setUpMediaRecorder();
    }

    async setUpMediaRecorder() {
        this.stream = await this.getStream();

        const streamSrc = this._audioContext.createMediaStreamSource(this.stream);
        const analyserNode = this._audioContext.createAnalyser();
        const highPassFilter = this._audioContext.createBiquadFilter();
        const lowshelfFilter = this._audioContext.createBiquadFilter();
        const highShelfFilter = this._audioContext.createBiquadFilter();
        const scriptNode = this._audioContext.createScriptProcessor(4096, 1, 1);
        const destination = this._audioContext.createMediaStreamDestination();

        highPassFilter.type = 'highpass';
        highPassFilter.frequency.setValueAtTime(2000, this._audioContext.currentTime);

        lowshelfFilter.type = 'lowshelf';
        lowshelfFilter.frequency.setValueAtTime(8000, this._audioContext.currentTime);

        highShelfFilter.type = 'highshelf';
        highShelfFilter.frequency.setValueAtTime(17000, this._audioContext.currentTime);

        streamSrc.connect(analyserNode);
        analyserNode.connect(lowshelfFilter);
        lowshelfFilter.connect(highPassFilter);
        highPassFilter.connect(highShelfFilter);
        highShelfFilter.connect(scriptNode);
        scriptNode.connect(destination);
        scriptNode.onaudioprocess = this._handleScriptProcess(analyserNode);
        // removes audio track
        this.stream.removeTrack(this.stream.getAudioTracks()[0]);
        this.stream.addTrack(destination.stream.getAudioTracks()[0]);

        this._mediaRecorder = new MediaRecorder(this.stream, MEDIA_RECORDER_OPTION);
        this._mediaRecorder.ondataavailable = function (e) {
            console.log('HEE HAA');
            // chunks.push(e.data);
        };
        this.setupVideoElement();
    }

    setupVideoElement() {
        this.videoElement.id = 'webCamElement';
        this.videoElement.srcObject = this._mediaRecorder.stream;
        this.videoElement.width = this._VIDEO_WIDTH;
        this.videoElement.height = this._VIDEO_HEIGHT;
        this.videoElement.style.width = '100%';
        this.videoElement.style.height = '100%';
        this.videoElement.autoplay = false;
        this.videoElement.playbackRate = 0;
    }

    startRecording() {
        this._mediaRecorder.start();
    }

    _handleScriptProcess = (analyserNode) => (audioProcessingEvent) => {
        const array = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(array);
        this._currentVolume = array.reduce((total, data) => total + data, 0) / array.length;
        const { inputBuffer, outputBuffer } = audioProcessingEvent;
        for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            const inputData = inputBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);
            for (let sample = 0; sample < inputBuffer.length; sample++) {
                if (inputData[sample] > -0.0015 && inputData[sample] < 0.0015) {
                    outputData[sample] = 0;
                    continue;
                }

                if (this._currentVolume > 10) {
                    outputData[sample] = inputData[sample];
                } else if (this._currentVolume > 5) {
                    outputData[sample] = inputData[sample] / (10 / this._currentVolume);
                } else {
                    outputData[sample] = null;
                }
            }
        }
    };

    async getStream() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('not supported');
        }

        return await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, autoGainControl: true, noiseSuppression: true },
            video: {
                facingMode: 'user',
                width: this._VIDEO_WIDTH,
                height: this._VIDEO_HEIGHT,
            },
        });
    }
}

export default VideoUtils;
