import { Route, Routes } from 'react-router-dom';
import AdminLogin from '../pages/Admin/AdminLogin';
import AuthRoute from '../middleware/AuthRoute';
import AdminHome from '../pages/Admin/AdminHome';
import ListUsers from '../components/AdminContent/ListUsers';
import AdminDashBoard from '../components/AdminContent/AdminDashBoard';
import ListTutor from '../components/AdminContent/ListTutor';
import ListProblems from '../components/AdminContent/ListProblems';
import AddProblemForm from '../components/AdminContent/AddProblemForm';
import EditProblemForm from '../components/AdminContent/EditProblemForm';
import ListCourses from '../components/AdminContent/ListCourses';
import NotFound from '../pages/CommonPages/NotFound';


const AdminRoute = () => {
    return (
        <Routes>
            <Route path='/login' element={<AdminLogin />} />
            <Route path='/' element={<AuthRoute role='admin'><AdminHome /></AuthRoute>}>
                <Route index element={<AdminDashBoard />} />
                <Route path='listuser' element={<ListUsers />} />
                <Route path ='instructors' element ={<ListTutor/>}/>
                <Route path='/problems' element={<ListProblems/>}/>
                <Route path='/courses' element={<ListCourses/>}/>
                <Route path='/add-problems' element={<AddProblemForm/>}/>
                <Route path='/edit-problem/:id' element={<EditProblemForm/>}/>
            </Route>

            <Route path='*' element={<NotFound/>}/>
            
        </Routes>
    )
}

export default AdminRoute;