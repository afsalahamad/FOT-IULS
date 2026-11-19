import "./Footer.css";

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        © {CURRENT_YEAR} IULS. All rights reserved.
      </p>
      <p>
        Developed by <strong>Group 23</strong> 
      </p>
      <a href="#admin">Admin Dashboard</a>
    </footer>
  );
};

export default Footer;
