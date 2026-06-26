import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Book from "./pages/Book";
import MyAppointments from "./pages/MyAppointments";
import DoctorsPage from "./pages/Doctors";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/book" element={<Book />} />
        <Route path="/appointments" element={<MyAppointments />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
