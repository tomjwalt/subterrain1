// src/components/Navbar.jsx
import React from "react";
import logo from "../assets/S-logo-removebg.png";
import TitlePiece from "../assets/white-title-removebg.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Navbar = ({
  onLoginHoverStart,
  onLoginHoverEnd,
  onLoginClick,
  onCartHoverStart,
  onCartHoverEnd,
  onCheckoutClick,
}) => {
  return (
    <header className="relative flex items-center justify-center h-36">
      {/* Logo on the left */}
      <div className="absolute left-4 cursor-pointer">
        <Link to="/">
          <img className="w-42 h-auto" src={logo} alt="logo" />
        </Link>
      </div>

      {/* Center title */}
      <div>
        <Link to="/">
          <img
            className="h-36 w-auto cursor-pointer"
            src={TitlePiece}
            alt="title"
          />
        </Link>
      </div>

      {/* Cart / Checkout Button */}
      <div className="absolute right-16">
        <button
          className="text-white text-2xl cursor-pointer hover:scale-110 transition-transform"
          onMouseEnter={onCartHoverStart}   // 👉 open basket modal
          onMouseLeave={onCartHoverEnd}     // 👉 close basket modal
          onClick={onCheckoutClick}         // 👉 go to /checkout
        >
          <FontAwesomeIcon icon={faCartShopping} />
        </button>
      </div>

      {/* Login Button (hover to show modal, click to go to /login) */}
      <div
        className="absolute right-4 text-white text-2xl cursor-pointer hover:scale-110 transition-transform"
        onMouseEnter={onLoginHoverStart}
        onMouseLeave={onLoginHoverEnd}
        onClick={onLoginClick} // 👉 this was missing before
      >
        <FontAwesomeIcon icon={faUser} />
      </div>
    </header>
  );
};

export default Navbar;
