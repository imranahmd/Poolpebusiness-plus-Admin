
import React, { useEffect, useState, useMemo, Suspense } from "react";
import axios from "axios";
import myImage from "../img/payfilogo.ico";
import Sidebar from "../../src/utils/Sidebar";
import { UserGroupIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/outline';
import { useNavigate } from "react-router-dom";

const BarChartComponent = React.lazy(() => import('../utils/BarChartComponent'));

const Dashboard = () => {
  const navigate = useNavigate();


  const [totalMerchants, setTotalMerchants] = useState(0);
  const [pendingMerchants, setPendingMerchants] = useState(0);
  const [approvedMerchants, setApprovedMerchants] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrls = process.env.REACT_APP_API_URL;
  const approvedCount = useMemo(() => users.filter((user) => user.pin?.isapproved).length, [users]);
  const pendingCount = useMemo(() => users.filter((user) => !user.pin?.isapproved).length, [users]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrls}api/admin/allUser`);

      const usersArray = Object.values(response.data);
      const updatedUsers = usersArray[1].map((user) => ({ ...user }));
  
      const approvedCount = updatedUsers.filter((user) => user.pin?.isapproved).length;
      const pendingCount = updatedUsers.filter((user) => !user.pin?.isapproved).length;
  
      setUsers(updatedUsers);
      setTotalMerchants(updatedUsers.length);
      setApprovedMerchants(approvedCount);
      setPendingMerchants(pendingCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const userSession = sessionStorage.getItem("userSession");
    const expirationTime = sessionStorage.getItem("expirationTime");
    const now = new Date().getTime();

    // If session doesn't exist or has expired, redirect to login
    if (!userSession || (expirationTime && now >= expirationTime)) {
      navigate("/"); // Redirect to login page
      return;
    }

    // Fetch users if session is valid
    if (expirationTime && now < expirationTime) {
      const timeRemaining = expirationTime - now;
      setTimeout(() => {
        // handleLogout(); // Logout when session expires
        navigate("/");
      }, timeRemaining);
    }


    fetchUsers();
  }, [navigate]);

  // const data = [
  //   { name: 'Merchants', totalmerchants: totalMerchants },
  //   { name: 'Pending Merchants', pending: pendingMerchants },
  //   { name: 'Approved', Approved: approvedMerchants },
  // ];

  const data = [
    { name: 'Merchants', totalmerchants: totalMerchants, pending: pendingMerchants, Approved: approvedMerchants },
  ];

  

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-1xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 justify-start">
            <div className="flex items-center">
              <img src={myImage} alt="Logo" className="h-10 w-10 mr-3" />
              <span className="text-xl font-bold text-gray-900">Poolpe for Business</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content and sidebar */}
      <div className="flex flex-grow">
        <aside className="w-64 bg-white-200 p-3">
          <Sidebar />
        </aside>

        <main className="flex-grow bg-[#F0F4FA] p-6">
          <div className="flex justify-around w-full max-w-4xl mx-auto mt-4">
            <MerchantCount count={totalMerchants} label="Total Docs Verified" icon={UserGroupIcon} color="text-purple-600" />
            <MerchantCount count={pendingMerchants} label="Docs Pending" icon={ClockIcon} color="text-yellow-500" />
            <MerchantCount count={approvedMerchants} label="Docs Verified" icon={CheckCircleIcon} color="text-green-500" />
          </div>

          <div className="flex flex-col items-center mt-10">
            <div className="flex bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto" style={{ width: "120%" }}>
              <div className="ml-3 mt-4 w-full md:w-64 bg-white p-4 rounded-lg shadow-md" style={{ width: "120%" }}>
                {/* Lazy loading the BarChart */}
                <Suspense fallback={<div>Loading Chart...</div>}>
                  <BarChartComponent data={data} />
                </Suspense>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Memoized MerchantCount to avoid unnecessary re-renders
const MerchantCount = React.memo(({ count, label, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md w-1/3 flex flex-col items-center">
    <div className="flex items-center">
      <Icon className={`h-6 w-6 ${color} mr-2`} />
      <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
    </div>
    <p className={`text-xl font-bold ${color} mt-4`}>{count}</p>
  </div>
));

export default Dashboard;
