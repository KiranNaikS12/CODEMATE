// import React from 'react';
// import { createPortal } from 'react-dom';
// import VideoFeed from './VideoFeed';

// interface VideoCallModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   videoRef: React.RefObject<HTMLVideoElement>;
// }

// const VideoCallModal: React.FC<VideoCallModalProps> = ({ isOpen, onClose, videoRef }) => {
//   if (!isOpen) return null;

//   // Create portal to render at root level
//   return createPortal(
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center">
//       {/* Backdrop */}
//       <div 
//         className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
//         onClick={onClose}
//       />
      
//       {/* Modal Content */}
//       <div className="relative z-10 w-full max-w-4xl p-6 mx-4 bg-white shadow-2xl rounded-xl">
//         <div className="flex flex-col">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold text-gray-800">Video Call</h2>
//             <button
//               onClick={onClose}
//               className="px-4 py-2 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
//             >
//               End Call
//             </button>
//           </div>
          
//           {/* Video Feed Container */}
//           <div className="overflow-hidden bg-gray-100 rounded-lg">
//             <VideoFeed videoRef={videoRef} />
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body // This ensures the modal is rendered at the root level
//   );
// };

// export default VideoCallModal;