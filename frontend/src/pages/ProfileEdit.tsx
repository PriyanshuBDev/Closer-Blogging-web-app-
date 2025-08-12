import { useEffect, useState } from "react";
import { Appbar } from "../components/Appbar";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";

interface UserDetailsAxios {
  msg: string;
  user: {
    id: string;
    name: string;
    profile: {
      bio: string;
      longBio: string;
      imageUrl: string;
    };
  };
}
export function ProfileEdit() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [longBio, setLongBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [loading, setloading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await axios.get<UserDetailsAxios>(
          `${BACKEND_URL}/api/v1/profile/get/details`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(res.data.msg);
        setName(res.data.user.name);
        setImageUrl(res.data.user.profile.imageUrl);
        setLongBio(res.data.user.profile.longBio);
        setBio(res.data.user.profile.bio);
      } catch (e) {
        console.error("Error:", e instanceof Error ? e.message : e);
        alert("Error encountered while fetching user details");
      } finally {
        setloading(false);
      }
    };
    fetchUserDetails();
  }, []);

  const handleUpdatingProfile = async () => {
    setloading(true);
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/v1/profile/update`,
        {
          name,
          bio,
          longBio,
          imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(res.data.msg);
      navigate("/profile");
    } catch (e) {
      console.error("Error:", e instanceof Error ? e.message : e);
      alert("Error encountered while updating your profile");
    } finally {
      setloading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
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
  return (
    <div className="pt-20 flex justify-center flex-col items-center pb-20">
      <Appbar></Appbar>
      <div className="flex flex-col items-center">
        <div className="text-3xl font-semibold">Setup Your Profile</div>
        <div className="flex justify-center items-center h-35 w-35 rounded-full mt-10">
          <img
            src={
              imageUrl
                ? imageUrl
                : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            }
            className="rounded-full w-35 h-35 border-2 object-cover object-center"
          />
        </div>
        <div className=" flex mt-3 gap-4">
          <div className="text-xl font-semibold">Avatar</div>{" "}
          <button
            className="text-gray-400 hover:text-black"
            onClick={() => setShowImageModal(true)}
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
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
        </div>
        <div>
          <div className="flex flex-col justify-start mt-4">
            <div className="text-xl font-medium mb-2">Name</div>
            <input
              className="border-solid border-2 border-gray-300 rounded-md text-gray-600 font-medium text-lg p-2 px-3 min-w-md"
              type="text"
              placeholder="Enter your new name"
              onChange={(e) => setName(e.target.value.trim())}
              value={name}
              maxLength={30}
            />
          </div>
          <div className="flex flex-col justify-start mt-4">
            <div className="text-xl font-medium mb-2">Short Bio</div>
            <textarea
              className="border-solid border-2 border-gray-300 rounded-md text-gray-600 font-medium text-lg p-2 px-3 min-w-md"
              placeholder="Enter your new Bio"
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              value={bio}
            />
          </div>
          <div className="flex flex-col justify-start mt-4">
            <div className="text-xl font-medium mb-2">Long Bio</div>
            <textarea
              className="border-solid border-2 border-gray-300 rounded-md text-gray-600 font-medium text-lg p-2 px-3 min-w-md"
              placeholder="Enter your new Bio"
              onChange={(e) => setLongBio(e.target.value)}
              maxLength={600}
              value={longBio}
            />
          </div>
        </div>
        <div className="mt-10">
          <Button
            placeholder="Done"
            onClick={() => handleUpdatingProfile()}
          ></Button>
        </div>
      </div>
      {showImageModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 ">
          <div className="bg-white p-6 rounded shadow-lg space-y-4 w-full max-w-sm">
            <h2 className="text-lg font-bold">Insert Image</h2>
            <input
              type="text"
              value={tempImageUrl}
              onChange={(e) => setTempImageUrl(e.target.value.trim())}
              placeholder="Paste image URL here"
              className="w-full border p-2 rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (tempImageUrl.trim() !== " " && tempImageUrl.length > 0) {
                    setImageUrl(tempImageUrl);
                    setShowImageModal(false);
                  }
                }}
                className="bg-black text-white px-3 py-1 rounded"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
