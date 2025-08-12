import { Date } from "./Date";
import { TagStyle } from "./BlogCard";
import { Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useState } from "react";
import { CustomAlert } from "./CustomAlert";

interface UserDraftBind {
  id: string;
  title: string;
  content: string;
  mainImg?: string;
  updatedAt: string;
  tags: string[];
  refetch: () => void;
}
function stripHtmlTags(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}
export function DraftCard({
  id,
  title,
  content,
  mainImg,
  updatedAt,
  tags,
  refetch,
}: UserDraftBind) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alert, setAlert] = useState<null | {
    msg: string;
    type: "success" | "error" | "info" | "warning";
  }>(null);
  const handleAlert = ({
    msg,
    type,
  }: {
    msg: string;
    type: "success" | "error" | "info" | "warning";
  }) => {
    setAlert({ msg, type });
  };
  const handleDelete = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/blog/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Blog was successfully deleted");
      handleAlert({ msg: "Blog was successfully deleted", type: "success" });
    } catch (e) {
      console.error("Error:", e instanceof Error ? e.message : e);
      handleAlert({
        msg: "Error encountered while deleting the blog",
        type: "error",
      });
    }
  };
  return (
    <div className="border-2 border-gray-200 p-5 rounded-md w-2xl mt-6">
      {alert && (
        <CustomAlert
          msg={alert.msg}
          type={alert.type}
          onClose={() => {
            setAlert(null);
          }}
        />
      )}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex items-center gap-2">
          {" "}
          <div>Last updated:-</div>
          <Date date={updatedAt} size={"sm"}></Date>
        </div>
      </div>
      {mainImg ? (
        <div className="w-full h-40">
          <img src={mainImg} className="w-full h-full object-cover shadow-sm" />
        </div>
      ) : (
        <div className="w-full h-40 bg-gray-300 flex justify-center items-center text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-8"
          >
            <path
              fillRule="evenodd"
              d="M3.05 3.05a7 7 0 1 1 9.9 9.9 7 7 0 0 1-9.9-9.9Zm1.627.566 7.707 7.707a5.501 5.501 0 0 0-7.707-7.707Zm6.646 8.768L3.616 4.677a5.501 5.501 0 0 0 7.707 7.707Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
      {title.length > 0 ? (
        <div className="text-2xl font-semibold mt-3 ">{title}</div>
      ) : (
        <div className="text-2xl font-semibold mt-3 ">Untitled</div>
      )}
      {stripHtmlTags(content).length > 0 ? (
        <div className="text-lg text-wrap leading-6 text-gray-700 mt-2">
          {(() => {
            const plainText = stripHtmlTags(content);
            return plainText.length > 100
              ? `${plainText.slice(0, 100)}...`
              : plainText;
          })()}
        </div>
      ) : (
        <div className="text-lg text-wrap leading-6 text-gray-700 mt-2">
          {" "}
          No content
        </div>
      )}
      <div className="mt-3 ">
        {tags && tags.length != 0 ? (
          tags.length > 1 ? (
            <div className="flex gap-3">
              <TagStyle label={tags[0]}></TagStyle>
              <TagStyle label={tags[1]}></TagStyle>
            </div>
          ) : (
            <TagStyle label={tags[0]}></TagStyle>
          )
        ) : (
          <></>
        )}
      </div>
      <div className="flex items-center gap-5 mt-2">
        <Link to={`/blog/edit/${id}`}>
          <button className="px-3 py-1 hover:opacity-90 text-white bg-black rounded-md cursor-pointer">
            Edit
          </button>
        </Link>
        <button
          className="px-3 py-1 hover:opacity-90 text-white bg-black rounded-md cursor-pointer"
          onClick={() => {
            setShowDeleteModal(true);
          }}
        >
          Delete
        </button>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 ">
          <div className="bg-white p-6 rounded shadow-lg space-y-4 w-full max-w-sm">
            <h2 className="text-lg font-bold">
              Are you sure you want to delete this?
            </h2>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowDeleteModal(false);
                  refetch();
                }}
                className="bg-black text-white px-3 py-1 rounded hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
