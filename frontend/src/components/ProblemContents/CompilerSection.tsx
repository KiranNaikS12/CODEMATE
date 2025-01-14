import React, { useState, useEffect } from 'react';
import { FaFileCircleCheck } from "react-icons/fa6";
import { CodeSubmitResponse, TestCase } from '../../types/problemTypes';


interface CompilerSectionProps {
    responseData: CodeSubmitResponse | null;
    examples: TestCase[] | undefined
}

const CompilerSection: React.FC<CompilerSectionProps> = ({responseData, examples}) => {
    const [activeCase, setActiveCase] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [delayedResponse, setDelayedResponse] = useState<CodeSubmitResponse | null>(null);

    const handleTabClick = (index: number) => {
        setActiveCase(index)
    }

    useEffect(() => {
        if (responseData) {
            setLoading(true);
            const timer = setTimeout(() => {
                setDelayedResponse(responseData);
                setLoading(false)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [responseData])

    return (
        <div className='p-4 ml-4'>
            <div className='flex items-center mt-4 space-x-2'>
                <FaFileCircleCheck style={{ color: 'green', fontSize: '24px' }} />
                <h1 className="font-bold text-md">TestCases:</h1>
            </div>

            {loading ? (
                <div className="mt-4 text-lg text-gray-600 animate-pulse">Compiling....</div>
            ) : (
                delayedResponse && (
                    <div className='mt-4'>
                        {delayedResponse.success.some((testCase) => !testCase.passed) ? (
                            <h2 className="text-lg font-semibold text-red-500">Wrong Answer</h2>
                        ) : (
                            <h2 className="text-lg font-semibold text-green-500">Accepted</h2>
                        )}
                    </div>
                )
            )}
            <div className='flex mt-8 space-x-6 text-base text-gray-600'>
                {examples?.map((example, index) => (
                    <button
                        key={example._id}
                        className={`px-4 py-1 text-md font-medium rounded-lg 
                                                ${activeCase === index
                                ? "text-themeColor hover:bg-gray-200"
                                : "text-gray-700"} 
                                                ${!loading && delayedResponse
                                ? delayedResponse.success?.[index]?.passed
                                    ? 'bg-green-300'
                                    : 'bg-red-200'
                                : 'bg-gray-300'}`}
                        onClick={() => handleTabClick(index)}
                    >
                        Case {index + 1}
                    </button>
                ))}
            </div>

            {/* case content */}
            <div className='my-6'>
                {examples && (
                    <div className='flex flex-col space-y-4'>
                        <div className='flex flex-col space-y-1'>
                            <h1 className='font-bold text-md'>Input</h1>
                            {examples[activeCase]?.inputs.map((input) => (
                            <p key={input._id} className='flex px-2 py-3 bg-gray-300 rounded-md'>
                                <span className='mr-1'>{input.name} = </span>
                                {input.value}
                            </p>   
                            ))}
                        </div>
                        <div className='flex flex-col space-y-1'>
                            <h1 className='font-bold text-md'>Output</h1>
                            <p className='px-2 py-3 bg-gray-300 rounded-md'>{examples[activeCase]?.output}</p>
                        </div>
                        {responseData && responseData?.success[activeCase]?.logs.length >= 1 && (
                            <div className='flex flex-col space-y-1'>
                                <h1 className='text-md'>stdout</h1>
                                <p className='px-2 py-3 bg-gray-300 rounded-md'>{responseData?.success[activeCase]?.logs.map((log, index) => (
                                    <div key={index}>{log}</div>
                                ))}</p>
                            </div>
                        )}
                        {responseData && responseData?.success[activeCase]?.expectedOutput && (
                            <div className='flex flex-col space-y-1'>
                                <h1 className='text-md'>Expected</h1>
                                <p className='px-2 py-3 bg-gray-300 rounded-md'>{responseData?.success[activeCase]?.expectedOutput}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CompilerSection
