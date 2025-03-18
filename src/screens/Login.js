import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();



    // Check for existing session when the component mounts
    useEffect(() => {
      const userSession = sessionStorage.getItem("userSession");
      const expirationTime = sessionStorage.getItem("expirationTime");
      const now = new Date().getTime();
  
      // If the session exists and is valid, navigate to the dashboard
      if (userSession && (!expirationTime || now < expirationTime)) {
        navigate("/dashboard", { replace: true });
      }
    }, [navigate]);
  
    const handleLogin = (e) => {
      e.preventDefault(); // Prevent default form submission
  
      if (email === "poolpeadmin123@gmail.com" && password === "admin@123") {
        const userSession = { email };
        
        sessionStorage.setItem("userSession", JSON.stringify(userSession));
        const expirationTime = new Date().getTime() + 5 * 60 * 1000; // 5 minutes from now
        sessionStorage.setItem("expirationTime", expirationTime);
        navigate("/dashboard", { replace: true }); // Navigate to the dashboard after login
      } else {
        setError("Wrong credentials");
      }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Poolpe for Business
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          {error && (
            <div className="mb-4 text-red-500 text-center">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Login
          </button>
          <div class="flex items-center my-4">
              <div class="flex-1 border-t border-gray-300"></div>
              <span class="px-3 text-gray-500 text-sm font-medium">OR</span>
              <div class="flex-1 border-t border-gray-300"></div>
           </div>
          <div>
            {/* <button
            onClick={() => navigate("/Propcap-login")}
              type="button"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Procap Admin Login
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
