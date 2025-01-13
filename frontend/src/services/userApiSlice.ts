import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { showUserDetailsResponse } from "../types/userTypes";
import { FilteredData, ListProblemResponse, showProblemDataResponse } from "../types/problemTypes";
import { showCourseDetailsResponse, showCourseViewResponse } from "../types/courseTypes";
import { ListTutorResponse } from "../types/tutorTypes";
import { showCartDetailsResponse } from "../types/cartTypes";
import { showWishlistDetailsResponse } from "../types/wishlistTypes";
import { FilteredDataForHistory, showEnrolledCourseResponse, showOrderDetailsResponse, showPaymentDetailsResponse } from "../types/orderTypes";
import { showWalletDetailsResponse } from "../types/walletTypes";
import { showProblemReviewListResponse, showReviewListResponse } from "../types/reviewTypes";
import { ShowProblemFeedbackResponse } from "../types/feedbackTypes";


export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
       baseUrl: import.meta.env.VITE_BASE_URL,
       credentials: 'include'
    }),
    tagTypes: ['User','Wallet','Course','Problem', 'Feedback', 'ProblemReview','Cart'],
    endpoints: (builder) => ({
       register:builder.mutation({ 
        query: (data) => ({
            url: '/users/initiate-register',
            method: 'POST',
            body: data,
        }),
       }),
       logout: builder.mutation({
        query:() => ({
            url:'/users/logout',
            method:'POST'
        }),
       }),
       verifyUser: builder.mutation({
        query:(data) => ({
            url:'/users/verify-user',
            method:'POST',
            body: data
        })
       }),
       googleAuth: builder.mutation({
        query:(data) => ({
            url:'/users/auth/google',
            method:'POST',
            body:data
        })
       }),
       loginUser: builder.mutation({
        query: (data) => ({
            url:'/users/login',
            method:'POST',
            body:data
        })
       }),
       forgetPassword: builder.mutation({
        query:(data) => ({
           url:'/users/forget-password',
           method:'POST',
           body:data
        })
       }),
       resetPassword: builder.mutation({
        query:({id, token, password}) => ({
            url:`/users/reset-password/${id}/${token}`,
            method:'PATCH',
            body:{password},
        })
       }),
       getUserById: builder.query<showUserDetailsResponse, string>({
        query:(id) => ({
            url:`/users/profile/${id}`,
            method:'GET'
        })
       }),
       updateUserData: builder.mutation({
        query:({userId, ...userData}) => ({
            url:`/users/update-profile/${userId}`,
            method:'PUT',
            body:userData
        }) 
       }),
       updateUserProfile: builder.mutation({
        query:({userId, formData}) => ({
          url:`/users/update-image/${userId}`,
          method:'PATCH',
          body:formData,
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
            url: `/users/list-problems?${queryString}`,
            method: 'GET',
          };
        },
      }),
      updateUserAccountInfo: builder.mutation({
        query:({userId, ...userData}) => ({
            url:`/users/update-account/${userId}`,
            method:'PUT',
            body:userData
        })
      }),
      updatePassword: builder.mutation({
        query:(data) => ({
          url:`/users/update-password/${data.userId}`,
          method:'PATCH',
          body: {
            current_password: data.currentPassword,
            password: data.newPassword
          }
        })
      }),
      listAllCourse: builder.query<showCourseDetailsResponse, string>({
         query:() => ({
            url:'/users/list-courses',
            method:'GET'
         })
      }),
      addToCart: builder.mutation({
        query:({userId, courseId}) => ({
           url:'/users/cart/add',
           method:'POST',
           body:{ userId, courseId}
        })
      }),
      addToWishlist: builder.mutation({
        query:({userId, courseId}) => ({
          url:'/users/wishlist/add',
          method:'POST',
          body:{userId, courseId}
        })
      }),
      listTutorProfile: builder.query<ListTutorResponse, void>({
        query:() => ({
          url:'/users/list-tutors',
          method:'GET',
        })
      }),
      listCartItems: builder.query<showCartDetailsResponse, {userId:string}>({
        query:({userId}) => ({
          url:`/users/list-cart/${userId}`,
          method:'GET',  
        }),
        providesTags:['Cart']
      }),
      removeCartItems: builder.mutation({
        query:({userId,  itemId}) => ({
           url:'/users/remove-items',
           method:'DELETE',
           body:{userId,  itemId}
        }),
        invalidatesTags: ['Cart']
      }),
      listWishlistItems: builder.query<showWishlistDetailsResponse, { userId: string}>({
        query:({userId}) => ({
          url:`/users/list-wishlist/${userId}`,
          method:'GET'
        })
      }),
      removeWishlistItems: builder.mutation({
        query:({userId, itemId}) => ({
          url:'/users/remove-wishlist',
          method:'DELETE',
          body:{userId, itemId}
        })
      }),
      createCheckoutSession: builder.mutation({
        query: (data) => ({
          url:'/users/create-checkout-session',
          method:'POST',
          body: data,
        })
      }),
      verifySuccessPayment: builder.mutation<showPaymentDetailsResponse, string>({
        query: (sessionId) => ({
          url:'/users/verify-payment-success',
          method:'POST',
          body: {sessionId}
        })
      }),
      verifyFailurePayment: builder.mutation({
        query: (sessionId) => ({
            url:'/users/verify-payment-failure',
            method:'POST',
            body: {sessionId}
        })
      }),
      listOrderHistory: builder.query<showOrderDetailsResponse, FilteredDataForHistory & { userId: string }>({
        query: ({ userId, page = 1, limit = 6 }) => ({
          url: `/users/list-user-orders/${userId}?page=${page}&limit=${limit}`,
          method: 'GET',
        }),
      }),
      retryPayment: builder.mutation({
        query: (data) => ({
          url:'/users/retry-payment',
          method:'PATCH',
          body: data
        })
      }),
      activateWallet: builder.mutation({
        query:(userId) => ({
          url:'/users/activate-wallet',
          method:'POST',
          body: {userId}
        })
      }),
      getWalletDetails: builder.query<showWalletDetailsResponse, string>({
         query: (userId) => ({
          url:`/users/list-wallet/${userId}`,
          method:'GET',
         }),
         providesTags:['Wallet']
      }),
      walletPayment: builder.mutation({
        query: ({userId, amount}) => ({
          url:'/users/update-wallet',
          method:'PUT',
          body: {userId, amount}
        })
      }),
      verifySuccessfullWallPayment: builder.mutation({
        query:(sessionId) => ({
           url:'/users/wallet-success-stat',
           method:'PATCH',
           body: {sessionId}
        })
      }),
      verifyFailureWalletPayment: builder.mutation({
        query: (sessionId) => ({
          url:'/users/wallet-failure-stat',
          method:'PATCH',
          body: {sessionId}
        })
      }),
      payWithWallet: builder.mutation({
        query: (data) => ({
           url:'/users/wallet-payment',
           method:'POST',
           body: data,
        }),
        invalidatesTags: ['Wallet']
      }),
      viewCourseData: builder.query<showCourseViewResponse, string>({
        query: (courseId) => ({
          url:`/users/view-course/${courseId}`,
          method: 'GET'
        }),
        providesTags: ['Course']

      }),
      addReview: builder.mutation({
        query: (data) => ({
          url:'/users/add-review',
          method:'POST',
          body: data
        }),
        invalidatesTags: ['Course']
      }),
      listCourseReview: builder.query<showReviewListResponse, {id: string}>({
        query: ({id}) => ({
          url:`/users/list-reviews/${id}`,
          method: 'GET'
        }),
      }),
      listProblemData: builder.query<showProblemDataResponse, string>({
        query: (problemId) => ({
          url:`/users/view-problem/${problemId}`,
          method:'GET'
        }),
        providesTags:['Problem']
      }),
      runCode: builder.mutation({
        query: ({code, language, problemId}) => ({
          url:'users/run-code',
          method:'POST',
          body: {code, language, problemId}
        })
      }),
      submitCode: builder.mutation({
        query: ({code, language, problemId, userId}) => ({
          url:'users/submit-code',
          method:'POST',
          body: {code, language, problemId, userId}
        }),
        invalidatesTags:['Problem']
      }),
      addFeedback: builder.mutation({
        query:(data) => ({
          url:'/users/add-feedback',
          method:'POST',
          body: data
        }),
        invalidatesTags:['Feedback']
      }),
      listProblemFeedback: builder.query<ShowProblemFeedbackResponse, {id: string}>({
        query: ({id}) => ({
          url:`/users/list-feedback/${id}`,
          method:'GET'
        }),
        providesTags:['Feedback']
      }),
      listEnrolledCourse: builder.query<showEnrolledCourseResponse, {userId: string}>({
        query: ({userId}) => ({
          url:`/users/enroll-course/${userId}`,
          method: 'GET'
        })
      }),
      addProblemReview: builder.mutation({
        query: (data) => ({
          url:'/users/problem-review',
          method:'POST',
          body: data
        }),
        invalidatesTags:['ProblemReview']
      }),
      listProblemReviews: builder.query<showProblemReviewListResponse, {id: string}>({
        query: ({id}) => ({
          url:`/users/list-problem-review/${id}`,
          method: 'GET'
        }),
        providesTags:['ProblemReview']
      }),
      getUserProgressData: builder.query({
        query:(userId) => ({
          url:`/users/list-user/${userId}`,
          method:'GET'
        })
      }),
      getProblemCount: builder.query({
        query: () => ({
          url:`/users/get-count/`,
          method:'GET'
        })
      }),
      getDashboardStats: builder.query({
        query:(id) => ({
          url:`/users/get-stats/${id}`,
          method:'GET'
        })
      })
    }),

});

export const {
    useRegisterMutation, 
    useLogoutMutation,
    useVerifyUserMutation,
    useLoginUserMutation,
    useForgetPasswordMutation,
    useResetPasswordMutation,
    useGoogleAuthMutation,
    useGetUserByIdQuery,
    useUpdateUserDataMutation,
    useUpdateUserProfileMutation,
    useGetProblemsQuery,
    useUpdateUserAccountInfoMutation,
    useUpdatePasswordMutation,
    useListAllCourseQuery,
    useAddToCartMutation,
    useAddToWishlistMutation,
    useListTutorProfileQuery,
    useListCartItemsQuery,
    useRemoveCartItemsMutation,
    useListWishlistItemsQuery,
    useRemoveWishlistItemsMutation,
    useCreateCheckoutSessionMutation,
    useVerifySuccessPaymentMutation,
    useVerifyFailurePaymentMutation,
    useListOrderHistoryQuery,
    useRetryPaymentMutation,
    useActivateWalletMutation,
    useGetWalletDetailsQuery,
    useWalletPaymentMutation,
    useVerifySuccessfullWallPaymentMutation,
    useVerifyFailureWalletPaymentMutation,
    usePayWithWalletMutation,
    useViewCourseDataQuery,
    useAddReviewMutation,
    useListCourseReviewQuery,
    useListProblemDataQuery,
    useRunCodeMutation,
    useSubmitCodeMutation,
    useAddFeedbackMutation,
    useListProblemFeedbackQuery,
    useListEnrolledCourseQuery,
    useAddProblemReviewMutation,
    useListProblemReviewsQuery,
    useGetUserProgressDataQuery,
    useGetProblemCountQuery,
    useGetDashboardStatsQuery

} = apiSlice;

