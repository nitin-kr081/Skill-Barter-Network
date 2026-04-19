import { Routes, Route} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from "./pages/Profile";
import CreateListing from "./pages/CreateListing";
import Listings from "./pages/Listings";
import MyListings from "./pages/MyListings";
import './App.css'

function Home(){
  return <h1>Home Page</h1>
}

function App() {
  // return <h1>APP WORKING</h1>;
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route 
        path='/dashboard'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/create" 
        element={
          <ProtectedRoute>
            <CreateListing />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/listings"
        element={
          <ProtectedRoute>
            <Listings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-listings"
        element={
          <ProtectedRoute>
            <MyListings />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path='/signup' element={<Signup/>} />
      <Route path="/login" element={<Login/>} />
    </Routes>
  )
}

export default App
