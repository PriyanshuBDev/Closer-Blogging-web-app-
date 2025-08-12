import axios from "axios";
import { BACKEND_URL } from "../config";
import { useState } from "react";

interface liked {
  hasLiked: boolean;
  postId: string;
  likeCount: number;
}

export function Like({ hasLiked, postId, likeCount }: liked) {
  const [liked, setLiked] = useState(hasLiked);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(likeCount);
  const handleLiking = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      console.log(postId);
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/blog/like/toggle/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(res.data.msg);
      setLiked((prev) => !prev);
      if (liked) {
        setCount((c) => c - 1);
      } else {
        setCount((c) => c + 1);
      }
    } catch (e) {
      console.log("Error:", e instanceof Error ? e.message : e);
      alert("Error encountered while liking the blog");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={handleLiking}
        className="cursor-pointer"
        disabled={loading}
      >
        {liked ? (
          <svg
            className="w-6 h-6 text-red-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="m12.75 20.66 6.184-7.098c2.677-2.884 2.559-6.506.754-8.705-.898-1.095-2.206-1.816-3.72-1.855-1.293-.034-2.652.43-3.963 1.442-1.315-1.012-2.678-1.476-3.973-1.442-1.515.04-2.825.76-3.724 1.855-1.806 2.201-1.915 5.823.772 8.706l6.183 7.097c.19.216.46.34.743.34a.985.985 0 0 0 .743-.34Z" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-gray-400 hover:text-black"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"
            />
          </svg>
        )}
      </button>
      <div className="text-gray-400">{count}</div>
    </div>
  );
}
