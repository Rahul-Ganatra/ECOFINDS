import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
      </div>
      <div className={styles.footerBottom} style={{ flexDirection: 'column' }}>
        <p>&copy; 2025 EcoFinds</p>
      </div>
    </footer>
  );
};

export default Footer;