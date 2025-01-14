import { X } from "lucide-react";


const ImagePreview = ({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div className="relative ">
        <img
          src={imageUrl}
          alt="Preview"
          className="object-contain w-3/4 rounded-lg h-3/4"
        />
        <button
          onClick={onClose}
          className="absolute p-2 bg-white rounded-full shadow-md top-2 left-2 hover:bg-gray-200"
          aria-label="Close preview"
        >
          <X size={16}/>
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;
