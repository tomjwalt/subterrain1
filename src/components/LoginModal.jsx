import React, { useRef } from "react";
import LoginForm from "./LoginForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const LoginModal = ({ onClose, onSignupRedirect }) => {
  const modalRef = useRef(null);

  return (
    <div
      className="absolute top-20 right-6 z-50"
      onMouseEnter={() => clearTimeout(window.closeLoginTimeout)}
      onMouseLeave={() => {
        window.closeLoginTimeout = setTimeout(onClose, 0);
      }}
    >
      <div className="bg-gray-900 text-white rounded-xl p-6 w-80 shadow-lg border border-gray-800">
        <h2 className="text-xl font-semibold mb-4 text-center">Log In</h2>

        {/* Inline login form (not the full page) */}
        <form className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded-md bg-black border border-gray-700 focus:border-white outline-none text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded-md bg-black border border-gray-700 focus:border-white outline-none text-sm"
          />
          <button
            type="submit"
            className="mt-2 border border-gray-700 hover:border-white text-white py-2 rounded-md bg-black transition"
          >
            Log In
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            New customer?{" "}
            <button 
              onClick={onSignupRedirect}
              className="text-white underline hover:text-gray-300 cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
