import React, { useState, useEffect, useRef } from 'react'
import { Check, CheckCheck, Send, X, Paperclip, VideoIcon } from 'lucide-react'
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Message } from '../../types/messageTypes';
import socketService from '../../services/socket.service';
import { UserAdditional } from '../../types/userTypes';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import fileToBase64 from '../../utils/base64file';
import VideoCallHanlder from '../ChatHandler/VideoCallHanlder';
import VideoCallResponseHandler from '../ChatHandler/VideoCallResponseHandler';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  data: UserAdditional

}

const TutorChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose, data }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState<string>("");
  const [isReceiverActive, setIsReceiverActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState(false);
  const [receiverTyping, setReceiverTyping] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isIncomingcallResponse, SetIsIncomingcallResponse] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const senderId = useSelector((state: RootState) => state.tutor.tutorInfo)
  const receiverId = data?._id;

  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);


  useEffect(() => {
    const setupSocketConnection = async () => {
      try {
        // Ensure socket is connected
        await socketService.connect();

        // Join room when receiverId is available
        if (receiverId) {
          socketService.joinRoom(senderId!._id, receiverId);

          socketService.markMessagesAsRead(senderId!._id, receiverId)


          socketService.onMessagesReadStatusUpdate((data) => {
            setMessages(prevMessages =>
              prevMessages.map(msg =>
                (msg.senderId === data.senderId && msg.receiverId === data.receiverId)
                  ? { ...msg, read: data.read }
                  : msg
              )
            );
          });

          socketService.loadMessages((loadedMessages: Message[]) => {
            setMessages((prev) => {
              const newMessages = loadedMessages.filter(
                (msg) => !prev.some((prevMsg) => prevMsg.clientId === msg.clientId)
              );

              return [...prev, ...newMessages];
            });
          });

          setIsReceiverActive(true)
        }

        // Setup message receiving
        const messageListener = (newMessage: Message) => {
          if (newMessage.senderId === senderId?._id) return;

          setMessages((prev) => {
            const isDuplicate = prev.some((msg) => msg.clientId === newMessage.clientId);
            if (!isDuplicate) {
              return [...prev, newMessage]
            }
            return prev;
          });

        }

        socketService.onMessageReceived(messageListener);


        socketService.onTypingStatusReceived((data) => {
          if (data.senderId === receiverId) {
            setReceiverTyping(data.isTyping)
          }
        })

        //Listen for userStatus event
        const handleUserStatus = (statusUpdate: { userId: string, status: 'Online' | 'Offline' }) => {
          const { userId, status } = statusUpdate;
          if (userId === receiverId) {
            setIsReceiverActive(status === 'Online')
          }
        }

        socketService.onUserStatusChange(handleUserStatus);

        const handleIncomingCall = (data: { senderId: string; receiverId: string }) => {
          console.log("Incoming call data:", data);
          SetIsIncomingcallResponse(true)
        };

        socketService.listenForCalls(handleIncomingCall);

      } catch (error) {
        console.error("Socket setup failed:", error);
      }
    };

    setupSocketConnection();

    return () => {
      socketService.offMessageReceived();
      socketService.offMessagesReadStatusUpdate();
      socketService.offTypingStatusReceived();
      socketService.offUserStatusChange();
      socketService.cleanupCallListeners();
    };
  }, [receiverId, senderId]);


  useEffect(() => {
    if (isVisible && lastMessageRef.current) {
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isVisible, messages]);


  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.emitTypingStatus(senderId!._id, receiverId!, true)
    }

    //CLEAR_EXISITING_TIMEOUT
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.emitTypingStatus(senderId!._id, receiverId!, false)
    }, 2000)
  }

  const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    handleTyping();
  }

  const handleFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);

      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      setSelectedFiles(prev => [...prev, ...imageFiles]);
    }
  }

  //HANDLE SEND MESSAGE
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!messageText.trim() && selectedFiles.length === 0) || !receiverId) {
      return;
    }

    try {

      // Convert selected files to base64
      const imagePromises = selectedFiles.map(file => fileToBase64(file));
      const imageBase64Data = await Promise.all(imagePromises);

      console.log('image', imageBase64Data)

      const newMessage: Message = {
        senderId: senderId!._id,
        receiverId,
        text: messageText.trim(),
        images: imageBase64Data,
        timestamp: new Date().toISOString(),
        clientId: Date.now().toString()
      }

      setMessages(prev => [...prev, newMessage]);

      socketService.sendMessage(newMessage);

      setMessageText("");
      setSelectedFiles([]);

    } catch (error) {
      console.error("Failed to send message:", error);
    }

  }


  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageText((prev) => prev + emojiData.emoji);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  //HANDLE_START_VIDEO_CALL
  const handleStartCall = () => {
    if (!senderId?._id || !receiverId) return;
    setIsVideoCallActive(true);

    socketService.sendCallRequest(senderId!._id, receiverId)
  }

  if (!isVisible) return null;

  const renderMessage = (msg: Message) => (
    <div
      className={`mb-2 p-3 rounded-lg shadow-sm max-w-[80%] ${msg.senderId === senderId?._id
        ? "bg-blue-100 text-blue-500 text-start ml-auto"
        : "bg-gray-200 text-gray-800 self-start mr-auto"
        }`}
      style={{
        minWidth: "100px",
        padding: "0.5rem 1rem",
        width: "fit-content",
      }}
    >
      {/* Text content */}
      {msg.text && <div className="mb-2">{msg.text}</div>}

      {/* Image content */}
      {msg.images && msg.images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {msg.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Message attachment ${index + 1}`}
              className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {/* Timestamp and read status */}
      <div className='flex items-end justify-end space-x-1'>
        <h1 className='text-xs text-gray-500'>
          {new Date(msg.timestamp).toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })}
        </h1>
        {isReceiverActive || msg.read ? (
          <CheckCheck size={14} color='green' />
        ) : (
          <Check size={12} />
        )}
      </div>
    </div>
  );



  return (
    <div className={`fixed top-28 right-2 flex flex-col h-[600px] bg-white w-[400px] rounded-lg transition-all duration-300 ease-in-out border shadow-left   ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 rounded-t-lg bg-gradient-to-r from-blue-400 to-purple-300">
        <div className="flex items-center space-x-3">
          <div className={`flex items-center justify-center w-10 h-10  rounded-full  shadow-inner ${isReceiverActive ? 'bg-green-500 ' : 'bg-white  rounded-full'}`}>
            <img src={data.profileImage} alt={data.username} className='object-cover rounded-full w-9 h-9' />
          </div>
          <div className='flex flex-col'>
            <h1 className="text-lg font-semibold text-white">{data.username}</h1>
            <h1 className={`text-xs text-gray-300`}>
              {receiverTyping ? 'typing...' : (
                isReceiverActive ? 'Online' : 'Offline'
              )}
            </h1>
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          <button
            className='flex items-center justify-center w-10 h-10 bg-green-100 rounded-full'
            onClick={handleStartCall}
          >
            <VideoIcon size={24} color='green' />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-white transition-colors duration-200 rounded-full hover:bg-white/20"
            aria-label="Close chat"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow p-4 overflow-y-auto bg-gray-100">
        {messages.map((msg, idx) => (
          <div key={idx} ref={idx === messages.length - 1 ? lastMessageRef : null}>
            {renderMessage(msg)}
          </div>
        ))}
        {isVideoCallActive && (
          <VideoCallHanlder
            senderId={senderId?._id}
            isVideoCallActive={isVideoCallActive}
            receiverId={receiverId}
          />
        )}
        {isIncomingcallResponse && (
          <div className='relative overflow-visible'>
            <VideoCallResponseHandler senderId = {senderId!._id} receiverId = {receiverId}/>
          </div>
        )}
        {receiverTyping && (
          <div className="flex items-center mt-4 mb-4 space-x-2">
            <div className="flex items-center px-4 py-2 space-x-1 bg-gray-200 rounded-full">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
          
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">


        <div className='flex flex-wrap mb-2 gap-x-2'>
          {selectedFiles.map((file, idx) => (
            <div key={idx} className='relative'>
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-16 p-1 mb-6 mr-2 border-gray-300 rounded-md shadow-lg border-1 w-18"
              />
              <button
                className='absolute top-0 right-0 p-1 text-white bg-red-500 rounded-full'
                onClick={() => handleRemoveImage(idx)}
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <form className="flex space-x-2" onSubmit={handleSendMessage}>
          <button
            type="button"
            className="p-2 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            aria-label="Toggle emoji picker"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="absolute z-10 top-4">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <div className="relative flex items-center w-full">
            <input
              type="text"
              value={messageText}
              onChange={handleMessageInput}
              placeholder="Type your message..."
              className="flex-grow p-2 transition-colors duration-200 bg-gray-100 border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-400"
            />
            <div className="absolute right-3 top-3 group">
              <button
                type='button'
                className="relative text-gray-500 hover:text-blue-500 focus:outline-none"
                aria-label="Attach file"
                onClick={handleFileSelection}
              >
                <Paperclip size={20} className="text-gray-400" />

                {/* Tooltip */}
                <span className="absolute px-2 py-1 text-sm text-white transition-opacity duration-200 transform -translate-x-1/2 bg-gray-700 rounded-md opacity-0 whitespace-nowrap left-1/2 bottom-8 group-hover:opacity-100">
                  Attach files
                </span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
              />
            </div>
          </div>

          <button
            type="submit"
            className="p-3 text-white transition-colors duration-200 bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default TutorChatInterface

