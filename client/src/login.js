import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission

    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Need to stringify the body
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
    <section className="bg-gray-100 min-h-screen flex box-border justify-center items-center">
      <div className="bg-[#dfa674] rounded-2xl flex max-w-3xl p-5 items-center">
        <div className="md:w-1/2 px-8">
          <h2 className="font-bold text-3xl text-[#002D74]">Login</h2>
          <p className="text-sm mt-4 text-[#002D74]">
            If you are already a member, easily log in now.
          </p>
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <input
              className="p-2 mt-8 rounded-xl border"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <input
                className="p-2 rounded-xl border w-full"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
              />
            </div>
            <button
              className="bg-[#002D74] text-white py-2 rounded-xl hover:scale-105 duration-300 hover:bg-[#206ab1] font-medium"
              type="submit"
            >
              Login
            </button>
          </form>
          <div>
            <Link to="/forgetPassword">
              <h3 className="mt-10 text-sm border-b border-gray-500 py-5 playfair tooltip">
                Forget Password?
              </h3>
            </Link>
          </div>
          <div className="mt-4 text-sm flex justify-between items-center container-mr">
            <h3 className="mr-3 md:mr-0 ">New User?</h3>
            <Link to="/signup">
              <button className="hover:border register text-white bg-[#002D74] hover:border-gray-400 rounded-xl py-2 px-5 hover:scale-110 hover:bg-[#002c7424] font-semibold duration-300">
                Signup
              </button>
            </Link>
          </div>
        </div>
        <div className="md:block hidden w-1/2">
          <img
            className="rounded-2xl max-h-[1600px]"
            src="https://images.unsplash.com/photo-1552010099-5dc86fcfaa38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxfHxmcmVzaHxlbnwwfDF8fHwxNzEyMTU4MDk0fDA&ixlib=rb-4.0.3&q=80&w=1080"
            alt="login form"
          />
        </div>
      </div>
    </section>
  );
}

export default Login;
