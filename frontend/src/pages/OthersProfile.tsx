import { useState } from "react";
import { Appbar } from "../components/Appbar";
import { Date } from "../components/Date";
import { Followers } from "../components/Followers";
import { Followings } from "../components/Followings";
import { Link, useParams } from "react-router-dom";
import { Follow } from "../components/Follow";
import { Avatar } from "../components/Avatar";
import { useOtherUser } from "../hooks/user";
import { UserBlog } from "../components/UserBlog";
import "../App.css";

export function OthersProfile() {
  const { id } = useParams();
  const [postActive, setPostActive] = useState(true);
  const [followersActive, setFollowersActive] = useState(false);
  const [followingsActive, setFollowingsActive] = useState(false);
  const [aboutActive, setAboutActive] = useState(false);
  const { loading, blogs, user, followers } = useOtherUser({ id: id || "" });
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
  return (
    <div className="pt-10 flex justify-center flex-col items-center ">
      <Appbar></Appbar>
      <div className="grid grid-cols-7 w-screen">
        <div className="col-span-5 h-screen border-r-2 border-gray-200 max-lg:col-span-7 flex items-center flex-col mt-5 othersProfile overflow-y-scroll max-h-200 pb-15">
          <div className="flex w-2xl mt-10">
            <div className="text-5xl font-semibold">{user?.name}</div>
          </div>
          <div className="flex w-2xl border-b-2 border-gray-200 gap-8 mt-8 ">
            <button
              className={`py-2 cursor-pointer hover:text-black ${
                postActive ? "text-black border-b-2" : "text-gray-600"
              }`}
              onClick={() => {
                setPostActive(true);
                setAboutActive(false);
                setFollowersActive(false);
                setFollowingsActive(false);
              }}
            >
              Posts
            </button>
            <button
              className={`py-2 cursor-pointer hover:text-black ${
                aboutActive ? "text-black border-b-2" : "text-gray-600"
              }`}
              onClick={() => {
                setPostActive(false);
                setAboutActive(true);
                setFollowersActive(false);
                setFollowingsActive(false);
              }}
            >
              About
            </button>
            <button
              className={`py-2 cursor-pointer hover:text-black ${
                followersActive ? "text-black border-b-2" : "text-gray-600"
              }`}
              onClick={() => {
                setPostActive(false);
                setAboutActive(false);
                setFollowingsActive(false);
                setFollowersActive(true);
              }}
            >
              Followers
            </button>
            <button
              className={`py-2 cursor-pointer hover:text-black ${
                followingsActive ? "text-black border-b-2" : "text-gray-600"
              }`}
              onClick={() => {
                setPostActive(false);
                setAboutActive(false);
                setFollowersActive(false);
                setFollowingsActive(true);
              }}
            >
              Followings
            </button>
          </div>
          {postActive &&
            (blogs && blogs?.length > 0 ? (
              <div>
                {blogs.map((blog) => (
                  <UserBlog
                    key={blog.id}
                    title={blog.title}
                    id={blog.id}
                    content={blog.content}
                    commentCount={blog.commentCount}
                    likeCount={blog.likeCount}
                    hasLiked={blog.hasLiked}
                    hasSaved={blog.hasSaved}
                    tags={blog.tags}
                    authorName={user?.name || "unknown"}
                    createdAt={blog.createdAt}
                    mainImg={blog.imgUrl}
                    avatar={user?.profile.imageUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="flex justify-center mt-20 text-2xl text-gray-700">
                No Posts
              </div>
            ))}
          {aboutActive && (
            <div className="flex justify-center flex-col items-center w-[63%]">
              <div className="text-wrap text-xl  mt-6 pb-10 border-b-2 border-gray-100">
                {user?.profile.longBio}
              </div>
              <div className="flex items-center mt-10 justify-start w-full gap-5 text-lg">
                <div
                  className="hover:underline"
                  onClick={() => {
                    setAboutActive(false);
                    setFollowersActive(true);
                  }}
                >
                  {user?.followersCount} followers
                </div>
                <div>•</div>
                <div
                  className="hover:underline"
                  onClick={() => {
                    setAboutActive(false);
                    setFollowingsActive(true);
                  }}
                >
                  {user?.followingsCount} followings
                </div>
              </div>
            </div>
          )}
          {followersActive && <Followers id={user?.id || ""} />}
          {followingsActive && <Followings id={user?.id || ""} />}
        </div>
        <div className="max-lg:invisible flex flex-col px-5 col-span-2">
          <div className="w-28 h-28 rounded-full bg-gray-100 mt-15 ">
            <img
              src={user?.profile.imageUrl}
              alt=""
              className="w-28 h-28 rounded-full object-center object-cover"
            />
          </div>
          <div className="text-2xl mt-6 font-bold">{user?.name}</div>
          <div className="text-gray-600">
            Member since{" "}
            <Date date={user?.createdAt ?? "0000-00-00"} size={"sm"}></Date>
          </div>
          <div
            className="hover:underline hover:text-black text-gray-400 mt-2 text-lg  cursor-pointer w-25"
            onClick={() => {
              setPostActive(false);
              setAboutActive(false);
              setFollowingsActive(false);
              setFollowersActive(true);
            }}
          >
            {user?.followersCount} followers
          </div>
          <div className="mt-5">{user?.profile.bio}</div>

          {user ? (
            <div className="mt-4">
              <Follow
                hasFollowed={user?.hasFollowed}
                followingId={user?.id}
              ></Follow>
            </div>
          ) : null}

          <div className="mt-7 font-semibold text-lg">Followers</div>
          <div>
            {followers &&
              followers?.length > 0 &&
              followers.map((f) => (
                <FollowersCard
                  key={f.id}
                  avatar={f.profile.imageUrl}
                  name={f.name}
                  hasFollowed={f.hasFollowed}
                  followingId={f.id}
                  himself={f.himself}
                  followersCount={f.followersCount}
                  id={f.id}
                  bio={f.profile.bio}
                />
              ))}
          </div>
          {followers && followers?.length > 5 ? (
            <div
              className=" py-0.5 border-2 text-gray-500 hover:bg-gray-100 hover:border-black hover:text-black w-20 rounded-full border-gray-500 flex justify-center cursor-pointer mt-4"
              onClick={() => {
                setPostActive(false);
                setAboutActive(false);
                setFollowingsActive(false);
                setFollowersActive(true);
              }}
            >
              See all
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FollowersCard({
  id,
  avatar,
  name,
  hasFollowed,
  followingId,
  himself,
  followersCount,
  bio,
}: {
  id: string;
  avatar: string;
  name: string;
  hasFollowed: boolean;
  followingId: string;
  himself: boolean;
  followersCount: number;
  bio: string;
}) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  return (
    <div className="flex gap-5 mt-3 relative max-w-90">
      <div className="w-10">
        {!himself ? (
          <Link to={`/users/profile/${id}`}>
            <Avatar size={"sm"} avatar={avatar}></Avatar>
          </Link>
        ) : (
          <Avatar size={"sm"} avatar={avatar}></Avatar>
        )}
      </div>
      <div className="flex justify-between w-full">
        <div>
          {!himself ? (
            <Link to={`/users/profile/${id}`}>
              <div>{name}</div>
            </Link>
          ) : (
            <div>{name}</div>
          )}
        </div>

        <button
          onClick={() => setShowProfileModal((prev) => !prev)}
          className=" cursor-pointer"
        >
          <svg
            className="w-6 h-6 text-gray-800"
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
              strokeWidth="4"
              d="M6 12h.01m6 0h.01m5.99 0h.01"
            />
          </svg>
        </button>
        <div
          className={` absolute bottom-10 p-5 bg-white rounded-md shadow-sm ${
            showProfileModal ? "visible" : "invisible pointer-events-none"
          }`}
        >
          <div className="flex justify-between items-center w-full">
            <Avatar size="lg" avatar={avatar} />
            {himself ? null : (
              <div className="ml-15">
                <Follow
                  hasFollowed={hasFollowed}
                  followingId={followingId}
                ></Follow>
              </div>
            )}
          </div>
          {himself ? (
            <Link to={`/profile`}>
              <div className="text-md mt-2 font-medium hover:underline">
                {name}
              </div>
            </Link>
          ) : (
            <Link to={`/users/profile/${id}`}>
              <div className="text-md mt-2 font-medium hover:underline">
                {name}
              </div>
            </Link>
          )}
          <div className="flex items-center gap-1">
            <div className="text-sm">{followersCount}</div>{" "}
            <div className="text-sm text-gray-600">followers</div>
          </div>
          <div className="text-sm mt-3">{bio}</div>
        </div>
      </div>
    </div>
  );
}
