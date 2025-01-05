import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/home';
import Login from './pages/login';
import Emailverify from './pages/emailverify';
import Resetpassword from './pages/resetpassword';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const App = () => {
  return (
    <div>
    <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/emailverify' element={<Emailverify />} />
        <Route path='/resetpassword' element={<Resetpassword />} />


      </Routes>
    </div>
  )
}

export default App