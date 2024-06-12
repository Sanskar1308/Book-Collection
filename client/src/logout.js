import React from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  async function handleLogout() {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send token in the authorization header
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        // Remove the token from local storage
        localStorage.removeItem("token");

        // Navigate to the login page after successful logout
        navigate("/login");
      } else {
        // Logout failed, display error message
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  }

  return (
    <div className="absolute top-0 right-0 m-4">
      <button className="relative" onClick={handleLogout}>
        <span className="absolute top-0 left-0 mt-1 ml-1 h-full w-full rounded bg-gray-700"></span>
        <span className="fold-bold relative inline-block h-full w-full rounded border-2 border-black bg-white px-3 py-1 text-xs font-bold text-black transition duration-100 hover:bg-black hover:text-white">
          logout
        </span>
      </button>
    </div>
  );
}

export default Logout;
