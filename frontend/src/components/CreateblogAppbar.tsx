import { useAvatar } from "../stateManagement/avatar";
import { useEffect } from "react";

import { Link } from "react-router-dom";
import { AppProfile } from "./Appbar";

interface prop {
  onClick: (published: boolean) => void | Promise<void>;
}

export const CreateblogAppbar: React.FC<prop> = ({ onClick }) => {
  const avatar = useAvatar((s) => s.avatar);
  const fetchAvatar = useAvatar((s) => s.fetchAvatar);
  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200 bg-white fixed w-screen top-0 z-40 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
      <Link to={"/blogs"}>
        {" "}
        <div className="font-bold text-3xl ml-4 cursor-pointer">CLOSER</div>
      </Link>

      <div className="flex items-center">
        <button
          onClick={() => {
            onClick(true);
          }}
          className="mr-10 text-white rounded-full px-4 py-1 bg-black text-lg cursor-pointer hover:opacity-80 active:scale-[.98]"
        >
          Publish
        </button>
        <button
          onClick={() => {
            onClick(false);
          }}
          className="mr-10 border-3 border-gray-400 text-gray-600 rounded-full px-4 py-0.75 text-lg cursor-pointer hover:bg-gray-200 active:scale-[.98]"
        >
          Save
        </button>
        <div className="mr-10">
          <AppProfile avatar={avatar} />
        </div>
      </div>
    </div>
  );
};
