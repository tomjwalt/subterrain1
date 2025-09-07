import React from "react";
import Login from "./Login";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const LoginModal = ({ onClose, onSignupRedirect }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-lg w-96 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-300 cursor-pointer"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2 className="text-white text-2xl font-bold text-center mb-6">
          Login
        </h2>

        {/* Pass signup redirect callback into Login */}
        <Login onSignupRedirect={onSignupRedirect} />
      </div>
    </div>
  );
};

export default LoginModal;
