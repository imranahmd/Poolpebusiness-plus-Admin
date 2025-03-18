import React, { useState } from "react";
import propcapimg from "../img/SignUp1.svg";
import businessicon from "../img/Business Icon 1.svg";
import addbusinessicon from "../img/image 2.png";

const Propcap = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <div className="relative">
        <img className="w-full z-0 relative" src={propcapimg} alt="propcap" />


        {/* Always Visible Dialog Box */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white p-4 rounded-lg shadow-lg w-80">
          <div className="flex flex-row mb-[12rem]  items-center gap-10">
          
            <div className="ml-3">
              <img src={businessicon} alt="Placeholder" />
            </div>
            <div className="ml-[11rem]">
              <img src={addbusinessicon} alt="Placeholder" />
            </div>
          </div>


          <div>
            <h2 className="text-[#263238] text-center font-['DM_Sans'] text-2xl font-bold">
              Welcome, Progcap Merchants!
            </h2>
            <p className="text-[#263238] text-center font-['Inter'] text-base font-normal">
              Seamless Access to your Merchant Dashboard.
            </p>
          </div>

          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />

            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </div>
          <div>
            <p className="text-[#263238] font-['Inter'] text-sm font-semibold leading-[1.3125rem]">
              Forgot your Password?
            </p>
          </div>
          <div>
            <input type="checkbox" />
            <p>keep me logged in</p>
          </div>
          <div>
            <button>sign up</button>
          </div>
          <div>----or----</div>
          <div>
            <button>Connect with Google</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Propcap;
