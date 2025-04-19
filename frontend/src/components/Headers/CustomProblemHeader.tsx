import React from 'react';
import * as monaco from 'monaco-editor';
import { ArrowLeftCircleIcon, ArrowRightCircle, Play } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Link } from 'react-router-dom';
import {
    faCog,
  } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Language } from '../../types/languageConstants';
import { useRunCodeMutation, useSubmitCodeMutation,  } from '../../services/userApiSlice';
import { CodeSubmitResponse, SubmissionResponse } from '../../types/problemTypes';
import { APIError } from '../../types/types';
import { toast, Toaster } from 'sonner';



export interface CustomProblemHeader {
    value: string;
    editorInstance: monaco.editor.IStandaloneCodeEditor | null;
    language: Language;
    problemId?: string;
    onCodeSubmitResponse: (response: CodeSubmitResponse) => void;
    onSubmitTabChange: () => void;
    onCodeFinalSubmittedResponse: (response: SubmissionResponse) => void;
}


const CustomProblemHeader: React.FC<CustomProblemHeader> = ({editorInstance, language, problemId, onCodeSubmitResponse, onSubmitTabChange, onCodeFinalSubmittedResponse}) => {
    const userInfo = useSelector((state: RootState) => state.auth.userInfo);
    const userId = userInfo?._id;
    const [run] = useRunCodeMutation();
    const [submit] = useSubmitCodeMutation();
    
    const runCode = async () => {
        if (editorInstance) {
          const sourceCode = editorInstance.getValue();
          try {
            const response = await run({code: sourceCode, language, problemId}).unwrap();
            onCodeSubmitResponse(response);
          } catch (error) {
               const apiError = error as APIError
               if (apiError.data && apiError.data.message) {
                toast.error(apiError.data.message)
             }
          }
        } else {
          console.error("Editor instance is not available.");
        }
    };

    const CodeSubmission = async () => {
        if(editorInstance) {
            const sourceCode = editorInstance.getValue();
            try {
                const response = await submit({code: sourceCode, language, problemId, userId}).unwrap();
                onCodeFinalSubmittedResponse(response)    
                onSubmitTabChange();
            }  catch (error) {
                const apiError = error as APIError
                if (apiError.data && apiError.data.message) {
                   toast.error(apiError.data.message)
                }
            }
        }   else {
            console.error("Editor instance is not available")
        }
    }


    return (
        <header className="flex items-center justify-between px-5 py-3 mt-0 mb-2 bg-white">
             <Toaster
                position="bottom-center"
                richColors
            />
            <div className="flex items-center">
                <img src="/logo.svg" alt="CodeMATE Logo" className="h-8 mr-4" />
                <Link to = '/problem'>
                   <h1 className='text-xl font-medium text-black cursor-pointer hover:text-hoverColor'>Problems</h1>
                </Link>
                <div className='flex ml-4 space-x-2 text-gray-600'>
                    <ArrowLeftCircleIcon />
                    <ArrowRightCircle />
                </div>
            </div>
            <div className="flex items-center">
                <button className="flex items-center px-3 py-1 mr-2 border rounded shadow-inner border-hoverColor text-themeColor hover:bg-green-100 gap-x-1"
                    onClick={runCode}
                >
                    <Play size={16} color='green'/>
                    Run
                </button>
                <button className="px-3 py-1 rounded text-customGrey bg-themeColor hover:bg-highlightBlue"
                    onClick={CodeSubmission}
                >
                    Submit
                </button>
            </div>
            <div className='flex items-center space-x-6'>
                <FontAwesomeIcon icon={faCog} className="text-3xl text-themeColor" />
                <Link to={`/profile/${userId}`}>
                    <img
                        src={userInfo?.profileImage || '/profile.webp'}
                        alt="avatar"
                        className="w-9 h-9 border-2 border-[#247cff] rounded-full cursor-pointer hover:border-3 transition duration-200 object-cover"
                    />
                </Link>
            </div>
        </header>
    );
};

export default React.memo(CustomProblemHeader)
