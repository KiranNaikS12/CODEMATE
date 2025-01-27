import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { showTutorDetailResponse } from "../types/tutorTypes";
import { showCourseDetailsResponse, showTutorCourseDetailsResponse } from "../types/courseTypes";
import { showEnrolledUsersResponse } from "../types/userTypes";
import { showNotificationResponse } from "../types/notificationTypes";


export const tutorApiSlice = createApi({
    reducerPath: 'tutorapi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_BASE_URL,
        credentials: 'include'
    }),
    tagTypes: ['Tutor', 'Notification'],
    endpoints: (builder) => ({
        registerTutor: builder.mutation({
            query: (data) => ({
                url: '/tutors/initiate-register',
                method: 'POST',
                body: data,
            }),
        }),
        logoutTutor: builder.mutation({
            query: () => ({
                url: '/tutors/logout',
                method: 'POST'
            }),
        }),
        verifyTutor: builder.mutation({
            query: (data) => ({
                url: '/tutors/verify-tutor',
                method: 'POST',
                body: data
            })
        }),
        googleAuth: builder.mutation({
            query: (data) => ({
                url: '/tutors/auth/google',
                method: 'POST',
                body: data
            })
        }),
        loginTutor: builder.mutation({
            query: (data) => ({
                url: '/tutors/login',
                method: 'POST',
                body: data
            })
        }),
        forgetPassword: builder.mutation({
            query: (data) => ({
                url: '/tutors/forget-password',
                method: 'POST',
                body: data
            })
        }),
        resetPassword: builder.mutation({
            query: ({ id, token, password }) => ({
                url: `tutors/reset-password/${id}/${token}`,
                method: 'PATCH',
                body: { password }
            })
        }),
        handleApprovalForm: builder.mutation({
            query: ({ id, data }) => ({
                url: `/tutors/tutor-approval/${id}`,
                method: 'POST',
                body: data
            })
        }),
        getTutorById: builder.query<showTutorDetailResponse, string>({
            query: (id) => ({
                url: `/tutors/profile/${id}`,
                method: 'GET'
            })
        }),
        updateTutorData: builder.mutation({
            query: ({ tutorId, ...tutorData }) => ({
                url: `/tutors/update-profile/${tutorId}`,
                method: 'PUT',
                body: tutorData
            })
        }),
        updateTutorImage: builder.mutation({
            query: ({ userId, formData }) => ({
                url: `/tutors/update-image/${userId}`,
                method: 'PATCH',
                body: formData
            })
        }),
        uploadCourse: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/tutors/upload-course/${id}`,
                method: 'POST',
                body: formData
            })
        }),
        listCourse: builder.query<showCourseDetailsResponse, string>({
            query: () => ({
                url: `/tutors/list-course`,
                method: 'GET'
            })
        }),
        listMyCourse: builder.query<showTutorCourseDetailsResponse, { id: string; page: number, limit: number }>({
            query: ({ id, page, limit }) => ({
                url: `/tutors/my-course/${id}`,
                method: 'GET',
                params: { page, limit }
            })
        }),
        updateCourseStatus: builder.mutation({
            query: ({ id, isBlocked }) => ({
                url: `/tutors/update-status/${id}`,
                method: 'PATCH',
                body: { isBlocked }
            })
        }),
        getEnrolledUser: builder.query<showEnrolledUsersResponse, { tutorId: string, page?: number, limit?: number }>({
            query: ({ tutorId, page, limit }) => ({
                url: `/tutors/get-students/${tutorId}`,
                method: 'GET',
                params: { page, limit }
            })
        }),
        getNotification: builder.query<showNotificationResponse, { id: string }>({
            query: ({ id }) => ({
                url: `/tutors/notification/${id}`,
                method: 'GET',
            }),
            providesTags: ['Notification']
        }),
        removeNotification: builder.mutation({
            query: (notificationId) => ({
                url: `/tutors/remove/notification`,
                method: 'DELETE',
                body: notificationId
            }),
            invalidatesTags: ['Notification']
        }),
        clearAllNotification: builder.mutation({
            query: (tutorId) => ({
              url:'/tutors/clear/notifications',
              method:'DELETE',
              body: tutorId
            }),
            invalidatesTags: ['Notification']
        })
    }),
});

export const {
    useRegisterTutorMutation,
    useLogoutTutorMutation,
    useVerifyTutorMutation,
    useLoginTutorMutation,
    useForgetPasswordMutation,
    useResetPasswordMutation,
    useGoogleAuthMutation,
    useHandleApprovalFormMutation,
    useGetTutorByIdQuery,
    useUpdateTutorDataMutation,
    useUpdateTutorImageMutation,
    useUploadCourseMutation,
    useListCourseQuery,
    useUpdateCourseStatusMutation,
    useGetEnrolledUserQuery,
    useListMyCourseQuery,
    useGetNotificationQuery,
    useRemoveNotificationMutation,
    useClearAllNotificationMutation
} = tutorApiSlice;


