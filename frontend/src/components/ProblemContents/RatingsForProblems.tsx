import React from 'react'
import { Form, Formik, ErrorMessage, Field } from 'formik'
import { problemReviewSchema } from '../../utils/validation'
import ReactStars from 'react-stars'
import { useAddProblemReviewMutation } from '../../services/userApiSlice';
import { toast, Toaster } from 'sonner'
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Swal from 'sweetalert2';
import { APIError } from '../../types/types';

interface RatingsForProblemsProps {
    problemId?: string;
    onClose: () => void;
}

const RatingsForProblems: React.FC<RatingsForProblemsProps> = ({problemId, onClose}) => {
    const [ submitReview ] = useAddProblemReviewMutation();
    const userInfo = useSelector((state: RootState) => state.auth.userInfo);
    const userId = userInfo?._id;
    

    const handleReviewSubmit = async (values: {ratings: number, reviews: string, }) => {
        try {

            const response = await submitReview({problemId,
                userId,
                ratings: values.ratings,
                reviews: values.reviews
            }).unwrap();
            if(response) {
                Swal.fire({
                    icon:'success',
                    title:'Review Added',
                    text: response.message,
                    confirmButtonColor: '#3085d6'
                })
            }
            onClose();
        }  catch (error) {
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
        <div className='ml-4'>
            <h2 className="mb-4 text-lg font-semibold text-gray-700">Add Review</h2>
            <Formik
                initialValues={{
                    ratings: 0,
                    reviews: ''
                }}
                validationSchema={problemReviewSchema}
                onSubmit={handleReviewSubmit}
            >
                {({ values, setFieldValue }) => (
                    <Form className='w-full '>
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
                        <ErrorMessage
                            name="ratings"
                            component="div"
                            className="text-sm italic text-red-500"
                        />
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <Field type="text" name="reviews" id="reviews" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none  focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                            <label htmlFor="floating_reviews" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Add Review Title</label>
                        </div>
                        <ErrorMessage
                            name="reviews"
                            component="div"
                            className="text-sm italic text-red-500"
                        />
                        <div className="flex justify-end gap-4">

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
        </>
    )
}

export default RatingsForProblems
