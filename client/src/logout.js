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
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Logout;

// import React from "react";
// import { useNavigate } from "react-router-dom";

// function Logout() {
//   const navigate = useNavigate();

//   async function handleLogout() {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       console.error("No token found");
//       return;
//     }

//   async function handleLogout() {
//     try {
//       const response = await fetch("http://localhost:3001/logout", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`, // Send token in the authorization header
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log(data);
//         const fetchedToken = data.token;

//         // Add the token to the blacklist
//         fetchedToken && localStorage.removeItem("token");

//         // Respond with a success message
//         response.status(200).json({ message: "Logged out successfully" });

//         // Navigate to the dashboard after successful login
//         navigate("/login");
//       } else {
//         // SignIn failed, display error message
//         console.error("Signout failed:", await response.text());
//       }
//     } catch (error) {
//       console.error("Error during Signout:", error.message);
//     }
//   }

//   return (
//     <div>
//       <button onClick={handleLogout}>Logout</button>
//     </div>
//   );
// }

// export default Logout;

// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// function Logout() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     localStorage.removeItem("userId"); // Clear any other user-related data
//     navigate("/login");
//   }, [navigate]);
//   console.log(localStorage.getItem("token"));
//   console.log(localStorage.getItem("userId"));

//   return null;
// }

// export default Logout;
