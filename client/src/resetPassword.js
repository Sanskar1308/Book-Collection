import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const email = localStorage.getItem("email");
  const otp = localStorage.getItem("otp");
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (newPassword === confirmPassword) {
      try {
        await axios.post("http://localhost:3001/resetPassword", {
          email,
          otp,
          newPassword,
        });
        alert("Password has been reset successfully.");
        localStorage.removeItem("email");
        localStorage.removeItem("otp");
        navigate("/login");
      } catch (error) {
        console.error("Error resetting password:", error);
        alert("Not verified user");
      }
    } else {
      alert("Password didn't match");
    }
  };

  return (
    <div className="flex flex-1 flex-col  justify-center space-y-5 max-w-md mx-auto mt-24">
      <div className="flex flex-col space-y-2 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Reset Password</h2>
      </div>
      <div className="flex flex-col max-w-md space-y-5">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="flex px-3 py-2 md:px-4 md:py-3 border-2 border-black rounded-lg font-medium placeholder:font-normal"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          className="flex px-3 py-2 md:px-4 md:py-3 border-2 border-black rounded-lg font-medium placeholder:font-normal"
        />
        <button
          className="flex items-center justify-center flex-none px-3 py-2 md:px-4 md:py-3 border-2 rounded-lg font-medium border-black bg-black text-white"
          onClick={handleResetPassword}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
