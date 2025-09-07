import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import Footer from "../../components/Footer/Footer";
import { useUser } from "../../UserContext";
import { backend_url } from "../../utils/helper";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${backend_url}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailId: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token and user data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.bg}>
        <div className={styles.centerBox}>
          <h2 className={styles.title}>EcoFinds</h2>
          <p className={styles.subtitle}>Welcome Back to EcoFinds</p>
          <p className={styles.desc}>Buy, Sell & Rent</p>
          {error && (
            <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
          )}
          <form className={styles.form} onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className={styles.forgotRow}>
              <Link to="#" className={styles.forgot}>
                Forgot Password?
              </Link>
            </div>
            <button
              className={styles.loginBtn}
              type="submit"
              disabled={loading}
            >
              <span className={styles.loginIcon}>⇨</span>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className={styles.bottomText}>
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
