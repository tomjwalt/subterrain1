import Navbar from "./components/Navbar.jsx";
import "./App.css";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Checkout from "./components/Checkout.jsx";
import Signup from "./components/Signup.jsx";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginModal from "./components/LoginModal.jsx";
import Homepage from "./components/Homepage.jsx"

const stripePromise = loadStripe(
  "***REMOVED***_51RsQkwQzbCrsaJqpklbrEN3mFg28PeiakQ5byiLctR6TCusfX2o9wcRRSqpX2RPbAwn5sV2WhRMkINAmYZPZ5TWv00ErkukHDt"
);

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  const handleSignupRedirect = () => {
    closeLogin();
    navigate("/signup"); // ✅ closes modal, then navigates to signup page
  };

  return (
    <>
      <Navbar onLoginClick={openLogin} />

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>

      {showLogin && (
        <LoginModal
          onClose={closeLogin}
          onSignupRedirect={handleSignupRedirect}
        />
      )}
    </>
  );
}

export default App;