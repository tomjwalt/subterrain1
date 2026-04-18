import React, { useState } from "react";
import LoginForm from "./LoginForm";

const Login = ({ onSignupRedirect }) => {
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <div className="flex flex-col items-center justify-center flex-grow px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-800">
          <h1 className="text-3xl font-semibold text-center mb-6 tracking-wide ">
            Log In
          </h1>

          <LoginForm onSignupRedirect={onSignupRedirect} />
        </div>
      </div>
    </div>
  );
};

export default Login;
