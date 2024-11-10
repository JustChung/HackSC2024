import { useState, useRef } from 'react'
import './VideoPlayer.css'
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

function VideoPlayer() {

    const videoRef = useRef();
    const playbackRef = useRef();
    const ffmpegRef = useRef(new FFmpeg());
    const messageRef = useRef()

    const [isRecording, setIsRecording] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const TIME_SLICE = 5000
    let mediaRecorder;
    let chunks = []
    let stream;

    const mediaConstraints = {
        audio: true,
        video: true
    }

    const load = async () => {
        const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on("log", ({ message }) => {
          if (messageRef.current) messageRef.current.innerHTML = message;
        });
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm"
          ),
          workerURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.worker.js`,
            "text/javascript"
          ),
        });
        setLoaded(true);
      };

    const transcode = async (original, addOn) => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.writeFile('original.webm', original);
        await ffmpeg.writeFile('addon.webm', addOn);
        await ffmpeg.exec([
            '-i',
            'input.webm',
            '-i',
            'reversed.webm',
            // '-filter_complex',
            // '[0:v][1:v]blend=all_expr=\'A*(if(eq(0,N/2),1,T))+B*(if(eq(0,N/2),T,1))\'',
            'output.mp4',
        ]);
        const data = await ffmpeg.readFile('output.mp4');
        playbackRef.current.src =
            URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'}));
    }


    const shareScreen = async () => {
        if (navigator.mediaDevices.getDisplayMedia) {
            if (stream == undefined) {
                stream = await navigator.mediaDevices.getDisplayMedia(
                    mediaConstraints
                )
                videoRef.current.srcObject = stream
            }
            setIsRecording(true);
            mediaRecorder = new MediaRecorder(stream)
            mediaRecorder.start(); 
            mediaRecorder.ondataavailable = function (event) {
                console.log({event})
                chunks.push(event.data)
            }
            mediaRecorder.onstop = (event) => {
                // window.clearTimeout(timoutStop);
                let blob = new Blob(chunks, {type: 'video/webm'});
                chunks = []; // Clear chunks
                // console.log(blob,"blob")
                // var url = URL.createObjectURL(blob);
                // var a = document.createElement('a');
                // document.body.appendChild(a);
                // a.style = 'display: none';
                // a.href = url;
                // a.download = 'test.webm';
                // a.click();
                // window.URL.revokeObjectURL(url);
                display(blob, playbackRef)
            }
            setTimeout(() => {
                mediaRecorder.stop(); 
                shareScreen()
            }, TIME_SLICE);
        }
    }

    /**
     * @param {Blob} videoFile
     * @param {HTMLVideoElement} videoEl 
     * @returns {void}
     */
    function display( videoFile, videoEl ) {

        // Preconditions:
        if( !( videoFile instanceof Blob ) ) throw new Error( '`videoFile` must be a Blob or File object.' ); // The `File` prototype extends the `Blob` prototype, so `instanceof Blob` works for both.
        // if( !( videoEl instanceof HTMLVideoElement ) ) throw new Error( '`videoEl` must be a <video> element.' );
        
        // 

        const newObjectUrl = URL.createObjectURL( videoFile );
            
        // URLs created by `URL.createObjectURL` always use the `blob:` URI scheme: https://w3c.github.io/FileAPI/#dfn-createObjectURL
        const oldObjectUrl = videoEl.current.currentSrc;
        if( oldObjectUrl && oldObjectUrl.startsWith('blob:') ) {
            // It is very important to revoke the previous ObjectURL to prevent memory leaks. Un-set the `src` first.
            // See https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL

            videoEl.current.src = ''; // <-- Un-set the src property *before* revoking the object URL.
            URL.revokeObjectURL( oldObjectUrl );
        }

        // Then set the new URL:
        videoEl.current.src = newObjectUrl;

        // And load it:
        videoEl.current.load(); // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/load
        
    }

  return (loaded
    ? (
        <>
            <button onClick={()=>shareScreen()}>Test</button>
            <p ref={messageRef}></p>
            <video width={800} height={800} ref={videoRef} autoPlay></video>
            <video width={800} height={800} ref={playbackRef} controls autoPlay></video>
        </>
    )
    : (
        <button onClick={load}>Load ffmpeg-core (~31 MB)</button>
    )
  )
}

export default VideoPlayer
