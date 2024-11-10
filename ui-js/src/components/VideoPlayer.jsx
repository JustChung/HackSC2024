import { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';
import RecordRTC from 'recordrtc';

function VideoPlayer() {
    const videoRef = useRef();
    const playbackRef = useRef();
    const [isRecording, setIsRecording] = useState(false);
    const [recordRTC, setRecordRTC] = useState(null);
    let multiblob = []
    // let fullBlob

    const startStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });
            videoRef.current.srcObject = stream;

            const recorder = new RecordRTC(stream, {
                type: 'video',
                mimeType: 'video/webm',
                timeSlice: 5000,
                ondataavailable: (blob) => {
                    storeSegment(blob);
                    updatePlayback();
                },
            });

            recorder.startRecording();
            setIsRecording(true);
            setRecordRTC(recorder);
        } catch (error) {
            console.error("Error starting the stream:", error);
        }
    };

    const storeSegment = (blob) => {
        multiblob.push(blob)
        // fullBlob = new Blob(multiblob, { type: 'video/webm' }); 
    };

    const updatePlayback = () => {
        const fullBlob = new Blob(multiblob, { type: 'video/webm' }); 
        const currentPlaybackTime = playbackRef.current.currentTime;
        playbackRef.current.src = URL.createObjectURL(fullBlob);
        playbackRef.current.onloadedmetadata = () => {
            playbackRef.current.currentTime = Math.max(0, currentPlaybackTime);
        };
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
        }
    };

    return (
        <div>
            <button onClick={isRecording ? stopStream : startStream}>
                {isRecording ? "Stop Stream" : "Start Stream"}
            </button>
            <video ref={videoRef} width={400} height={300} autoPlay muted></video>
            <video 
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