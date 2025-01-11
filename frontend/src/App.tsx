import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserRoute from './routes/UserRoute';
import TutorRoute from './routes/TutorRoute';
import AdminRoute from './routes/AdminRoute';
import 'flowbite'


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/*' element={<UserRoute />} />
          <Route path='/tutor/*' element={<TutorRoute />} />
          <Route path = '/admin/*' element={<AdminRoute/>} />
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />
    </>
  );
}

export default App;
