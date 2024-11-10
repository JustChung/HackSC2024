import { useState, useRef } from 'react';
import './VideoPlayer.css';
import RecordRTC from 'recordrtc';

function VideoPlayer() {
    const videoRef = useRef();
    const playbackRef = useRef();
    const [isRecording, setIsRecording] = useState(false);
    const [recordRTC, setRecordRTC] = useState(null);
    const mediaSource = useRef(new MediaSource()); 
    const sourceBuffer = useRef(null); 
    const multiblob = useRef([]);

    const startStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });
            videoRef.current.srcObject = stream;

            const recorder = new RecordRTC(stream, {
                type: 'video',
                mimeType: 'video/webm; codecs="vp8, opus"',
                timeSlice: 1000,
                ondataavailable: handleDataAvailable,
            });

            playbackRef.current.src = URL.createObjectURL(mediaSource.current);
            mediaSource.current.addEventListener("sourceopen", handleSourceOpen);

            recorder.startRecording();
            setIsRecording(true);
            setRecordRTC(recorder);
        } catch (error) {
            console.error("Error starting the stream:", error);
        }
    };

    const handleSourceOpen = () => {
        try {
            sourceBuffer.current = mediaSource.current.addSourceBuffer('video/webm; codecs="vp8, opus"');
            sourceBuffer.current.mode = "sequence"; 

            multiblob.current.forEach(blob => appendToBuffer(blob));
            multiblob.current = [];
        } catch (error) {
            console.error("Error creating SourceBuffer:", error);
        }
    };

    const handleDataAvailable = (blob) => {
        if (sourceBuffer.current && !sourceBuffer.current.updating) {
            appendToBuffer(blob);
        } else {
            multiblob.current.push(blob); 
        }
    };

    const appendToBuffer = (blob) => {
        if (sourceBuffer.current && !sourceBuffer.current.updating) {
            const reader = new FileReader();
            reader.onloadend = () => {
                try {
                    sourceBuffer.current.appendBuffer(new Uint8Array(reader.result));
                } catch (error) {
                    console.error("Error appending buffer:", error);
                }
            };
            reader.readAsArrayBuffer(blob);
        } else {
            multiblob.current.push(blob);
        }
    };

    const stopStream = async () => {
        if (recordRTC) {
            await recordRTC.stopRecording(() => {
                setIsRecording(false);

                const stream = videoRef.current.srcObject;
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                setRecordRTC(null);
            });

            if (mediaSource.current.readyState === "open") {
                mediaSource.current.endOfStream();
            }
        }
    };

    return (
        <div>
            <button onClick={isRecording ? stopStream : startStream}>
                {isRecording ? "Stop Stream" : "Start Stream"}
            </button>
            <video ref={videoRef} width={400} height={300} autoPlay muted></video>
            <video 
                className="video-player"
                ref={playbackRef} 
                width={400} 
                height={300} 
                controls 
                autoPlay
            ></video>
        </div>
    );
}

export default VideoPlayer;
