import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/LandingPage'
import About from './pages/AboutPage'
import Contact from './pages/ContactPage'
import SignUp from './pages/SignUp';
import SignIn from './pages/Login';
import RenterDashboard from './pages/RenterDashboard';
import Dashboard from './pages/Dashboard';

function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/renter" element={<RenterDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />



      </Routes>
    </BrowserRouter>
  )
}

export default App
