import React, { useState, useEffect } from 'react';
import Table from '../Tables/Table';
import { useGetUserByIdQuery, useListUsersQuery, useUpdateUsersMutation } from '../../services/adminApiSlice';
import { User } from '../../types/userTypes';
import { APIError } from "../../types/types";
import { Toaster, toast } from "sonner";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setCredentials } from '../../store/slices/authSlice';
import { flushSync } from 'react-dom';
import Swal from 'sweetalert2'
import useThrottle from '../../hooks/useThrottle';


const ListUsers: React.FC = () => {
  const headers: string[] = ["ID", "USER_NAME", "EMAIL_ID", "CONTACT", "CREATED_AT", "STATUS"];
  const [searchTerm, setSearchTerm] = useState("");
  const throttledSearchTerm = useThrottle(searchTerm, 300)
  const [localUsers, setLoacalUsers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalUsers, setTotalUsers] = useState(0);
  const { data, isError, error, refetch } = useListUsersQuery({
    searchTerm: throttledSearchTerm,
    page: currentPage,
    limit: itemsPerPage
  });
  const { data: userDetails, isLoading, isError: isDetailError, refetch: userRefetch } = useGetUserByIdQuery(selectedId ?? '', { skip: !selectedId })
  const [updateUser] = useUpdateUsersMutation();
  const dispatch = useDispatch();

  const currentUser = useSelector((state: RootState) => state.auth.userInfo)

  useEffect(() => {
    if (data) {
      setLoacalUsers(data.data?.users || [])
      setTotalUsers(data?.data?.totalUsers || 0)
    }
  }, [data])

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (isError) {
    return (
      <p className="text-center text-themeColor">
        Message: {error instanceof Error ? error.message : 'No users are found'}
      </p>
    );
  }

  const toggleUserBlock = async (userId: string, isBlocked: boolean) => {
    const action = isBlocked ? 'unblock' : 'block';
    try {
      const result = await Swal.fire({
        title: `Are you sure you want to ${action} this user?`,
        text: `This action will ${action} the user's account.`,
        showCancelButton: true,
        position: 'top',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, ${action} it!`,
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'rounded-lg shadow-lg  border border-green-500 text-center'
        },
      });

      if (result.isConfirmed) {
        const response = await updateUser({ id: userId, isBlocked: !isBlocked }).unwrap();
        if (response) {
          console.log('updated successfully', response.data)
          setLoacalUsers((prevUsers) =>
            prevUsers.map((user) =>
              user._id === userId ? { ...user, isBlocked: !isBlocked } : user
            )
          );

          const textColor = isBlocked ? 'green' : 'red';
          toast.success(`User ${action} successfully`, {
            style: {
              color: textColor,
            },

          });

          console.log("currentUser", currentUser)
          if (currentUser && currentUser._id === userId) {
            const updatedUser = { ...currentUser, isBlocked: !isBlocked };
            console.log("updatedUser", updateUser)
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




  const userRows = localUsers.map((user: User) => [
    user._id,
    user.username,
    user.email,
    user.contact || 'NILL',
    new Date(user.createdAt).toLocaleDateString(),
    <div className="relative group">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={user.isBlocked}
          onChange={() => toggleUserBlock(user._id, user.isBlocked)}
          className="hidden"
        />
        <div className={`w-12 flex items-center rounded-full p-1 transition duration-1000 ease-in-out ${user.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}>
          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ease-in-out ${user.isBlocked ? 'translate-x-6' : ''}`}></div>
        </div>
      </label>

      {/* Tooltip */}
      <div className={`absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 rounded bg-customGrey text-themeColor text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 `}>
        {user.isBlocked ? 'User is blocked' : 'User is active'}
      </div>
    </div>
  ]);

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ style: { backgroundColor: '#D8D8FD' } }} richColors />
      <h1 className="mb-4 text-2xl font-semibold">LIST OF USERS</h1>
      <input
        type="text"
        placeholder="Search Users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 bg-white border rounded-lg shadow-xl border-customGrey md:w-1/2 focus:outline-none focus:border-hoverColor"
      />
      <Table
        headers={headers}
        data={userRows}
        type='user'
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        userDetails={userDetails}
        isLoading={isLoading}
        isDetailError={isDetailError}
        refetch={userRefetch}
      />

      <div className="flex items-center justify-between max-w-5xl mt-4 ">
        <div>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
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
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className={`px-4 py-2 bg-gray-300 rounded-md ${currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-400"
              }`}
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(totalUsers / itemsPerPage) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-md ${pageNum === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 hover:bg-gray-400"
                  }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
          {/* next */}
          <button
            disabled={currentPage === Math.ceil(totalUsers / itemsPerPage)}
            onClick={() => handlePageChange(currentPage + 1)}
            className={`px-4 py-2 bg-gray-300 rounded-md ${currentPage === Math.ceil(totalUsers / itemsPerPage)
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-400"
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default ListUsers;