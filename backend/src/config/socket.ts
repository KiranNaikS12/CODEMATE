//socket connection in backend
import { injectable, inject } from "inversify";
import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";
import "reflect-metadata";
import { IMessage } from "../types/messageTypes";
import { IMessageService } from "../services/messageService/IMessageService";
import { CallStatus } from "../types/videoCallHistoryTypes";


@injectable()
export class SocketServiceClass {
  private io: Server | null = null;
  private offlineMessages: Record<string, any[]> = {};
  private userSockets: Map<string, Set<string>> = new Map();


  constructor(
    @inject("MessageService") private messageService: IMessageService,
    @inject("HttpServer") private server: http.Server,
  ) { }

  initialize() {
    const corsOrigin = process.env.CORS_ORIGIN
    if (!corsOrigin) {
      throw new Error("CORS_ORIGIN is not defined in the environment variables.");
    }

    const allowedOrigins = corsOrigin.split(",").map(origin => origin.trim());


    this.io = new Server(this.server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
      connectionStateRecovery: {
        maxDisconnectionDuration: 24 * 60 * 60 * 1000,
      }
    });

    this.io.on("connection", (socket) => {
      console.log("A user connected", socket.id);

      // Joining room based on sender and receiver's IDs
      socket.on("join_room", async ({ senderId, receiverId }) => {


        const room = [senderId, receiverId].sort().join("_");
        socket.join(room);
        console.log(`${socket.id} joined room: ${room}`);
        this.io?.to(room).emit("user_status", { userId: senderId, status: "Online" });

        try {
          const messages = await this.messageService.getPreviousMessages(senderId, receiverId)
          socket.emit('load_messages', messages);


          //msg read
          this.io?.to(room).emit("messages_read_status", {
            senderId,
            receiverId,
            read: true
          })

        } catch (error) {
          console.error("Error send ing message:", error);
          socket.emit("error", { message: "Failed to get message." });
        }

        try {
          const callHistory = await this.messageService.getCallHistory(senderId, receiverId);
          socket.emit('load_call_history', callHistory)
        } catch (error) {
          console.error("Failed to load call history", error);
        }

        //Track users's socket connection
        if (!this.userSockets.has(senderId)) {
          this.userSockets.set(senderId, new Set())
        }

        this.userSockets.get(senderId)?.add(socket.id);

        // Send offline messages if available
        this.sendOfflineMessages(senderId, socket)

        //emit status for other connected users
        this.io?.emit("user_status", { userId: senderId, status: "Online" });
      });




      socket.on("mark_messages_read", async ({ senderId, receiverId }) => {
        const room = [senderId, receiverId].sort().join("_");

        try {
          await this.messageService.markMessageAsRead(senderId, receiverId);

          // Broadcast read status to both users in the room
          this.io?.to(room).emit("messages_read_status", {
            senderId,
            receiverId,
            read: true
          });
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      });




      // Listen for sendMessage events
      socket.on("send_message", async (message) => {
        console.log('Message received:', message);
        const room = [message.senderId, message.receiverId].sort().join("_");
        const { senderId, receiverId, text, timestamp, clientId, images } = message;
        console.log(`Message received: ${text} || ${images} from ${senderId} to ${receiverId} at ${timestamp} having clientId ${clientId}`);

        try {
          const preparedMessage = await this.messageService.prepareMessage(
            receiverId,
            senderId,
            text,
            images,
            timestamp,
            clientId,
          );
          const savedMessage: IMessage = await this.messageService.saveMessageToDB(preparedMessage);


          // Check if receiver is online in the room
          const receiverSockets = this.userSockets.get(receiverId);
          if (receiverSockets && receiverSockets.size > 0) {
            this.io?.to(room).emit("receive_message", savedMessage);
          } else {


            this.storeOfflineMessage(receiverId, savedMessage);
          }
        } catch (error) {
          console.error("Error send ing message:", error);
          socket.emit("error", { message: "Failed to send the message." });
        }
      });


      // Handle Typing Indicator
      socket.on("typing_status", ({ senderId, receiverId, isTyping, room }) => {
        socket.to(room).emit("typing_status_update", {
          senderId,
          isTyping
        });
      });


      //**********Listen for video_call_request_event**********
      socket.on("video_call_request", async ({ senderId, receiverId, room, timestamp }) => {
        socket.join(room);

        const data = {
          senderId,
          receiverId
        }

        try {
          const callHistoryData = await this.messageService.prepareCallHistory(
            receiverId,
            senderId,
            CallStatus.Sent,
            timestamp
          );
          await this.messageService.createCallHistory(callHistoryData);
          const receiverSockets = this.userSockets.get(receiverId);
          if (receiverSockets && receiverSockets.size > 0) {
            receiverSockets.forEach(socketId => {
              this.io?.to(socketId).emit("incoming_call", data);
              console.log('call request received for the receiver', data.receiverId);
            });
          } else {
            console.log(`Receiver ${receiverId} is not online`);
          }
        } catch (error) {
          console.error("Error creating call history:", error);
        }
      });


      //list for video_call_accept event
      socket.on("video-call-accept", async ({ senderId, receiverId, room }) => {
        socket.join(room);
        const data = {
          senderId,
          receiverId
        }

        try {
          await this.messageService.updateCallHistory(
            senderId,
            receiverId,
            CallStatus.Accepted
          )

          const receiverSockets = this.userSockets.get(receiverId);
          if (receiverSockets && receiverSockets.size > 0) {
            receiverSockets.forEach(socketId => {
              this.io?.to(socketId).emit("call_accepted", data);
            });
          } else {
            console.log(`Receiver ${receiverId} is not online`);
          }

        } catch (error) {
          console.error("Error updating call history:", error);
        }
      });


      //list for video_call_reject event
      socket.on("video-call-reject", async ({ senderId, receiverId, room }) => {
        socket.join(room);
        const data = {
          senderId,
          receiverId
        }

        try {

          await this.messageService.updateCallHistory(
            senderId,
            receiverId,
            CallStatus.Rejected
          )

          const receiverSockets = this.userSockets.get(receiverId);
          if (receiverSockets && receiverSockets.size > 0) {
            receiverSockets.forEach(socketId => {
              this.io?.to(socketId).emit("call_rejected", data);
            });
          } else {
            console.log(`Receiver ${receiverId} is not online`);
          }

        } catch (error) {
          console.error("Error updating call history:", error);
        }
      });


      //webrtc singnalling events
      socket.on('webrtc-offer', (data) => {
        console.log('offer received', data.senderId, data.receiverId)
        socket.to(data.room).emit('webrtc-offer', data);
      });

      socket.on('webrtc-answer', (data) => {
        console.log('answer listened', data.senderId, data.receiverId)
        socket.to(data.room).emit('webrtc-answer', data);
      });

      socket.on('webrtc-ice-candidate', (data) => {
        console.log('ice-candidate listened', data.senderId, data.receiverId)
        socket.to(data.room).emit('webrtc-ice-candidate', data);
      });


      //*********Events for handling End-Video Call************
      socket.on("video-call-end", ({ senderId, receiverId, room }) => {
        socket.join(room)
        const data = {
          senderId,
          receiverId
        }

        const receiverSockets = this.userSockets.get(receiverId);
        if (receiverSockets && receiverSockets.size > 0) {
          receiverSockets.forEach(socketId => {
            this.io?.to(socketId).emit("call_ended", data);
          });
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        this.userSockets.forEach((sockets, userId) => {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.userSockets.delete(userId);

            this.io?.emit("user_status", { userId, status: "Offline" })
          }
        });


        console.log("A user disconnected", socket.id);
      });
    });
  }

  private sendOfflineMessages(userId: string, socket: Socket) {
    if (this.offlineMessages[userId]) {
      this.offlineMessages[userId].forEach((message) => {
        socket.emit("receive_message", message);
      });
      delete this.offlineMessages[userId];
    }
  }

  private storeOfflineMessage(userId: string, message: any) {
    if (!this.offlineMessages[userId]) {
      this.offlineMessages[userId] = [];
    }
    this.offlineMessages[userId].push(message);

  }

  // Expose the `io` instance if needed elsewhere
  getSocketInstance(): Server | null {
    return this.io;
  }
}


// Usage
const app = express();
const server = http.createServer(app);

export { app, server };
