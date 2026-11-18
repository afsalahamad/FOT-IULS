
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} IULMS. All rights reserved.
      </p>
      <p>
        Developed by <strong>Group 23</strong>
      </p>
    </footer>
  );
};

export default Footer;
