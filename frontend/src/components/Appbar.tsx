import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar } from "./Avatar";
import { useAvatar } from "../stateManagement/avatar";
import { useNotificatinCount } from "../hooks/notifications";
import { CustomAlert } from "./CustomAlert";

export function Appbar() {
  const [active, setActive] = useState(false);
  const [searchType, setSearchType] = useState("Blogs");
  const avatar = useAvatar((s) => s.avatar);
  const fetchAvatar = useAvatar((s) => s.fetchAvatar);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();
  const [alert, setAlert] = useState<null | {
    msg: string;
    type: "success" | "error" | "info" | "warning";
  }>(null);
  const handleAlert = useCallback(
    (alert: {
      msg: string;
      type: "success" | "error" | "info" | "warning";
    }) => {
      setAlert(alert);
      setTimeout(() => setAlert(null), 3000);
    },
    []
  );
  const count = useNotificatinCount(handleAlert);

  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);
  const handleLogOut = () => {
    handleAlert({ msg: "You have been logged out", type: "info" });
    setTimeout(() => {
      localStorage.removeItem("token");
      navigate("/signin");
    }, 2000);
  };
  return (
    <div className="flex items-center px-4 py-2 border-b-2 border-gray-200 bg-white fixed w-screen top-0 z-50 justify-between">
      {alert && (
        <CustomAlert
          msg={alert.msg}
          type={alert.type}
          onClose={() => {
            setAlert(null);
          }}
        />
      )}
      <Link to={"/blogs"}>
        {" "}
        <div className="font-bold text-3xl ml-4 mr-10 cursor-pointer">
          CLOSER
        </div>
      </Link>
      <div className="flex justify-between w-full">
        <form
          className=" flex-1 max-w-lg "
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex">
            <label
              htmlFor="search-dropdown"
              className="mb-2 text-sm font-medium text-gray-900 sr-only"
            >
              Search Categories
            </label>
            <button
              id="dropdown-button"
              onClick={() => setActive((prev: boolean) => !prev)}
              className=" cursor-pointer shrink-0 z-10 inline-flex justify-center items-center w-31 py-2.5 px-7 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100"
              type="button"
            >
              {searchType}{" "}
              <svg
                className="w-2.5 h-2.5 ms-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
            <div
              id="dropdown"
              className={`z-10 absolute top-13 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-31 ${
                active ? "" : "hidden"
              }`}
            >
              <ul
                className="py-2 text-sm text-gray-700"
                aria-labelledby="dropdown-button"
              >
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(false);
                      setSearchType("Users");
                    }}
                    className="inline-flex w-full px-9 py-2  hover:bg-gray-100 border-b-2 border-gray-100"
                  >
                    Users
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(false);
                      setSearchType("Blogs");
                    }}
                    className="inline-flex w-full px-9 py-2 hover:bg-gray-100 border-b-2 border-gray-100"
                  >
                    Blogs
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(false);
                      setSearchType("Tags");
                    }}
                    className="inline-flex w-full px-9 py-2 hover:bg-gray-100"
                  >
                    Tags
                  </button>
                </li>
              </ul>
            </div>
            <div className="relative w-full">
              <input
                type="search"
                id="search-dropdown"
                className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
                placeholder="Search Users or Blogs"
                required
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <button
                type="submit"
                className="cursor-pointer absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white bg-black rounded-e-lg border border-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 "
                onClick={() => {
                  if (filter != "") {
                    if (searchType === "Users") {
                      navigate(`/users/filter/${filter}`);
                    } else if (searchType === "Blogs") {
                      navigate(`/blogs/${filter}`);
                    } else {
                      navigate(`/tags/${filter}`);
                    }
                  }
                }}
              >
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
                <span className="sr-only">Search</span>
              </button>
            </div>
          </div>
        </form>
        <div className="mr-4 gap-6 flex items-center">
          <Link to={"/blogs/create"}>
            <button className="text-gray-500 hover:text-black flex items-center gap-2 text-lg cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              write
            </button>
          </Link>
          <div className="relative">
            <Link to={"/notifications"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
              {count > 0 && count < 99 && (
                <span className="absolute top-0 right-0 text-xs bg-red-500 text-white rounded-full px-1">
                  {" "}
                  {count}
                </span>
              )}
              {count > 99 && (
                <span className="absolute top-0 right-0 text-xs bg-red-500 text-white rounded-full px-1">
                  {" "}
                  99+
                </span>
              )}
            </Link>
          </div>
          <AppProfile avatar={avatar} />
          <button
            className="flex items-center justify-center rounded-full px-2 py-2 bg-gray-200 text-gray-500 cursor-pointer"
            onClick={handleLogOut}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-7"
            >
              <path
                fillRule="evenodd"
                d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

interface AppProfileProps {
  avatar: string;
}
export const AppProfile = React.memo(({ avatar }: AppProfileProps) => {
  return (
    <Link to={"/profile"}>
      <Avatar avatar={avatar} size={"md"}></Avatar>
    </Link>
  );
});
