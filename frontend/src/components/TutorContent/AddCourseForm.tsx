import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { CourseFormTypes } from "../../types/courseTypes";
import VideoUploadSection from "./VideoUploadSection";
import { APIError } from "../../types/types";
import { Toaster, toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useUploadCourseMutation } from "../../services/tutorApiSlice";
import Spinner from "../Loader/Spinner";
import { useNavigate } from "react-router-dom";
import { FaCamera } from "react-icons/fa";
import { AddCourseValidationSchema } from "../../utils/validation";

const AddCourseForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const navigate = useNavigate()
  const tutorInfo = useSelector((state: RootState) => state.tutor.tutorInfo);
  const id = tutorInfo?._id;
  const [submitForm] = useUploadCourseMutation()

  const initialValues: CourseFormTypes = {
    title: "",
    description: "",
    level: "",
    category: "",
    videoUrl: [{ chapterTitle: "", videos: [] }],
    lesson: 0,
    language: '',
    subject: '',
    price: 0,
    discount: 0,
    coverImage: ''
  };

  const handleSubmit = async (
    values: CourseFormTypes,
  ) => {
    setIsLoading(true)
    try {

      const discountValue = values.discount || 0;

      const formData = new FormData();

      // Add course details
      const courseDetails = {
        title: values.title,
        description: values.description,
        level: values.level,
        category: values.category,
        lesson: values.lesson,
        language: values.language,
        subject: values.subject,
        price: values.price,
        discount: discountValue
      };

      formData.append('courseDetails', JSON.stringify(courseDetails));

      // Prepare chapters data
      const chaptersData = values.videoUrl.map(chapter => ({
        chapterTitle: chapter.chapterTitle,
        videoTitles: chapter.videos.map(video => video.title)
      }));

      formData.append('chapters', JSON.stringify(chaptersData));

      // Add video files
      values.videoUrl.forEach(chapter => {
        chapter.videos.forEach(video => {
          if (video.file) {
            formData.append('videos', video.file);
          }
        });
      });

      if (values.coverImage) {
        formData.append("coverImage", values.coverImage)
      }

      const response = await submitForm({ id, formData }).unwrap();
      console.log("response", response);
      setIsLoading(false);
      navigate('/tutor/home/course')
    } catch (error) {
      const apiError = error as APIError;
      if (apiError.data && apiError.data.message) {
        toast.error(apiError.data.message);
      } else {
        toast.error('An error occurred while uploading the course');
      }
      console.error('Form submission error:', error);
    }
  };

  


  return (
    <div className="relative flex-1 p-6 mt-2 -top-28 -left-4">
      <div>
        <Toaster
          position="top-center"
          toastOptions={{ style: { backgroundColor: "#D8D8FD" } }}
          richColors
        />
        <Formik initialValues={initialValues} validationSchema={AddCourseValidationSchema} onSubmit={handleSubmit}>
          {({ values, setFieldValue}) => (
            <Form className="mt-20 space-y-6">
              <div className="p-6 bg-gray-200 rounded-lg shadow-md">
                <h1 className="mb-8 text-2xl font-semibold text-start text-themeColor">
                  UPLOAD COURSE
                </h1>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="col-span-full">
                  <label
                    htmlFor="coverImage"
                    className="block mb-3 font-medium text-gray-700"
                  >
                    Upload Cover Image
                  </label>
                  {coverImagePreview && (
                    <div className="mb-4">
                      <img
                        src={coverImagePreview}
                        alt="Cover Preview"
                        className="w-2/4 h-64 rounded-md shadow-sm object-fit"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="coverImage"
                      className="flex flex-col items-center justify-center w-full px-4 py-6 tracking-wide text-gray-600 transition-all duration-300 bg-gray-300 rounded-lg cursor-pointer hover:bg-gray-400"
                    >
                      <FaCamera size={24} />
                      <span className="text-sm font-semibold leading-normal">
                        Click Here
                      </span>
                      <input
                        id="coverImage"
                        name="coverImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          if (event.target.files && event.target.files[0]) {
                            const file = event.target.files[0];
                            setFieldValue("coverImage", file);
                            setCoverImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <ErrorMessage
                        name="coverImage"
                        component="div"
                        className="text-sm italic text-red-500"
                      />
                    </label>
                  </div>
                </div>
                  {/* Course Title */}
                  <div className="col-span-full">
                    <label htmlFor="title" className="block font-medium text-gray-700">
                      Course Title
                    </label>
                    <Field
                      type="text"
                      id="title"
                      name="title"
                      placeholder="Enter Course Title"
                      className="block w-full p-3 mt-2 border border-gray-400 rounded-lg focus:border-themeColor focus:ring-themeColor"
                    />
                    <ErrorMessage
                      name="title"
                      component="div"
                      className="text-sm italic text-red-500"
                    />
                  </div>

                  {/* Course Description */}
                  <div className="col-span-full">
                    <label htmlFor="description" className="block font-medium text-gray-700">
                      Course Description
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      placeholder="Enter Course Description"
                      className="block w-full p-3 mt-2 border border-gray-400 rounded-lg focus:border-themeColor focus:ring-themeColor"
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-sm italic text-red-500"
                    />
                  </div>

                  {/* Course Level */}
                  <div className="col-span-full">
                    <label className="block font-medium text-gray-700">
                      Course Level
                    </label>
                    <div className="flex items-center mt-3 space-x-4">
                      <div>
                        <Field
                          type="radio"
                          id="beginner"
                          name="level"
                          value="beginner"
                          className="mr-2"
                        />
                        <label htmlFor="beginner">Beginner</label>
                      </div>
                      <div>
                        <Field
                          type="radio"
                          id="intermediate"
                          name="level"
                          value="intermediate"
                          className="mr-2"
                        />
                        <label htmlFor="intermediate">Intermediate</label>
                      </div>
                      <div>
                        <Field
                          type="radio"
                          id="advanced"
                          name="level"
                          value="advanced"
                          className="mr-2"
                        />
                        <label htmlFor="advanced">Advanced</label>
                      </div>
                      <ErrorMessage
                        name="level"
                        component="div"
                        className="text-sm italic text-red-500"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-full">
                    <label htmlFor="category" className="block font-medium text-gray-700">
                      Category
                    </label>
                    <Field
                      as="select"
                      id="category"
                      name="category"
                      className="block w-full p-3 mt-2 border border-gray-400 rounded-lg focus:border-themeColor focus:ring-themeColor"
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      <option value="Programming Language">Programming Language</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Data Science & Machine Learning">
                        Data Science & Machine Learning
                      </option>
                      <option value="Cloud Computing">Cloud Computing</option>
                      <option value="DevOps & Automation">DevOps & Automation</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Databases">Databases</option>
                      <option value="Software Development & Engineering">
                        Software Development & Engineering
                      </option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Blockchain & Cryptocurrency">Blockchain & Cryptocurrency</option>
                      <option value="Networking & IT Support">Networking & IT Support</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Game Development">Game Development</option>
                      <option value="Others">Others</option>
                    </Field>
                    <ErrorMessage
                      name="category"
                      component="div"
                      className="text-sm italic text-red-500"
                    />
                  </div>

                  {/* Lesson, Language, Subject */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3 col-span-full">
                    <div>
                      <label htmlFor="lesson" className="block font-medium text-gray-700">
                        Total Lessons
                      </label>
                      <Field
                        type="number"
                        id="lesson"
                        name="lesson"
                        className="block w-full p-3 mt-2 border border-gray-400 rounded-lg focus:border-themeColor focus:ring-themeColor"
                      />
                      <ErrorMessage
                        name="lesson"
                        component="div"
                        className="text-sm italic text-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="language" className="block font-medium text-gray-700">
                        Language
                      </label>
                      <Field
                        type="text"
                        id="language"
                        name="language"
                        placeholder="Enter Language"
                        className="block w-full p-3 mt-2 border border-gray-400 rounded-lg focus:border-themeColor focus:ring-themeColor"
                      />
                      <ErrorMessage
                        name="language"
                        component="div"
                        className="text-sm italic text-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block font-medium text-gray-700">
                        Subject
                      </label>
                      <Field
                        type="text"
                        id="subject"
                        name="subject"
                        placeholder="Enter Subject"
                        className="block w-full p-3 mt-2 border border-gray-400 rounded-lg focus:border-themeColor focus:ring-themeColor"
                      />
                      <ErrorMessage
                        name="subject"
                        component="div"
                        className="text-sm italic text-red-500"
                      />
                    </div>
                  </div>

                  {/* Price and Discount */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 col-span-full">
                    <div>
                      <label htmlFor="price" className="block font-medium text-gray-700">
                        Price
                      </label>
                      <Field
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Enter Price"
                        className="block w-full p-3 mt-2 border border-gray-400 rounded-lg focus:border-themeColor focus:ring-themeColor"
                      />
                      <ErrorMessage
                        name="price"
                        component="div"
                        className="text-sm italic text-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="discount" className="block font-medium text-gray-700">
                        Discount Price
                      </label>
                      <Field
                        type="number"
                        id="discount"
                        name="discount"
                        placeholder="Enter Discount Price"
                        className="block w-full p-3 mt-2 border border-gray-400 rounded-lg focus:border-themeColor focus:ring-themeColor"
                      />
                      <ErrorMessage
                        name="discount"
                        component="div"
                        className="text-sm italic text-red-500"
                      />
                    </div>
                  </div>
                  <div className="w-full col-span-full">
                    <VideoUploadSection values={values} setFieldValue={setFieldValue} />
                  </div>
                </div>
              </div>
              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="px-6 py-3 font-semibold text-white rounded-lg bg-themeColor hover:bg-themeColor-dark focus:outline-none focus:ring-4 focus:ring-themeColor-light"
                >
                  Submit Course
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      <Spinner isLoading={isLoading} />
    </div>
  );
};

export default AddCourseForm;