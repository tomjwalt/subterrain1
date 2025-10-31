import React, { useState } from "react";
import { supabase } from "../../supabaseClient.js";
import GoogleSignInButton from "../assets/web_dark_rd_ctn.svg";

const LoginForm = ({ onSignupRedirect }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            alert("Logged in successfully!");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };s

    const handleOAuthLogin = async (provider) => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/`,
                    queryParams: { prompt: "select_account" },
                },
            });
            if (error) throw error;
            if (data?.url) window.location.assign(data.url);
        } catch (err) {
            console.error(`Error with ${provider} login:`, err.message);
            alert("Login failed. Please try again.");
        }
    };

    // Forgot Password

    const handleForgotPassword = async () => {
        const email = prompt("Enter your email to reset your password")

        if (!email) return;

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "http://localhost:5173/reset-password",
        });

        if (error) {
            alert("Error: " + error.message);
        } else {
            alert("Password reset link sent, Please check your email.");
        }
    };

    return (
        <form onSubmit={handleLogin} className="flex flex-col gap-3 text-white p-6 rounded-2xl w-full max-w-md mx-auto">
            {error && (
                <div className="bg-red-500/20 text-red-400 p-2 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            <div>
                <input
                    type="email"
                    className="w-full p-2 rounded-lg mt-4 bg-gray-800 border border-gray-700 hover:border-white focus:outline-none focus:border-gray-500"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div>
                <input
                    type="password"
                    className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-white focus:outline-none focus:border-gray-500 mb-6"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <p
                onClick={() => handleForgotPassword()}
                className="text-sm text-gray-400 hover:text-white cursor-pointer text-right mt-1"
            >
                Forgot password?
            </p>

            <button
                type="submit"
                disabled={loading}
                className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-gray-500 mt-10 cursor-pointer hover:border-white transition"
            >
                {loading ? "Logging in..." : "Log In"}
            </button>

            <div className="flex flex-col gap-4 mt-6 py-2 items-center hover:border-white transition">
                {/* GOOGLE BUTTON */}
                <button
                    type="button"
                    onClick={() => handleOAuthLogin("google")}
                    className="flex items-center justify-center w-full h-10 cursor-pointer hover:opacity-80"
                >
                    <img src={GoogleSignInButton} alt="Sign in with Google" className="h-full" />
                </button>

                {/* FACEBOOK BUTTON */}
                <button
                    type="button"
                    onClick={() => handleOAuthLogin("facebook")}
                    className="flex items-center justify-center w-full h-10 cursor-pointer hover:opacity-80"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="40" viewBox="0 0 240 40" fill="none">
                        <rect width="240" height="40" rx="20" fill="#131314" stroke="#8E918F" strokeWidth="1" />
                        <g transform="translate(22, 8)">
                            <circle cx="12" cy="12" r="12" fill="#1877F2" />
                            <path d="M14.8 12.6h-2.4v8.2h-3.3v-8.2H7.8v-2.9h1.3V8.7c0-2.2 0.9-3.7 3.7-3.7h2.3v2.9h-1.4c-1 0-1.1 0.4-1.1 1.1v1.7h2.6l-0.4 2.9z" fill="white" />
                        </g>
                        <text x="55" y="25" fill="#E3E3E3" fontFamily="Roboto, sans-serif" fontWeight="500" fontSize="14">
                            Continue with Facebook
                        </text>
                    </svg>
                </button>
            </div>

            <p className="text-sm text-center text-gray-400 mt-2">
                Don’t have an account?{" "}
                <button type="button" onClick={onSignupRedirect} className="text-white underline hover:text-gray-300 cursor-pointer">
                    Sign up
                </button>
            </p>
        </form>
    );
};

export default LoginForm;