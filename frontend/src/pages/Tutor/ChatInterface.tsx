import React, { useState, useEffect, useRef } from 'react';
import { Check, CheckCheck, Send, X, Paperclip, VideoIcon, Video, CircleX } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import TutorHeader from '../../components/Headers/TutorHeader';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useGetEnrolledUserQuery } from '../../services/tutorApiSlice';
import { Message } from '../../types/messageTypes';
import { UserAdditional } from '../../types/userTypes';
import socketService from '../../services/socket.service';
import fileToBase64 from '../../utils/base64file';
import VideoCallHanlder from '../../components/ChatHandler/VideoCallHanlder';
import VideoCallResponseHandler from '../../components/ChatHandler/VideoCallResponseHandler';
import { ICallHistory } from '../../types/callHistoryTypes';
import {  getCallStatusForTutor, getStatusColor } from '../../utils/getCallStatus';

const ChatInterface: React.FC = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isReceiverActive, setIsReceiverActive] = useState(false);
  const [receiverTyping, setReceiverTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isIncomingcallResponse, SetIsIncomingcallResponse] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserAdditional | null>(null);
  const [history, setHistory] = useState<ICallHistory[]>([]);
  const [historyTab, sethistoryTab] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  const tutorInfo = useSelector((state: RootState) => state.tutor.tutorInfo);
  const id = tutorInfo?._id;
  const { data: studentDetails } = useGetEnrolledUserQuery({
    tutorId: id!,
  });

  const users = studentDetails?.data?.users;
  const senderId = tutorInfo?._id;
  const receiverId = selectedUser?._id;

  useEffect(() => {
    const setupSocketConnection = async () => {
      if (!senderId) return;

      try {
        await socketService.connect(senderId!);
        socketService.joinRoom(senderId!, receiverId!);
        socketService.markMessagesAsRead(senderId!, receiverId!);

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

        const messageListener = (newMessage: Message) => {
          if (newMessage.senderId === senderId) return;

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
        });

        const handleUserStatus = (statusUpdate: { userId: string, status: 'Online' | 'Offline' }) => {
          const { userId, status } = statusUpdate;
          if (userId === receiverId) {
            setIsReceiverActive(status === 'Online')
          }
        };

        socketService.onUserStatusChange(handleUserStatus);

        const handleIncomingCall = (data: { senderId: string; receiverId: string }) => {
          console.log("Incoming call data:", data);
          SetIsIncomingcallResponse(true)
        };

        socketService.listenForCalls(handleIncomingCall);

        //Fetching Call History
        const currentUserId = senderId;
        if (currentUserId) {
          socketService.loadCallHistory((callHistories) => {
            setHistory(callHistories)
          })
        }

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
    if (lastMessageRef.current) {
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);


  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.emitTypingStatus(senderId!, receiverId!, true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.emitTypingStatus(senderId!, receiverId!, false)
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!messageText.trim() && selectedFiles.length === 0) || !receiverId) {
      return;
    }

    try {
      const imagePromises = selectedFiles.map(file => fileToBase64(file));
      const imageBase64Data = await Promise.all(imagePromises);

      const newMessage: Message = {
        senderId: senderId!,
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

  const handleStartCall = () => {
    if (!senderId || !receiverId) return;
    setIsVideoCallActive(true);
    socketService.sendCallRequest(senderId, receiverId)
  }

  const handleSelectUser = (user: UserAdditional) => {
    setSelectedUser(user);
    setMessages([]); // Clear previous messages
  }

  const handleHistoryTab = () => {
    sethistoryTab(!historyTab)
  }

  const getOtherUserInfo = (callHistory: ICallHistory) => {
    // If the current tutor is the sender, return receiver's info
    if (callHistory.senderId === id) {
      const receiver = users?.find(user => user._id === callHistory.receiverId);
      return {
        username: receiver?.username || 'Unknown User',
        profileImage: receiver?.profileImage || './profile.webp'
      };
    }

    // If the current tutor is the receiver, return sender's info
    if (callHistory.receiverId === id) {
      const sender = users?.find(user => user._id === callHistory.senderId);
      return {
        username: sender?.username || 'Unknown User',
        profileImage: sender?.profileImage || '/profile.webp'
      };
    }

    return {
      username: 'Unknown User',
      profileImage: '/profile.webp'
    };
  };

  const renderMessage = (msg: Message) => (
    <div
      className={`mb-2 p-3 rounded-lg shadow-sm max-w-[80%] ${msg.senderId === senderId
        ? "bg-white text-black text-start ml-auto shadow-md"
        : "bg-gradient-to-tr from-blue-200 to-blue-300 text-black self-start mr-auto shadow-md"
        }`}
      style={{
        minWidth: "100px",
        padding: "0.5rem 1rem",
        width: "fit-content",
      }}
    >
      {msg.text && <div className="mb-2">{msg.text}</div>}

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

      <div className='flex items-end justify-end space-x-1'>
        <h1 className='text-xs text-gray-700'>
          {new Date(msg.timestamp).toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })}
        </h1>
        {isReceiverActive || msg.read ? (
          <CheckCheck size={14} color='#228B22' />
        ) : (
          <Check size={12} />
        )}
      </div>
    </div>
  );

  console.log(historyTab)

  return (
    <div className="flex flex-col min-h-screen overflow-y-hidden bg-gray-50">
      <TutorHeader />
      <div className="flex flex-1 mt-20">
        {/* Users List - Left Side */}
        <div className="flex flex-col bg-white border-r border-gray-300 w-80">
          <div className="flex items-center justify-between p-4 pt-4 border-b border-gray-300">
            <h2 className="text-xl font-semibold text-themeColor">Chats</h2>
            <div className="transition-transform duration-200 transform hover:scale-110"
              onClick={() => handleHistoryTab()}
            >
              {historyTab ? (
                <CircleX size={20} color='red' />
              ) : (
                <Video size={20} color="#3D3D7E" />
              )}
            </div>
          </div>
          {historyTab ? (
            <div className="flex-1 overflow-y-auto"
              style={{
                maxHeight: 'calc(100vh - 160px)',
                overflowY: 'auto'
              }}
            >
              {history.map((callHistory) => {
                const otherUserInfo = getOtherUserInfo(callHistory);

                return (
                  <div
                    key={callHistory._id}
                    className="flex items-center p-4 m-2 transition-colors border-b border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex items-center w-full">
                      <div className="flex items-center flex-1 space-x-3">
                        <img
                          src={otherUserInfo.profileImage}
                          alt={otherUserInfo.username}
                          className="object-cover w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{otherUserInfo.username}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(callHistory.timestamp).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(callHistory.callStatus, callHistory.senderType)}`}>
                         {getCallStatusForTutor(callHistory.callStatus, callHistory.senderType)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto"
              style={{
                maxHeight: 'calc(100vh - 200px)',
                overflowY: 'auto'
              }}
            >
              {users?.map((user, index) => (
                <div
                  key={user?._id}
                  className={`flex items-center p-4 m-2 transition-colors rounded-lg cursor-pointer 
                 ${selectedUser?._id === user._id ? 'bg-themeColor text-customGrey' : 'hover:bg-gray-100'}
                 ${index !== users.length - 1 ? 'border-b border-gray-300' : ''}`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="relative">
                    <img
                      src={user?.profileImage}
                      alt={user?.username}
                      className="object-cover w-10 h-10 rounded-full"
                    />
                    {isReceiverActive && selectedUser?._id === user._id && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 ml-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium ">{user.username}</h3>
                    </div>
                  </div>
                  <div className='border-b border-themeColor'></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area - Right Side */}
        {selectedUser ? (
          <div className="flex flex-col flex-1 bg-customGrey">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-300">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-inner ${isReceiverActive ? 'bg-green-500' : 'bg-white rounded-full'}`}>
                  <img
                    src={selectedUser.profileImage}
                    alt={selectedUser.username}
                    className='object-cover rounded-full w-9 h-9'
                  />
                </div>
                <div className="ml-3">
                  <h2 className="font-medium text-gray-800">{selectedUser.username}</h2>
                  <p className="text-sm text-gray-500">
                    {receiverTyping ? 'typing...' : (isReceiverActive ? 'Online' : 'Offline')}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <button
                  className='flex items-center justify-center w-10 h-10 bg-green-100 rounded-full'
                  onClick={handleStartCall}
                >
                  <VideoIcon size={24} color='green' />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray"
              style={{
                maxHeight: 'calc(100vh - 240px)',  // Adjust height
                overflowY: 'auto'
              }}
            >
              {messages.map((msg, idx) => (
                <div key={idx} ref={idx === messages.length - 1 ? lastMessageRef : null}>
                  {renderMessage(msg)}
                </div>
              ))}
              {receiverTyping && (
                <div className="flex items-center mt-4 mb-4 space-x-2">
                  <div className="flex items-center px-4 py-2 space-x-1 bg-gray-200 rounded-full">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              )}
              {isVideoCallActive && (
                <VideoCallHanlder
                  senderId={senderId}
                  isVideoCallActive={isVideoCallActive}
                  receiverId={receiverId}
                />
              )}
              {isIncomingcallResponse && (
                <div className='relative overflow-visible'>
                  <VideoCallResponseHandler senderId={senderId!} receiverId={receiverId} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
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
                  className="w-10 h-10 bg-gray-100 border border-gray-400 rounded-full hover:bg-gray-200"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  aria-label="Toggle emoji picker"
                >
                  😊
                </button>
                {showEmojiPicker && (
                  <div className="absolute z-10 bottom-36 left-1/2">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
                <div className="relative flex items-center flex-1">
                  <input
                    type="text"
                    value={messageText}
                    onChange={handleMessageInput}
                    placeholder="Type your message..."
                    className="w-full p-2 bg-gray-100 border border-gray-400 rounded-full focus:outline-none focus:border-blue-600"
                  />
                  <div className="absolute right-3 top-3 group">
                    <button
                      type="button"
                      className="relative text-gray-400 hover:text-blue-600 focus:outline-none"
                      aria-label="Attach file"
                      onClick={handleFileSelection}
                    >
                      <Paperclip size={20} />
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
                  className="p-3 ml-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center flex-1 bg-gray-100">
            <p className="text-gray-500">Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatInterface;