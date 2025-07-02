import React from 'react';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
    const handleGoogleLogin = () => {
        window.location.href = 'https://todo-backend-e14k.onrender.com/auth/google';
    };


    return (
        <>
            {/* Import Poppins font */}
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Poppins', sans-serif;
          }
        `}
            </style>

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D7F8FE] to-[#F0FCFF] p-4 sm:p-6">
                <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl max-w-md w-full text-center space-y-8 border border-gray-200">
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="text-4xl font-bold text-[#2B455C] bg-[#A5EEFD] w-16 h-16 flex items-center justify-center rounded-full shadow-md">
                            T
                        </div>
                        <h1 className="text-3xl font-bold text-[#2B455C] mt-4">
                            Welcome Back!
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Sign in to manage your tasks and collaborate with your team.
                        </p>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-gray-300 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <FcGoogle className="w-5 h-5" />
                        Sign in with Google
                    </button>

                    <p className="text-xs text-gray-500 mt-6">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-blue-500 hover:underline">Terms of Service</a> and{' '}
                        <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </>
    );
};

export default Login;
