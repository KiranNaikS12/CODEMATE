import socketService from "./socket.service";

export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private onRemoteStreamUpdate: ((stream: MediaStream) => void) | null = null;

    //stun configuration
    private configuration = {
        iceServers: [
            {
                urls: [
                    'stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302'
                ]
            }
        ]
    };

    //Setting up localstream
    //To get access to user's media using getUserMedia()
    async setupLocalStream() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            return this.localStream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    }


    setOnRemoteStreamUpdate(callback: (stream: MediaStream) => void) {
        this.onRemoteStreamUpdate = callback;
    }

    //Creates a RTCPeerConnection with STUN servers for NAT traversal.
    async createPeerConnection(isInitiator: boolean, senderId: string, receiverId: string) {
        console.log('Creating peer connection...', { isInitiator, senderId, receiverId });
        try {

            //setting up peer connection...
            this.peerConnection = new RTCPeerConnection(this.configuration);
    
            // Connection state logging: connected | disconnected | failed
            this.peerConnection.onconnectionstatechange = () => {
                console.log('Connection state:', this.peerConnection?.connectionState);
                if (this.peerConnection?.connectionState === 'connected') {
                    console.log('Peers connected!');
                } 
            };
    
            //tracks the connection of ICE
            this.peerConnection.oniceconnectionstatechange = () => {
                console.log('ICE connection state changed:', this.peerConnection?.iceConnectionState);
            };
    
            //Logs changes in singling state
            this.peerConnection.onsignalingstatechange = () => {
                console.log('Signaling state changed:', this.peerConnection?.signalingState);
            };
    
            //gather iceCandidate
            this.peerConnection.onicegatheringstatechange = () => {
                console.log('ICE gathering state changed:', this.peerConnection?.iceGatheringState);
            };
    
            //Sending iceCandidate to remote peer
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('Sending ICE candidate to:', receiverId);
                    socketService.sendIceCandidate(senderId, receiverId, event.candidate);
                }
            };
    
            //tracks the remote media tracks received from other peer, adding them remote stream.
            this.peerConnection.ontrack = (event) => {
                console.log('Got remote track:', event.track.kind);
                if (!this.remoteStream) {
                    this.remoteStream = new MediaStream();
                }
                this.remoteStream.addTrack(event.track);
                if (this.onRemoteStreamUpdate) {
                    this.onRemoteStreamUpdate(this.remoteStream);
                }
            };
    
            if (this.localStream) {
                console.log('Adding local tracks to peer connection');
                const tracks = this.localStream.getTracks();
                console.log('Local tracks to add:', tracks.map(t => t.kind));
                
                tracks.forEach(track => {
                    if (this.localStream && this.peerConnection) {
                        console.log(`Adding ${track.kind} track to peer connection`);
                        this.peerConnection.addTrack(track, this.localStream);
                    }
                });
            }
    
            if (isInitiator) {
                console.log('Creating offer as initiator');
                const offer = await this.peerConnection.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true
                });
                console.log('Created offer:', offer);
                await this.peerConnection.setLocalDescription(offer);
                socketService.sendWebRTCOffer(senderId, receiverId, offer);
            }
    
            return this.peerConnection;
        } catch (error) {
            console.error('Error in createPeerConnection:', error);
            throw error;
        }
    }

    async handleIncomingOffer(offer: RTCSessionDescriptionInit, senderId: string, receiverId: string) {
        if (!this.peerConnection) return;
        try {
            console.log('Handling incoming offer from:', senderId);
            console.log('Offer:', offer);
            
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            console.log('Set remote description successfully');
            
            const answer = await this.peerConnection.createAnswer();
            console.log('Created answer:', answer);
            
            await this.peerConnection.setLocalDescription(answer);
            console.log('Set local description successfully');
            
            socketService.sendWebRTCAnswer(receiverId, senderId, answer);
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }

    async handleIncomingAnswer(answer: RTCSessionDescriptionInit) {
        if (!this.peerConnection) return;
        try {
            console.log('Handling incoming answer:', answer);
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('Set remote description from answer successfully');
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }

    async handleIncomingIceCandidate(candidate: RTCIceCandidateInit) {
        if (!this.peerConnection) return;
        try {
            console.log('Handling incoming ICE candidate:', candidate);
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('Added ICE candidate successfully');
        } catch (error) {
            console.error('Error adding ice candidate:', error);
        }
    }
    
    getLocalStream() {
        return this.localStream
    }

    getRemoteStream() {
        return this.remoteStream
    }

    cleanup() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }

        if (this.peerConnection) {
            this.peerConnection.close();
        }

        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;

    }
}

export const webRTCService = new WebRTCService();