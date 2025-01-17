import React, { useState } from "react";
import * as monaco from 'monaco-editor';
import CustomProblemHeader from "../../components/Headers/CustomProblemHeader";
import { useParams } from "react-router-dom";
import { useListProblemDataQuery, useListProblemReviewsQuery } from "../../services/userApiSlice";
import LeftSectionContent from "../../components/ProblemContents/LeftSectionContent";
import CodingEnvironment from "../../components/ProblemContents/CodingEnvironment";
import { CODE_SNIPPETS, Language } from "../../types/languageConstants";
import { CodeSubmitResponse, SubmissionResponse } from "../../types/problemTypes";
import { Player } from '@lottiefiles/react-lottie-player';
import { IoMdDoneAll } from "react-icons/io";
import useDateFormatter from "../../hooks/useFormatDate";
import Editor from '@monaco-editor/react';
import CompilerSection from "../../components/ProblemContents/CompilerSection";
import { ChevronDown, ChevronUp } from "lucide-react";
import RatingsForProblems from "../../components/ProblemContents/RatingsForProblems";
import { FaStar } from "react-icons/fa";
import UserNotFound from "../CommonPages/UserNotFound";
import { ErrorData } from "../../types/types";


const Problems: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState("description");
    const [shouldRefetch, setShouldRefetch] = useState(true);
    const { data: problemResponse, isError, error } = useListProblemDataQuery(id!, {skip: !shouldRefetch});
    const problem = problemResponse?.data;
    const [value, setValue] = useState('');
    const [editorInstance, setEditorInstance] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [language, setLanguage] = useState<Language>('javascript');
    const [responseData, setResponseData] = useState<CodeSubmitResponse | null>(null);
    const [submissionResponseData, setSubmissionResponseData] = useState<SubmissionResponse | null>(null);
    const [showCode, setShowCode] = useState<string>('');
    const [ratingDropdown, setRatingDropdown] = useState(false);
    const { formatToISODate, calculateTimeSince, formatDate } = useDateFormatter();
    const { data: reviewResponse } = useListProblemReviewsQuery({ id: id! }, { skip: !id });
    const review = reviewResponse?.data;
    console.log(review);



    console.log('tab', activeTab);

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
    };

    const onSelectLanguage = (newLanguage: Language) => {
        setLanguage(newLanguage);
        setValue(CODE_SNIPPETS[newLanguage])
    }

    const handleCodeSubmitResponse = (response: CodeSubmitResponse) => {
        setResponseData(response);
    }

    const handleSubmitTabChange = () => {
        setActiveTab("submission");
    }

    const handleFinalCodeSubmitResponse = (response: SubmissionResponse) => {
        setSubmissionResponseData(response)
    }

    const handleShowCode = (code: string) => {
        setShowCode((prevCode) => (prevCode === code ? '' : code));
    };

    const handleReviewForm = () => {
        setRatingDropdown(!ratingDropdown)
    }

    if(isError || error) {
        return (
            <UserNotFound errorData={error as ErrorData} />
        )
    }


    return (
        <div className="flex flex-col w-full min-h-screen overflow-hidden bg-gray-300">
            <CustomProblemHeader
                value={value}
                editorInstance={editorInstance}
                language={language}
                problemId={problem?._id}
                onCodeSubmitResponse={handleCodeSubmitResponse}
                onSubmitTabChange={handleSubmitTabChange}
                onCodeFinalSubmittedResponse={handleFinalCodeSubmitResponse}
            />
            <div className="flex justify-between w-full px-3 mt-2 space-x-4 ">
                <div key='leftSection' className="flex-1 p-4 mb-6 overflow-x-auto bg-white rounded-md basis-1/2">
                    {/* Tabs */}
                    <div className="flex space-x-6 text-sm text-gray-500 bg-white rounded-md">
                        <button
                            className={`px-4 py-2 text-md font-medium ${activeTab === "description" ? "text-hoverColor" : "text-gray-500"}`}
                            onClick={() => handleTabClick("description")}
                        >
                            Description
                        </button>
                        <button
                            className={`px-4 py-2 text-md font-medium ${activeTab === "solution" ? "text-hoverColor" : "text-gray-500"}`}
                            onClick={() => handleTabClick("solution")}
                        >
                            Solution
                        </button>
                        <button
                            className={`px-4 py-2 text-md font-medium ${activeTab === "submission" ? "text-hoverColor" : "text-gray-500"}`}
                            onClick={() => handleTabClick("submission")}
                        >
                            Submission
                        </button>
                        <button
                            className={`px-4 py-2 text-md font-medium ${activeTab === "note" ? "text-hoverColor" : "text-gray-500"}`}
                            onClick={() => handleTabClick("note")}
                        >
                            Note
                        </button>
                        <button
                            className={`px-4 py-2 text-md font-medium ${activeTab === "ratings" ? "text-hoverColor" : "text-gray-500"}`}
                            onClick={() => handleTabClick("ratings")}
                        >
                            Ratings
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-4">
                        {activeTab === "description" && (
                            <LeftSectionContent problem={problem} setShouldRefetch = {setShouldRefetch}/>
                        )}
                        {activeTab === "solution" && (
                            <div>
                                <p>This is the solution section</p>
                            </div>
                        )}
                        {activeTab === "submission" && (
                            <div className="flex flex-col w-full">
                                {/* No submission data */}
                                {!submissionResponseData && (
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="min-w-full border-collapse table-auto">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="px-4 py-2 font-semibold text-left">Status</th>
                                                    <th className="px-4 py-2 font-semibold text-left">Language</th>
                                                    <th className="px-4 py-2 font-semibold text-left">Updated At</th>
                                                    <th className="px-4 py-2 font-semibold text-left">Review Code</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {problem?.userSubmission && problem.userSubmission.length > 0 ? (
                                                    problem.userSubmission.map((submission, index) => (
                                                        <tr key={index} className="border-b">
                                                            <td className="flex flex-col px-4 py-2 font-medium text-md">
                                                                <span
                                                                    className={`${submission.status === 'Accepted' ? 'text-green-600' : 'text-red-600'
                                                                        }`}
                                                                >
                                                                    {submission.status === 'Accepted' ? 'Accepted' : 'Wrong Answer'}
                                                                </span>
                                                                <h1 className="text-xs font-normal">
                                                                    {calculateTimeSince(submission.updatedAt)}
                                                                </h1>
                                                            </td>
                                                            <td className="px-2 py-2">
                                                                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                                                    {submission.language}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2">{formatToISODate(submission.updatedAt)}</td>
                                                            <td className="px-4 py-4 font-medium text-blue-500 underline">
                                                                <button
                                                                    onClick={() => handleShowCode(submission.code)}
                                                                    className="text-blue-500 underline hover:text-blue-700"
                                                                >
                                                                    {showCode ? 'Close' : 'View'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-4 py-2 text-center">
                                                            No submissions found.
                                                        </td>
                                                    </tr>
                                                )}
                                                {showCode && (
                                                    <tr>
                                                        <td colSpan={4} className="px-4 py-4">
                                                            <pre className="p-4 text-sm bg-gray-100 border rounded-md">{showCode}</pre>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {/* Submission data available */}
                                {submissionResponseData && (
                                    <div className="w-full p-5 bg-gray-100 border border-gray-300 rounded-md">
                                        {/* Display Status */}
                                        <div
                                            className={`text-2xl font-medium ${submissionResponseData.success.meta.passedTestCases ===
                                                submissionResponseData.success.meta.totalTestCases
                                                ? "text-green-500"
                                                : "text-red-500"
                                                }`}

                                        >
                                            <h1>
                                                {submissionResponseData.success.meta.passedTestCases ===
                                                    submissionResponseData.success.meta.totalTestCases
                                                    ? "Accepted"
                                                    : "Wrong Answer"}
                                            </h1>
                                        </div>

                                        {/* Test Case Details */}
                                        {submissionResponseData.success && (() => {
                                            const firstFailingTestCase = submissionResponseData.success.results.find(
                                                (test) => !test.passed
                                            );

                                            // Case: Some test cases failed
                                            if (firstFailingTestCase) {
                                                return (
                                                    <div className="mt-4 text-sm">
                                                        <h1>
                                                            Test case passed:{" "}
                                                            <span>
                                                                {submissionResponseData.success.meta.passedTestCases}/
                                                                {submissionResponseData.success.meta.totalTestCases}
                                                            </span>
                                                        </h1>

                                                        <div className="flex flex-col mt-6 space-y-6">
                                                            <div className="flex flex-col space-y-2">
                                                                <h1>Input</h1>
                                                                <h1 className="px-2 py-2 bg-gray-300 rounded-md text-md">
                                                                    {firstFailingTestCase.input || "N/A"}
                                                                </h1>
                                                            </div>
                                                            <div>
                                                                <h1>Output</h1>
                                                                <h1 className="px-2 py-2 bg-gray-300 rounded-md text-md">
                                                                    {firstFailingTestCase.actualOutput || "N/A"}
                                                                </h1>
                                                            </div>
                                                            <div>
                                                                <h1>Expected Output</h1>
                                                                <h1 className="px-2 py-2 bg-gray-300 rounded-md text-md">
                                                                    {firstFailingTestCase.expectedOutput || "N/A"}
                                                                </h1>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="mt-4">
                                                    <h1 className="flex items-start space-x-2">
                                                        Test case passed:{" "}
                                                        <span>
                                                            {submissionResponseData.success.meta.passedTestCases}/
                                                            {submissionResponseData.success.meta.totalTestCases}
                                                        </span>
                                                        <IoMdDoneAll size={24} style={{ color: 'green' }} />
                                                    </h1>
                                                    <div>
                                                        <Player
                                                            autoplay
                                                            loop
                                                            src="/Accepted.json"
                                                            style={{ height: '300px', width: '300px' }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "note" && (
                            <div className="h-screen">
                                <Editor
                                    height="50%"
                                    theme="vs-light"
                                    defaultValue="//sort it out your logic here"
                                />
                            </div>
                        )}
                        {activeTab === 'ratings' && (
                            <div className="h-screen">
                                <div className="flex justify-end">
                                    <button
                                        className="flex items-center px-1 py-2 text-xs bg-blue-100 border rounded-full shadow-md border-hoverColor"
                                        onClick={() => handleReviewForm()}
                                    >
                                        Add Ratings
                                        {ratingDropdown ? <ChevronUp size={16} className="ml-1"/> : <ChevronDown size={16} className="ml-1"/>}
                                    </button>
                                </div>

                                {/* Rating Form */}
                                {ratingDropdown && (
                                    <div className="mb-6">
                                        <RatingsForProblems problemId={id!} onClose = {handleReviewForm} />
                                    </div>
                                )}

                                {/* REVIEW SECTION */}
                                <div className="p-6 bg-white rounded-lg shadow-lg">
                                    <h1 className="mb-6 text-2xl font-semibold text-themeColor">Reviews and Ratings</h1>
                                    {review?.map((review) => (
                                        <div
                                            key={review._id}
                                            className="flex flex-col w-full p-4 mb-6 transition-transform transform rounded-lg shadow-sm bg-gray-50 hover:scale-105"
                                        >
                                            <div className="flex items-start w-full space-x-4">
                                                <img
                                                    className="object-cover w-12 h-12 border-2 rounded-full border-hoverColor"
                                                    src={review.user.profileImage || "/profile.webp"}
                                                    alt="profile"
                                                />
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <p className="text-lg font-medium text-themeColor">{review.user.username}</p>
                                                            <div className="flex items-center space-x-1">
                                                                <FaStar style={{ color: "#EAB308" }} />
                                                                <p className="text-sm text-gray-600">{review.ratings}</p>
                                                            </div>
                                                        </div>
                                                        <time
                                                            dateTime={review?.createdAt}
                                                            className="text-sm font-light text-gray-500"
                                                        >
                                                            Updated on {formatDate(review?.createdAt)}
                                                        </time>
                                                    </div>
                                                    <div className="mb-2 text-base text-gray-700 break-words">
                                                        {review.reviews}
                                                    </div>
                                                    <p className="text-sm italic text-gray-500">
                                                        {calculateTimeSince(review?.createdAt)} ago
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
                <div className="flex-1 mb-6 bg-gray-200 rounded-md basis-1/2">
                    <div className="relative bg-gray-300">
                        <div className="flex flex-col h-full space-y-16">


                            <div key="codingEnvironment" className="w-full rounded-md h-[400px]">
                                <CodingEnvironment
                                    value={value}
                                    setValue={setValue}
                                    setEditorInstance={setEditorInstance}
                                    examples={problem?.examples}
                                    language={language}
                                    onSelectLanguage={onSelectLanguage}
                                    responseData={responseData}
                                />
                            </div>

                            <div key="submissionSection" className="w-full overflow-auto bg-white rounded-md h-[350px]">
                                <CompilerSection responseData={responseData} examples={problem?.testCases} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Problems;


