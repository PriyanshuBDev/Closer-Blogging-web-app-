import axios from "axios";
import { Appbar } from "../components/Appbar";
import { Avatar } from "../components/Avatar";
import { BACKEND_URL } from "../config";
import { useNotifications } from "../hooks/notifications";
import { Link } from "react-router-dom";
import { useCallback, useState } from "react";
import { CustomAlert } from "../components/CustomAlert";

export function Notifications() {
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
  const { loading, notifications, refetch } = useNotifications(handleAlert);
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-70 ">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-10 h-10 text-gray-200 animate-spin  fill-black"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  const handleMarkingAllRead = async () => {
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/v1/notification/all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(res.data.msg);
    } catch (e) {
      console.error("Error:", e instanceof Error ? e.message : e);
      handleAlert({
        msg: "Error encountered while marking all notifications as read",
        type: "error",
      });
    }
  };
  return (
    <div className="pt-30 flex justify-center flex-col items-center pb-20">
      {alert && (
        <CustomAlert
          msg={alert.msg}
          type={alert.type}
          onClose={() => {
            setAlert(null);
          }}
        />
      )}
      <Appbar></Appbar>
      <div className="flex items-center flex-col w-2xl">
        <div className="w-full flex justify-between items-center">
          <div className="text-4xl font-semibold">All Notifications</div>
          {notifications && notifications?.length > 0 ? (
            <button
              onClick={async () => {
                await handleMarkingAllRead();
                refetch();
              }}
              className="hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          ) : null}
        </div>
        {notifications && notifications.length > 0 ? (
          <div className="mt-3">
            {notifications.map((n) => (
              <Notification
                key={n.id}
                avatar={n.sender.profile.imageUrl}
                message={n.message}
                id={n.id}
                userId={n.sender.id}
                refetch={refetch}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center mt-20 text-2xl text-gray-700">
            No new notifications
          </div>
        )}
      </div>
    </div>
  );
}

interface NotificationBind {
  avatar: string;
  message: string;
  id: string;
  userId: string;
  refetch: () => void;
}

function Notification({
  avatar,
  message,
  id,
  userId,
  refetch,
}: NotificationBind) {
  const handleNotificationReadState = async () => {
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/v1/notification/read/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(res.data.msg);
    } catch (e) {
      console.error("Error:", e instanceof Error ? e.message : e);
      alert("Error encountered while marking notification as read");
    }
  };
  return (
    <div className="flex w-2xl px-4 py-2 mt-5 rounded-md bg-gray-200 gap-5 items-center">
      <Link to={`/users/profile/${userId}`}>
        <Avatar avatar={avatar} size="sm"></Avatar>
      </Link>
      <div className="flex items-center justify-between w-full">
        <div className="text-wrap">{message}</div>
        <div
          onClick={async () => {
            await handleNotificationReadState();
            refetch();
          }}
          className="cursor-pointer ml-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
