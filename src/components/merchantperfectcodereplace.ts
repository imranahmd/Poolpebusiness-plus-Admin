import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../utils/Loader"; // Import the Loader component
import Loaderbutton from "../utils/Loaderbutton";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../src/utils/Sidebar";

import { MdClear } from "react-icons/md";

const apiUrls = process.env.REACT_APP_API_URL;

const MerchantStatus = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(""); // New search query state
  const [isCreateDisabled, setIsCreateDisabled] = useState(false); // New state to control button disabled status

  const [panStatus, setPanStatus] = useState(null);
  const [aadharStatus, setAadharStatus] = useState(null);

  const [users, setUsers] = useState([]);
  // const [qrStatus, setQrStatus] = useState(null); // State to track QR status
  const [qrStatus, setQrStatus] = useState({});

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedUserId, setExpandedUserId] = useState(null);

  const [creationError, setCreationError] = useState({});
  const [creationError400, setCreationError400] = useState({});

  const [error201, setError201] = useState({});
  const [createLoading, setCreateLoading] = useState(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      sessionStorage.removeItem("userSession");
      sessionStorage.removeItem("expirationTime");

      // Trigger the logout event across all tabs
      localStorage.setItem("logout", Date.now());

      // Redirect to login
      navigate("/", { replace: true });
    }
  };

  const checkLegality = async (type) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/legality/${type}`
      );
      const data = await response.json();

      if (type === "pan") {
        setPanStatus(data.flag);
      } else if (type === "aadhar") {
        setAadharStatus(data.flag);
      }
    } catch (error) {
      console.error("Error fetching legality status:", error);
    }
  };

  const fetchLegality = () => {
    console.log("hello");
  };

  const handleLegality = () => {
    // const confirmLogout = window.confirm("Are you sure you want to verify legality?");
    fetchLegality();
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrls}api/admin/allUser`);
      // curl --location 'https://uatpoolpebusinessplus.payfi.co.in/poolpebusinessplus/api/admin/allUser'

      const usersArray = Object.values(response.data);

      const updatedUsers = usersArray[1].map((user) => ({
        ...user,
        isregistered: user.pin?.isregistered ?? false,
        isQrGenerated: user.pin?.isQrGenrated ?? false,
      }));
      setUsers(updatedUsers);
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

    // Check if there's no user session or if the session has expired
    if (!userSession || (expirationTime && now >= expirationTime)) {
      // Redirect to login page if session is invalid
      navigate("/", { replace: true });
    } else {
      // Redirect to dashboard if accessing root URL
      if (window.location.pathname === "/") {
        navigate("/dashboard", { replace: true });
      }
    }

    // Listen for popstate events to handle back navigation
    const handlePopState = () => {
      if (window.location.pathname === "/") {
        navigate("/dashboard", { replace: true });
      }
    };

    window.onpopstate = handlePopState;

    // Cleanup listener on component unmount
    return () => {
      window.onpopstate = null;
    };
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <Loader />;
  }

  // const handleInputChange = (e, userId, field) => {
  //   const newValue = e.target.value;
  //   setUsers((prevUsers) =>
  //     prevUsers.map((user) =>
  //       user.id === userId
  //         ? { ...user, pin: { ...user.pin, [field]: newValue } }
  //         : user
  //     )
  //   );
  // };
  const handleInputChange = (e, userId, field) => {
    const newValue = e.target.value;

    if (field === "AgentID") {
      // Only allow numbers
      if (!/^\d*$/.test(newValue)) {
        return; // Ignore the input if it is not numeric
      }
    }

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? { ...user, pin: { ...user.pin, [field]: newValue } }
          : user
      )
    );
  };

  const handleApproveUser = async (user) => {
    if (!user.pin?.AgentName || !user.pin?.AgentID) {
      alert("Agent Name and Agent ID are mandatory.");
      return;
    }
    try {
      const { mobileNumber, pin } = user;
      const response = await axios.put(
        `${apiUrls}api/admin/updateFlagApproved`,
        {
          mobileNumber,
          isapproved: true,
          AgentName: pin.AgentName,
          AgentID: pin.AgentID,
        }
      );
      console.log("User approved successfully:", response.data);
      fetchUsers();
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  // Handle generating QR code
  const handleCreation = async (user) => {
    setCreateLoading(true);
    setCreationError({});
    setCreationError400({});
    setError201({});

    try {
      // const response = await axios.post(`${apiUrls}api/seller/createseller`, {
      const response = await axios.post(
        `${apiUrls}api/seller/yesBankNew/createseller`,
        {
          mobileNumber: user.mobileNumber,
        }
      );

      const { status, data } = response;
      const responseMessage =
        data?.data?.responseMessage || data?.message || "Unknown error"; // Fallback to a default message
      console.log("me", response);
      console.log("error", response.data.status);

      if (status === 201 || status == 200 || status == 204) {
        setError201((prevErrors) => ({
          ...prevErrors,
          [user.id]: {
            code201: response.data.data.code,
            message201: response.data.data.msg,
            responseCode: response.data.data.responseCode,
            message: responseMessage,
            statues: response.data.data.status,
            // status201:response.data.data.status
            code201success: response.data.status,
            code201message: response.data.message,
          },
        }));
      }
      // else if (status === 200) {
      //   console.log("Seller registered successfully");
      // }

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id
            ? { ...u, isSellerCreated: true, isregistered: true }
            : u
        )
      );
      setIsCreateDisabled(true);
    } catch (error) {
      console.error("Error creating seller:", error);

      if (error.response) {
        const { status, data } = error.response;
        const responseMessage = data?.message || "Error while creating seller";

        if (status === 500) {
          setCreationError400((prevErrors) => ({
            ...prevErrors,
            // [user.id]: `${data.mainResponse}`,
            [user.id]: {
              responseCode: data.mainResponse.responseCode, // Save responseCode
              responseMessage: data.mainResponse.responseMessage, // Save responseMessage
              responseError: data.mainResponse.status, // Save responseMessage
            },
          }));

          console.log("prev----------", data);
        } else if (status === 400) {
          setCreationError400((prevErrors) => ({
            ...prevErrors,
            // [user.id]: `400: ${responseMessage}`,
            [user.id]: ` ${data.mainResponse}`,
          }));
        } else {
          setCreationError((prevErrors) => ({
            ...prevErrors,
            [user.id]: responseMessage,
          }));
        }
      } else {
        setCreationError((prevErrors) => ({
          ...prevErrors,
          [user.id]: "Unknown error occurred",
        }));
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleQr = async (user) => {
    try {
      // const response = await axios.post(`${apiUrls}api/qr/createqr`, {

      const response = await axios.post(
        `${apiUrls}api/qr/yesBankNew/createqr`,
        {
          mobileNumber: user.mobileNumber,
        }
      );

      const { status, message, data } = response;

      if (status === 201) {
        console.log("QR created successfully for user:", user.id);
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === user.id ? { ...u, isQrGenerated: true } : u
          )
        );
        setQrStatus((prevStatus) => ({
          ...prevStatus,
          [user.id]: {
            status: "success",
            message: message || "QR generated successfully!",
            sellerStatus: data?.data?.sellerStatus || "",
            qrString: data?.data?.qrString || "",
            // sellerIdentifier: data?.data?.sellerIdentifier || "",
          },
        }));
      } else if (response.status === 200) {
        console.log("QR created successfully for user:", user.id);
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === user.id ? { ...u, isQrGenerated: true } : u
          )
        );
        setQrStatus((prevStatus) => ({
          ...prevStatus,
          [user.id]: {
            status: "success",
            message: "QR code created successfully!",
          },
        }));
      } else {
        console.log("Unexpected response status:", status);
      }
    } catch (error) {
      console.error("Error creating QR:", error);
      setQrStatus((prevStatus) => ({
        ...prevStatus,
        [user.id]: {
          status: "error",
          message: "Failed to create QR code. Please check the details.",
        },
      }));
    }
  };
  const handleClear = () => {
    setSearchQuery("");
  };

  // Handle showing all users
  const handleShowAll = () => {
    setFilter("all");
  };

  // Filtering logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.mobileNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "approved") return user.pin?.isapproved && matchesSearch;
    if (filter === "notApproved") return !user.pin?.isapproved && matchesSearch;

    return matchesSearch; // Default return for other cases
  });

  // Toggle expanded user details
  const toggleUserDetails = (userId) => {
    setExpandedUserId((prevId) => (prevId === userId ? null : userId));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div></div>
      <h1 className="text-2xl font-bold mb-4">Merchant Data</h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-gray-800 text-white py-2 px-4 rounded shadow-sm text-xs border border-white"
          style={{ marginTop: "-40px" }}
        >
          Logout
        </button>
      </div>
      <div className="relative mb-4">
        <span style={{ color: "gray" }}>Search: </span>
        <input
          type="text"
          placeholder="Search By Business Name"
          className="border border-gray-300 py-2 px-4 rounded pr-10" // Add padding-right to avoid overlap with button
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-[81%]  top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <MdClear className="w-5 h-5" /> {/* Adjust size if needed */}
          </button>
        )}
      </div>

      <div className="mb-4 flex justify-center">
        <button
          onClick={handleShowAll}
          className="bg-gray-500 text-white py-2 px-4 ml-2 rounded hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
        >
          All Users
        </button>
        <button
          onClick={() => setFilter("approved")}
          className="bg-green-500 text-white py-2 mx-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:bg-green-600"
        >
          Docs verified
        </button>
        <button
          onClick={() => setFilter("notApproved")}
          className="bg-red-500 text-white py-2 px-4 mx-2 rounded hover:bg-red-600 focus:outline-none focus:bg-red-600"
        >
          Docs not verified
        </button>
      </div>
      {filteredUsers.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">sellerIdentifier</th>
              <th className="py-2 px-4 border-b">Business Name</th>
              <th className="py-2 px-4 border-b">Account Name</th>
              <th className="py-2 px-4 border-b">Account Number</th>
              <th className="py-2 px-4 border-b">MCC</th>
              <th className="py-2 px-4 border-b">Mobile Number</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Agent Name</th>
              <th className="py-2 px-4 border-b">Agent Id</th>
              <th className="py-2 px-4 border-b">Docs Verified</th>

              {/* <th className="py-2 px-4 border-b">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <React.Fragment key={user.id}>
                <tr
                  onClick={() => toggleUserDetails(user.id)}
                  className="cursor-pointer"
                >
                  <td className="py-2 px-4 border-b">{user.id}</td>
                  <td className="py-2 px-4 border-b">
                    {user.sellerIdentifier}
                  </td>
                  <td className="py-2 px-4 border-b">{user.businessName}</td>
                  <td className="py-2 px-4 border-b">{user.accountName}</td>
                  <td className="py-2 px-4 border-b">
                    {user.settlementAccountNumber}
                  </td>
                  <td className="py-2 px-4 border-b">{user.mcc}</td>
                  <td className="py-2 px-4 border-b">{user.mobileNumber}</td>
                  <td className="py-2 px-4 border-b">{user.emailId}</td>

                  <td className="py-2 px-4 border-b">
                    <input
                      className="border border-gray-400 py-1 px-2 rounded-md focus:outline-none focus:border-blue-500 w-full"
                      type="text"
                      value={user.pin?.AgentName || ""}
                      placeholder="Agent Name"
                      onChange={(e) =>
                        handleInputChange(e, user.id, "AgentName")
                      }
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <input
                      className="border border-gray-400 py-1 px-2 rounded-md focus:outline-none focus:border-blue-500 w-full"
                      type="text"
                      value={user.pin?.AgentID || ""}
                      placeholder="AgentId Number"
                      onChange={(e) => handleInputChange(e, user.id, "AgentID")}
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    {/* {user.pin?.isapproved ? "Approved" : "Not Approved"} */}
                    {user.pin?.isapproved ? "Docs Verify" : "Docs Not Verfy"}
                  </td>
                </tr>
                {expandedUserId === user.id && (
                  <tr>
                    <td colSpan="12" className="p-4 bg-gray-100">
                      <div className="flex flex-wrap items-start justify-between">
                        <div className="p-4 bg-white rounded-lg shadow-md">
                          <h2 className="text-xl font-semibold mb-4">
                            Bank Details
                          </h2>
                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <p className="font-medium">ID:</p>
                            <p>{user.udyogAadhaar || "N/A"}</p>

                            <p className="font-medium">
                              Settlement Account Number:
                            </p>
                            <p>{user.settlementAccountNumber || "N/A"}</p>

                            <p className="font-medium">Partner Reference No:</p>
                            <p>{user.partnerReferenceNo || "N/A"}</p>

                            <p className="font-medium">
                              Settlement Account IFSC:
                            </p>
                            <p>{user.settlementAccountIfsc || "N/A"}</p>

                            <p className="font-medium">PAN:</p>
                            <p>{user.pan || "N/A"}</p>

                            <p className="font-medium">GST Number:</p>
                            <p>{user.gstNumber || "N/A"}</p>

                            <p className="font-medium">Acceptance Type:</p>
                            <p>{user.acceptanceType || "N/A"}</p>

                            <p className="font-medium">Ownership Type:</p>
                            <p>{user.ownershipType || "N/A"}</p>
                          </div>
                        </div>

                        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mb-4 p-4 bg-white rounded-lg shadow-md">
                          <h2 className="text-xl font-semibold mb-4 text-center">
                            User Details
                          </h2>
                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <p className="font-medium">ID:</p>
                            <p>{user.id || "N/A"}</p>

                            <p className="font-medium">Business Name:</p>
                            <p>{user.businessName || "N/A"}</p>

                            <p className="font-medium">Account Name:</p>
                            <p>{user.sellerName || "N/A"}</p>

                            <p className="font-medium">Account Number:</p>
                            <p>{user.settlementAccountNumber || "N/A"}</p>

                            <p className="font-medium">MCC:</p>
                            <p>{user.mcc || "N/A"}</p>

                            <p className="font-medium">Mobile Number:</p>
                            <p>{user.mobileNumber || "N/A"}</p>

                            <p className="font-medium">Email:</p>
                            <p>{user.emailId || "N/A"}</p>
                          </div>
                        </div>

                        {/* ---------------------------------- */}
                        {/* <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mb-4 flex flex-col">
                          <p className="mb-1">
                            <strong>Agent Name:</strong> {user.pin?.AgentName}
                          </p>
                          <p className="mb-1">
                            <strong>Agent ID:</strong> {user.pin?.AgentID}
                          </p>
                          <p className="mb-1">
                            <strong>Status:</strong>{" "}
                            {user.pin?.isapproved
                              ? "Docs Verified"
                              : "Docs Not Approved"}
                          </p>

                          <p className="mb-1">
                            <strong>registeredDate: </strong>
                            {user.pin?.isapproved &&
                            user.pin?.registeredDate ? (
                              <>
                                {user.pin.registeredDate.split("T")[0]}{" "}
                                {
                                  user.pin.registeredDate
                                    .split("T")[1]
                                    .split(".")[0]
                                }{" "}
                              </>
                            ) : (
                              "N/A"
                            )}
                          </p>
                        </div> */}
                        {/* -------------------------------------- */}

                        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mb-4 p-4 bg-white rounded-lg shadow-md">
                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <p className="font-medium">Agent Name:</p>
                            <p>{user.pin?.AgentName || "N/A"}</p>

                            <p className="font-medium">Agent ID:</p>
                            <p>{user.pin?.AgentID || "N/A"}</p>

                            <p className="font-medium">Status:</p>
                            <p>
                              {user.pin?.isapproved ? (
                                <span className="text-green-600 font-semibold">
                                  Docs Verified
                                </span>
                              ) : (
                                <span className="text-red-600 font-semibold">
                                  Docs Not Approved
                                </span>
                              )}
                            </p>

                            <p className="font-medium">Registered Date:</p>
                            <p>
                              {user.pin?.isapproved &&
                              user.pin?.registeredDate ? (
                                <>
                                  {user.pin.registeredDate.split("T")[0]}{" "}
                                  {
                                    user.pin.registeredDate
                                      .split("T")[1]
                                      .split(".")[0]
                                  }
                                </>
                              ) : (
                                "N/A"
                              )}
                            </p>
                          </div>
                        </div>

                        {/* border-2 border-red-300  */}
                        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mt-4 sm:mt-0 flex flex-col mr-20">
                          {!user.pin?.isapproved && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveUser(user);
                              }}
                              disabled={
                                !user.pin?.AgentName || !user.pin?.AgentID
                              }
                              className={`bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600 mt-auto ${
                                (!user.pin?.AgentName || !user.pin?.AgentID) &&
                                "opacity-50 cursor-not-allowed"
                              }`}
                            >
                              Approve (Docs Verified)
                            </button>
                          )}

                          {user.pin?.isapproved && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreation(user);
                                }}
                                disabled={isCreateDisabled} // Disable button based on state
                                className={`${
                                  creationError[user.id] || error201[user.id]
                                    ? "bg-gray-500 cursor-not-allowed"
                                    : !user.isregistered && !user.isQrGenerated
                                    ? "bg-red-500 text-white hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
                                    : "bg-green-500 text-white cursor-allowed" // Change to cursor-allowed
                                } py-2 mx-2 px-4 rounded mt-2 sm:mt-2`}
                              >
                                {createLoading ? (
                                  <Loaderbutton />
                                ) : user.isregistered && !user.isQrGenerated ? (
                                  "Create Seller"
                                ) : (
                                  <span className="flex items-center justify-center">
                                    {/* <CheckCircleIcon className="h-5 w-5 text-green-200 ml-20" /> Green tick icon */}
                                    Seller Registered
                                  </span>
                                )}
                              </button>

                              {/* <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQr(user);
                                }}
                                className={`${
                                  !user.isregistered || user.isQrGenerated
                                    ? // ? "bg-red-500 cursor-not-allowed"
                                      "bg-red-500"
                                    : "bg-green-500"
                                } text-white py-2 mx-2 px-4 rounded mt-2 sm:mt-2 hover:bg-grey-600  focus:bg-grey-600`}
                                // disabled={
                                //   !user.isregistered || user.isQrGenerated
                                // }
                              >
                                {user.isQrGenerated
                                  ? "QR Generated"
                                  : "Generate QR"}
                              </button> */}
                            </>
                          )}

                          {error201[user.id] && (
                            <div>
                              <p>{error201[user.id].code201success}</p>
                              <p>{error201[user.id].code201message}</p>
                              <hr style={{ marginTop: "20px" }} />
                              <p className="text-green-500 mt-2">
                                code : {error201[user.id].code201}
                                <br />
                                message : {error201[user.id].message201}
                                <br />
                                Response Code: {error201[user.id].responseCode}
                                <br />
                                responseMessage : {error201[user.id].message}
                                <br />
                                status: {error201[user.id].responseError}
                              </p>
                            </div>
                          )}

                          <button
                            onClick={handleLegality}
                            className="bg-gray-500 text-white py-2 px-4 rounded shadow-sm text-xs border border-white"
                          >
                            Verify Legality
                          </button>

                          {/* pan card and adhar  */}
                          <div className="p-4 bg-gray-100 rounded shadow-md max-w-sm">
                            <p className="text-lg font-semibold mb-2">
                              Legality Status:
                            </p>

                            <div className="flex gap-4">
                              <button
                                onClick={() => checkLegality("pan")}
                                className="bg-gray-600 text-white py-2 px-4 rounded shadow-sm text-sm border border-white"
                              >
                                PAN
                              </button>

                              <button
                                onClick={() => checkLegality("aadhar")}
                                className="bg-gray-600 text-white py-2 px-4 rounded shadow-sm text-sm border border-white"
                              >
                                Aadhar
                              </button>
                            </div>

                            <div className="mt-4">
                              <p>
                                PAN Status:{" "}
                                {panStatus !== null
                                  ? panStatus.toString()
                                  : "Not Checked"}
                              </p>
                              <p>
                                Aadhar Status:{" "}
                                {aadharStatus !== null
                                  ? aadharStatus.toString()
                                  : "Not Checked"}
                              </p>
                            </div>
                          </div>

                          {/* 400 error seller register */}
                          {creationError400[user.id] && (
                            <div className="border border-red-500 bg-red-50 p-4 rounded-md mt-2 shadow-md">
                              <p className="text-red-700 font-semibold">
                                <strong>Response Code:</strong>{" "}
                                {creationError400[user.id].responseCode}
                              </p>
                              <p className="text-red-700 mt-2">
                                <strong>Message:</strong>{" "}
                                {creationError400[user.id].responseMessage}
                              </p>
                              {creationError400[user.id].responseError && (
                                <p className="text-red-700 mt-2">
                                  <strong>Additional Info:</strong>{" "}
                                  {creationError400[user.id].responseError}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Display QR Generation Status */}
                          {qrStatus[user.id] && (
                            <div
                              className={`mt-2 ${
                                qrStatus[user.id].status === "success"
                                  ? "text-green-800"
                                  : "text-red-500"
                              }`}
                            >
                              {qrStatus[user.id].message}
                              {qrStatus[user.id].status === "success" && (
                                <div className="mt-1">
                                  <p>
                                    <strong>Seller Status:</strong>{" "}
                                    {qrStatus[user.id].sellerStatus}
                                  </p>
                                  <p>
                                    <strong>QR String:</strong>{" "}
                                    {qrStatus[user.id].qrString}
                                  </p>
                                  <p>
                                    <strong>Seller Identifier:</strong>{" "}
                                    {qrStatus[user.id].sellerIdentifier}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center mt-4">No users available.</p>
      )}
    </div>
  );
};

export default React.memo(MerchantStatus);



// id  on each table


import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../utils/Loader"; // Import the Loader component
import Loaderbutton from "../utils/Loaderbutton";
import { useNavigate } from "react-router-dom";
// import Sidebar from "../../src/utils/Sidebar";
import { MdClear } from "react-icons/md";

const apiUrls = process.env.REACT_APP_API_URL;

const MerchantStatus = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);

  const [searchQuery, setSearchQuery] = useState(""); // New search query state
  const [isCreateDisabled, setIsCreateDisabled] = useState(false); // New state to control button disabled status

  const [users, setUsers] = useState([]);
  // const [qrStatus, setQrStatus] = useState(null); // State to track QR status
  const [qrStatus, setQrStatus] = useState({});


  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedUserId, setExpandedUserId] = useState(null);

  const [creationError, setCreationError] = useState({});
  const [creationError400, setCreationError400] = useState({});

  const [error201, setError201] = useState({});
  const [createLoading, setCreateLoading] = useState(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      sessionStorage.removeItem("userSession");
      sessionStorage.removeItem("expirationTime");

      // Trigger the logout event across all tabs
      localStorage.setItem("logout", Date.now());

      // Redirect to login
      navigate("/", { replace: true });
    }
  };

  // useEffect(() => {
  //   fetch("/config.json")
  //     .then((res) => res.json())
  //     .then((data) => setIsRunning(data.isRunning))
  //     .catch((err) => console.error("Error fetching config:", err));
  // }, []);

  const handleClick = () => {
    setIsRunning(true);

    // Simulate a process
    setTimeout(() => {
      setIsRunning(false);
      alert("Process Completed");
    }, 3000);
  };
  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrls}api/admin/allUser`);
      // curl --location 'https://uatpoolpebusinessplus.payfi.co.in/poolpebusinessplus/api/admin/allUser'

      const usersArray = Object.values(response.data);

      const updatedUsers = usersArray[1].map((user) => ({
        ...user,
        isregistered: user.pin?.isregistered ?? false,
        isQrGenerated: user.pin?.isQrGenrated ?? false,
      }));
      setUsers(updatedUsers);
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

    // Check if there's no user session or if the session has expired
    if (!userSession || (expirationTime && now >= expirationTime)) {
      // Redirect to login page if session is invalid
      navigate("/", { replace: true });
    } else {
      // Redirect to dashboard if accessing root URL
      if (window.location.pathname === "/") {
        navigate("/dashboard", { replace: true });
      }
    }

    // Listen for popstate events to handle back navigation
    const handlePopState = () => {
      if (window.location.pathname === "/") {
        navigate("/dashboard", { replace: true });
      }
    };

    window.onpopstate = handlePopState;

    // Cleanup listener on component unmount
    return () => {
      window.onpopstate = null;
    };
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const handleInputChange = (e, userId, field) => {
    const newValue = e.target.value;

    if (field === "AgentID") {
      // Only allow numbers
      if (!/^\d*$/.test(newValue)) {
        return; // Ignore the input if it is not numeric
      }
    }

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? { ...user, pin: { ...user.pin, [field]: newValue } }
          : user
      )
    );
  };

  const handleApproveUser = async (user) => {
    if (!user.pin?.AgentName || !user.pin?.AgentID) {
      alert("Agent Name and Agent ID are mandatory.");
      return;
    }
    try {
      const { mobileNumber, pin } = user;
      const response = await axios.put(
        `${apiUrls}api/admin/updateFlagApproved`,
        {
          mobileNumber,
          isapproved: true,
          AgentName: pin.AgentName,
          AgentID: pin.AgentID,
        }
      );
      console.log("User approved successfully:", response.data);
      fetchUsers();
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  // Handle generating QR code
  const handleSellerRegister = async (user) => {
    setCreateLoading(true);
    setCreationError({});
    setCreationError400({});
    setError201({});

    try {
      const response = await axios.post(
        `${apiUrls}api/seller/yesBankNew/createseller`,
        {
          mobileNumber: user.mobileNumber,
        }
      );

      const { status, data } = response;
      const responseMessage =
        data?.data?.responseMessage || data?.message || "Unknown error"; // Fallback to a default message
      console.log("me", response);
      console.log("error", response.data.status);

      if (status === 201 || status == 200 || status == 204) {
        setError201((prevErrors) => ({
          ...prevErrors,
          [user.id]: {
            code201: response.data.data.code,
            message201: response.data.data.msg,
            responseCode: response.data.data.responseCode,
            message: responseMessage,
            statues: response.data.data.status,
            code201success: response.data.status,
            code201message: response.data.message,
          },
        }));
      }

      setUsers(
        (prevUsers) => {
          prevUsers.map((u) =>
            u.id === user.id
              ? { ...u, isSellerCreated: true, isregistered: true }
              : u
          );
        }
        // setIsCreateDisabled(true);
      );
      // setUsers((prevUsers) =>
      //   prevUsers.map((u) =>
      //     u.id === user.id
      //       ? { ...u, isSellerCreated: true, isregistered: true }
      //       : u
      //   )
      // );
      setIsCreateDisabled(true);
    } catch (error) {
      console.error("Error creating seller:", error);

      if (error.response) {
        const { status, data } = error.response;
        const responseMessage = data?.message || "Error while creating seller";

        if (status === 500) {
          setCreationError400((prevErrors) => ({
            ...prevErrors,
            // [user.id]: `${data.mainResponse}`,
            [user.id]: {
              responseCode: data.mainResponse.responseCode, // Save responseCode
              responseMessage: data.mainResponse.responseMessage, // Save responseMessage
              responseError: data.mainResponse.status, // Save responseMessage
            },
          }));

          console.log("prev----------", data);
        } else if (status === 400) {
          setCreationError400((prevErrors) => ({
            ...prevErrors,
            // [user.id]: `400: ${responseMessage}`,
            [user.id]: ` ${data.mainResponse}`,
          }));
        } else {
          setCreationError((prevErrors) => ({
            ...prevErrors,
            [user.id]: responseMessage,
          }));
        }
      } else {
        setCreationError((prevErrors) => ({
          ...prevErrors,
          [user.id]: "Unknown error occurred",
        }));
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
  };

  // Handle showing all users
  const handleShowAll = () => {
    setFilter("all");
  };

  // Filtering logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.mobileNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "approved") return user.pin?.isapproved && matchesSearch;
    if (filter === "notApproved") return !user.pin?.isapproved && matchesSearch;

    return matchesSearch; // Default return for other cases
  });

  // Toggle expanded user details
  const toggleUserDetails = (userId) => {
    setExpandedUserId((prevId) => (prevId === userId ? null : userId));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div></div>
      <h1 className="text-2xl font-bold mb-4">Merchant Data</h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-gray-800 text-white py-2 px-4 rounded shadow-sm text-xs border border-white"
          style={{ marginTop: "-40px" }}
        >
          Logout
        </button>
      </div>
      <div className="relative mb-4">
        <span style={{ color: "gray" }}>Search: </span>
        <input
          type="text"
          placeholder="Search By Business Name"
          className="border border-gray-300 py-2 px-4 rounded pr-10" // Add padding-right to avoid overlap with button
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-[81%]  top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <MdClear className="w-5 h-5" /> {/* Adjust size if needed */}
          </button>
        )}
      </div>

      <div className="mb-4 flex justify-center">
        <button
          onClick={handleShowAll}
          className="bg-gray-500 text-white py-2 px-4 ml-2 rounded hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
        >
          All Users
        </button>
        <button
          onClick={() => setFilter("approved")}
          className="bg-green-500 text-white py-2 mx-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:bg-green-600"
        >
          Docs verified
        </button>
        <button
          onClick={() => setFilter("notApproved")}
          className="bg-red-500 text-white py-2 px-4 mx-2 rounded hover:bg-red-600 focus:outline-none focus:bg-red-600"
        >
          Docs not verified
        </button>
      </div>
      {filteredUsers.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">sellerIdentifier</th>
              <th className="py-2 px-4 border-b">Business Name</th>
              <th className="py-2 px-4 border-b">Account Name</th>
              <th className="py-2 px-4 border-b">Account Number</th>
              <th className="py-2 px-4 border-b">MCC</th>
              <th className="py-2 px-4 border-b">Mobile Number</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Agent Name</th>
              <th className="py-2 px-4 border-b">Agent Id</th>
              <th className="py-2 px-4 border-b">Docs Verified</th>

              {/* <th className="py-2 px-4 border-b">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <React.Fragment key={user.id}>
                <tr
                  onClick={() => toggleUserDetails(user.id)}
                  className="cursor-pointer"
                >
                  <td className="py-2 px-4 border-b">{user.id}</td>
                  <td className="py-2 px-4 border-b">
                    {user.sellerIdentifier}
                  </td>
                  <td className="py-2 px-4 border-b">{user.businessName}</td>
                  <td className="py-2 px-4 border-b">{user.accountName}</td>
                  <td className="py-2 px-4 border-b">
                    {user.settlementAccountNumber}
                  </td>
                  <td className="py-2 px-4 border-b">{user.mcc}</td>
                  <td className="py-2 px-4 border-b">{user.mobileNumber}</td>
                  <td className="py-2 px-4 border-b">{user.emailId}</td>

                  <td className="py-2 px-4 border-b">
                    <input
                      className="border border-gray-400 py-1 px-2 rounded-md focus:outline-none focus:border-blue-500 w-full"
                      type="text"
                      value={user.pin?.AgentName || ""}
                      placeholder="Agent Name"
                      onChange={(e) =>
                        handleInputChange(e, user.id, "AgentName")
                      }
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <input
                      className="border border-gray-400 py-1 px-2 rounded-md focus:outline-none focus:border-blue-500 w-full"
                      type="text"
                      value={user.pin?.AgentID || ""}
                      placeholder="AgentId Number"
                      onChange={(e) => handleInputChange(e, user.id, "AgentID")}
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    {/* {user.pin?.isapproved ? "Approved" : "Not Approved"} */}
                    {user.pin?.isapproved ? "Docs Verify" : "Docs Not Verfy"}
                  </td>
                </tr>
                {expandedUserId === user.id && (
                  <tr>
                    <td colSpan="12" className="p-4 bg-gray-100">
                      <div className="flex flex-wrap items-start justify-between">
                        <div className="p-4 bg-white rounded-lg shadow-md">
                          <h2 className="text-xl font-semibold mb-4">
                            Bank Details
                          </h2>
                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <p className="font-medium">ID:</p>
                            <p>{user.udyogAadhaar || "N/A"}</p>

                            <p className="font-medium">
                              Settlement Account Number:
                            </p>
                            <p>{user.settlementAccountNumber || "N/A"}</p>

                            <p className="font-medium">Partner Reference No:</p>
                            <p>{user.partnerReferenceNo || "N/A"}</p>

                            <p className="font-medium">
                              Settlement Account IFSC:
                            </p>
                            <p>{user.settlementAccountIfsc || "N/A"}</p>

                            <p className="font-medium">PAN:</p>
                            <p>{user.pan || "N/A"}</p>

                            <p className="font-medium">GST Number:</p>
                            <p>{user.gstNumber || "N/A"}</p>

                            <p className="font-medium">Acceptance Type:</p>
                            <p>{user.acceptanceType || "N/A"}</p>

                            <p className="font-medium">Ownership Type:</p>
                            <p>{user.ownershipType || "N/A"}</p>
                          </div>
                        </div>

                        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mb-4 p-4 bg-white rounded-lg shadow-md">
                          <h2 className="text-xl font-semibold mb-4 text-center">
                            User Details
                          </h2>
                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <p className="font-medium">ID:</p>
                            <p>{user.id || "N/A"}</p>

                            <p className="font-medium">Business Name:</p>
                            <p>{user.businessName || "N/A"}</p>

                            <p className="font-medium">Account Name:</p>
                            <p>{user.sellerName || "N/A"}</p>

                            <p className="font-medium">Account Number:</p>
                            <p>{user.settlementAccountNumber || "N/A"}</p>

                            <p className="font-medium">MCC:</p>
                            <p>{user.mcc || "N/A"}</p>

                            <p className="font-medium">Mobile Number:</p>
                            <p>{user.mobileNumber || "N/A"}</p>

                            <p className="font-medium">Email:</p>
                            <p>{user.emailId || "N/A"}</p>
                          </div>
                        </div>

                        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mb-4 p-4 bg-white rounded-lg shadow-md">
                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <p className="font-medium">Agent Name:</p>
                            <p>{user.pin?.AgentName || "N/A"}</p>

                            <p className="font-medium">Agent ID:</p>
                            <p>{user.pin?.AgentID || "N/A"}</p>

                            <p className="font-medium">Status:</p>
                            <p>
                              {user.pin?.isapproved ? (
                                <span className="text-green-600 font-semibold">
                                  Docs Verified
                                </span>
                              ) : (
                                <span className="text-red-600 font-semibold">
                                  Docs Not Approved
                                </span>
                              )}
                            </p>

                            <p className="font-medium">Registered Date:</p>
                            <p>
                              {user.pin?.isapproved &&
                              user.pin?.registeredDate ? (
                                <>
                                  {user.pin.registeredDate.split("T")[0]}{" "}
                                  {
                                    user.pin.registeredDate
                                      .split("T")[1]
                                      .split(".")[0]
                                  }
                                </>
                              ) : (
                                "N/A"
                              )}
                            </p>
                          </div>
                        </div>

                        {/* border-2 border-red-300  */}
                        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mt-4 sm:mt-0 flex flex-col mr-20">
                          {!user.pin?.isapproved && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveUser(user);
                              }}
                              disabled={
                                !user.pin?.AgentName || !user.pin?.AgentID
                              }
                              className={`bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600 mt-auto ${
                                (!user.pin?.AgentName || !user.pin?.AgentID) &&
                                "opacity-50 cursor-not-allowed"
                              }`}
                            >
                              Approve (Docs Verified)
                            </button>
                          )}

                          {user.pin?.isapproved && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSellerRegister(user);
                                }}
                                disabled={isCreateDisabled} // Disable button based on state
                                className={`${
                                  creationError[user.id] || error201[user.id]
                                    ? "bg-gray-500 cursor-not-allowed"
                                    : !user.isregistered && !user.isQrGenerated
                                    ? "bg-red-500 text-white hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
                                    : "bg-green-500 text-white cursor-allowed" // Change to cursor-allowed
                                } py-2 mx-2 px-4 rounded mt-2 sm:mt-2`}
                              >
                                {createLoading ? (
                                  <Loaderbutton />
                                ) : user.isregistered && !user.isQrGenerated ? (
                                  "Create Seller"
                                ) : (
                                  <span className="flex items-center justify-center">
                                    {/* <CheckCircleIcon className="h-5 w-5 text-green-200 ml-20" /> Green tick icon */}
                                    Seller Registered
                                  </span>
                                )}
                              </button>




                             
                            </>
                            
                          )}
                          
                          
                          
                          
                          
                          {users
  .filter((u) => u.id === user.id) // This ensures only the matching user ID's table appears
  .map((filteredUser) => (
    <div
      key={filteredUser.id}
      className="mt-4 border border-2 border-gray-300 p-4"
    >
      <h2 className="text-lg font-semibold mb-2">
        User ID: {filteredUser.id}
      </h2>
      <table className="table-auto border border-gray-300 w-full">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Workflow</th>
            <th className="border border-gray-300 p-2">Created on</th>
            <th className="border border-gray-300 p-2">Last updated</th>
            <th className="border border-gray-300 p-2">Type</th>
            <th className="border border-gray-300 p-2">Status</th>
            <th className="border border-gray-300 p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border border-gray-300">
            <td className="border border-gray-300 p-4">{filteredUser.name}</td>
            <td className="border border-gray-300 p-4">
              {filteredUser.createdOn}
            </td>
            <td className="border border-gray-300 p-4">
              {filteredUser.lastUpdated}
            </td>
            <td className="border border-gray-300 p-4">{filteredUser.type}</td>
            <td className="border border-gray-300 p-4">{filteredUser.status}</td>
            <td className="border border-gray-300 p-4">
              <button
                className="bg-red-200 px-4 py-2 rounded"
                onClick={() => handleClick(filteredUser.id)}
                disabled={isRunning}
              >
                {isRunning ? "Processing..." : "Run"}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ))}


                                
                          {error201[user.id] && (
                            <div>
                              <p>{error201[user.id].code201success}</p>
                              <p>{error201[user.id].code201message}</p>
                              <hr style={{ marginTop: "20px" }} />
                              <p className="text-green-500 mt-2">
                                code : {error201[user.id].code201}
                                <br />
                                message : {error201[user.id].message201}
                                <br />
                                Response Code: {error201[user.id].responseCode}
                                <br />
                                responseMessage : {error201[user.id].message}
                                <br />
                                status: {error201[user.id].responseError}
                              </p>
                            </div>
                          )}



                          {/* 400 error seller register */}
                          {creationError400[user.id] && (
                            <div className="border border-red-500 bg-red-50 p-4 rounded-md mt-2 shadow-md">
                              <p className="text-red-700 font-semibold">
                                <strong>Response Code:</strong>{" "}
                                {creationError400[user.id].responseCode}
                              </p>
                              <p className="text-red-700 mt-2">
                                <strong>Message:</strong>{" "}
                                {creationError400[user.id].responseMessage}
                              </p>
                              {creationError400[user.id].responseError && (
                                <p className="text-red-700 mt-2">
                                  <strong>Additional Info:</strong>{" "}
                                  {creationError400[user.id].responseError}
                                </p>
                              )}
                            </div>
                          )}






                        

                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center mt-4">No users available.</p>
      )}
    </div>
  );
};

export default React.memo(MerchantStatus);
