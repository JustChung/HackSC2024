import { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';
import RecordRTC from 'recordrtc';

function VideoPlayer() {
    const videoRef = useRef();
    const playbackRef = useRef();
    const [isRecording, setIsRecording] = useState(false);
    const [recordRTC, setRecordRTC] = useState(null);
    const [totalDuration, setTotalDuration] = useState(0);

    useEffect(() => {
        const request = indexedDB.open("VideoSegmentsDB", 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("segments")) {
                db.createObjectStore("segments", { autoIncrement: true });
            }
        };

        request.onerror = (event) => {
            console.error("IndexedDB error:", event);
        };
    }, []);

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
        const request = indexedDB.open("VideoSegmentsDB", 1);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction("segments", "readwrite");
            const store = transaction.objectStore("segments");
            store.add(blob);
            transaction.oncomplete = () => {
                console.log("Segment stored successfully");
            };
        };
    };

    const updatePlayback = () => {
        const request = indexedDB.open("VideoSegmentsDB", 1);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction("segments", "readonly");
            const store = transaction.objectStore("segments");

            const blobs = [];
            store.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    blobs.push(cursor.value);
                    cursor.continue();
                } else {
                    const superBlob = new Blob(blobs, { type: 'video/webm' });
                    const currentPlaybackTime = playbackRef.current.currentTime;
                    playbackRef.current.src = URL.createObjectURL(superBlob);
                    playbackRef.current.onloadedmetadata = () => {
                        playbackRef.current.currentTime = Math.max(0, currentPlaybackTime);
                    };
                    setTotalDuration((prev) => prev + 5);
                }
            };
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
