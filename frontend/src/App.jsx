import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import Profile from './pages/Profile';
import UploadProject from './pages/UploadProject';
import EditProject from './pages/EditProject';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Toast />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/upload" element={<UploadProject />} />
          <Route path="/edit/:id" element={<EditProject />} />
        </Routes>
      </main>
    </AuthProvider>
  );
}

export default App;