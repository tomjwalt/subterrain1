import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import Navbar from "./components/Navbar.jsx";
import Homepage from "./components/Homepage.jsx";
import Checkout from "./components/Checkout.jsx";
import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";
import LoginModal from "./components/LoginModal.jsx";
import ResetPassword from "./components/ResetPassword.jsx"
import SubNavbar from "./components/SubNavbar.jsx"

import "./App.css";

const stripePromise = loadStripe(
  "***REMOVED***_51RsQkwQzbCrsaJqpklbrEN3mFg28PeiakQ5byiLctR6TCusfX2o9wcRRSqpX2RPbAwn5sV2WhRMkINAmYZPZ5TWv00ErkukHDt"
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  //handles Logout Function
  const handleLogout = () => {
    setIsLoggedIn(false);
  }

  // When hovering starts (on icon or modal)
  const handleLoginHoverStart = () => {
    setIsClosing(false);
    setShowLoginModal(true);
    setIsHovered(true);
  };

  // When hover ends (on icon or modal)
  const handleLoginHoverEnd = () => {
    setIsHovered(false);
    // small delay to allow quick re-hover without flicker
    setTimeout(() => {
      if (!isHovered) startCloseModal();
    }, 300);
  };

  // Begin closing animation
  const startCloseModal = () => {
    if (showLoginModal) setIsClosing(true);
  };

  // Navigate to login page on click
  const handleLoginClick = () => {
    setShowLoginModal(false);
    setIsClosing(false);
    navigate("/login");
  };

  // Navigate to signup page from modal
  const handleSignupRedirect = () => {
    setShowLoginModal(false);
    setIsClosing(false);
    navigate("/signup");
  };

  return (
    <>
      <Navbar
        onLoginHoverStart={handleLoginHoverStart}
        onLoginHoverEnd={handleLoginHoverEnd}
        onLoginClick={handleLoginClick}
        onCheckoutClick={() => navigate("/checkout")}
      />

      <SubNavbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <Elements stripe={stripePromise}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/login"
            element={<Login onSignupRedirect={handleSignupRedirect} />}
          />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Elements>

      {/* 🔹 Only show when open or closing */}
      {(showLoginModal || isClosing) && (
        <div
          onMouseEnter={handleLoginHoverStart}
          onMouseLeave={handleLoginHoverEnd}
          className={`fixed top-14 right-6 z-50 ${isClosing ? "fade-out-down" : "fade-in-up"
            }`}
          onAnimationEnd={() => {
            if (isClosing) {
              setIsClosing(false);
              setShowLoginModal(false);
            }
          }}
        >
          <LoginModal
            onClose={startCloseModal}
            onSignupRedirect={handleSignupRedirect}
          />
        </div>
      )}
    </>
  );
}

export default App;
