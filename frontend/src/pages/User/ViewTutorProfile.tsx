import React from 'react';
import Header from '../../components/Headers/Header';
import { Mail, Globe, Building2, Phone } from 'lucide-react';
import { useViewTutorDataQuery } from '../../services/userApiSlice';
import { useParams } from 'react-router-dom';
import UserNotFound from '../CommonPages/UserNotFound';
import { ErrorData } from '../../types/types';

const ViewTutorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: courseResoponse, isError, error } = useViewTutorDataQuery(id!);
  const tutorData = courseResoponse?.data;
  console.log(tutorData)

  if (isError || error) {
    return (
      <UserNotFound errorData={error as ErrorData} />
    )
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-200">
      <Header />

      <div className="flex flex-col gap-8 p-8 md:flex-row md:px-16 lg:px-24 md:mt-8">
        {/* Left Column - Image and Basic Info */}
        <div className="md:w-1/4 lg:w-1/5">
          <div className="flex flex-col items-center p-6 space-y-4 bg-white rounded-lg shadow-sm">
            <div className="relative">
              <img
                src={tutorData?.profileImage}
                alt={tutorData?.fullname}
                className="object-cover w-48 h-48 border-4 border-blue-100 rounded-full"
              />
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold">{tutorData?.fullname}</h2>
              <div className="flex items-center justify-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">{tutorData?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="md:w-3/4 lg:w-4/5">
          <div className="grid grid-cols-1 gap-6 p-8 bg-white rounded-lg shadow-sm md:grid-cols-2">
            <div className="space-y-6">
              <div className="pb-8 space-y-6">
                <h3 className="pb-4 text-lg font-semibold text-gray-700 border-b">Personal Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-sm text-gray-600">Age</div>
                  <div className="text-sm">{tutorData?.age || 'Not Provided'}</div>
                  <div className="text-sm text-gray-600">Country</div>
                  <div className="text-sm">{tutorData?.country || 'Not Provided'}</div>
                  <div className="text-sm text-gray-600">Birthday</div>
                  <div className="text-sm">{tutorData?.birthday || 'Not Provided'}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="pb-2 text-lg font-semibold text-gray-700 border-b">Contact Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm">{tutorData?.contact}</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm">{tutorData?.website || 'Not Provided'}</span>
                  </div>
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm">{tutorData?.company || 'Not Provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="spa8ce-y-6 pb-">
              <div className="space-y-8">
                <h3 className="pb-4 text-lg font-semibold text-gray-700 border-b">Professional Background</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-sm text-gray-600">Specialization</div>
                  <div className="text-sm">{tutorData?.specialization || 'Not Provided'}</div>
                  <div className="text-sm text-gray-600">Education</div>
                  <div className="text-sm">{tutorData?.education || 'Not Provided'}</div>
                  <div className="text-sm text-gray-600">Experience</div>
                  <div className="text-sm">{tutorData?.experience || 'Not Provided'}</div>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                <h3 className="pb-4 text-lg font-semibold text-gray-700 border-b">Bio</h3>
                <p className="text-sm leading-relaxed text-gray-700">{tutorData?.bio || 'Not Provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTutorProfile;