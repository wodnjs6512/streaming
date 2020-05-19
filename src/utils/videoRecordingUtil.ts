class VideoUtils {
    // 카메라 입력 해상도
    private _VIDEO_WIDTH: number = 640;
    private _VIDEO_HEIGHT: number = 480;
    private stream: MediaStream;
    private videoElement: HTMLVideoElement;

    constructor(targetFrame) {
        this.videoElement = targetFrame;
    }

    async init() {
        this.stream = await this.getStream();
        // const videoElement: HTMLVideoElement = document.querySelector('#webCamElement');

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
