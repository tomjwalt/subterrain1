// src/App.jsx
import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import CheckoutModal from "./components/CheckoutModal.jsx";
import Navbar from "./components/Navbar.jsx";
import Homepage from "./components/Homepage.jsx";
import CheckoutWrapper from "./components/CheckoutWrapper.jsx";
import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";
import LoginModal from "./components/LoginModal.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import OrderConfirmation from "./components/OrderConfirmation.jsx";
import PersonalDetails from "./components/PersonalDetails.jsx"; // 👈 make sure this file exists

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const [cartItems] = useState([
    {
      id: "tee-1",
      name: "SubTerrain Performance Tee",
      size: "M",
      colour: "Black / Reflective",
      price: 24.99,
      quantity: 1,
    },
  ]);

  const navigate = useNavigate();

  // ---------- LOGIN HANDLERS ----------
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleLoginHoverStart = () => {
    setIsClosing(false);
    setShowLoginModal(true);
    setIsHovered(true);
  };

  const handleLoginHoverEnd = () => {
    setIsHovered(false);
    setTimeout(() => {
      if (!isHovered) startCloseModal();
    }, 300);
  };

  const startCloseModal = () => {
    if (showLoginModal) setIsClosing(true);
  };

  const handleLoginClick = () => {
    setShowLoginModal(false);
    setIsClosing(false);
    navigate("/login");
  };

  const handleSignupRedirect = () => {
    setShowLoginModal(false);
    setIsClosing(false);
    navigate("/signup");
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setIsClosing(false);
  };

  // ---------- CART / CHECKOUT HANDLERS ----------
  const handleCartHoverStart = () => {
    if (window.cartCloseTimeout) {
      clearTimeout(window.cartCloseTimeout);
    }
    setShowCheckoutModal(true);
  };

  const handleCartHoverEnd = () => {
    window.cartCloseTimeout = setTimeout(() => {
      setShowCheckoutModal(false);
    }, 250);
  };

  const handleCartClick = () => {
    setShowCheckoutModal(false);
    navigate("/checkout");
  };

  return (
    <>
      <Navbar
        onLoginHoverStart={handleLoginHoverStart}
        onLoginHoverEnd={handleLoginHoverEnd}
        onLoginClick={handleLoginClick}
        onCartHoverStart={handleCartHoverStart}
        onCartHoverEnd={handleCartHoverEnd}
        onCheckoutClick={handleCartClick}
      />

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/checkout" element={<CheckoutWrapper />} />
        <Route
          path="/login"
          element={<Login onSignupRedirect={handleSignupRedirect} />}
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/personal-details" element={<PersonalDetails />} />
        {/* you can add /orders, /likes, /addresses later if you want */}
      </Routes>

      {(showLoginModal || isClosing) && (
        <div
          onMouseEnter={handleLoginHoverStart}
          onMouseLeave={handleLoginHoverEnd}
          className={`fixed top-14 right-6 z-50 ${
            isClosing ? "fade-out-down" : "fade-in-up"
          }`}
          onAnimationEnd={() => {
            if (isClosing) {
              setIsClosing(false);
              setShowLoginModal(false);
            }
          }}
        >
          <LoginModal
            isLoggedIn={isLoggedIn}
            onClose={startCloseModal}
            onSignupRedirect={handleSignupRedirect}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onGoToOrders={() => navigate("/orders")}
            onGoToLikes={() => navigate("/likes")}
            onGoToPersonalDetails={() => navigate("/personal-details")}
          />
        </div>
      )}

      {showCheckoutModal && (
        <div
          className="fixed top-20 right-6 z-50"
          onMouseEnter={handleCartHoverStart}
          onMouseLeave={handleCartHoverEnd}
        >
          <CheckoutModal
            cartItems={cartItems}
            shippingCost={0}
            onClose={() => setShowCheckoutModal(false)}
            onGoToCheckout={() => {
              setShowCheckoutModal(false);
              navigate("/checkout");
            }}
          />
        </div>
      )}
    </>
  );
}

export default App;
