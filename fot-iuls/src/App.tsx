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
import BulkBookUpload from './Pages/bulk_books';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { INITIAL_BOOKS } from './data/booksData';
import { AIAssistant } from './components/Assistant/AIAssistant';
import { useAuth } from './context/useAuth';
import type { Scope } from './components/SearchBar/types';
import './App.css';

const VALID_SCOPES: Scope[] = ['all', 'title', 'author', 'isbn', 'subject'];

function parseScope(raw: string | null): Scope {
   return raw && VALID_SCOPES.includes(raw as Scope) ? (raw as Scope) : 'all';
}

function App() {
   const { displayName, profile, isAuthenticated, updateProfile } = useAuth();

   const [hash, setHash] = useState(() => {
      if (window.location.pathname === '/bulk-books' && !window.location.hash) {
         return '#bulk-books';
      }
      return window.location.hash || '#home';
   });
   const [selectedBookId, setSelectedBookId] = useState<string>(() => {
      const match =
         window.location.hash.match(/[?&]id=([^&]+)/) ||
         window.location.hash.match(/#reading\/([^/?]+)/);
      return match ? decodeURIComponent(match[1]) : INITIAL_BOOKS[0].id;
   });

   useEffect(() => {
      const updateHash = () => {
         const currentHash = window.location.hash || '#home';
         setHash(currentHash);

         const match =
            currentHash.match(/[?&]id=([^&]+)/) ||
            currentHash.match(/#reading\/([^/?]+)/);
         if (match) {
            setSelectedBookId(decodeURIComponent(match[1]));
         }
      };

      window.addEventListener('hashchange', updateHash);
      return () => window.removeEventListener('hashchange', updateHash);
   }, []);

   useEffect(() => {
      const scrollTimer = setTimeout(() => {
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);

      return () => clearTimeout(scrollTimer);
   }, [hash]);

   const handleSelectBook = (bookId: string) => {
      setSelectedBookId(bookId);
      window.location.hash = `#reading?id=${encodeURIComponent(bookId)}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const renderCurrentPage = () => {
      if (hash === '#admin') {
         return <Admin />;
      }

      if (hash === '#bulk-books') {
         return (
            <div className="home-container">
               <Navigation profileName={displayName} />
               <main style={{ padding: '16px', flex: 1 }}>
                  <BulkBookUpload />
               </main>
               <Footer />
            </div>
         );
      }

      if (hash === '#login') {
         return <Login />;
      }

      if (hash === '#signup') {
         return <Signup />;
      }

      if (hash === '#student-dashboard') {
         return <StudentDashboard profileName={displayName} />;
      }

      if (hash === '#library' || hash.startsWith('#library?')) {
         const queryStart = hash.indexOf('?');
         const params = new URLSearchParams(queryStart >= 0 ? hash.slice(queryStart + 1) : '');
         const yearRaw = params.get('year_from');
         const parsedYear = yearRaw ? Number.parseInt(yearRaw, 10) : undefined;
         return (
            <Library
               profileName={displayName}
               onSelectBook={handleSelectBook}
               searchFilterQuery={params.get('q') ?? ''}
               searchScope={parseScope(params.get('scope'))}
               searchLanguage={params.get('language') ?? ''}
               searchYearFrom={Number.isFinite(parsedYear) ? parsedYear : undefined}
            />
         );
      }

      if (hash === '#research' || hash.startsWith('#research?')) {
         return <Research profileName={displayName} />;
      }

      if (hash === '#edit-profile') {
         if (!isAuthenticated) {
            return <Login />;
         }
         return (
            <EditProfile
               name={profile?.full_name || displayName}
               email={profile?.email || ''}
               phone={profile?.phone || ''}
               department={profile?.department || 'Faculty of Technology'}
               role={profile?.role || 'student'}
               onSave={async (nextProfile) => {
                  const res = await updateProfile(nextProfile);
                  if (!res.error) {
                     window.location.hash = '#home';
                  }
                  return res.error;
               }}
               onCancel={() => {
                  window.location.hash = '#home';
               }}
            />
         );
      }

      if (hash === '#reader' || hash.startsWith('#reader')) {
         return <ReaderPage />;
      }

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

      if (hash === '#community') {
         return <Community profileName={displayName} />;
      }

      return (
         <Home
            profileName={displayName}
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
