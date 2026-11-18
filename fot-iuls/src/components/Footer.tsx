
import "./Footer.css";

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        © {CURRENT_YEAR} IULMS. All rights reserved.
      </p>
      <p>
        Developed by <strong>Group 23</strong>
      </p>
    </footer>
  );
};

export default Footer;
