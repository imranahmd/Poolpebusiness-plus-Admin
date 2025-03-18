import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./screens/Login";
import Dashboard from "./screens/Dashboard";
import MerchantStatus from "./components/MerchantStatus";
import UserDetail from "./components/UserDetail";
import AdminSuccessApproved from "./components/AdminSuccessApproved";
import Propcap from "./components/Propcap";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/merchants" element={<MerchantStatus />} />
        <Route path="/user/:userId" element={<UserDetail />} />
        <Route path="/successapproved" element={<AdminSuccessApproved />} />
        <Route path="/Propcap-login" element={<Propcap />} />
        
        {/* c:\Users\acer\Downloads\SignUp1.svg */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
