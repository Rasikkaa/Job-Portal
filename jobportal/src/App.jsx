import {BrowserRouter, Routes, Route} from 'react-router-dom';
import React from 'react';
import SignUp from './components/auth/SignUp';
import Home from './components/dashboard/Home';
import Footer from './components/shared/Footer';
import './app.css'
function App() {

  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<><SignUp/><Footer /></>}/>
    <Route path='/home' element={<Home/>}/>
   </Routes>
   </BrowserRouter>

  );
}

export default App;