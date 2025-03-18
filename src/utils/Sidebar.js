// import React from "react";
// import { Link } from "react-router-dom";

// const Sidebar = () => {
//   return (
//     <div className="w-30 h-screen  text-black">
//       {/* <div className="p-6">
//         <h2 className="text-2xl font-bold">Menu</h2>
//       </div> */}
//       <nav className="mt-10">
        
//       <Link to="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
//           Dashboard
//         </Link>
        
      
//         <Link to="/merchants" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
//           Merchant Details
//         </Link>
//         {/* <Link to="/help" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
//           Help
//         </Link> */}
//         <Link to="/" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
//           Logout
//         </Link>
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;


import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
    // Clear the session storage on logout
    sessionStorage.removeItem("userSession");
    navigate("/");
  }
  };

  return (
    <div className="w-30 h-screen text-black">
      {/* <div className="p-6">
        <h2 className="text-2xl font-bold">Menu</h2>
      </div> */}
      <nav className="mt-10">
        <Link to="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          Dashboard
        </Link>

        <a href="/merchants" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          Merchant Details
        </a>
        
        {/* <Link to="/help" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
          Help
        </Link> */}
        
        <a 
          href="#logout" 
          onClick={handleLogout}
          className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white"
        >
          Logout
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
