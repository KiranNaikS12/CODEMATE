import React, { useState } from "react";
import { Camera, X } from "lucide-react";
import { Field, FieldArray } from "formik";
import { PreviewState, VideoUploadSectionProps } from "../../types/courseTypes";


const VideoUploadSection: React.FC<VideoUploadSectionProps> = ({
  values,
  setFieldValue,
}) => {
  const [previews, setPreviews] = useState<PreviewState>({});
  const [isDragging, setIsDragging] = useState<{ [key: number]: boolean }>({});

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    chapterIndex: number
  ): void => {
    const files = Array.from(event.target.files || []);

    // Initialize videos array with title for each video
    const videosWithTitles = files.map((file) => ({
      title: "",
      file: file,
      chapterIndex: chapterIndex
    }));

    setFieldValue(`videoUrl.${chapterIndex}.videos`, videosWithTitles);

    // Reset the dragging state
    setIsDragging((prev) => ({ ...prev, [chapterIndex]: false }));

    // Clear previous previews for this index
    setPreviews((prev) => ({ ...prev, [chapterIndex]: [] }));

    files.forEach((file: File) => {
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";

      videoElement.onloadedmetadata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 140;

        const context = canvas.getContext("2d");
        
        if(context) {
          // Seek to 1 second if available, or just take the first frame
          videoElement.currentTime = 1;
        }
        
        videoElement.onseeked = () => {
          if (context) {
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            setPreviews((prev) => ({
              ...prev,
              [chapterIndex]: [...(prev[chapterIndex] || []), canvas.toDataURL()],
            }));
          }
        } 
      };

      videoElement.src = URL.createObjectURL(file);
    });
  };

  const handleRemoveVideo = (chapterIndex: number, videoIndex: number) => {
    const currentVideos = [...(values.videoUrl[chapterIndex].videos || [])];
    currentVideos.splice(videoIndex, 1);
    setFieldValue(`videoUrl.${chapterIndex}.videos`, currentVideos);

    const currentPreviews = [...(previews[chapterIndex] || [])];
    currentPreviews.splice(videoIndex, 1);
    setPreviews((prev) => ({ ...prev, [chapterIndex]: currentPreviews }));
  };

  const handleDragEnter = (index: number) => {
    setIsDragging((prev) => ({ ...prev, [index]: true }));
  };

  const handleDragLeave = (index: number) => {
    setIsDragging((prev) => ({ ...prev, [index]: false }));
  };

  return (
    <div className="w-full">
      <label className="block mb-4 font-medium">Video Upload section</label>
      <FieldArray name="videoUrl">
        {({ push, remove }) => (
          <div className="space-y-6">
            {values.videoUrl.map((chapter, chapterIndex: number) => (
              <div
                key={chapterIndex}
                className="w-full p-6 border border-gray-400 rounded-lg"
              >
                <div className="space-y-4">
                  {/* Chapter Title */}
                  <div>
                    <label className="mb-2 text-sm font-medium text-gray-700 ">
                      Chapter Title
                    </label>
                    <Field
                      name={`videoUrl.${chapterIndex}.chapterTitle`}
                      placeholder="Add Chapter Title @example: Chapter -1"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="relative">
                    {/* Upload area */}
                    <label className="mb-2 text-sm font-medium text-gray-700 ">
                         Upload Videos <span className="text-blue-500">(Support Multiple Files)</span>
                    </label>
                    <div
                      className={`relative w-full h-32 rounded-lg transition-colors duration-200 
                          ${
                            isDragging[chapterIndex]
                              ? "bg-blue-500/20"
                              : "bg-gray-100"
                          }
                          ${
                            chapter.videos?.length
                              ? "border-2 border-blue-500"
                              : "border-2 border-dashed border-gray-300"
                          }
                          hover:bg-blue-500/10`}
                    >
                      
                      <input
                        type="file"
                        accept="video/*"
                        name="video"
                        multiple
                        onChange={(e) => handleFileChange(e, chapterIndex)}
                        onDragEnter={() => handleDragEnter(chapterIndex)}
                        onDragLeave={() => handleDragLeave(chapterIndex)}
                        onDrop={() => handleDragLeave(chapterIndex)}
                        className="absolute inset-0 z-10 w-full h-full border border-gray-300 opacity-0 cursor-pointer "
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Camera
                          className={`w-12 h-12 ${
                            isDragging[chapterIndex]
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`mt-2 text-sm ${
                            isDragging[chapterIndex]
                              ? "text-blue-500"
                              : "text-gray-500"
                          }`}
                        >
                          {chapter.videos?.length
                            ? `${chapter.videos.length} file(s) selected`
                            : "Click or drag to upload"}
                        </span>
                      </div>
                    </div>

                    {/* Video previews with individual titles */}
                    <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3">
                      {chapter.videos?.map((video, videoIndex: number) => (
                        <div key={videoIndex} className="relative group">
                          <div className="w-full space-y-2">
                            {/* Video Title Input */}
                            <Field
                              name={`videoUrl.${chapterIndex}.videos.${videoIndex}.title`}
                              placeholder="Add Video Title Here.... @example: Lesson-1"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                            />

                            {/* Video Preview */}
                            <div className="relative w-full h-32 overflow-hidden rounded-lg">
                              {previews[chapterIndex]?.[videoIndex] ? (
                                <img
                                  src={previews[chapterIndex][videoIndex]}
                                  alt={`Video thumbnail ${videoIndex + 1}`}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                                  <span className="text-xs text-gray-500">
                                    Loading...
                                  </span>
                                </div>
                              )}
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveVideo(chapterIndex, videoIndex)
                                }
                                className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* File name */}
                            <p className="text-xs text-gray-600 truncate">
                              {video.file
                                ? video.file.name
                                : "No video uploaded"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {values.videoUrl.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(chapterIndex)}
                      className="mt-4 text-sm text-red-500"
                    >
                      Remove Chapter
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => push({ chapterTitle: "", videos: [] })}
              className="inline-flex items-center text-sm font-normal leading-4 text-indigo-700 hover:text-indigo-500"
            >
              + Add Another Chapter
            </button>
          </div>
        )}
      </FieldArray>
    </div>
  );
};

export default VideoUploadSection;
