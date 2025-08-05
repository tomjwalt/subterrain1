import React, { useState } from "react";
import logo from "../assets/S-logo-removebg.png";
import TitlePiece from "../assets/white-title-removebg.png";
import CheckoutModal from "./CheckoutModal.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <header className="relative flex items-center justify-center h-36">
      {/* Logo on the left */}
      <div className="absolute left-4 cursor-pointer">
        <img className="w-42 h-auto" src={logo} alt="logo" />
      </div>

      {/* Center title */}
      <div>
        <img className="h-36 w-auto cursor-pointer" src={TitlePiece} alt="title" />
      </div>

      {/* Checkout Button */}

      <div className="absolute right-9">
        <button
          className="text-white text-2xl cursor-pointer hover:scale-110 transition-transform"
          onClick={() => setShowCheckout(true)}
        >
          <FontAwesomeIcon icon={faCartShopping} />
        </button>
      </div>

      {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} />}
    </header>
  );
};

export default Navbar;
