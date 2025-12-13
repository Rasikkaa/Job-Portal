import {BrowserRouter, Routes, Route} from 'react-router-dom';
import React from 'react';
import SignUp from './components/SignUPUI/SignUp';
import Home from './components/Home/Home';
import Footer from './components/Footer';
import './app.css'
function App() {

  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<SignUp/>}/>
    <Route path='/home' element={<Home/>}/>
   </Routes>
   <Footer />
   </BrowserRouter>

  );
}

export default App;