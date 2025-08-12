import axios from "axios";
import { useState } from "react";
import { BACKEND_URL } from "../config";

interface savePostBinds {
  hasSaved: boolean;
  postId: string;
}

export function SavePost({ hasSaved, postId }: savePostBinds) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(hasSaved);
  const handleSaving = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/blog/saved/toggle/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(res.data.msg);
      setSaved((prev) => !prev);
    } catch (e) {
      console.error("Error:", e instanceof Error ? e.message : e);
      alert("Error encountered while saving the post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className="cursor-pointer"
        onClick={handleSaving}
        disabled={loading}
      >
        {saved ? (
          <svg
            className="w-6 h-6 text-gray-500 "
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M7.833 2c-.507 0-.98.216-1.318.576A1.92 1.92 0 0 0 6 3.89V21a1 1 0 0 0 1.625.78L12 18.28l4.375 3.5A1 1 0 0 0 18 21V3.889c0-.481-.178-.954-.515-1.313A1.808 1.808 0 0 0 16.167 2H7.833Z" />
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
              d="m17 21-5-4-5 4V3.889a.92.92 0 0 1 .244-.629.808.808 0 0 1 .59-.26h8.333a.81.81 0 0 1 .589.26.92.92 0 0 1 .244.63V21Z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
