import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

const UserDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const mobNumb = user.mobileNumber;
  const agentName = user.pin?.AgentName;
  const agentId = user.pin?.AgentID;

  const handleApproval = async () => {
    try {
      const response = await axios.put(
        `${apiUrl}api/admin/updateFlagApproved`,
        {
          mobileNumber: mobNumb,
          isapproved: true,
          AgentName: agentName,
          AgentID: agentId,
        }
      );
      if (response.status === 200) {
        navigate("/merchants");
      }
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Details</h1>
      {user ? (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Business Name</th>
              <th className="py-2 px-4 border-b">Account Name</th>
              <th className="py-2 px-4 border-b">Account Number</th>
              <th className="py-2 px-4 border-b">MCC</th>
              <th className="py-2 px-4 border-b">Agent Id</th>
              <th className="py-2 px-4 border-b">Agent Name</th>
              <th className="py-2 px-4 border-b">Mobile Number</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">seller created</th>
              
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b">{user.id}</td>
              <td className="py-2 px-4 border-b">{user.businessname}</td>
              <td className="py-2 px-4 border-b">{user.settlementAccountName}</td>
              <td className="py-2 px-4 border-b">{user.settlementAccountNumber}</td>
              <td className="py-2 px-4 border-b">{user.mcc}</td>
              <td className="py-2 px-4 border-b">{agentId}</td>
              <td className="py-2 px-4 border-b">{agentName}</td>
              <td className="py-2 px-4 border-b">{user.mobileNumber}</td>
              <td className="py-2 px-4 border-b">{user.emailId}</td>
              <td className="py-2 px-4 border-b">seller created</td>
              </tr>
          </tbody>
        </table>
      ) : (
        <p>User details not available.</p>
      )}
      <button
        onClick={handleApproval}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Approve
      </button>
    </div>
  );
};

export default UserDetail;
