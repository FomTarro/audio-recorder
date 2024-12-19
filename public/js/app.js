const recordButton = document.getElementById("record");
const stopButton = document.getElementById("stop");
const canvas = document.getElementById('visualizer');

const prompts = new Map();
prompts.set('Greetings', ["Hello!", "Buon giorno!", "Bom dia!"]);
prompts.set('Exclamations', ["Wow!", "HA!", "Oh no!"]);
const refresh = document.getElementById('refresh');
const categories = document.getElementById("categories");
for (category of [...prompts.keys()]) {
    const opt = document.createElement("option");
    opt.value = category;
    opt.innerHTML = category;
    categories.appendChild(opt);
}
refresh.onclick = categories.onchange = (e) => {
    const choices = prompts.get(categories.value);
    const index = Math.floor((choices.length) * Math.random())
    console.log(index);
    document.getElementById("prompt").innerHTML = choices[index]
}

function visualize(stream) {
    const audioCtx = new AudioContext();
    const canvasCtx = canvas.getContext("2d");
    const source = audioCtx.createMediaStreamSource(stream);

    const bufferLength = 2048;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = bufferLength;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);

    draw();

    function draw() {
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = "rgb(200, 200, 200)";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 5;
        // #544ef4, #f16dca 15%, #f16dca 44%, #faca3b
        const gradient = canvasCtx.createLinearGradient(0, 0, 170, 170);
        gradient.addColorStop(0, '#544ef4');
        gradient.addColorStop(0.15, '#f16dca');
        gradient.addColorStop(0.44, '#f16dca');
        gradient.addColorStop(1, '#faca3b');
        canvasCtx.strokeStyle = gradient;

        canvasCtx.beginPath();

        let sliceWidth = (WIDTH * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            let v = dataArray[i] / 128.0;
            let y = (v * HEIGHT) / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia supported.");
    navigator.mediaDevices
        .getUserMedia(
            // constraints - only audio needed for this app
            {
                audio: true,
                video: false
            },
        )
        // Success callback
        .then((stream) => {
            let chunks = [];
            stopButton.disabled = true;
            const mediaRecorder = new MediaRecorder(stream);
            visualize(stream);
            recordButton.onclick = () => {
                mediaRecorder.start();
                stopButton.disabled = false;
                recordButton.disabled = true;
            }
            stopButton.onclick = () => {
                mediaRecorder.stop();
                stopButton.disabled = true;
                recordButton.disabled = false;
            }
            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            }
            mediaRecorder.onstop = async () => {
                const li = window.document.createElement("div");
                li.classList.add("center", "col", "take")
                const span = window.document.createElement("span");
                const fileName = getFileName();
                span.innerHTML = fileName
                
                const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
                const arrayBuffer = await blob.arrayBuffer();
                // Use AudioContext to decode our array buffer into an audio buffer
                const audioContext = new AudioContext();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                const wavBlob = await convertAudioBufferToWavBlob(audioBuffer);
                const wavURL = window.URL.createObjectURL(wavBlob);
                chunks = [];

                const audio = window.document.createElement("audio");
                const controls = window.document.createElement("div");
                const choose = window.document.createElement("button");
                choose.innerHTML = `Download`;
                choose.onclick = () => {
                    downloadBlob(wavBlob, fileName);
                }

                const trash = window.document.createElement("button");
                trash.innerHTML = `Delete`;
                trash.onclick = () => {
                    li.remove();
                }

                controls.classList.add("center", "row");
                controls.appendChild(choose);
                controls.appendChild(trash);

                audio.controls = true;
                audio.src = wavURL;

                li.appendChild(span);
                li.appendChild(audio);
                li.appendChild(controls);
                document.getElementById("takes").appendChild(li);
            }
        })

        // Error callback
        .catch((err) => {
            console.error(`The following getUserMedia error occurred: ${err}`);
        });
} else {
    console.log("getUserMedia not supported on your browser!");
}

function getFileName(){
    const fileName = `${sanitize(document.getElementById("username").value)}_${sanitize(document.getElementById("prompt").innerHTML)}_${Date.now()}.wav`;
    return fileName;
}

function upload(){
    const selectedFile = document.getElementById("file").files[0];
    console.log(selectedFile);
    var fd = new FormData();
    fd.append(selectedFile.name, selectedFile);
    fetch("/upload", {
        method: "POST",
        body: fd
      }).then(res => {
        console.log("Request complete! response:", res);
        if(res.status > 200){
            // err
        }else{
            // ok!
        }
      });
}
