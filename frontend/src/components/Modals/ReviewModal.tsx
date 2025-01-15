import React from 'react';
import ReactStars from 'react-stars';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { reviewSchema } from '../../utils/validation';
import { useAddReviewMutation } from '../../services/userApiSlice';
import Swal from 'sweetalert2';
import { APIError } from '../../types/types';
import { toast, Toaster } from 'sonner'

export interface ReviewModalProps {
    onclose: () => void;
    courseId?: string;
    userId?: string;
    refetch: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ onclose, courseId, userId, refetch }) => {
    const [addReview] = useAddReviewMutation()

    const handleReviewSubmit = async (values: { ratings: number, title: string, feedback: string }) => {
        try {
            const response = await addReview({ courseId, userId, 
                ratings: values.ratings,
                title: values.title,
                feedback: values.feedback
            }).unwrap();
            if (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Review Added',
                    text: response.message,
                    confirmButtonColor: '#3085d6',
                });
                refetch()
            }
            onclose();
        } catch (error) {
            const apiError = error as APIError;
            if (apiError.data && apiError.data.message) {
                toast.error(apiError.data.message)
            }
        }   
    }

    return (
        <>
            <Toaster
                position="bottom-center"
                richColors
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className='p-6 bg-gray-100 rounded-lg shadow-lg w-96'>
                    <h2 className="mb-4 text-lg font-semibold text-gray-700">Add Review</h2>
                    <Formik
                        initialValues={{
                            ratings: 0,
                            title: '',
                            feedback: ''
                        }}
                        validationSchema={reviewSchema}
                        onSubmit={handleReviewSubmit}
                    >
                        {({ values, setFieldValue }) => (
                            <Form className='max-w-md mx-auto'>
                                <div className="flex items-center mb-5 gap-x-2">
                                    <label className="mt-1 text-sm text-blue-500">ADD RATING</label>
                                    <ReactStars
                                        count={5}
                                        size={24}
                                        color2={'#ffd700'}
                                        half={true}
                                        value={values.ratings}
                                        onChange={(newRating) => setFieldValue('ratings', newRating)}
                                    />
                                </div>
                                <ErrorMessage
                                    name="ratings"
                                    component="div"
                                    className="text-sm italic text-red-500"
                                />
                                <div className="relative z-0 w-full mb-5 group">
                                    <Field type="text" name="title" id="title" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none  focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                    <label htmlFor="floating_title" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Add Review Title</label>
                                </div>
                                <ErrorMessage
                                    name="title"
                                    component="div"
                                    className="text-sm italic text-red-500"
                                />
                                <div className="relative z-0 w-full mb-5 group">
                                    <Field as="textarea" name="feedback" id="name" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none  focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                    <label htmlFor="floating_feedback" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Add FeedBack</label>
                                </div>
                                <ErrorMessage
                                    name="feedback"
                                    component="div"
                                    className="text-sm italic text-red-500"
                                />
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={onclose}
                                        className="px-4 py-2 text-sm text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm text-white rounded-md hover:bg-themeColor bg-highlightBlue"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </>
    )
}

export default ReviewModal
