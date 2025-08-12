import axios from "axios";
import { BACKEND_URL } from "../config";
import { useState } from "react";

interface follow {
  hasFollowed: boolean;
  followingId: string;
}
export function Follow({ hasFollowed, followingId }: follow) {
  const [followed, setFollowed] = useState(hasFollowed);
  const [loading, setLoading] = useState(false);
  async function handleFollowing() {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/user/follow/${followingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(res.data.msg);
      setFollowed((prev) => !prev);
    } catch (e) {
      console.error("Error", e instanceof Error ? e.message : e);
      alert("Error encountered while follow/unfollow");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        className={`border rounded-full px-3 py-1 cursor-pointer ${
          followed
            ? "hover:bg-gray-100"
            : "bg-black text-white hover:opacity-90"
        }`}
        onClick={handleFollowing}
        disabled={loading}
      >
        {followed ? "Following" : "Follow"}
      </button>
    </div>
  );
}
