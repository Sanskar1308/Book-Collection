import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const RequestPasswordReset = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleRequestReset = async () => {
    try {
      await axios.post("http://localhost:3001/forgetPassword", {
        email: email,
      });
      console.log(email);
      localStorage.setItem("email", email);
      navigate("/verifyOtp");
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  return (
    <div className="w-full  max-w-md mx-auto p-6">
      <div className="mt-7 bg-white  rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 border-2 border-indigo-300">
        <div className="p-4 sm:p-7">
          <div className="text-center">
            <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
              Forgot password?
            </h1>
            <h3 className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Remember your password?
              <Link to={"/login"}>
                <p
                  className="text-blue-600 decoration-2 hover:underline font-medium"
                  href="#"
                >
                  Login here
                </p>
              </Link>
            </h3>
          </div>
          <div className="mt-5">
            <div className="grid gap-y-4">
              <div>
                <label className="block text-sm font-bold ml-1 mb-2 dark:text-white">
                  Email address
                </label>
                <div className="relative">
                  <input
                    className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                    type="email"
                    required
                    aria-describedby="email-error"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <p
                  className="hidden text-xs text-red-600 mt-2"
                  id="email-error"
                >
                  Please include a valid email address so we can get back to you
                </p>
              </div>
              <button
                className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                onClick={handleRequestReset}
              >
                Send OTP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPasswordReset;
