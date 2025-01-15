import { DownloadedImages, STORAGE_KEY } from "../types/messageTypes";

const handleDownload = async (
    image: string,
    messageId: string,
    index: number,
    setIsDownloading: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    setDownloadedImages: React.Dispatch<React.SetStateAction<DownloadedImages>>
  ) => {
    try {
      setIsDownloading(prev => ({ ...prev, [`${messageId}-${index}`]: true }));
      
      //DOWNLOAD IMAGE
      const response = await fetch(image);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
  
      //TRIGGER DOWNLOAD
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `downloaded-image-${index}.jpg`;
      anchor.click();
  
      URL.revokeObjectURL(url);

      setDownloadedImages(prev => {
        const newState = {
            ...prev,
            [messageId]: {
                ...(prev[messageId] || {}),
                [index.toString()]: true  
            }
        };

        //UPADATE LOCALSTORAGE
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        } catch (err) {
            console.error('Failed to save to localStorage:', err);
        }

        return newState;
    });


    } catch (error) {
      console.error('Failed to download the image:', error);
    } finally {
      setIsDownloading(prev => ({ ...prev, [`${messageId}-${index}`]: false }));
    }
};

export default handleDownload;