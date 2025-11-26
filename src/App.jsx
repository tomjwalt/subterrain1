import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import CheckoutModal from "./components/CheckoutModal.jsx"
import Navbar from "./components/Navbar.jsx";
import Homepage from "./components/Homepage.jsx";
import CheckoutWrapper from "./components/CheckoutWrapper.jsx";
import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";
import LoginModal from "./components/LoginModal.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import OrderConfirmation from "./components/OrderConfirmation.jsx";

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

  // Called when login succeeds from the modal
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setIsClosing(false);
  };

  return (
    <>
      <Navbar
        onLoginHoverStart={handleLoginHoverStart}
        onLoginHoverEnd={handleLoginHoverEnd}
        onLoginClick={handleLoginClick}
        onCheckoutClick={() => setShowCheckoutModal(true)}
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
            onGoToAddresses={() => navigate("/addresses")}
          />
        </div>
      )}

      {showCheckoutModal && (
        <CheckoutModal
          cartItems={cartItems}
          shippingCost={0} // swap for your real shipping logic
          onClose={() => setShowCheckoutModal(false)}
          onGoToCheckout={() => {
            setShowCheckoutModal(false);
            navigate("/checkout");
          }}
        />
      )}
    </>
  );
}

export default App;
