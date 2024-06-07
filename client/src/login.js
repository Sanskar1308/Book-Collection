import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }), // Need to stringify the body
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedToken = data.token;

        // Store the token and userId in localStorage
        localStorage.setItem("token", fetchedToken);

        // Navigate to the dashboard after successful login
        navigate("/");
      } else {
        // SignIn failed, display error message
        console.error("SignIn failed:", await response.text());
      }
    } catch (error) {
      console.error("Error during SignIn:", error.message);
    }
  }

  return (
    <div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;