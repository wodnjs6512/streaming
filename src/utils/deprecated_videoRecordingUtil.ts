class VideoUtils {
    // 카메라 입력 해상도
    private _VIDEO_WIDTH: number = 640;
    private _VIDEO_HEIGHT: number = 480;
    private stream: any;
    private videoElement: HTMLVideoElement;
    private _audioContext: AudioContext;
    _mediaRecorder: MediaRecorder;

    constructor(targetFrame: HTMLVideoElement) {
        this._audioContext = new AudioContext();
        this.videoElement = targetFrame;

        // const videoElement: HTMLVideoElement = document.querySelector('#webCamElement');

        const streamDest = this._audioContext.createMediaStreamDestination();
        const mediaRecorder = new MediaRecorder(streamDest.stream);
        // scriptNode.onaudioprocess = this._handleScriptProcess(analyserNode);

        this._mediaRecorder = mediaRecorder;
        this.connectNodeWithSourceLoad(streamDest);
    }

    async connectNodeWithSourceLoad(streamDest: MediaStreamAudioDestinationNode) {
        this.stream = await this.getStream();
        this.setupVideoElement();
        const streamSrc = this._audioContext.createMediaStreamSource(this.stream);
        const analyserNode = this._audioContext.createAnalyser();
        const biquadFilter = this._audioContext.createBiquadFilter();
        biquadFilter.type = 'highpass';
        biquadFilter.frequency.value = 30;
        // const scriptNode = this._audioContext.createScriptProcessor(4096, 1, 1);

        // 순서대로 노드 커넥션을 맺는다.
        this._connectNodes(streamSrc, analyserNode, biquadFilter, streamDest);
    }

    _connectNodes(...connectableNodes: AudioNode[]) {
        for (let i = 0; i < connectableNodes.length - 1; i++) {
            if (!!connectableNodes[i].connect) {
                connectableNodes[i].connect(connectableNodes[i + 1]);
            } else {
                throw new Error('you can not connect node');
            }
        }
    }

    setupVideoElement() {
        this.videoElement.id = 'webCamElement';
        this.videoElement.srcObject = this.stream;
        this.videoElement.width = this._VIDEO_WIDTH;
        this.videoElement.height = this._VIDEO_HEIGHT;
        this.videoElement.style.width = '100%';
        this.videoElement.style.height = '100%';
        this.videoElement.autoplay = false;
    }

    async connectToServer() {}

    async getStream() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('not supported');
        }

        return await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                facingMode: 'user',
                width: this._VIDEO_WIDTH,
                height: this._VIDEO_HEIGHT,
            },
        });
    }
}

export default VideoUtils;
