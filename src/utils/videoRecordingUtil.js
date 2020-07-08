import SocketUtils from './serverConnectionUtil';
const timeSlice = 3000;
class VideoUtils {
    // 카메라 입력 해상도

    constructor(targetFrame) {
        this._VIDEO_WIDTH = 640;
        this._VIDEO_HEIGHT = 480;
        this.stream = null;
        this.videoElement = targetFrame;
        this._audioContext = new AudioContext({ sampleRate: 44100 });
        // this.socketUtil = new SocketUtils();
        // this.socketClient = this.socketUtil.serverConnect();
        this._mediaRecorder = null;

        // const videoElement: HTMLVideoElement = document.querySelector('#webCamElement');
        this.setUpMediaRecorder();
        this.setupVideoElement();
    }

    sendToServer(data, callback) {
        var blobData = new Blob([data]);
        var formData = new FormData();
        var url = '/api/upload';
        formData.append('wavData', blobData);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.enctype = 'multipart/form-data';
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4) {
                blobData = null;
                formData = null;
                callback();
            }
        };
        xhr.send(formData);
    }

    async setUpMediaRecorder() {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            video: {
                facingMode: 'user',
                width: this._VIDEO_WIDTH,
                height: this._VIDEO_HEIGHT,
            },
        });
        const options = { mimeType: 'video/webm;codecs=vp9' };
        var mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.ondataavailable = (e) => {
            console.log('dataavailable!');

            if (mediaRecorder.state == 'recording') {
                mediaRecorder.stop();
                if (e.data.size > 0) {
                    this.sendToServer(e.data, function () {
                        console.log('Upload request!');
                    });
                }
            }
        };

        mediaRecorder.onerror = function (e) {
            console.log('error occured on recorder', e);
        };
        mediaRecorder.onresume = function () {
            console.log('onresume');
        };
        mediaRecorder.onstart = function () {
            console.log('onstart');
        };
        mediaRecorder.onstop = function () {
            console.log('onstop');
            mediaRecorder.start(timeSlice);
        };

        mediaRecorder.start(timeSlice);
    }

    setupVideoElement() {
        this.videoElement.id = 'webCamElement';
        this.videoElement.width = this._VIDEO_WIDTH;
        this.videoElement.height = this._VIDEO_HEIGHT;
        this.videoElement.style.width = '100%';
        this.videoElement.style.height = '100%';
    }
}

export default VideoUtils;
