import Home from './Pages/Home';
import './App.css'
import { useEffect, useState } from 'react';
import { SearchBar } from './components/SearchBar/SearchBar'
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import EditProfile from './Pages/EditProfile';
import { ReaderPage } from "./Pages/Reader";

function App() {
   const [hash, setHash] = useState(() => window.location.hash || '#home');
   const [profile, setProfile] = useState({
      name: 'Guest',
      email: '',
      phone: '',
      department: '',
   });

   useEffect(() => {
      const updateHash = () => setHash(window.location.hash || '#home');
      window.addEventListener('hashchange', updateHash);
      return () => window.removeEventListener('hashchange', updateHash);
   }, []);

   useEffect(() => {
      if (['#library', '#community', '#research'].includes(hash)) {
         requestAnimationFrame(() => {
            document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
         });
      }
   }, [hash]);

   // Route handling for authentication & profile pages
   if (hash === '#login') {
      return <Login />;
   }

   if (hash === '#signup') {
      return <Signup />;
   }

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

   // Route handling for Reading Mode
   if (hash === '#reader' || hash.startsWith('#reader')) {
      return <ReaderPage />;
   }

   return (
      <div>
         <Home profileName={profile.name} />
         <section id="community" aria-label="Community">
            <SearchBar
               onSearch={(query, scope, filters) => console.log("SEARCH:", query, scope, filters)}
               onSelect={(s) => {
                  console.log("SELECTED BOOK/ITEM:", s);
                  // When a book is clicked/selected, open the reading mode
                  window.location.hash = '#reader';
               }}
            />
         </section>
      </div>
   );
   
}

export default App