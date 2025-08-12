import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";
import axios from "axios";

interface notifiationsBinds {
  id: string;
  type: string;
  message: string;
  postId?: string;
  sender: {
    id: string;
    profile: {
      imageUrl: string;
    };
  };
  isRead: boolean;
  createdAt: string;
}

interface notificationsAxios {
  msg: string;
  notifications: notifiationsBinds[];
}

export function useNotifications(
  handleAlert: (alert: {
    msg: string;
    type: "success" | "error" | "info" | "warning";
  }) => void
) {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<
    notifiationsBinds[] | null
  >(null);
  const handleReFetchingNotifications = async () => {
    try {
      const res = await axios.get<notificationsAxios>(
        `${BACKEND_URL}/api/v1/notification/get`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setNotifications(res.data.notifications);
      console.log(res.data.msg);
    } catch (e) {
      console.error("Error:", e instanceof Error ? e.message : e);
      handleAlert({
        msg: "Error encountered while fetching notifications",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const handleFetchingNotifications = async () => {
      try {
        const res = await axios.get<notificationsAxios>(
          `${BACKEND_URL}/api/v1/notification/get`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setNotifications(res.data.notifications);
        console.log(res.data.msg);
      } catch (e) {
        console.error("Error:", e instanceof Error ? e.message : e);
        handleAlert({
          msg: "Error encountered while fetching notifications",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    handleFetchingNotifications();
  }, [handleAlert]);
  return { loading, notifications, refetch: handleReFetchingNotifications };
}

export function useNotificatinCount(
  handleAlert: (alert: {
    msg: string;
    type: "success" | "error" | "info" | "warning";
  }) => void
) {
  const [count, setCount] = useState(0);
  const timePeriod = 2 * 60 * 1000;

  useEffect(() => {
    const handleFetchingNotificationsCount = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/v1/notification/get/count`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCount(res.data.count);
      } catch (e) {
        console.error("Error:", e instanceof Error ? e.message : e);
        handleAlert({
          msg: "Error encountered while fetching periodic notifications",
          type: "error",
        });
      }
    };
    handleFetchingNotificationsCount();
    const interval = setInterval(handleFetchingNotificationsCount, timePeriod);
    return () => clearInterval(interval);
  }, [timePeriod, handleAlert]);
  return count;
}
