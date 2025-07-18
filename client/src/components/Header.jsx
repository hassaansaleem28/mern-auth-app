import { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";

function Header() {
  const { userDataa } = useContext(AppContext);
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center mt-20 px-4 text-center text-gray-800">
      <img src={assets.header_img} className="w-36 h-36 rounded-full mb-6" />
      <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">
        Hey {userDataa ? userDataa.name : "Developer"}
        <img className="w-8 aspect-square" src={assets.hand_wave} />
      </h1>
      <h2 className="text-3xl sm:text-5xl mb-4 font-semibold">
        Welcome to our app
      </h2>
      <p className="mb-8 max-w-md">
        Let's start with a quick product tour and we will have you up and
        running in no time!
      </p>
      <button
        onClick={() => navigate("/login")}
        className="border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 cursor-pointer transition-all"
      >
        Get Started
      </button>
    </div>
  );
}

export default Header;
