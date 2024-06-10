import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  async function handleSignup() {
    try {
      const response = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name, email: email, password: password }), // Need to stringify the body
      });

      if (response.ok) {
        // Navigate to the dashboard after successful login
        navigate("/login");
      } else {
        // SignIn failed, display error message
        console.error("Signup failed:", await response.text());
      }
    } catch (error) {
      console.error("Error during Signup:", error.message);
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
      <button className="btn btn-2" onClick={handleSignup}>
        Signup
      </button>
    </div>
  );
}

export default Signup;
