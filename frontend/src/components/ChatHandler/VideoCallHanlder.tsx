import React, { useEffect, useState } from 'react'
import socketService from '../../services/socket.service';
import { webRTCService } from '../../services/webrtc.service';
import VideoFeed from './VideoFeed';


interface VideoCallHandlerProps {
    isVideoCallActive: boolean;
    receiverId: string | undefined;
    senderId: string | undefined;
}

const VideoCallHandler: React.FC<VideoCallHandlerProps> =
    ({ isVideoCallActive, senderId, receiverId }) => {
        const [isRequestAccepted, setIsRequestAccepted] = useState<boolean>(false);
        const [isCallRejected, setIsCallRejected] = useState<boolean>(false);
        const [isAction, setIsAction] = useState<boolean>(true);

        useEffect(() => {
            //Listen for call accepted
            socketService.listenForAcceptCall(async (data) => {
                try {

                    //First access localStream 
                    await webRTCService.setupLocalStream();

                    //Establish peer connection
                    await webRTCService.createPeerConnection(true, data.senderId, data.receiverId);

                    setIsRequestAccepted(true);
                    setIsAction(false);
                } catch (error) {
                    console.error('Error setting up call:', error);
                }
            });

            const handleRejectedCall = (data: { senderId: string, receiverId: string }) => {
                console.log("Incoming call data:", data);
                setIsRequestAccepted(false);
                setIsCallRejected(true);
            }

            socketService.listenForIgnoredEvent(handleRejectedCall);


            //Listening for incoming answer and ICE candidate
            socketService.socket?.on('webrtc-answer', async (data) => {
                console.log('Received WebRTC answer in caller side');
                await webRTCService.handleIncomingAnswer(data.answer)
            })

            socketService.socket?.on('webrtc-ice-candidate', async (data) => {
                console.log('Received ICE candidate in caller side');
                await webRTCService.handleIncomingIceCandidate(data.candidate);
            });

            socketService.listenForCallEnd(() => {
                webRTCService.cleanup();
                setIsRequestAccepted(false);
            });


            return () => {
                socketService.cleanUpListenForAcceptCall();
                socketService.cleanUpListenForRejectedCall();
                socketService.cleanUpCallEndListener();
                socketService.socket?.off('webrtc-answer');
                socketService.socket?.off('webrtc-ice-candidate');
                webRTCService.cleanup();
            }
        }, []);

        const handleEndCall = () => {
            socketService.endVideoCall(senderId!, receiverId!);
            webRTCService.cleanup();
            setIsRequestAccepted(false);
        }


        return (
            <>
                <div className='flex items-center justify-center w-full mt-8 bg-gray-200'>
                    {isVideoCallActive && !isCallRejected && !isRequestAccepted && isAction && (
                        <div className="flex items-center py-1 space-x-2">
                            <span className="text-sm text-red-500 animate-pulse">
                                Video call request sent waiting for response...
                            </span>
                        </div>
                    )}
                    {isCallRejected && (
                        <div className="flex items-center py-1 space-x-2">
                            <span className="text-sm text-red-500 animate-pulse">
                                Call has been rejected
                            </span>
                        </div>
                    )}
                </div>
                {isRequestAccepted && (
                    <VideoFeed
                        localStream={webRTCService.getLocalStream()}
                        remoteStream={webRTCService.getRemoteStream()}
                        onEndCall={handleEndCall}
                    />
                )}
            </>
        )
    }

export default VideoCallHandler;