import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

interface FollowersBind {
  id: string;
  name: string;
  imageUrl: string;
  bio: string;
  followedBack: boolean;
  himself: boolean;
}

interface FollowersAxios {
  msg: string;
  users: FollowersBind[];
  total: number;
}

interface FollowingsBind {
  id: string;
  name: string;
  imageUrl: string;
  bio: string;
  followedBack: boolean;
  himself: boolean;
}
interface FollowingsAxios {
  msg: string;
  users: FollowingsBind[];
  total: number;
}

export function useFollowers(id: string) {
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState<FollowersBind[] | null>(null);

  useEffect(() => {
    const handleFetchingFollowers = async () => {
      try {
        const res = await axios.get<FollowersAxios>(
          `${BACKEND_URL}/api/v1/user/follower/get/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(res.data.msg);
        setFollowers(res.data.users);
      } catch (e) {
        console.error("Error:", e instanceof Error ? e.message : e);
        alert("Error encountered while fetching followers");
      } finally {
        setLoading(false);
      }
    };
    handleFetchingFollowers();
  }, [id]);
  return { loading, followers };
}

export function useFollowings(id: string) {
  const [loading, setLoading] = useState(true);
  const [followings, setFollowings] = useState<FollowingsBind[] | null>(null);

  useEffect(() => {
    const handleFetchingFollowers = async () => {
      try {
        const res = await axios.get<FollowingsAxios>(
          `${BACKEND_URL}/api/v1/user/following/get/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(res.data.msg);
        setFollowings(res.data.users);
      } catch (e) {
        console.error("Error:", e instanceof Error ? e.message : e);
        alert("Error encountered while fetching followings");
      } finally {
        setLoading(false);
      }
    };
    handleFetchingFollowers();
  }, [id]);
  return { loading, followings };
}
