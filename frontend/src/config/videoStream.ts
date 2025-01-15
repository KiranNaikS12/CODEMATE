const constraints = {
    audio: true,
    video: true,
};

export const getStream = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log(stream);
        return stream;
    } catch (error) {
        console.error('User denied access to constraints', error);
        return null;
    }
};


export const showMyFeed = (videoElement: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!videoElement || !stream) {
        console.error('Video element or stream is not available');
        return;
    }
    videoElement.srcObject = stream;
    console.log('Feed is live');
};


export const stopMyFeed = (videoElement: HTMLVideoElement | null, stream: MediaStream | null) => {
    if(!stream) return;
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
        track.stop();
    })

    if (videoElement) {
        videoElement.srcObject = null;
    }
    console.log('Feed stopped and video element cleared');
}

//resoultino setup:
export const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

export const changeVideoSize = (stream: MediaStream | null, height:number, width: number) => {
    //video track
    //we can get it's capabilities from.getCapabilities();
    //or we can apply new constrainsts with applyConstrains();
     
    stream?.getVideoTracks().forEach(track => {
        const capabilities = track.getCapabilities();
        console.log('browser capbalities', capabilities)

        const maxHeight = capabilities.height?.max ?? height;
        const maxWidth = capabilities.width?.max ?? width;

        const videoConstraints = {
            height : {exact: height < maxHeight ? height : maxHeight},
            width :  {exact: width < maxWidth ? height : maxWidth},          
        }
        track.applyConstraints(videoConstraints).then(() => {
            console.log(`Video size changed to: ${width}x${height}`);
        }).catch(error => {
            console.error('Failed to apply constraints:', error);
        });
    })
}