import { Routes, Route } from 'react-router-dom';
import UserRegistrations from '../pages/User/UserRegistrations';
import UserLogin from '../pages/User/UserLogin';
import UserHome from '../pages/User/UserHome';
import AuthRoute from '../middleware/AuthRoute';
import ResetPassword from '../components/Forms/ResetPassword';
import UserProfile from '../pages/User/UserProfile';
import UserListProblems from '../pages/User/UserListProblems';
import UserCoursePage from '../pages/User/UserCoursePage';
import UserCartPage from '../pages/User/UserCartPage';
import UserWishlistPage from '../pages/User/UserWishlistPage';
import StripeCheckoutpage from '../components/Checkout/StripeCheckoutpage';
import PaymentSuccessPage from '../pages/User/PaymentSuccessPage';
import PaymentFailurePage from '../pages/User/PaymentFailurePage';
import WalletSuccess from '../components/ProfileContent/WalletSuccess';
import WalletFailure from '../components/ProfileContent/WalletFailure';
import ViewCourse from '../pages/User/ViewCourse';
import Problems from '../pages/User/Problems';
import EnrolledCoursePage from '../pages/User/EnrolledCoursePage';
import AcessCourse from '../pages/User/AcessCourse';
import NotFound from '../pages/CommonPages/NotFound';
import ViewTutorProfile from '../pages/User/ViewTutorProfile';
import LandingPage from '../pages/LandingPage/LandingPage';


const UserRoute = () => {
  return (  
    <Routes>
        {/* public routes  */}
        <Route path='' element={<LandingPage/>}></Route>
        <Route path='/login' element = {<UserLogin/>}></Route>
        <Route path='/register' element = {<UserRegistrations/>}/>
        <Route path='/reset-password/:id/:token' element={<ResetPassword />} />


        {/* Protected Routes  */}
        <Route path='/home' element = {<AuthRoute role='user'><UserHome/></AuthRoute>}></Route>
        <Route path='/profile/:id' element={<AuthRoute role='user'><UserProfile/></AuthRoute>}></Route>
        <Route path='/problem' element={<AuthRoute role='user'><UserListProblems/></AuthRoute>}></Route>
        <Route path='/course' element={<AuthRoute role= 'user'><UserCoursePage/></AuthRoute>}></Route>
        <Route path='/cart/:id' element={<AuthRoute role='user'><UserCartPage/></AuthRoute>}></Route>
        <Route path='/wishlist/:id' element={<AuthRoute role='user'><UserWishlistPage/></AuthRoute>}></Route>
        <Route path='/checkout/:id' element={<AuthRoute role='user'><StripeCheckoutpage/></AuthRoute>}></Route>
        <Route path='/payment-success' element={<AuthRoute role='user'><PaymentSuccessPage/></AuthRoute>}></Route>
        <Route path='/payment-failure' element={<AuthRoute role='user'><PaymentFailurePage/></AuthRoute>}></Route>
        <Route path='/wallet-success' element={<AuthRoute role='user'><WalletSuccess/></AuthRoute>}></Route>
        <Route path='/wallet-failure' element={<AuthRoute role='user'><WalletFailure/></AuthRoute>}></Route>
        <Route path='/view-course/:id' element={<AuthRoute role='user'><ViewCourse/></AuthRoute>}></Route>
        <Route path='/view-problem/:id' element={<AuthRoute role='user'><Problems/></AuthRoute>}></Route>
        <Route path='/enroll-course/:id' element={<AuthRoute role='user'><EnrolledCoursePage/></AuthRoute>}></Route>
        <Route path='/access-course/:id' element={<AuthRoute role='user'><AcessCourse/></AuthRoute>}></Route>
        <Route path='/view-tutor/:id' element={<AuthRoute role='user'><ViewTutorProfile/></AuthRoute>}></Route>

        <Route path='*' element={<NotFound/>}/>
    </Routes>
  )
}

export default UserRoute
