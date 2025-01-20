import React from 'react';
import { motion } from 'framer-motion';
import LandingPage4 from './LandingPage4';


const LandingSection3: React.FC = () => {
    const cardVariants = {
        hidden: (direction: 'left' | 'right') => ({
            x: direction === 'left' ? -100 : 100,
            opacity: 0
        }),
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                duration: 1,
                bounce: 0.3
            }
        }
    };

    return (
        <>
        <div className='relative min-h-screen bg-customGrey'>
            <div className='flex flex-col space-y-4'>
                <motion.div 
                    className='flex items-center justify-center mt-8 space-x-16'
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, margin: "-100px" }}
                >
                    <motion.div
                        variants={cardVariants}
                        custom="left"
                    >
                        <img
                            src="/landing-Vector2.png"
                            alt="Coding"
                            className="w-[350px]"
                        />
                    </motion.div>
                    <motion.div 
                        className='flex-col justify-center space-y-3'
                        variants={cardVariants}
                        custom="right"
                    >
                        <h1 className='text-2xl break-words text-gray-500 w-[600px]'>
                            Practice Coding With Personalized Tailored Environment for Every Language
                        </h1>
                        <p className='break-words w-[800px] text-2xl text-gray-400 font-light'>
                            Start coding right away in the language of your choice. Our language-specific environments provide the optimal setup to help you learn faster, code smarter, and build a strong foundation in your chosen language, empowering you to tackle complex problems and real-world challenges effectively.
                        </p>
                    </motion.div>
                </motion.div>

                <motion.div 
                    className='flex items-center justify-center space-x-6'
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div 
                        className='flex-col justify-center space-y-3'
                        variants={cardVariants}
                        custom="left"
                    >
                        <h1 className='text-2xl break-words text-gray-500 w-[600px]'>
                            Elevate Your Skills With Premium Course And Upskill And Gain Hands-On Experience
                        </h1>
                        <p className='break-words w-[800px] text-2xl text-gray-400 font-light'>
                            At CodeMate, we believe that learning should be as diverse and personalized as the needs of our users. That's why we've developed a robust course purchase and tutorial system that offers something for everyone - from beginners taking their first steps in coding to seasoned professionals looking to master advanced concepts
                        </p>
                    </motion.div>
                    <motion.div
                        variants={cardVariants}
                        custom="right"
                    >
                        <img
                            src="/landing-Vector3.png"
                            alt="Coding"
                            className="w-[450px]"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div>
        <LandingPage4/>
        </>
    );
};

export default LandingSection3;