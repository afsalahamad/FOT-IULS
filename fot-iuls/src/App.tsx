
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './Pages/Home';


import Admin from './Pages/Admin';

import './App.css';

import { SearchBar } from './components/SearchBar/SearchBar';

function App() {

    return (

        <BrowserRouter>

            <Routes>

                
                {/* Home Page */}
                <Route
                    path="/home"
                    element={
                        <>
                            <Home />

                            <SearchBar
                                onSearch={(query, scope, filters) =>
                                    console.log("SEARCH:", query, scope, filters)
                                }
                                onSelect={(s) =>
                                    console.log("SELECTED:", s)
                                }
                            />
                        </>
                    }
                />


                {/* Admin Dashboard */}
                <Route
                    path="/admin"
                    element={<Admin />}
                />

                {/* Invalid URL */}
                <Route
                    path="*"
                    element={<Navigate to="/" />}
                />

            </Routes>

        </BrowserRouter>

    );
}

export default App;
