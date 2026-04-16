import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

import CheckoutModal from "./components/CheckoutModal.jsx";
import Navbar from "./components/Navbar.jsx";
import Homepage from "./components/Homepage.jsx";
import CheckoutWrapper from "./components/CheckoutWrapper.jsx";
import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";
import LoginModal from "./components/LoginModal.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import OrderConfirmation from "./components/OrderConfirmation.jsx";
import PersonalDetails from "./components/PersonalDetails.jsx";
import LikesPage from "./components/LikesPage.jsx";
import OrdersPage from "./components/OrdersPage.jsx";
import ProductPage from "./components/ProductPage.jsx";
import CategoryPage from "./components/CategoryPage.jsx";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);

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

  const handleLoginClick = async () => {
    setShowLoginModal(false);
    setIsClosing(false);

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error checking auth state:", error);
        navigate("/signup");
        return;
      }

      const loggedIn = !!data?.user;

      if (loggedIn) {
        navigate("/personal-details");
      } else {
        navigate("/signup");
      }
    } catch (err) {
      console.error("Unexpected error in handleLoginClick", err);
      setShowLoginModal(true);
    }
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

  const handleAddToCart = (product, options = {}) => {
    const selectedSize = options.size || "M";
    const selectedQuantity = options.quantity || 1;
    const selectedColour = options.colour || "Black / Reflective";

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.size === selectedSize
      );

      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.size === selectedSize
            ? { ...item, quantity: item.quantity + selectedQuantity }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          size: selectedSize,
          quantity: selectedQuantity,
          colour: selectedColour,
        },
      ];
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleLikeFromCard = async (product) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error checking user for like:", userError);
        return;
      }

      if (!user) {
        navigate("/signup");
        return;
      }

      const { data: existingLike, error: existingError } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (existingError) {
        console.error("Error checking existing like:", existingError);
        return;
      }

      if (existingLike?.id) {
        const { error: deleteError } = await supabase
          .from("likes")
          .delete()
          .eq("id", existingLike.id);

        if (deleteError) {
          console.error("Error removing like from card:", deleteError);
        }

        return;
      }

      const { error: insertError } = await supabase.from("likes").insert({
        user_id: user.id,
        product_id: product.id,
      });

      if (insertError) {
        console.error("Error inserting like from card:", insertError);
      }
    } catch (err) {
      console.error("Unexpected error in handleLikeFromCard:", err);
    }
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

      <main className="bg-white min-h-screen pt-4 pb-16">
        <Routes>
          <Route
            path="/"
            element={
              <Homepage
                onAddToCart={handleAddToCart}
                onLike={handleLikeFromCard}
              />
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/checkout"
            element={
              <CheckoutWrapper
                cartItems={cartItems}
                onRemoveFromCart={handleRemoveFromCart}
              />
            }
          />
          <Route
            path="/login"
            element={<Login onSignupRedirect={handleSignupRedirect} />}
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/personal-details" element={<PersonalDetails />} />
          <Route path="/likes" element={<LikesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route
            path="/product/:productId"
            element={<ProductPage onAddToCart={handleAddToCart} />}
          />
          {/* Category pages — /category/men, /category/women, etc. */}
          <Route
            path="/category/:gender"
            element={
              <CategoryPage
                onAddToCart={handleAddToCart}
                onLike={handleLikeFromCard}
              />
            }
          />
        </Routes>
      </main>

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
            onRemoveFromCart={handleRemoveFromCart}
          />
        </div>
      )}
    </>
  );
}

export default App;
