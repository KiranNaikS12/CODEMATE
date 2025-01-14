import { Route, Routes } from "react-router-dom"
import TutorLogin from "../pages/Tutor/TutorLogin"
import TutorRegister from "../pages/Tutor/TutorRegister"
import AuthRoute from "../middleware/AuthRoute"
import TutorHome from "../pages/Tutor/TutorHome"
import ResetPassword from "../components/Forms/ResetPassword"
import TutorApprovalFrom from "../pages/Tutor/TutorApprovalFrom"
import TutorProfile from "../pages/Tutor/TutorProfile"
import DashBoard from "../components/TutorContent/DashBoard"
import CoursePage from "../components/TutorContent/CoursePage"
import AddCourseForm from "../components/TutorContent/AddCourseForm"
import EnrolledStudents from "../components/TutorContent/EnrolledStudents"
import NotFound from "../pages/CommonPages/NotFound"



const TutorRoute = () => {
  return (
    <Routes>
         {/* public routes  */}
        <Route path="/login" element = {<TutorLogin/>}></Route>
        <Route path="/register" element ={<TutorRegister/>}></Route>
        <Route path='/reset-password/:id/:token' element={<ResetPassword />} />
        <Route path="/approval/:id" element = {<TutorApprovalFrom/>}/>

        {/* Protected Routes  */}
        {/* <Route path="/home" element = {<AuthRoute role="tutor"><TutorHome/></AuthRoute>}></Route> */}
        <Route path="/home" element={<AuthRoute role="tutor"><TutorHome/></AuthRoute>}>
           <Route index element={<DashBoard/>}/>
           <Route path="course" element={<CoursePage/>}/>
           <Route path='course/upload' element={<AddCourseForm/>}/>
           <Route path="student" element={<EnrolledStudents/>}/>
        </Route>
        <Route path="/profile/:id" element ={<AuthRoute role="tutor"><TutorProfile/></AuthRoute>}></Route>

        <Route path="*" element = {<NotFound/>}></Route>
    </Routes>
  )
}

export default TutorRoute
