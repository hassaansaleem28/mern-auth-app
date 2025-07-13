import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext } from "react";
import { AppContext } from "../contexts/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

function NavBar() {
  const navigate = useNavigate();
  const { userDataa, setIsloggedIn, backendUrl, setUserDataa } =
    useContext(AppContext);

  async function Logout() {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      data.success && setIsloggedIn(false);
      data.success && setUserDataa(false);
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function sendVerificationOtp() {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp"
      );
      if (data.success) {
        navigate("/verify-email");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="flex w-full justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img src={assets.logo} alt="" className="w-28 sm:w-32" />
      {userDataa ? (
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
          {userDataa.name[0].toUpperCase()}
          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10 cursor-pointer">
            <ul className="list-none m-0 p-2 w-30 bg-gray-100 text-sm">
              {!userDataa.isAccountVerified && (
                <li
                  onClick={sendVerificationOtp}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                >
                  Verify Email
                </li>
              )}

              <li
                onClick={Logout}
                className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
              >
                Log out
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer transition-all"
        >
          Login <img src={assets.arrow_icon} alt="arrow-icon" />
        </button>
      )}
    </div>
  );
}

export default NavBar;
