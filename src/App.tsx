import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "leaflet/dist/leaflet.css";
import Home from './pages/LandingPage'
import About from './pages/AboutPage'
import Contact from './pages/ContactPage'
import SignUp from './pages/SignUp';
import SignIn from './pages/Login';
import RenterDashboard from './pages/RenterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/MerchantDashboard';
import Dashboard from './pages/Dashboard';
import Profile from './pages/BusinessProfilePage';
import Users from './pages/Users';
import Events from './pages/EventsAndBooths';
import UserEvents from './pages/UserEventsAndBooths';
import UserReservations from './pages/UserReservations';
import OwnerReservations from './pages/OwnerReservations';
import OwnerEvents from './pages/OwnerEventsAndBooths';
import Register from './pages/Register';
import RegisterOwner from './pages/RegisterOwner';
import RegisterAdmin from './pages/RegisterAdmin';
import Notifications from './pages/Notifications';
import ManageBusinessDocuments from './pages/ManageBusinessDocuments';
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";




function App() {
  
  return (
    <BrowserRouter>
       <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
        <Route path="/register/owner" element={<RegisterOwner />} />
        <Route path="/register/admin" element={<RegisterAdmin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/renter" element={<RenterDashboard />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/owner/BusinessProfile" element={<Profile />} />
        <Route path="/renter/BusinessProfile" element={<Profile />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/events" element={<Events />} />
        <Route path="owner/events" element={<OwnerEvents />} />
        <Route path="/admin/managebusinessdocuments" element={<ManageBusinessDocuments />} />
        <Route path="/renter/events" element={<UserEvents />} />
        <Route path="/renter/reservations" element={<UserReservations />} />
        <Route path="/owner/reservations" element={<OwnerReservations />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
