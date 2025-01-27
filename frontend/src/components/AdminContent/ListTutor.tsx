import React, { useEffect, useState } from 'react';
import Table from '../Tables/Table';
import { Tutor } from '../../types/tutorTypes';
import { useGetTutorByIdQuery, useListInstructorsQuery, useUpdateTutorsMutation } from '../../services/adminApiSlice';
import { APIError } from '../../types/types';
import { Toaster, toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setCredentials } from '../../store/slices/tutorSlice';
import { flushSync } from 'react-dom';
import Swal from 'sweetalert2';
import useThrottle from '../../hooks/useThrottle';


const ListTutor: React.FC = () => {
  const headers: string[] = [
    'ID',
    'USER_NAME',
    'EMAIL_ID',
    'ACCOUNT_STATUS',
    'CREATED_AT',
    'STATUS',
  ];
  const [searchTerm, setSearchTerm] = useState("");
  const [localUsers, setLocalUsers] = useState<Tutor[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const throttledSearchTerm = useThrottle(searchTerm, 300)
  const { data, isError, error, refetch } = useListInstructorsQuery({
    searchTerm: throttledSearchTerm
  });
  const [updateTutor] = useUpdateTutorsMutation();
  const { data: tutorDetails, isLoading, isError: isDetailError, refetch: tutoRefetch } = useGetTutorByIdQuery(selectedId || '');
  const dispatch = useDispatch();
  const currentuser = useSelector((state: RootState) => state.tutor.tutorInfo)


  useEffect(() => {

    if (data) {
      setLocalUsers(data.data);
    }
  }, [data]);

  if (isError) {
    return (
      <p className="text-center text-themeColor">
        Message: {error instanceof Error ? error.message : 'No Tutors found'}
      </p>
    );
  }



  const toggleTutorBlock = async (userId: string, isBlocked: boolean) => {
    const action = isBlocked ? 'unblock' : 'block';
    try {
      const result = await Swal.fire({
        title: `Are you sure you want to ${action} this tutor?`,
        text: `This action will ${action} the tutor's account.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, ${action} it!`,
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        const response = await updateTutor({ id: userId, isBlocked: !isBlocked }).unwrap();
        if (response) {
          setLocalUsers((prevUsers) =>
            prevUsers.map((tutor) =>
              tutor._id === userId ? { ...tutor, isBlocked: !isBlocked } : tutor
            )
          );

          const textColor = isBlocked ? 'green' : 'red';
          toast.success(`Tutor ${action}ed successfully`, {
            style: {
              color: textColor,
            },
          });

          if (currentuser && currentuser._id === userId) {
            const updatedUser = { ...currentuser, isBlocked: !isBlocked };
            flushSync(() => {
              dispatch(setCredentials({ data: updatedUser }));
            });
          }
        }
      } else {
        toast.info('Action canceled');
      }
    } catch (error) {
      const apiError = error as APIError;
      console.log('Failed to update user status', apiError.data?.message || apiError.data);
      refetch();
    }
  };



  const tutorRows = localUsers.map((tutor: Tutor) => [
    tutor._id,
    tutor.username,
    tutor.email,
    //badge
    <span
      key={`${tutor._id}-status`}
      className={`px-2 py-1 rounded-full  text-xs ${!tutor.isVerified
        ? 'text-yellow-500'
        : tutor.isApproved
          ? 'text-green-600'
          : 'text-red-700'
        }`}
    >
      {!tutor.isVerified
        ? '🟡Pending'
        : tutor.isApproved
          ? '🟢Approved'
          : '🔴Not-approved'}
    </span>,
    new Date(tutor.createdAt).toLocaleDateString(),
    <div className="relative group" key={tutor._id}>
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={tutor.isBlocked}
          onChange={() => toggleTutorBlock(tutor._id, tutor.isBlocked)}
          className="hidden"
        />
        <div
          className={`w-12 flex items-center rounded-full p-1 transition duration-1000 ease-in-out ${tutor.isBlocked ? 'bg-red-500' : 'bg-green-500'
            }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ease-in-out ${tutor.isBlocked ? 'translate-x-6' : ''
              }`}
          ></div>
        </div>
      </label>
      <div
        className={`absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 rounded bg-customGrey text-themeColor text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      >
        {tutor.isBlocked ? 'User is blocked' : 'User is active'}
      </div>
    </div>,
  ]);

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ style: { backgroundColor: '#D8D8FD' } }} richColors />
      <h1 className="mb-4 text-2xl font-semibold">LIST OF INSTRUCTORS</h1>
      <input
        type="text"
        placeholder="Search Tutors..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 bg-white border rounded-lg shadow-xl border-customGrey md:w-1/2 focus:outline-none focus:border-hoverColor"
      />

      <Table
        headers={headers}
        data={tutorRows}
        type='tutor'
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        tutorDetails={tutorDetails}
        isLoading={isLoading}
        isDetailError={isDetailError}
        refetch={tutoRefetch}
      />

      <div className='flex items-center justify-between max-w-5xl mt-4'>
        <div>
          <select
            className="px-3 py-2 border border-gray-400 rounded-lg shadow-none bg-customGrey focus:outline-none focus:border-hoverColor"
          >
            {[8, 12].map((size) => (
              <option key={size} value={size}>
                Show {size} rows per page
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-center gap-x-2">
          {/* previous */}
          <button
            className={`px-4 py-2 bg-gray-300 rounded-md opacity-50 cursor-not-allowed
           `}
          >
            Previous
          </button>

          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-md bg-blue-500 text-white `}
            >
              1
            </button>
          </div>
          {/* next */}
          <button
            className={`px-4 py-2 bg-gray-300 rounded-md opacity-50 cursor-not-allowed`}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default ListTutor;
