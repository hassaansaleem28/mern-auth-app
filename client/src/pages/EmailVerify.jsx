import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../contexts/AppContext";
import axios from "axios";
import { useState } from "react";

function EmailVerify() {
  const inputRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const { backendUrl, isloggedIn, userDataa, getUserData } =
    useContext(AppContext);
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  function handleInput(e, index) {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  }
  function handleKeydown(e, index) {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }
  function handlePaste(e) {
    const paste = e.clipboardData.getData("text");
    const pasteArr = paste.split("");
    pasteArr.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  }
  async function handleSubmit(e) {
    try {
      e.preventDefault();
      const otpArray = inputRefs.current.map(e => e.value);
      const OTP = otpArray.join("");
      setIsLoading(true);

      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-email",
        {},
        {
          headers: { "x-otp": OTP, "Content-Type": "application/json" },
        }
      );
      if (data.success) {
        setIsLoading(false);
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
        setIsLoading(false);
      }
    } catch (err) {
      toast.error(err.message);
      setIsLoading(false);
    }
  }
  useEffect(
    function () {
      isloggedIn && userDataa && userDataa.isAccountVerified && navigate("/");
    },
    [userDataa, isloggedIn]
  );
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        src={assets.logo}
        onClick={() => navigate("/")}
        alt="app logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6 digit code sent to your email id.
        </p>
        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type="text"
                required
                ref={e => (inputRefs.current[index] = e)}
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                maxLength={1}
                key={index}
                onInput={e => handleInput(e, index)}
                onKeyDown={e => handleKeydown(e, index)}
              />
            ))}
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer">
          {isLoading ? "Wait..." : "Verify email"}
        </button>
      </form>
    </div>
  );
}

export default EmailVerify;
