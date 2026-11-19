import { useEffect, useState } from 'react';
import Home from './Pages/Home';
import Library from './Pages/Library';
import Research from './Pages/Research';
import Reading from './Pages/Reading';
import { ReaderPage } from './Pages/Reader';
import Community from './Pages/Community';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import EditProfile from './Pages/EditProfile';
import Admin from './Pages/Admin';
import StudentDashboard from './Pages/StudentDashboard';
import { INITIAL_BOOKS } from './data/booksData';
import { AIAssistant } from './components/Assistant/AIAssistant';
import './App.css';

function App() {
   const [hash, setHash] = useState(() => window.location.hash || '#home');
   const [selectedBookId, setSelectedBookId] = useState<string>(() => {
      // Check if hash has a book ID
      const match = window.location.hash.match(/[?&]id=([^&]+)/) || window.location.hash.match(/#reading\/([^/?]+)/);
      return match ? match[1] : INITIAL_BOOKS[0].id;
   });

   const [profile, setProfile] = useState({
      name: 'Scholar User',
      email: 'scholar@iulms.edu',
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

   // Start each routed page at the top after hash navigation.
   useEffect(() => {
      const scrollTimer = setTimeout(() => {
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);

      return () => clearTimeout(scrollTimer);
   }, [hash]);

   const handleSelectBook = (bookId: string) => {
      setSelectedBookId(bookId);
      window.location.hash = `#reading?id=${bookId}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const renderCurrentPage = () => {
      // Route: Admin Dashboard
      if (hash === '#admin') {
         return <Admin />;
      }

      // Route: Login
      if (hash === '#login') {
         return <Login />;
      }

      // Route: Signup
      if (hash === '#signup') {
         return <Signup />;
      }

      if (hash === '#student-dashboard') {
         return <StudentDashboard profileName={profile.name} />;
      }

      if (hash === '#library' || hash.startsWith('#library?')) {
         const queryStart = hash.indexOf('?');
         const params = new URLSearchParams(queryStart >= 0 ? hash.slice(queryStart + 1) : '');
         return (
            <Library
               profileName={profile.name}
               onSelectBook={handleSelectBook}
               searchFilterQuery={params.get('q') ?? ''}
            />
         );
      }

      if (hash === '#research' || hash.startsWith('#research?')) {
         return <Research profileName={profile.name} />;
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
