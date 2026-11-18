import Home from './Pages/Home';
import './App.css'
import {SearchBar} from './components/SearchBar/SearchBar'

function App() {
   return <div><Home/>
      <SearchBar
         onSearch={(query, scope, filters) => console.log("SEARCH:", query, scope, filters)}
         onSelect={(s) => console.log("SELECTED:", s)}
      />
   
   </div>
}

export default App
