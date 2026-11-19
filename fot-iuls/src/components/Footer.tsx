import React from 'react';
import logoTransparent from '../assets/logo-transparent.png';
import { useAuth } from '../context/useAuth';
import './Footer.css';

const CURRENT_YEAR = new Date().getFullYear();

const Footer: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <footer className="compact-footer" aria-label="University Footer">
      <div className="compact-footer-container">
        {/* Main Grid: Branding, Services, Support */}
        <div className="compact-footer-main">
          {/* Brand & Identity */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <img src={logoTransparent} alt="IULS Logo" className="footer-logo" />
              <div className="footer-brand-titles">
                <h3 className="footer-title">Faculty of Technology</h3>
                <span className="footer-subtitle">Intelligent University Library System</span>
              </div>
            </div>
            <p className="footer-description">
              Empowering academic inquiry, research dissemination, and multidisciplinary student collaboration.
            </p>
            <div className="footer-badge-hours">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Mon – Fri: 08:00 – 20:00 | Sat: 09:00 – 17:00</span>
            </div>
          </div>

          {/* Quick Academic Navigation */}
          <div className="footer-nav-col">
            <h4 className="footer-col-heading">Quick Services</h4>
            <ul className="footer-nav-list">
              <li><a href="#library">Library Catalog</a></li>
              <li><a href="#reading">AI Reading Mode</a></li>
              <li><a href="#community">Academic Community</a></li>
              <li><a href="#research">Research Repository</a></li>
              <li><a href="#reader">Document Analyzer</a></li>
              {isAuthenticated && (
                <li>
                  <a href={isAdmin ? '#admin' : '#student-dashboard'}>
                    {isAdmin ? 'Admin Dashboard' : 'Student Dashboard'}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Scholar Support & Contact */}
          <div className="footer-contact-col">
            <h4 className="footer-col-heading">Scholar Support</h4>
            <div className="footer-contact-items">
              <div className="footer-contact-line">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>support.library@fot.iuls.edu</span>
              </div>
              <div className="footer-contact-line">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Technology Campus, Block B</span>
              </div>
              <div className="footer-status-pill">
                <span className="status-indicator-dot"></span>
                <span>24/7 Accessible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Footer Bar */}
        <div className="compact-footer-bottom">
          <p className="footer-copyright">
            © {CURRENT_YEAR} Faculty of Technology, Intelligent University Library System. All rights reserved.
          </p>
          <div className="footer-sub-links">
            {isAuthenticated ? (
              <>
                <a href={isAdmin ? '#admin' : '#student-dashboard'}>
                  {isAdmin ? 'Admin Portal' : 'My Dashboard'}
                </a>
                <span className="sub-divider">•</span>
                <a href="#edit-profile">Profile Settings</a>
              </>
            ) : (
              <>
                <a href="#login">Sign In</a>
                <span className="sub-divider">•</span>
                <a href="#signup">Create Account</a>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
