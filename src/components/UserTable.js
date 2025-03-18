import React from "react"
export const UserTable = ({ users, expandedUserId, setExpandedUserId, handleApproveUser, handleSellerRegister, creationErrors, createLoading }) => {
    return (
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Business Name</th>
            <th className="py-2 px-4 border-b">Mobile Number</th>
            <th className="py-2 px-4 border-b">Docs Verified</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <React.Fragment key={user.id}>
              <tr onClick={() => setExpandedUserId(prevId => prevId === user.id ? null : user.id)} className="cursor-pointer">
                <td className="py-2 px-4 border-b">{user.id}</td>
                <td className="py-2 px-4 border-b">{user.businessName}</td>
                <td className="py-2 px-4 border-b">{user.mobileNumber}</td>
                <td className="py-2 px-4 border-b">
                  {user.pin?.isapproved ? "Verified" : "Not Verified"}
                </td>
                <td className="py-2 px-4 border-b">
                  {!user.pin?.isapproved ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproveUser(user);
                      }}
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSellerRegister(user);
                      }}
                      disabled={createLoading}
                      className={`py-1 px-3 rounded ${
                        createLoading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {createLoading ? "Processing..." : "Register Seller"}
                    </button>
                  )}
                </td>
              </tr>
              {expandedUserId === user.id && (
                <tr>
                  <td colSpan="5" className="p-4 bg-gray-100">
                    <p><strong>Additional Details:</strong></p>
                    <p>Account Name: {user.accountName || "N/A"}</p>
                    <p>Email: {user.emailId || "N/A"}</p>
                    {creationErrors[user.id] && <p className="text-red-500">Error: {creationErrors[user.id]}</p>}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    );
  };
  