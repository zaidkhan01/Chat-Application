import React from 'react'
import { useEffect } from 'react';
import { Routes, Route, Navigate  } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/UseAuthStore";
import PageLoader from "./components/PageLoader"; 
import {Toaster} from "react-hot-toast";
function App() {
  const { checkAuth,isCheckingAuth,authUser } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
console.log(checkAuth);
 if(isCheckingAuth)
  return <PageLoader/>
    

  return (
    <div className='bg-gray-100 min-h-screen relative flex items-center justify-center p-4 overflow-hidden'>
  
        {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-red-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-blue-500 opacity-20 blur-[100px]" />


   <Routes>
      <Route path="/" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
      <Route path="/login" element={ !authUser ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/signup" element={ !authUser ? <SignUpPage /> : <Navigate to="/" />} />

   </Routes>
   </div>
  )
}

export default App
