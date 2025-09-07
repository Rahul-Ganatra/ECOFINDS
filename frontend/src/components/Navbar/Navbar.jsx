import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import EcoFindsLogo from "/EcoFinds-logo.jpeg";
import { useUser } from "../../UserContext";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const navigate = useNavigate();

  const navItems = [
    { to: "/", label: "Marketplace" },
    { to: "/my-listings", label: "My Listings" },
    { to: "/cart", label: "Cart" },
    { to: "/purchase-history", label: "Purchase History" },
  ];

  const isActive = (path) =>
    location.pathname === path ? styles.activeLink : "";

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">
          <img
            src={EcoFindsLogo}
            alt="EcoFinds Logo"
            style={{ height: 36, marginRight: 8 }}
          />
        </Link>
        <Link to="/" className={styles.logoText}>
          EcoFinds
        </Link>
      </div>

      {/* Desktop Navigation */}
      <ul className={styles.desktopNavLinks}>
        {navItems.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className={isActive(item.to)}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop Profile Section */}
      <div className={styles.desktopProfile}>
        {user ? (
          <Link to="/profile" className={styles.userInfoLink}>
            <div className={styles.userInfo}>
              <img
                src={
                  user.image && user.image !== "default-profile.png"
                    ? user.image
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name || "User"
                    )}&background=007bff&color=fff&size=40`
                }
                alt={user.name || "User"}
                className={styles.userAvatar}
              />
              <span className={styles.userName}>{user.name || "User"}</span>
            </div>
          </Link>
        ) : (
          <div className={styles.authButtons}>
            <Link to="/login" className={styles.btnWrapper}>
              <button
                className={`${styles.loginBtn} ${location.pathname === "/login" ? styles.btnActive : ""
                  }`}
              >
                Login
              </button>
            </Link>
            <Link to="/signup" className={styles.btnWrapper}>
              <button
                className={`${styles.signupBtn} ${location.pathname === "/signup" ? styles.btnActive : ""
                  }`}
              >
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Hamburger Menu */}
      <button
        className={styles.hamburger}
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label="Open menu"
      >
        <span className={styles.hamburgerBar}></span>
        <span className={styles.hamburgerBar}></span>
        <span className={styles.hamburgerBar}></span>
      </button>

      {/* Mobile Sidebar */}
      <div
        className={`${styles.mobileSidebar} ${sidebarOpen ? styles.mobileSidebarOpen : ""
          }`}
      >
        <button
          className={styles.closeButton}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          ×
        </button>
        <ul className={styles.mobileNavLinks}>
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={isActive(item.to)}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Profile Section */}
        {user ? (
          <div className={styles.mobileProfile}>
            <Link
              to="/profile"
              className={styles.userInfoLink}
              onClick={() => setSidebarOpen(false)}
            >
              <div className={styles.userInfo}>
                <img
                  src={
                    user.image && user.image !== "default-profile.png"
                      ? user.image
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name || "User"
                      )}&background=007bff&color=fff&size=40`
                  }
                  alt={user.name || "User"}
                  className={styles.userAvatar}
                />
                <span className={styles.userName}>{user.name || "User"}</span>
              </div>
            </Link>
          </div>
        ) : (
          <div className={styles.mobileAuthButtons}>
            <Link
              to="/login"
              className={styles.btnWrapper}
              onClick={() => setSidebarOpen(false)}
            >
              <button
                className={`${styles.loginBtn} ${location.pathname === "/login" ? styles.btnActive : ""
                  }`}
              >
                Login
              </button>
            </Link>
            <Link
              to="/signup"
              className={styles.btnWrapper}
              onClick={() => setSidebarOpen(false)}
            >
              <button
                className={`${styles.signupBtn} ${location.pathname === "/signup" ? styles.btnActive : ""
                  }`}
              >
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
