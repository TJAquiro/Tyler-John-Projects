import Header from "./Header"
import { Login } from "./Login";
import { Homepage } from './Homepage.jsx'
import { HashRouter, Routes, Route } from 'react-router-dom'

function App() {
  return(
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/Homepage" element={<Homepage/>}/>
      </Routes>
    </HashRouter>
  );
}

export default App
