import React from "react";

const AdminSuccessApproved = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <svg
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
        <h1 className="text-2xl font-bold text-green-600">Success!</h1>
        <p className="text-gray-700 mt-2">Your action was completed successfully.</p>
      </div>
    </div>
  );
};

export default AdminSuccessApproved;
