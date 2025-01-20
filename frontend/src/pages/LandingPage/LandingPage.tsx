import React, { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'
import LandingSection2 from './LandingSection2';

const LandingPage: React.FC = () => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => {
        setOpacity(0.6);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <>
        <div className='relative min-h-screen'>
            <div
                ref={divRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className='absolute inset-0 bg-themeColor'>

                <div
                    className="absolute inset-0 transition-opacity duration-500 ease-in-out pointer-events-none"
                    style={{
                        opacity,
                        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(61, 61, 126, 0.40), transparent 50%)`,
                    }}
                />

                {/* Header */}
                <motion.div
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 10,
                        duration: 0.8,
                    }}
                    className="flex items-center m-14">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="45"
                        height="45"
                        viewBox="0 0 200 200"
                        className="flex-shrink-0 "
                    >
                        <path
                            d="M 130,50 A 70,70 0 1,0 130,150"
                            fill="none"
                            stroke="#D8D8FD"
                            strokeWidth="20"
                        />
                        <path
                            d="M 135,150 L 120,60 L 150,110 L 180,60 L 180,150"
                            fill="none"
                            stroke="#247CFF"
                            strokeWidth="20"
                        />
                    </svg>

                    <div className='flex items-center justify-between w-full'>
                        <h1 className="text-4xl font-bold text-customGrey">Code<span className="text-[#247CFF]">MATE</span></h1>
                        <div className='flex items-center mr-6 space-x-4'>
                            <div className="relative w-1/2">
                                <input
                                    type="text"
                                    placeholder="search Here"
                                    className="w-full py-2 pl-4 pr-12 text-gray-600 bg-gray-100 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                                <div className="absolute -translate-y-1/2 right-3 top-1/2">
                                    <div className="flex items-center justify-center p-1 bg-blue-600 rounded-full">
                                        <Search className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>
                            <Link
                                to='/login'
                                className={`px-4 py-2 font-semibold  rounded-lg bg-themeColor text-customGrey border border-hoverColor`}
                            >
                                LOGIN
                            </Link>
                            <Link
                                to='/tutor/login'
                                className={`px-4 py-2 font-semibold rounded-lg bg-themeColor text-customGrey border border-hoverColor`}
                            >
                                BE A TUTOR
                            </Link>
                        </div>
                    </div>
                </motion.div>


                {/* Header-Text */}
                <motion.div
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 10,
                        duration: 0.8,
                    }}
                >
                    <div className='mt-40 ml-14'>
                        <h1 className='text-customGrey break-words w-[500px]'>
                            <span className='mr-1 text-4xl font-bold text-customGrey '>MASTER</span>
                            <span className='text-2xl text-customGrey'>Coding At Tailored Courses And Real-Time Practice At CodeMate</span>
                        </h1>
                        <h1 className='mt-2 text-lg text-gray-400 animate-pulse'>LEARN. PRACTICE. EXPLORE</h1>
                    </div>

                    {/* Header-Button */}
                    <div className='flex flex-col mt-8 ml-12 space-y-4 '>
                        <div className='flex space-x-4'>
                            <button className='px-3 py-2 text-sm font-medium rounded-md bg-customGrey text-hoverColor '>GET STARTED</button>
                            <button className='px-4 py-2 text-sm font-medium border rounded-md text-customGrey border-hoverColor'>EXPLORE</button>
                        </div>
                    </div>

                </motion.div>

                <div className='absolute -bottom-10 right-28 z-10 w-[600px]'>
                    <img
                        src="/landing-vector1.png"
                        alt="Developer illustration"
                        className="w-full h-auto "
                    />
                </div>

                {/* White diagonal overlays */}
                <div className='absolute bottom-0 left-0 w-full'>
                    <div className='relative h-[45vh]'>
                        {/* Left Slope - Shorter */}
                        <div
                            className="absolute bottom-0 left-0 w-2/3 h-[25vh] bg-customGrey"
                            style={{
                                clipPath: 'polygon(0 100%, 80% 100%, 0 0)'
                            }}
                        ></div>

                        {/* Right slope - Taller */}
                        <div
                            className="absolute bottom-0 right-0 w-2/3 h-[35vh] bg-customGrey"
                            style={{
                                clipPath: 'polygon(100% 100%, 0% 100%, 100% 0)'
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
        <LandingSection2/>
        </>
    );
}

export default LandingPage
