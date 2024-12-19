if (navigator.mediaDevices.getUserMedia) {
    console.log("The mediaDevices.getUserMedia() method is supported.");
  
    const record = document.getElementById("record");
    const stop = document.getElementById("stop");
    const audio = document.getElementById("audio");

    const constraints = { audio: true };
    let chunks = [];
  
    stop.disabled = true;
    record.disabled = false;

    let onSuccess = function (stream) {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
  
    //   visualize(stream);
  
      record.onclick = function () {
        mediaRecorder.start();
        console.log(mediaRecorder.state);
        console.log("Recorder started.");
        stop.disabled = false;
        record.disabled = true;
      };
  
      stop.onclick = function () {
        mediaRecorder.stop();
        console.log(mediaRecorder.state);
        console.log("Recorder stopped.");
        stop.disabled = true;
        record.disabled = false;
      };
  
      mediaRecorder.onstop = async function (e) {
        console.log("Last data to read (after MediaRecorder.stop() called).");
        audio.controls = true;
        const webaBlob = new Blob(chunks, { type: mediaRecorder.mimeType });
        const webaURL = window.URL.createObjectURL(webaBlob);
        chunks = [];
        const arrayBuffer = await webaBlob.arrayBuffer();
        // Use AudioContext to decode our array buffer into an audio buffer
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const wavBlob = await convertAudioBufferToWavBlob(audioBuffer);
        const wavURL = window.URL.createObjectURL(wavBlob);
        audio.src = wavURL;
        console.log(webaURL);
        console.log("recorder stopped");
      };
  
      mediaRecorder.ondataavailable = function (e) {
        chunks.push(e.data);
      };
    };
  
    let onError = function (err) {
      console.log("The following error occured: " + err);
    };
  
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  } else {
    console.log("MediaDevices.getUserMedia() not supported on your browser!");
}