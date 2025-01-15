import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { webRTCService } from '../../services/webrtc.service';
import { Mic, MicOff, Phone, Video, VideoOff } from 'lucide-react';

interface VideoFeedProps {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    onEndCall: () => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ localStream, remoteStream, onEndCall }) => {
    const [isLocalMain, setIsLocalMain] = useState<boolean>(false);
    const [isMicOn, setIsMicOn] = useState<boolean>(true);
    const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const localVideo = localVideoRef.current;
        const remoteVideo = remoteVideoRef.current;


        // Set up remote stream update handler
        webRTCService.setOnRemoteStreamUpdate((stream) => {
            console.log('Remote stream updated:', stream);
            if (remoteVideo) {
                remoteVideo.srcObject = stream;
                console.log('Set remote video source');
            }           
        });


        // Set up local stream
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }

        return () => {
            if (localVideo) {
                localVideo.srcObject = null;
            }
            if (remoteVideo) {
                remoteVideo.srcObject = null;
            }
        };
    }, [localStream, remoteStream]);


    const toggleMic = () => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach((track) => (track.enabled = !track.enabled));
            setIsMicOn((prev) => !prev);
        }
    }

    const toggleVideo = () => {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            videoTracks.forEach((track) => (track.enabled = !track.enabled));
            setIsVideoOn((prev) => !prev);
        }
    };

    const modelContent = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative p-2 bg-white rounded-lg shadow-lg">
                {/* Video Containers */}
                <div className="relative">
                    {/* Main Video Screen */}
                    <div className="relative w-full h-[500px] rounded-md overflow-hidden bg-slate-500">
                        <video
                            ref={isLocalMain ? localVideoRef : remoteVideoRef}
                            className="w-full h-full"
                            autoPlay
                            playsInline
                        />
                        {/* End Call Button */}
                        <div className="absolute flex items-center space-x-4 transform -translate-x-1/2 bottom-4 left-1/2">
                            <button
                                className="flex items-center justify-center w-12 h-12 px-4 py-2 text-white bg-gray-700 rounded-full"
                                onClick={toggleMic}
                            >
                                {isMicOn ? (
                                    <Mic size={24} />
                                ) : (
                                    <MicOff size={24} />
                                )}

                            </button>
                            <button
                                className="flex items-center justify-center px-4 py-2 text-white bg-red-500 rounded-full h-14 w-14"
                                onClick={onEndCall}
                            >
                                <Phone size={24} />
                            </button>
                            <button
                                className="flex items-center justify-center w-12 h-12 px-4 py-2 text-white bg-gray-700 rounded-full"
                                onClick={toggleVideo}
                            >
                                {isVideoOn ? (
                                    <Video size={24} />                                  
                                ) : (
                                    <VideoOff size={24} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Small Corner Video */}
                    <div
                        className={`absolute top-4 right-4 w-40  rounded-md overflow-hidden cursor-pointer border-2 ${isLocalMain ? 'border-blue-500' : 'border-red-500'
                            }`}
                        onClick={() => setIsLocalMain(!isLocalMain)}
                    >
                        <video
                            ref={isLocalMain ? remoteVideoRef : localVideoRef}
                            className="w-full h-full"
                            autoPlay
                            playsInline
                        />
                    </div>
                </div>
            </div>
        </div>
    );


    return ReactDOM.createPortal(modelContent, document.body);
};

export default VideoFeed;