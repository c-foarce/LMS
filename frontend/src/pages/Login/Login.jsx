

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
            type:"",
            message:""
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

      {loginState.message && (
        <p classname={`message ${loginState.type}`}>
          {loginState.message}
        </p>
      )}
    </div>
  );
}

export default Login