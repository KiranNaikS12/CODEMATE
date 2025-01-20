import { Camera, File, RotateCcw, RotateCw } from 'lucide-react';
import React, { useState } from 'react';
import { useUpdateUserProfileMutation } from '../../services/userApiSlice';
import { APIError } from '../../types/types';
import { useDispatch } from 'react-redux';
import { updateCredentials as userUpdate } from '../../store/slices/authSlice';
import Swal from 'sweetalert2'
import { ProfileImageProps } from '../../types/types';
import { Toaster, toast } from 'sonner'
import { useUpdateTutorImageMutation } from '../../services/tutorApiSlice';
import { updateCredentials as tutorUpdate } from '../../store/slices/tutorSlice';



const UploadImageModal: React.FC<ProfileImageProps> = ({ handleProfile, userId, refetch, roleId }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData | null>(null);
  const [roation, setRotaion] = useState<number>(0);
  const dispatch = useDispatch()


  const [userUploadImage, { isLoading: UserisLoading }] = useUpdateUserProfileMutation();
  const [tutorUploadImage, { isLoading: TutorisLoading }] = useUpdateTutorImageMutation();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;
    const file = fileInput.files?.[0];
    if (file) {
      const readFile = new FileReader();
      readFile.onload = () => {
        setImagePreview(readFile.result as string);

        const data = new FormData();
        data.append('image', file);
        setFormData(data);
      };
      readFile.readAsDataURL(file)
    }
  }


  const handleReset = () => {
    const defaultImageUrl = `/profile.webp`;
    setImagePreview(defaultImageUrl);

    setRotaion(0)

    //clearing input file
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    fetch(defaultImageUrl)
      .then(res => res.blob())
      .then(blob => {
        const data = new FormData();
        data.append('image', blob, 'profile.webp');
        setFormData(data);
        toast.success('Profile Image reset to default');
      })
      .catch(error => {
        console.error('Error loading default image:', error);
        toast.error('Failed to reset profile image');
      });
  }



  //handlingImageUpload 
  const handleUpload = async () => {
    if (formData) {
      try {
        let response;
         // tutor profile upload
        if (roleId === 'user') {
          response = await userUploadImage({ userId, formData }).unwrap();
          if (response?.data?.profileImage) {
            dispatch(userUpdate({
              data: {
                profileImage: response.data.profileImage
              }
            }));
          }
           // tutor profile upload
        } else if (roleId === 'tutor') {
          response = await tutorUploadImage({ userId, formData }).unwrap();
          if (response?.data?.profileImage) {
            dispatch(tutorUpdate({
              data: {
                profileImage: response.data.profileImage
              }
            }));
          }
        }

        Swal.fire({
          icon: 'success',
          title: 'Avatar updated!',
          confirmButtonText: 'OK',
        });
        refetch();
        handleProfile();
      } catch (error) {
        const apiError = error as APIError;
        toast.error(apiError.data?.message || 'An unknown error occurred');
      }
    }
  };

  //handleImageRoation 
  const rotateClockwise = () => {
    setRotaion((prevRotation) => prevRotation + 90)
  }
  const rotateCounterclockwise = () => {
    setRotaion((prevRotation) => prevRotation - 90)
  }



  const isLoading = roleId === 'user' ? UserisLoading : TutorisLoading;
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-lg w-96">
      <Toaster
        position="top-center"
        toastOptions={{ style: { backgroundColor: "#fffff" } }}
        richColors
      />
      <div className="p-2 rounded-t-lg bg-customGrey">
        <h1 className="text-lg font-semibold">Upload New Avatar</h1>
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-themeColor">
        <div className="flex items-center justify-center w-40 h-40 overflow-hidden bg-gray-300 rounded-md">
          {imagePreview ? (
            <img src={imagePreview}
              alt="Preview"
              className='object-cover w-full h-full'
              style={{ transform: `rotate(${roation}deg)` }}
            />
          ) : (
            <div className='flex flex-col items-center'>
              <Camera size={24} className='text-gray-500' />
              <span className="text-gray-500">Image Preview</span>
            </div>
          )}
        </div>
        <div className='flex justify-around mt-6 space-x-2'>
          <button onClick={rotateClockwise} className='px-2 py-2 border rounded-lg text-customGrey border-hoverColor'>
            <RotateCcw size={20} />
          </button>
          <button onClick={rotateCounterclockwise} className='px-2 py-2 border rounded-lg text-customGrey border-hoverColor'>
            <RotateCw size={20} />
          </button>
          <button onClick={handleReset} className='px-2 py-2 text-sm font-semibold border rounded-lg text-customGrey border-hoverColor'>
            Set Default
          </button>
        </div>
      </div>

      <div className="p-4 rounded-b-lg bg-customGrey">
        <label className="block mb-2 text-sm font-medium" htmlFor='file-upload'>
          <input
            type="file"
            id='file-upload'
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <div className='flex items-center justify-center '>
            <File size={16} />
            <span className="py-2 text-sm text-center text-gray-900 cursor-pointer focus:outline-none">
              Choose Image
            </span>
          </div>
        </label>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={handleProfile}
            className="px-2 py-2 text-sm font-semibold border rounded-md text-themeColor border-themeColor"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-2 py-2 text-sm font-semibold text-green-600 border border-green-500 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadImageModal;
