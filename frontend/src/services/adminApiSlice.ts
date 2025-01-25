import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ListUsersResponse, showUserDetailsResponse } from "../types/userTypes";
import { ListTutorResponse, showTutorDetailResponse } from "../types/tutorTypes";
import { ListProblemResponse, showProblemDataResponse } from "../types/problemTypes";
import { FilteredData } from "../types/problemTypes";
import { FilterData, showCourseDetailsResponse } from "../types/courseTypes";

export const adminApiSlice = createApi({
    reducerPath: 'adminApi',
    baseQuery: fetchBaseQuery ({
        baseUrl: import.meta.env.VITE_BASE_URL,
        credentials: 'include'
    }),
    tagTypes: ['Admin','Problem'],
    endpoints: (builder) => ({
        loginAdmin: builder.mutation({
            query: (data) => ({
                url: '/admin/login',
                method:'POST',
                body:data
            })
        }),
        logoutAdmin: builder.mutation({
            query:() => ({
                url: '/admin/logout',
                method: 'POST'
            })
        }),
        listUsers: builder.query<ListUsersResponse, { searchTerm: string, page: number, limit: number}>({
            query:({searchTerm, page = 1, limit = 8}) => {
                let queryString = '';
                if(searchTerm) queryString += `searchTerm=${searchTerm.toLowerCase()}&`;
                queryString += `page=${page}&limit=${limit}`;
                return {
                    url:`/admin/listuser?${queryString}`,
                    method:'GET',
                }
            },
        }),
        listInstructors: builder.query<ListTutorResponse, FilterData>({
            query: ({searchTerm}) => {
                let queryString = '';
                if(searchTerm) queryString += `searchTerm=${searchTerm.toLowerCase()}&`;

                return {
                    url:`/admin/listtutors?${queryString}`,
                    method:'GET'
                }
            }
        }),
        updateUsers: builder.mutation({
            query:({id, isBlocked}) => ({
                url:`/admin/edituser/${id}`,
                method:'PATCH',
                body:{isBlocked}
            })
        }),
        updateTutors: builder.mutation({
            query:({id, isBlocked}) => ({
                url:`/admin/edittutor/${id}`,
                method:'PATCH',
                body    :{isBlocked}
            })
        }),
        getTutorById: builder.query<showTutorDetailResponse, string>({
            query:(tutorId:string) => ({
                url:`/admin/tutor-detail/${tutorId}`,
                method:'GET'
            })
        }),
        updateTutorApproval:builder.mutation({
            query:({tutorId, isApproved, isVerified, reason}) => ({
                url:`/admin/tutor-approval/${tutorId}`,
                method:'POST',
                body:{isApproved, isVerified, reason}
           })
        }),
        getUserById: builder.query<showUserDetailsResponse, string>({
            query: (userId:string) => ({
                url:`/admin/user-detail/${userId}`,
                method:'GET'
            })
        }),
        addProblems: builder.mutation({
            query: (data) => ({
                url:'/admin/add-problems',
                method:'POST',
                body:data
            })
        }),
        getProblems: builder.query<ListProblemResponse, FilteredData>({
            query: ({ searchTerm, sortOption, filterTag, filterLevel, page = 1, limit = 8 }) => {
              let queryString = '';
              if (searchTerm) queryString += `searchTerm=${searchTerm.toLowerCase()}&`;
              if (sortOption) queryString += `sortOption=${sortOption}&`;
              if (filterTag) queryString += `filterTag=${filterTag}&`;
              if (filterLevel) queryString += `filterLevel=${filterLevel.toLowerCase()}&`;
              queryString += `page=${page}&limit=${limit}`;
             
      
              return {
                url: `/admin/list-problems?${queryString}`,
                method: 'GET',
              };
            },
            providesTags:['Problem']
        }),
        updateProblemStatus: builder.mutation({
            query:({id, isBlock}) => ({
                url:`/admin/update-status/${id}`,
                method:'PATCH',
                body:{isBlock}
            })
        }),
        listProblemData: builder.query<showProblemDataResponse, string>({
            query: (problemId) => ({
                url:`/admin/list-problem/${problemId}`,
                method:'GET'
            })
        }),
        updateBasicProblemInfo: builder.mutation({
            query:({problemId, ...problemData}) => ({
                url:`/admin/update-basic/${problemId}`,
                method:'PUT',
                body: problemData
            }),
            invalidatesTags:['Problem']
        }),
        updateAdditionalProblemDetails: builder.mutation({
            query:({problemId, ...problemData}) => ({
                url:`/admin/additional-update/${problemId}`,
                method: 'PUT',
                body:problemData
            })
        }),
        listAllCourse: builder.query<showCourseDetailsResponse, FilterData>({
            query: ({searchTerm}) => {
                let queryString = '';
                if(searchTerm) queryString += `searchTerm=${searchTerm.toLowerCase()}&`;

                return {
                    url:`/admin/list-courses?${queryString}`,
                    method:'GET'
                }
            }
        }),
        getDashboardMetrics: builder.query({
            query:() => ({
                url:'/admin/get-stats',
                method:'GET'
            })
        })
    }),
});

export const {
    useLoginAdminMutation,
    useLogoutAdminMutation, 
    useListUsersQuery,
    useUpdateUsersMutation,
    useListInstructorsQuery,
    useUpdateTutorsMutation,
    useGetTutorByIdQuery,
    useUpdateTutorApprovalMutation,
    useGetUserByIdQuery,
    useAddProblemsMutation,
    useGetProblemsQuery,
    useUpdateProblemStatusMutation,
    useListProblemDataQuery,
    useUpdateBasicProblemInfoMutation,
    useUpdateAdditionalProblemDetailsMutation,
    useListAllCourseQuery,
    useGetDashboardMetricsQuery
} = adminApiSlice;