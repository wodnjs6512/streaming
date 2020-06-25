import React, { useRef, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import VideoUtils from './utils/videoRecordingUtil';
import './App.css';

const VideoContainer = styled.video`
    width: 100px;
    height: 100px;
    background: white;
    position: relative;
`;

let videoUtil = null;
function App() {
    const videoDisplay = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!videoUtil) {
            videoUtil = new VideoUtils(videoDisplay.current);
        }
    }, []);

    const playVideo = () => {
        setIsPlaying(true);
        videoDisplay.current.play();
        videoUtil.startRecording();
    };
    const stopVideo = () => {
        setIsPlaying(false);
        videoDisplay.current.pause();
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
