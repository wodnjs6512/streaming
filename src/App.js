import React, { useRef, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import VideoUtils from './utils/videoRecordingUtil.ts';
import './App.css';

const VideoContainer = styled.video`
    width: 100px;
    height: 100px;
    background: white;
    position: relative;
`;
var videoSrc = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

let videoUtil = null;

function App() {
    const videoDisplay = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        new Promise((resolve, reject) => {
            const hlsScript = document.createElement('script');
            hlsScript.setAttribute('src', '/lib/hls.js');
            hlsScript.addEventListener('load', (e) => {
                if (window.Hls.isSupported()) {
                    window.hls = new window.Hls();
                }

                resolve();
            });
            hlsScript.addEventListener('error', reject);
            document.body.appendChild(hlsScript);

            if (!videoUtil) {
                videoUtil = new VideoUtils(videoDisplay.current);
            }
        });
    }, []);

    const playVideo = () => {
        setIsPlaying(true);
        window.hls.loadSource('/video/chunklist.m3u8');
        window.hls.attachMedia(videoDisplay.current);
        window.hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            var video = document.getElementById('webCamElement').play();
        });
    };
    const stopVideo = () => {
        setIsPlaying(false);
    };

    return (
        <div className="App">
            <header className="App-header">
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
