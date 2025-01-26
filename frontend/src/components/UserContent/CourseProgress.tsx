import React from 'react'
import { CheckCircle2Icon } from 'lucide-react';

interface CourseProgressProps {
    totalVideos: number;
    completedVideos: number;
    percentage: number;
}

const CourseProgress: React.FC<CourseProgressProps> = ({ totalVideos, completedVideos, percentage }) => {
    const isCompleted = percentage === 100;

    return (
        <div className="w-full mt-2">
            {isCompleted ? (
                <div className="flex items-center justify-center w-full p-2 bg-green-100 rounded-lg">
                    <CheckCircle2Icon className="mr-2 text-green-600" />
                    <span className="font-semibold text-green-600">Course Completed</span>
                </div>
            ) : (
                <div className="flex flex-col">
                    <div className="flex justify-between mb-1 text-sm text-gray-600">
                        <span>Progress</span>
                        <span>{completedVideos}/{totalVideos} Videos</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2.5">
                        <div 
                            className="bg-themeColor h-2.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                    <div className="mt-1 text-sm text-center text-gray-600">
                        {percentage}% Complete
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseProgress