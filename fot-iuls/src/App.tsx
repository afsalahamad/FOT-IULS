
import "./App.css";

import Admin from "./Pages/Admin";
import BulkBookUpload from "./Pages/bulk_books";

function App() {
  const isBulkBooksPage =
    window.location.pathname === "/bulk-books";

  return (
    <div>
      {isBulkBooksPage ? (
        <BulkBookUpload />
      ) : (
        <Admin />
      )}
    </div>
  );
}

export default App;

