//frontend socket.service
import { io, Socket } from "socket.io-client";
import { Message } from "../types/messageTypes";

class SocketService {
  public socket: Socket | null = null;
  private isConnecting = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {

      this.disconnect();

      this.isConnecting = true;
      console.log("Attempting to connect to socket...");


      this.isConnecting = true;
      console.log("Attempting to connect to socket...");

      this.socket = io(import.meta.env.VITE_BASE_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000
      });

      this.socket.on("connect", () => {
        resolve();
      });

      this.socket.on("connect_error", (err) => {
        reject(err);
      });

      this.socket.on("disconnect", (reason) => {
        if (reason === "io server disconnect") {
          this.socket?.connect();
        }
      });

      this.socket.connect();
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.off();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  getSocket() {
    return this.socket;
  }



  //sending message:
  sendMessage(data: Message) {
    const room = [data.senderId, data.receiverId].sort().join("_");
    if (this.isConnected()) {
      this.socket?.emit("send_message", {
        ...data,
        room,
        timestamp: new Date().toISOString()
      }
      );
    } else {
      console.warn("Socket is not connected. Unable to send message.");
    }
  }

  //receiving message
  onMessageReceived(callback: (message: Message) => void): void {
    this.socket?.off("receive_message");
    this.socket?.on("receive_message", (rawMessage: string) => {
      console.log("Raw message received:", rawMessage);
      try {
        const parsedMessage: Message =
          typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
        callback(parsedMessage);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    });
  }

  // Remove listener for "receive_message"
  offMessageReceived(): void {
    if (this.socket) {
      this.socket.off("receive_message");
    }
  }

  //load previous message
  loadMessages(callback: (messages: Message[]) => void): void {
    this.socket?.off("load_messages");
    this.socket?.on("load_messages", (rawMessages: string | Message[]) => {
      try {
        const parsedMessages: Message[] =
          typeof rawMessages === "string" ? JSON.parse(rawMessages) : rawMessages;
        callback(parsedMessages);
      } catch (error) {
        console.error("Failed to parse messages:", error);
      }
    });
  }

  joinRoom(senderId: string, receiverId: string) {
    if (this.isConnected()) {
      [senderId, receiverId].sort().join("_");
      this.socket?.emit('join_room', { senderId, receiverId });

      this.emitUserStatus(senderId, 'Online')
    }
  }

  onMessagesReadStatusUpdate(callback: (data: { senderId: string, receiverId: string, read: boolean }) => void): void {
    this.socket?.off("messages_read_status");
    this.socket?.on("messages_read_status", (data) => {
      callback(data);
    });
  }

  offMessagesReadStatusUpdate(): void {
    if (this.socket) {
      this.socket.off("messages_read_status");
    }
  }

  markMessagesAsRead(senderId: string, receiverId: string) {
    if (this.isConnected()) {
      this.socket?.emit("mark_messages_read", { senderId, receiverId });
    } else {
      console.warn("Socket is not connected. Unable to mark messages as read.");
    }
  }

  emitTypingStatus(senderId: string, receiverId: string, isTyping: boolean) {
    if (this.isConnected()) {
      const room = [senderId, receiverId].sort().join("_");
      this.socket?.emit("typing_status", {
        senderId,
        receiverId,
        isTyping,
        room
      })
    }
  }

  //LISTEN
  onTypingStatusReceived(callback: (data: { senderId: string, isTyping: boolean }) => void) {
    this.socket?.off("typing_status_update");
    this.socket?.on("typing_status_update", (data) => {
      callback(data);
    });
  }

  //CLEANUP
  offTypingStatusReceived() {
    if (this.socket) {
      this.socket.off("typing_status_update");
    }
  }

  emitUserStatus(userId: string, status: 'Online' | 'Offline') {
    if (this.socket) {
      this.socket.emit('user_status_change', { userId, status })
    }
  }

  onUserStatusChange(callback: (data: { userId: string, status: 'Online' | 'Offline' }) => void) {
    this.socket?.on('user_status', callback);
  }

  offUserStatusChange() {
    this.socket?.off('user_status');
  }

  sendCallRequest(senderId: string, receiverId: string) {
    if (this.isConnected()) {
      const room = [senderId, receiverId].sort().join("_");
      this.socket?.emit("video_call_request", {
        senderId,
        receiverId,
        room
      })
    }
    console.log('Request sent')
  }

  listenForCalls(callback: (data: { senderId: string, receiverId: string }) => void): void {
    console.log("Setting up call listener");
    if (!this.socket) {
      return;
    }
    this.socket?.off("incoming_call");
    this.socket.on("incoming_call", (data) => {
      // console.log("Raw incoming call data received:", data);
      callback(data);
  });
  }

  cleanupCallListeners(): void {
    if (this.socket) {
      this.socket.off("incoming_call");
    }
  }

  videoCallAccepted(senderId: string, receiverId:string) {
    if(this.isConnected()) {
      const room = [senderId, receiverId].sort().join("_");
      this.socket?.emit("video-call-accept", {
        senderId,
        receiverId,
        room
      })

      console.log('event videocall accepted emitted')
    }
  }

  listenForAcceptCall(callback: (data: {senderId: string, receiverId:string}) => void): void {
    if(!this.socket) return;
    this.socket?.off("call_accepted");
    this.socket?.on("call_accepted", (data) => {
      console.log("Raw incoming call data received for video call acceptance:", data);
      callback(data);
    })
  }

  cleanUpListenForAcceptCall(): void {
    if(this.socket) {
      this.socket?.off("call_accepted")
    }
  }

  videoCallIgonred(senderId: string, receiverId: string) {
    if(this.isConnected()) {
      const room = [senderId, receiverId].sort().join("_");
      this.socket?.emit("video-call-reject", {
        senderId,
        receiverId,
        room
      })

      console.log('event videocall ignored emitted')
    }
  }

  listenForIgnoredEvent(callback: (data: {senderId: string, receiverId:string}) => void) : void {
    if(!this.socket) return;
    this.socket?.off("call_rejected");
    this.socket?.on("call_rejected", (data) => {
      callback(data);
    })
  }

  cleanUpListenForRejectedCall(): void {
    if(this.socket) {
      this.socket?.off("call_rejected")
    }
  }

  sendWebRTCOffer(senderId: string, receiverId: string, offer: RTCLocalSessionDescriptionInit) {
    console.log('Sending WebRTC offer to:', receiverId);
    if(this.isConnected()){
      const room = [senderId, receiverId].sort().join("_");
      this.socket?.emit("webrtc-offer", {
        senderId,
        receiverId,
        room,
        offer
      })
    }
  }

  sendWebRTCAnswer(senderId: string, receiverId: string, answer: RTCSessionDescriptionInit) {
    console.log('Sending WebRTC answer to:', receiverId);
    if (this.isConnected()) {
      const room = [senderId, receiverId].sort().join("_");
      this.socket?.emit("webrtc-answer", {
        senderId,
        receiverId,
        room,
        answer
      });
      console.log('WebRTC answer sent');
    }
  }

  sendIceCandidate(senderId: string, receiverId: string, candidate: RTCIceCandidate) {
    if (this.isConnected()) {
      const room = [senderId, receiverId].sort().join("_");
      this.socket?.emit("webrtc-ice-candidate", {
        senderId,
        receiverId,
        room,
        candidate
      });
      console.log('ICE candidate sent');
    }
  }
  

}

export default new SocketService();
