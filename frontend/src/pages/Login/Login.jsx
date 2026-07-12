

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("accounts/login/", {
        username,
        password,
      });

      console.log("LOGIN SUCCESS:", res.data);

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      setMessage("Successfully logged in");

      setTimeout(() => {
        navigate("/app");
      }, 1000);

    } catch (err) {
      console.log("LOGIN FAILED:", err.response?.data);

      setMessage("Login failed");
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <input
        placeholder="username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="password"
        /*TO DO, REMOVE COMMENT FOR PRODUCTION*/
        /* type="password" */
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Login