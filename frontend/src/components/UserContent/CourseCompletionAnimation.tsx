import React, { useEffect } from 'react'
import { Player } from '@lottiefiles/react-lottie-player';

interface CourseCompletionAnimationProps {
    onClose: () => void;
}

const CourseCompletionAnimation:React.FC<CourseCompletionAnimationProps> = ({onClose}) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose])
    
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-transparent rounded-md bg-opacity-30">
            <Player
                autoplay
                src="/course_completion.json"
                style={{ height: '350px', width: '350px' }}
                keepLastFrame
            />
        </div>
    );
}

export default CourseCompletionAnimation
