import React from 'react';
import { Player } from "@lottiefiles/react-lottie-player";
import { MoveLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
            <Player
                autoplay
                loop
                src="/pageNotFound.json"
                style={{ height: '300px', width: '300px' }}
            />

 
            <div className="space-y-6 text-center -mt-14">
                <h2 className="text-6xl text-gray-500 font-extralight">Page Not Found</h2>
                <p className="max-w-lg mx-auto text-lg text-gray-600">
                    Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track!
                </p>
            </div>

            {/* Decorative Divider */}
            <div className="relative w-full max-w-md mt-6">
                <div className="absolute top-0 w-64 h-1 -translate-x-1/2 left-1/2 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>


            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-3 mt-10 font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
                <MoveLeft size={16}/>
                Go Back
            </button>
        </div>
    );
};

export default NotFound;
