import React from "react";
import Login from "./Login";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faUser, faXmark  } from "@fortawesome/free-solid-svg-icons";

const LoginModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl p-8 shadow-lg w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-300 cursor-pointer"
        >
         <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2 className="text-white text-2xl font-bold text-center mb-6">Login/Signup</h2>
        <Login />
      </div>
    </div>
  );
};

export default LoginModal;