import SocketUtils from './serverConnectionUtil';

const MEDIA_RECORDER_OPTION = { mimeType: 'video/webm;codecs=vp8' };

class VideoUtils {
    // 카메라 입력 해상도

    constructor(targetFrame) {
        this._VIDEO_WIDTH = 640;
        this._VIDEO_HEIGHT = 480;
        this.stream = null;
        this.videoElement = targetFrame;
        this._audioContext = new AudioContext({ sampleRate: 44100 });
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

        const frequencies = [
            25,
            31,
            40,
            50,
            63,
            80,
            100,
            125,
            160,
            200,
            250,
            315,
            400,
            500,
            630,
            800,
            1000,
            1250,
            1600,
            2000,
            2500,
            3150,
            4000,
            5000,
            6300,
            8000,
            10000,
            12500,
            16000,
            20000,
        ];

        const filters = frequencies.map((frequency, index, array) => {
            const filterNode = this._audioContext.createBiquadFilter();
            filterNode.gain.value = 0.2;
            filterNode.frequency.setValueAtTime(frequency, this._audioContext.currentTime);

            if (index === 0) {
                filterNode.type = 'lowshelf';
            } else if (index === array.length - 1) {
                filterNode.type = 'highshelf';
            } else {
                filterNode.type = 'peaking';
            }
            return filterNode;
        });

        const bandpassFilter = this._audioContext.createBiquadFilter();
        const scriptNode = this._audioContext.createScriptProcessor();
        const destination = this._audioContext.createMediaStreamDestination();

        bandpassFilter.type = 'bandpass';
        bandpassFilter.frequency.setValueAtTime(8000, this._audioContext.currentTime);
        bandpassFilter.Q.value = 1;
        bandpassFilter.gain.value = 0.1;

        streamSrc.connect(analyserNode);
        // analyserNode.connect(bandpassFilter);
        filters.reduce((prev, current) => {
            prev.connect(current);
            return current;
        }, analyserNode);
        filters[filters.length - 1].connect(scriptNode);

        // bandpassFilter.connect(scriptNode);
        scriptNode.connect(destination);
        scriptNode.onaudioprocess = this._handleScriptProcess(analyserNode);
        // removes audio track
        this.stream.removeTrack(this.stream.getAudioTracks()[0]);
        this.stream.addTrack(destination.stream.getAudioTracks()[0]);

        this._mediaRecorder = new MediaRecorder(this.stream, MEDIA_RECORDER_OPTION);
        this.setupVideoElement();
        this._mediaRecorder.start();
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

    _handleScriptProcess = (analyserNode) => (audioProcessingEvent) => {
        const array = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(array);
        this._currentVolume = array.reduce((total, data) => total + data, 0) / array.length;
        const { inputBuffer, outputBuffer } = audioProcessingEvent;
        for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            const inputData = inputBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);
            for (let sample = 0; sample < inputBuffer.length; sample++) {
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
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            video: {
                facingMode: 'user',
                width: this._VIDEO_WIDTH,
                height: this._VIDEO_HEIGHT,
            },
        });
    }
}

export default VideoUtils;
