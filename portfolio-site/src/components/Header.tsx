import React from 'react';
import './Header.css';

export const Header: React.FC = () => (
  <header className="header container">
    <div className="logo">LocalWeb Pro</div>
    <nav className="nav">
      <a href="#hero">Home</a>
      <a href="#projects">Projects</a>
      <a href="#features">Features</a>
      <a href="#testimonials">Testimonials</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
);
