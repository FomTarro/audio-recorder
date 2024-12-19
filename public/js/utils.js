function downloadBlob(blob, name) {
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = name;
    document.body.appendChild(link);

    link.dispatchEvent(
        new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        })
    );

    document.body.removeChild(link);
}

async function convertAudioBufferToWavBlob(audioBuffer) {
    return new Promise(function (resolve) {

        let pcmArrays = [];
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            pcmArrays.push(audioBuffer.getChannelData(i));
        }

        const config = { sampleRate: audioBuffer.sampleRate }
        var wavPCM = new WavePCM(config);
        wavPCM.record(pcmArrays);
        wavPCM.requestData(resolve);
    });
}

function sanitize(str){
    return str.toLowerCase().replaceAll(' ', '_');
}