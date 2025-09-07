import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";
import { FaUserCircle, FaSignOutAlt, FaEdit } from "react-icons/fa";
import Footer from "../../components/Footer/Footer";
import styles from "./Profile.module.css";

const Profile = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate("/");
    }
  };

  if (!user)
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <FaUserCircle className={styles.emptyStateIcon} />
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );

  return (
    <>
      <div className={styles.container}>
        {/* User Info Section */}
        <div className={styles.profileHeader}>
          {/* Edit Button on top right */}
          <button
            className={styles.editButton}
            onClick={() => navigate("/edit-profile")}
          >
            <FaEdit style={{ marginRight: "0.3rem" }} />
            Edit Profile
          </button>

          <img
            src={
              user.image && user.image !== "default-profile.png"
                ? user.image
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || "User"
                  )}&background=667eea&color=fff&size=120`
            }
            alt={user.name || "User"}
            className={styles.userAvatar}
          />
          <h1 className={styles.userName}>{user.name || "User"}</h1>
          <p className={styles.userEmail}>{user.emailId}</p>

          <div className={styles.userDetails}>
            {user.city && (
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>City</div>
                <div className={styles.detailValue}>{user.city}</div>
              </div>
            )}
            {user.state && (
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>State</div>
                <div className={styles.detailValue}>{user.state}</div>
              </div>
            )}
            {user.country && (
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Country</div>
                <div className={styles.detailValue}>{user.country}</div>
              </div>
            )}
            {user.phoneno && (
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Phone</div>
                <div className={styles.detailValue}>{user.phoneno}</div>
              </div>
            )}
          </div>

          <button onClick={handleLogout} className={styles.logoutButton}>
            <FaSignOutAlt style={{ marginRight: "0.5rem" }} />
            Logout
          </button>
        </div>

        {/* Profile Settings Section */}
        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Profile Settings</h2>
          <p className={styles.settingsDescription}>
            Manage your account settings and preferences. Your travel history
            and calendar can now be found in the Dashboard for a better overview
            of your trips.
          </p>
          <div className={styles.settingsGrid}>
            <button
              className={styles.settingButton}
              onClick={() => navigate("/my-listings")}
            >
              My Listings
            </button>
            <button
              className={styles.settingButton}
              onClick={() => navigate("/purchase-history")}
            >
              My Purchases
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
