import Navbar from "./components/Navbar.jsx";
import "./App.css";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Checkout from "./components/Checkout.jsx";
import Login from "./components/Login.jsx";
import signUp from "./components/Signup.jsx"

const stripePromise = loadStripe(
  "***REMOVED***_51RsQkwQzbCrsaJqpklbrEN3mFg28PeiakQ5byiLctR6TCusfX2o9wcRRSqpX2RPbAwn5sV2WhRMkINAmYZPZ5TWv00ErkukHDt"
);

function App() {
  return (
    <div>
      <Elements stripe={stripePromise}>
        <Navbar />
      </Elements>
    </div>
  );
}

export default App;
