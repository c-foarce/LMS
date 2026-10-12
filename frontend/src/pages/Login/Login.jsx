

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";

import styles from "./Login.module.css"

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [loginState, setLoginState] = useState(
    {
      type: "",
      message: ""
    }
  )

  const { setUser } = useAuth()


  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    // Prevent duplicate submissions
    if (loading) return;

    setLoading(true);

    try {
      const res = await api.post("accounts/login/", {
        username,
        password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      const userRes = await api.get("accounts/user-role/");

      setUser(userRes.data);

      setLoginState({
        type: "success",
        message: "Successfully Logged in!"
      });

      setTimeout(() => {
        setLoginState({
          type: "",
          message: ""
        });
        navigate("/app/dashboard/");
      }, 1000);

    } catch (err) {
      setLoginState({
        type: "error",
        message: "Login Failed."
      });

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <button
          className={styles.back}
          type="button"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

        <h1>Login</h1>

        <form className={styles.form} onSubmit={handleLogin}>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            placeholder="username"
            onChange={(e) => setUsername(e.target.value)}
          />


          <label htmlFor="password">Password:</label>
          <div className={styles.passwordField}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>


          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {loginState.message && (
          <p className={`${styles.message} ${styles[loginState.type]}`}>
            {loginState.message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login