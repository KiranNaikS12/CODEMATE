import React, { Dispatch, SetStateAction, useState } from 'react';
import { Problem } from '../../types/problemTypes';
import { Field, Formik, Form, ErrorMessage, FormikHelpers } from 'formik';
import { feedbackSchema } from '../../utils/validation';
import { APIError } from '../../types/types';
import { toast, Toaster } from 'sonner';
import { useAddFeedbackMutation, useListProblemFeedbackQuery } from '../../services/userApiSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useParams } from 'react-router-dom';
import useDateFormatter from '../../hooks/useFormatDate';


export interface LeftSectionContentProps {
    problem: Problem | undefined;
    setShouldRefetch: Dispatch<SetStateAction<boolean>>;
}

const LeftSectionContent: React.FC<LeftSectionContentProps> = ({ problem, setShouldRefetch }) => {
    const { id } = useParams<{ id: string }>();
    const userInfo = useSelector((state: RootState) => state.auth.userInfo);
    const userId = userInfo?._id
    const [isCompaniesExpanded, setIsCompaniesExpanded] = useState(false);
    const [isHintsExpanded, setIsHintsExpanded] = useState(false);
    const [isRelatedQuestionsExpanded, setIsRelatedQuestionsExpanded] = useState(false);
    const [isDiscussionExpanded, setIsDiscussionExpanded] = useState(false);
    const [submit] = useAddFeedbackMutation();
    const problemId = problem?._id;;
    const { data: feedbackResponse } = useListProblemFeedbackQuery({ id: id! });
    const feeds = feedbackResponse?.data;
    const { formatDate } = useDateFormatter()

    const handleFeedbackSubmit = async (
        
        values: { feedback: string },
        { resetForm }: Pick<FormikHelpers<{ feedback: string }>, 'resetForm'>
    ) => {
        setShouldRefetch(false)
        try {
            const response = await submit({ userId, problemId, feedback: values.feedback }).unwrap();
            if (response) {
                toast.success('Feedback added successfully')
            }
            resetForm()
        } catch (error) {
            const apiError = error as APIError;
            if (apiError.data && apiError.data.message) {
                toast.error(apiError.data.message);
            }
        } finally {
            setShouldRefetch(true)
        }
    };

    console.log(problem)

    return (
        <>
            <Toaster
                position="bottom-center"
                richColors
            />
            <div className="flex flex-col ml-2 overflow-x-hidden overflow-y h-[800px]">
                {/* Problem Info */}
                <div>
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex">
                            <h1 className="text-2xl font-medium">{problem?.slno}.</h1>
                            <h1 className="text-2xl font-medium">{problem?.title}.</h1>
                        </div>
                        <div>
                            <h1
                                className={`font-normal text-sm ${problem?.status === 'Accepted'
                                    ? 'text-green-600'
                                    : problem?.status === 'Attempted'
                                        ? 'text-yellow-600'
                                        : ''
                                    }`}
                            >
                                {problem?.status}
                            </h1>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span
                            className={`text-sm font-medium me-2 px-2.5 py-0.5 rounded ${problem?.difficulty === 'easy'
                                ? 'bg-green-100 text-green-800'
                                : problem?.difficulty === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                        >
                            {problem?.difficulty}
                        </span>
                        {problem?.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-blue-100 text-gray-700 text-xs font-medium me-2 px-2.5 py-0.5 rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="mt-4">
                        <p className="w-full text-md">{problem?.description}</p>
                    </div>
                </div>
                {/* Example */}
                <div className="mt-10 space-y-6 text-md">
                    {problem?.examples.map((example) => (
                        <div key={example._id}>
                            <h1 className="font-medium">{example?.heading}:</h1>
                            <h1 className='flex font-bold text-black'>
                                Input:
                                {example?.inputs.map((input) => (
                                <div key={input._id} className='flex'>
                                    <span className='ml-3 font-normal'>{input.name} = </span>
                                    <span className='ml-1 font-normal'>{input.value}</span>
                                </div> 
                                ))}
                            </h1>

                            <h1 className='font-bold'>Output: <span className='font-normal'>{example?.output}</span></h1>
                            <h1 className='font-bold'>Explanation: <span className='font-normal'>{example?.explanation}</span></h1>
                        </div>
                    ))}
                </div>
                <div className="mt-28">
                    <div className="flex items-center space-x-16">
                        <h1>Total Submission: {problem?.totalSubmission || 0}</h1>
                        <h1>Total Acceptance: 0</h1>
                    </div>
                </div>
                {/* Individual Dropdown Sections */}
                <div className="mt-12 -ml-0 space-y-4 ">
                    {/* Companies Section */}
                    <div>
                        <button
                            onClick={() => setIsCompaniesExpanded(!isCompaniesExpanded)}
                            className="flex items-center justify-between w-full px-2 py-2 rounded-lg hover:bg-gray-200"
                        >
                            <span>Companies</span>
                            <svg
                                className={`w-5 h-5 transform transition-transform ${isCompaniesExpanded ? 'rotate-180' : ''
                                    }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                ></path>
                            </svg>
                        </button>
                        {isCompaniesExpanded && (
                            <div className="px-4 mt-2">
                                <ul className="pl-4 list-disc">
                                    {['Google', 'Amazon'].map((company, index) => (
                                        <li key={index}>{company}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    {/* Hints Section */}
                    <div>
                        <button
                            onClick={() => setIsHintsExpanded(!isHintsExpanded)}
                            className="flex items-center justify-between w-full px-2 py-2 rounded-lg hover:bg-gray-200"
                        >
                            <span>Hints</span>
                            <svg
                                className={`w-5 h-5 transform transition-transform ${isHintsExpanded ? 'rotate-180' : ''
                                    }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                ></path>
                            </svg>
                        </button>
                        {isHintsExpanded && (
                            <div className="px-4 mt-2">
                                <ul className="pl-4 space-y-4 list-disc">
                                    {problem?.hints?.length ? (
                                        problem.hints.map((hint, index) => (
                                            <li key={index}>{hint.content}</li>
                                        ))
                                    ) : (
                                        <p>No hints available.</p>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                    {/* Related Questions Section */}
                    <div>
                        <button
                            onClick={() => setIsRelatedQuestionsExpanded(!isRelatedQuestionsExpanded)}
                            className="flex items-center justify-between w-full px-2 py-2 rounded-lg hover:bg-gray-200"
                        >
                            <span>Related Questions</span>
                            <svg
                                className={`w-5 h-5 transform transition-transform ${isRelatedQuestionsExpanded ? 'rotate-180' : ''
                                    }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                ></path>
                            </svg>
                        </button>
                        {isRelatedQuestionsExpanded && (
                            <div className="px-4 mt-2">
                                <p>No related questions available.</p>
                            </div>
                        )}
                    </div>
                    {/* Discussion Section */}
                    <div>
                        <button
                            onClick={() => setIsDiscussionExpanded(!isDiscussionExpanded)}
                            className="flex items-center justify-between w-full px-2 py-2 rounded-lg hover:bg-gray-200"
                        >
                            <span>Discussion</span>
                            <svg
                                className={`w-5 h-5 transform transition-transform ${isDiscussionExpanded ? 'rotate-180' : ''
                                    }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                ></path>
                            </svg>
                        </button>
                        {isDiscussionExpanded && (
                            <div className="px-4 mt-4 overflow-y-auto">
                                <div>
                                    <Formik
                                        initialValues={{
                                            feedback: '',
                                        }}
                                        validationSchema={feedbackSchema}
                                        onSubmit={handleFeedbackSubmit}
                                    >
                                        <Form className="flex flex-col mt-4 space-y-4">
                                            <Field
                                                as="textarea"
                                                name="feedback"
                                                className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows={4}
                                                placeholder="Write your feedback here..."
                                            />
                                            <ErrorMessage
                                                name="feedback"
                                                component="div"
                                                className="text-red-500"
                                            />
                                            <button
                                                type="submit"
                                                className="self-end px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-800"
                                            >
                                                Send Feedback
                                            </button>
                                        </Form>
                                    </Formik>
                                </div>
                            </div>
                        )}

                        <div className="mt-12">
                            {feeds?.map((feed) => (
                                <div key={feed._id} className="flex flex-col mb-4">
                                    <div className="flex">
                                        <img className="object-cover w-10 h-10 border-2 rounded-full me-4 border-hoverColor" src={feed.user.profileImage || '/profile.webp'} alt="profile" />
                                        <div className="font-medium ">
                                            <p className="text-themeColor">{feed.user.username} <time dateTime="2014-08-16 19:00" className="block text-sm text-gray-400 ">Updated on {formatDate(feed?.createdAt)}</time></p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col mt-2 break-words w-full md:w-[1200px]">
                                        <p className="mb-2 text-gray-500 ">{feed.feedback}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeftSectionContent;
