import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext';
import Home from './pages/Home';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Search from './pages/Search';
import AddPost from './pages/AddPost';
import Notifications from './pages/Notifications';
import Trending from './pages/Trending';
import Following from './pages/Following';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

export default function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/profile/:username/following" element={<Following />} />
            <Route path="/following" element={<Following />} />
            <Route path="/search" element={<Search />} />
            <Route path="/add-post" element={<AddPost />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/trending" element={<Trending />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppDataProvider>
  );
}
