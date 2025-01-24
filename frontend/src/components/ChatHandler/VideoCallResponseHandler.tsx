import React, { useState, useEffect } from 'react'
import socketService from '../../services/socket.service';
// import { changeVideoSize, getStream, showMyFeed, stopMyFeed} from '../../config/videoStream';
import VideoFeed from './VideoFeed';
import { webRTCService } from '../../services/webrtc.service';


interface VideoCallResponseHandlerProps {
    senderId: string | undefined;
    receiverId: string | undefined;
}

const VideoCallResponseHandler: React.FC<VideoCallResponseHandlerProps> = ({ senderId, receiverId }) => {
    const [isRequestAccepted, setIsRequestAccepted] = useState<boolean>(false);
    const [isSeen , setIsSeen] = useState<boolean>(true); 
    const [isAction, setIsAction] = useState<boolean>(true);
    
    const handleAcceptedCall = async () => {
        if (!senderId || !receiverId) return;
        try {
            // Notify the caller that we accepted
            socketService.videoCallAccepted(senderId, receiverId);

            //set up local stream
            await webRTCService.setupLocalStream();

            // Create peer connection (not as initiator)
            await webRTCService.createPeerConnection(false, senderId, receiverId);
            setIsRequestAccepted(true);
            setIsAction(false);
            setIsSeen(false);

        } catch (error) {
            console.error('Error accepting call:', error);
        }
    }

    useEffect(() => {
        // Must listen for offer and ICE candidates
        socketService.socket?.on('webrtc-offer', async (data) => {
            console.log('Received WebRTC offer');
            try {
                await webRTCService.handleIncomingOffer(data.offer, data.senderId, data.receiverId);
            } catch (error) {
                console.error('Error handling offer:', error);
            }
        });


        socketService.socket?.on('webrtc-answer', async (data) => {
            console.log('Received WebRTC answer:', data);
            try {
                await webRTCService.handleIncomingAnswer(data.answer);
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        });

        socketService.socket?.on('webrtc-ice-candidate', async (data) => {
            console.log('Received ICE candidate:', data);
            try {
                await webRTCService.handleIncomingIceCandidate(data.candidate);
            } catch (error) {
                console.error('Error handling ICE candidate:', error);
            }
        });

        socketService.listenForCallEnd(() => {
            webRTCService.cleanup();
            setIsRequestAccepted(false);
        })
    

        return () => {
            socketService.socket?.off('webrtc-offer');
            socketService.socket?.off('webrtc-ice-candidate');
            socketService.socket?.off('webrtc-ice-candidate');
            socketService.cleanUpCallEndListener();
            webRTCService.cleanup();
        };
    }, []);

    const handleIgonreCall = () => {
        if (!senderId || !receiverId) return;

        socketService.videoCallIgonred(senderId, receiverId);
        setIsAction(false);
        setIsSeen(false); 
    }

    const handleEndCall = () => {
        socketService.endVideoCall(senderId!, receiverId!);
        webRTCService.cleanup();
        setIsRequestAccepted(false);
    }

    return (
        <>
            {!isRequestAccepted || isSeen ? (
                <div className='flex items-center justify-center w-full mt-8 bg-gray-200 rounded-lg'>
                    {isAction && (
                    <div className="flex flex-col items-center py-2 space-x-2 space-y-3">
                        <span className="text-sm text-green-500 ">
                            You got an request for video call...
                        </span>
                        <div className='flex space-x-4'>
                            <button
                                onClick={handleAcceptedCall}
                                className='px-3 py-1 text-sm text-white bg-green-500 rounded-full'>Accept</button>
                            <button 
                                onClick={handleIgonreCall}
                                className='px-3 py-1 text-sm text-white bg-red-500 rounded-full'>Ignore</button>
                        </div>
                    </div>    
                    )}
                </div>

            ) : (
                <VideoFeed
                    localStream={webRTCService.getLocalStream()}
                    remoteStream={webRTCService.getRemoteStream()}
                    onEndCall={handleEndCall}
                />
            )}
        </>
    )
}

export default VideoCallResponseHandler
