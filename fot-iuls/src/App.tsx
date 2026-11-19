import { useEffect, useState } from 'react';
import Home from './Pages/Home';
import Reading from './Pages/Reading';
import { ReaderPage } from './Pages/Reader';
import Community from './Pages/Community';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import EditProfile from './Pages/EditProfile';
import { INITIAL_BOOKS } from './data/booksData';
import './App.css';
import Admin from './Pages/Admin';
import { AIAssistant } from './components/Assistant/AIAssistant';

function App() {
   const [hash, setHash] = useState(() => window.location.hash || '#home');
   const [selectedBookId, setSelectedBookId] = useState<string>(() => {
      // Check if hash has a book ID
      const match = window.location.hash.match(/[?&]id=([^&]+)/) || window.location.hash.match(/#reading\/([^/?]+)/);
      return match ? match[1] : INITIAL_BOOKS[0].id;
   });

   const [profile, setProfile] = useState({
      name: 'Scholar User',
      email: 'scholar@IULS.edu',
      phone: '+1 234 567 890',
      department: 'Computer Science & Engineering',
   });

   useEffect(() => {
      const updateHash = () => {
         const currentHash = window.location.hash || '#home';
         setHash(currentHash);

         // If hash specifies a book, update selected book ID
         const match = currentHash.match(/[?&]id=([^&]+)/) || currentHash.match(/#reading\/([^/?]+)/);
         if (match) {
            setSelectedBookId(match[1]);
         }
      };

      window.addEventListener('hashchange', updateHash);
      return () => window.removeEventListener('hashchange', updateHash);
   }, []);

   // Handle smooth scrolling when navigating to sections on Home
   useEffect(() => {
      if (['#home', '#library', '#research'].includes(hash)) {
         requestAnimationFrame(() => {
            const targetId = hash.slice(1);
            const el = document.getElementById(targetId);
            if (el) {
               el.scrollIntoView({ behavior: 'smooth' });
            }
         });
      }
   }, [hash]);

   const handleSelectBook = (bookId: string) => {
      setSelectedBookId(bookId);
      window.location.hash = `#reading?id=${bookId}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const renderCurrentPage = () => {
      // Route: Login
      if (hash === '#login') {
         return <Login />;
      }

      // Route: Signup
      if (hash === '#signup') {
         return <Signup />;
      }

      // Route: Edit Profile
      if (hash === '#edit-profile') {
         return (
            <EditProfile
               {...profile}
               onSave={(nextProfile) => {
                  setProfile(nextProfile);
                  window.location.hash = '#home';
               }}
               onCancel={() => {
                  window.location.hash = '#home';
               }}
            />
         );
      }

      // Route: Ayas's Reader Mode (for document upload & PDF chapter AI analyzer)
      if (hash === '#reader' || hash.startsWith('#reader')) {
         return <ReaderPage />;
      }

      // Route: Reading Page (with AI Summary & Chapter Viewer)
      if (hash.startsWith('#reading') || hash.startsWith('#read')) {
         return (
            <Reading
               bookId={selectedBookId}
               onBack={() => {
                  window.location.hash = '#library';
               }}
            />
         );
      }

      // Route: Standalone Academic Community Page
      if (hash === '#community') {
         return (
            <Community
               profileName={profile.name}
            />
         );
      }

      // Route: Admin Dashboard
      if (hash === '#admin') {
         return <Admin />;
      }

      // Default Route: Home Page
      return (
         <Home
            profileName={profile.name}
            onSelectBook={handleSelectBook}
         />
      );
   };

   return (
      <>
         {renderCurrentPage()}
         <AIAssistant />
      </>
   );
}

export default App;
