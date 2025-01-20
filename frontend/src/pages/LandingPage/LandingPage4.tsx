import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const LandingPage4 = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="relative min-h-screen px-4 py-16 bg-customGrey">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        className="flex flex-col items-center space-y-12"
      >
        <motion.h1 
          className="text-4xl font-light bg-clip-text"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
        >
          What Can I Use CodeMate For?
        </motion.h1>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          className="grid grid-cols-1 gap-6 mx-auto md:grid-cols-2 lg:grid-cols-3 max-w-7xl"
        >
          {[1, 2, 3, 4, 5].map((index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="p-6 transition-all duration-300 transform bg-white shadow-lg group rounded-xl hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-blue-600">
                    SOLVE AND LEARN
                  </h2>
                  <ArrowRight className="w-5 h-5 text-blue-600 transition-all transform opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
                </div>
                
                <p className="flex-grow leading-relaxed text-gray-600">
                  Solve challenges in a language you are comfortable with. Try and
                  learn different methods to optimize your code. Improve your rank
                  across world wide. Practice all types of problems. View how others
                  solved the same challenge, learn new techniques from them.
                </p>

                <motion.div 
                  className="w-full h-1 mt-4 origin-left transform rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage4;