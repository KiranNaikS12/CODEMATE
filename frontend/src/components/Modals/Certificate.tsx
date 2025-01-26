import { Download, X } from 'lucide-react';
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

interface CertificateProps {
    userName: string;
    mentorName: string;
    courseName: string;
    issueDate: string;
    onClose: () => void;
}

const Certificate: React.FC<CertificateProps> = ({ userName, mentorName, courseName, issueDate, onClose }) => {
    const certificateRef = useRef<HTMLDivElement>(null);
    
    const downloadCertificate = async () => {
        if (certificateRef.current) {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,  
                useCORS: true, 
                logging: false, 
            });
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imgData;
            link.download = 'certificate.png';
            link.click();
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-[800px] h-[600px] p-10 mx-auto text-center bg-white border-8 border-gray-400 rounded-lg shadow-2xl overflow-auto">
                <div className='absolute flex space-x-2 top-2 right-4'>
                    <button className='px-2 py-1 text-gray-600 rounded-md hover:text-gray-900'
                        onClick={downloadCertificate}
                    >
                        <Download size={24}/>
                    </button>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div ref={certificateRef} className="relative w-full max-w-2xl p-6 mx-auto bg-white border-8 border-gray-400 shadow-2xl">
                    <h1 className="mb-2 text-5xl font-bold text-gray-700 uppercase font-pirata">Certificate of Completion</h1>
                    <p className="mt-6 font-serif text-xl text-blue-800">This certificate is proudly presented to</p>

                    <h2 className="mt-2 text-4xl italic text-themeColor font-playwrite">{userName},</h2>

                    <p className='mt-10 italic text-md'>For successfully completing the certified professional course {courseName} under the mentorship of {mentorName}. This accomplishment reflects dedication, hard work, and the skills gained throughout the course. The training provided by CodeMate has equipped me with practical knowledge, empowering me to tackle real-world challenges with confidence.</p>

                    <p className="mt-6 italic font-medium text-blue-800 font-playwrite">Issued on: {issueDate}</p>

                    <div className="flex items-center justify-between mt-4">
                        <div className="text-left">
                            <p className="text-sm font-bold text-gray-700">Hosted By:</p>
                            <p className="text-lg font-semibold text-themeColor">Code Mate</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificate;
