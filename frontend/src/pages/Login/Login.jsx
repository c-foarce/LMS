

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";

//IMPORT CLSX LATER

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loginState, setLoginState] = useState(
    {
      type: "",
      message: ""
    }
  )

  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const { setUser } = useAuth()

  const handleLogin = async () => {
    event.preventDefault()
    try {
      const res = await api.post("accounts/login/", {
        username,
        password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      const userRes = await api.get("accounts/user-role/");

      setUser(userRes.data);

      setLoginState(
        {
          type: "success",
          message: "Successfully Logged in!"
        }
      )

      setTimeout(() => {
        setLoginState(
          {
            type: "",
            message: ""
          }
        )
        navigate("/app");
      }, 1000);

    } catch (err) {
      console.log("LOGIN FAILED:", err.response?.data);
      setLoginState(
        {
          type: "error",
          message: "Login Failed."
        }
      )

    }
  };

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <label htmlFor="username">Username:</label>
        <input
          id="username"
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          placeholder="password"
          /*TO DO, REMOVE COMMENT FOR PRODUCTION*/
          /* type="password" */
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
      {loginState.message && (
        <p className={`message ${loginState.type}`}>
          {loginState.message}
        </p>
      )}
    </div>
  );
}

export default Login