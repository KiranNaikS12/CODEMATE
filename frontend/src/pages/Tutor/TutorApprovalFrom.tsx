import React, { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from "formik";
import { tutorApprovalFormValidationSchema } from '../../utils/validation';
import { ApprovalFormData } from '../../types/tutorTypes';
import { APIError } from '../../types/types';
import { Toaster, toast } from "sonner";
import { useHandleApprovalFormMutation } from '../../services/tutorApiSlice';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../../components/Loader/Spinner';
import Swal from 'sweetalert2'


const TutorApprovalFrom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
 const [handleApprovalForm] = useHandleApprovalFormMutation();
 const [selectedFile, setSelectedFile] = useState<File | null> (null);
 const [isLoading, setIsLoading] = useState(false); 
 const navigate = useNavigate()
  

 
  const handleFormSubmit = async (values: ApprovalFormData, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    setIsLoading(true)
    try {
      const formData = new FormData();   
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'certificate' && value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      if (selectedFile) {
        formData.append('certificate', selectedFile);
      } else {
        console.log('No file selected');
      }
      
     
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      if (!id) {
        throw new Error('Tutor ID is missing');
      }
      

      await handleApprovalForm({id, data:formData}).unwrap()

      Swal.fire({
        title:'Form Submitted Successfully',
        text:"Please check you email for confirmation",
        icon:'success',
        background:'#D8D8FD'
      }).then((result) => {
        if(result.isConfirmed) {
          navigate('/tutor/login')
        }
      })
      setTimeout(() => {
        setIsLoading(false)
      },1000)
    } catch (error) {
      const apiError = error as APIError;
      toast.error(apiError.data && apiError.data.message);
      console.log('Failed to submit', apiError.data?.message || apiError.data);
      setIsLoading(false);
    } finally {
      setSubmitting(false);
    }
  }
  
  
  
  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { backgroundColor: '#D8D8FD' } }} richColors />
      <div className="justify-center min-h-screen bg-themeColor">
        <div className="flex items-start justify-center w-full p-8 mx-auto">
          <div className="w-3/4 p-8 border rounded-lg shadow-md bg-customGrey">
            <h1 className="mb-3 text-3xl font-bold text-themeColor">Tutor Approval Form</h1>
            <p className='mb-6 font-light text-blue-500'>Please fill this form and get approval to be a tutor. Wish you luck :)</p>
            <Formik 
              initialValues={{
                fullname: "",
                age: "",
                country: "",
                contact: "",
                birthday: "",
                bio: "",
                specialization: "",
                education: "",
                experience: "",
                company: "",
                certificate: null as File | null
              }}
              validationSchema={tutorApprovalFormValidationSchema}
              onSubmit={handleFormSubmit}
            >
              {({ setFieldValue }) => (
                <Form>
                  <div className="mb-6">
                    <h2 className="mb-4 text-xl font-semibold text-themeColor">Basic Info</h2>
                    <div className="grid grid-cols-2 gap-4 ">
                      <div>
                        <label htmlFor="fullname" className="block mb-1 text-themeColor">Full Name</label>
                        <Field type="text" name='fullname' className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:bg-gray-100 dark:border-none" />
                        <ErrorMessage name='fullname' component='div' className='mt-1 text-sm text-red-500' />
                      </div>
                      <div>
                        <label htmlFor="age" className="block mb-1 text-themeColor">Age</label>
                        <Field type="number" name='age' className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:bg-gray-100 dark:border-none" />
                        <ErrorMessage name='age' component='div' className='mt-1 text-sm text-red-500' />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <label htmlFor="country" className="block mb-1 text-themeColor">Country</label>
                        <Field type="text" name='country' className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:bg-gray-100 dark:border-none" />
                        <ErrorMessage name='country' component='div' className='mt-1 text-sm text-red-500' />
                      </div>
                      <div>
                        <label htmlFor="contact" className="block mb-1 text-themeColor">Phone</label>
                        <Field type="text" name='contact' className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:bg-gray-100 dark:border-none" />
                        <ErrorMessage name='contact' component='div' className='mt-1 text-sm text-red-500' />
                      </div>
                      <div>
                        <label htmlFor="birthday" className="block mb-1 text-themeColor">Date of Birth</label>
                        <Field type="date" name='birthday' className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:bg-gray-100 dark:border-none" />
                        <ErrorMessage name='birthday' component='div' className='mt-1 text-sm text-red-500' />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="bio" className="block mb-1 text-themeColor">Add Bio <span className='text-red-500'> (optional)</span></label>
                      <Field as="textarea" name='bio' className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:bg-gray-100 dark:border-none" />
                    </div>
                    <h2 className="mt-8 text-xl font-semibold text-themeColor">Professional Info</h2>
                    <div className="grid grid-cols-2 gap-4 mt-4">   
                      <div>
                        <label htmlFor="subject" className="block mb-1 text-themeColor">Subject Specialization</label>
                        <Field type="text" name='specialization' className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:bg-gray-100 dark:border-none" />
                        <ErrorMessage name='specialization' component='div' className='mt-1 text-sm text-red-500' />
                      </div>
                      <div>
                        <label htmlFor="education" className="block mb-1 text-themeColor">Qualification</label>
                        <Field type="text" name='education' className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:bg-gray-100 dark:border-none" />
                        <ErrorMessage name='education' component='div' className='mt-1 text-sm text-red-500' />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">   
                      <div>
                        <label htmlFor="experience" className="block mb-1 text-themeColor">Years of Experience</label>
                        <Field type="number" name='experience' className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:bg-gray-100 dark:border-none" />
                        <ErrorMessage name='experience' component='div' className='mt-1 text-sm text-red-500' />
                      </div>
                      <div>
                        <label htmlFor="company" className="block mb-1 text-themeColor">Company/Brand <span className='text-red-500'>(optional)</span></label>
                        <Field type="text" name='company' className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:bg-gray-100 dark:border-none" />
                        <ErrorMessage name='company' component='div' className='mt-1 text-sm text-red-500' />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="certificate" className="block mb-1 text-themeColor">Upload Certificate / Resume</label>
                      <input
                        id="certificate"
                        name="certificate"
                        type="file"
                        accept=".pdf"
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0] || null;
                          setFieldValue("certificate", file);
                          setSelectedFile(file);
                          console.log('File selected:', file);
                        }}  
                        className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:bg-gray-100 dark:border-none"
                      />
                      <ErrorMessage name='certificate' component='div' className='mt-1 text-sm text-red-500' />
                    </div>
                  </div>
                  <div className="flex justify-end mt-8">
                    <button type="submit" className="px-4 py-2 text-white rounded-lg bg-themeColor dark:text-customGrey hover:bg-highlightBlue">SUBMIT</button>
                  </div>
                </Form>
              )}
            </Formik>
            <Spinner isLoading = {isLoading} />
          </div>
        </div>
      </div>
    </>
  );
}

export default TutorApprovalFrom;
