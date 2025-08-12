import flower from "../assets/9597323.png";
import "../App.css";
import { Link } from "react-router-dom";

export function Dashboard() {
  return (
    <div className="h-screen w-screen bg-indigo-50">
      <div className="fixed top-0 left-0 right-0 border-b-2 border-gray-800 h-15 flex justify-between px-5 bg-indigo-50 z-20">
        <div className="font-bold text-5xl ml-20">CLOSER</div>
        <div className="flex gap-7 items-center">
          <Link to={"/signin"}>
            <div className="text-lg font-semibold hover:underline cursor-pointer ">
              Signin
            </div>
          </Link>
          <Link to={"/signup"}>
            {" "}
            <div className="font-semibold text-lg rounded-full bg-black text-white px-4 py-1.5  cursor-pointer hover:opacity-90">
              Get started
            </div>
          </Link>
        </div>
      </div>
      <div>
        <div className="flex justify-center items-center relative z-0 overflow-hidden pt-15">
          <img src={flower} className="w-[100vw] h-[92vh] animate-scale-up " />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-7xl text-wrap w-2xl custom-font animate-slide-up">
            {" "}
            Every story we write, read, and share brings us closer.{" "}
            <div className="text-3xl mt-5">
              This is a place for you to share your story.
            </div>
            <Link to={"/blogs"}>
              <div className="text-xl rounded-full bg-black text-white px-5 py-2 cursor-pointer hover:opacity-90 inline-block">
                Start Sharing
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
