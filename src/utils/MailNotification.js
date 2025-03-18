import React, { useState } from "react";
import { MailIcon, XIcon } from "@heroicons/react/solid";

const MailNotification = (usermail) => {
    console.log("fsd" , [usermail.usermail])
  const [emails, setEmails] = useState([usermail.usermail]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Function to handle sending email via mailto:
  const handleSendEmail = (userEmail, userLink) => {
    const subject = encodeURIComponent("Important Notification");
    const body = encodeURIComponent(`Hello,\n\nPlease click the link below:\n${userLink}\n\nBest Regards,\nYour Company`);
    
    window.location.href = `mailto:${userEmail}?subject=${subject}&body=${body}`;
        // Update emails state when mail is opened
        // setEmails((prevEmails) => [...prevEmails, userEmail]);
  };

  return (
    <div className="relative">
      {/* Button to Show Notifications */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 bg-gray-800 text-white rounded-full"
      >
        <MailIcon className="h-6 w-6" />
        {emails.some((email) => email.unread) && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {emails.filter((email) => email.unread).length}
          </span>
        )}
      </button>

      {/* Dropdown Notifications */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-300 z-10">
          <div className="p-3 flex justify-between border-b">
            <h3 className="font-semibold text-gray-700">Mail Notifications</h3>
            <button onClick={() => setShowNotifications(false)}>
              <XIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          {emails.length > 0 ? (
            emails.map((email) => (
              <div
                key={email.id}
                className={`p-3 border-b ${email.unread ? "bg-gray-100" : "bg-white"}`}
              >
                <p className="font-semibold">{email.subject}</p>
                <p className="text-sm text-gray-600">{email.message}</p>

                {/* Send Email Button */}
                <button
                  className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded"
                  onClick={() => handleSendEmail(email.email, email.link)}
                >
                  Send Email
                </button>
              </div>
            ))
          ) : (
            <p className="p-3 text-center text-gray-500">No new emails</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MailNotification;
