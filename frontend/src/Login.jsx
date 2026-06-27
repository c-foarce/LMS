import { useState } from "react";
import api from "./api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("login/", {
        username,
        password,
      });

      console.log("LOGIN SUCCESS:", res.data);

      localStorage.setItem("token", res.data.access);

      setMessage("Successfully logged in");
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
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Login