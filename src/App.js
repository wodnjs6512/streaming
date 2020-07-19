import React, { useRef, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import VideoUtils from './utils/videoRecordingUtil.js';
import videojs from 'video.js';
import './App.css';
import io from 'socket.io-client';

const VideoContainer = styled.video`
    width: 100px;
    height: 100px;
    background: white;
    position: relative;
`;

const OPTIONS = {
    aspectRatio: '16:9',
    playbackRates: [0.5, 1, 1.5, 2],
    responsive: true,
    height: 10,
    liveui: true,
};

let videoUtil = null;

function App() {
    const videoDisplay = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        new Promise((resolve, reject) => {
            const hlsScript = document.createElement('script');
            hlsScript.setAttribute('src', 'https://cdn.jsdelivr.net/npm/hls.js@latest');
            hlsScript.addEventListener('load', (e) => {
                if (window.Hls.isSupported()) {
                    window.hls = new window.Hls();
                }
                resolve();
            });
            hlsScript.addEventListener('error', reject);
            document.body.appendChild(hlsScript);

            videoUtil = new VideoUtils(videoDisplay.current);
        });
        videojs('my-player', OPTIONS, function onPlayerReady() {
            videojs.log('Your player is ready!');

            // In this context, `this` is the player that was created by Video.js.
            this.aspectRatio = '4:3';
            // How about an event listener?
            this.on('ended', function () {
                videojs.log('Awww...over so soon?!');
            });
        });
    }, []);

    const playVideo = () => {
        setIsPlaying(true);
        // videoUtil.isBroadcasting = true;
        const socket = io('https://local.streaming.com', {
            path: '/ws/chat',
            reconnect: true,
            rejectUnauthorized: false,
            transports: ['websocket'],
        });

        socket.on('open', () => {
            console.log('NSASR Voice Server Connected');
        });
        socket.on('connect', () => {
            console.log('socket connected');
        });
    };
    const stopVideo = () => {
        setIsPlaying(false);
        videoUtil.isBroadcasting = false;
    };

    return (
        <div className="App">
            <header className="App-header">
                <video
                    id="my-player"
                    className="video-js"
                    controls
                    preload="auto"
                    poster="//vjs.zencdn.net/v/oceans.png"
                    data-setup="{}"
                >
                    <source src="/video/chunklist.m3u8" type="application/x-mpegURL" />

                    <p className="vjs-no-js">
                        To view this video please enable JavaScript, and consider upgrading to a web
                        browser that supports HTML5 video
                    </p>
                </video>
                <div>
                    <VideoContainer id="webCamElement" ref={videoDisplay}></VideoContainer>
                    {!isPlaying && <div onClick={playVideo}>PLAY</div>}
                    {isPlaying && <div onClick={stopVideo}>PAUSE</div>}
                </div>
            </header>
        </div>
    );
}

export default App;
