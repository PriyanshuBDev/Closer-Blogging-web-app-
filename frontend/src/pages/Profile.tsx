import { useState } from "react";
import { Appbar } from "../components/Appbar";
import { UserBlog } from "../components/UserBlog";
import { useUser } from "../hooks/user";
import { Date } from "../components/Date";
import axios from "axios";
import { BACKEND_URL } from "../config";
import type { Tag } from "../hooks/blog";
import { UsersBlogCard } from "../components/UsersBlogCard";
import { Followers } from "../components/Followers";
import { Followings } from "../components/Followings";
import { Link } from "react-router-dom";
import type { draftsAxios, draftBinds } from "../hooks/draft";
import { DraftCard } from "../components/DraftCard";
import { CustomAlert } from "../components/CustomAlert";

interface savedPostAxios {
  msg: string;
  blogs: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    authorId: string;
    author: {
      name: string;
      profile: {
        imageUrl: string;
      };
    };
    imgUrl: string;
    tags: Tag[];
    likeCount: number;
    commentCount: number;
    hasLiked: boolean;
    hasFollowed: boolean;
    himself: boolean;
    userId: string;
  }[];
  total: number;
}

interface SavedPostBinds {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: {
    name: string;
    profile: {
      imageUrl: string;
    };
  };
  imgUrl: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  hasFollowed: boolean;
  himself: boolean;
  userId: string;
}

export function Profile() {
  const [postActive, setPostActive] = useState(true);
  const [savedActive, setSavedActive] = useState(false);
  const [draftActive, setDraftActive] = useState(false);
  const [savedPostLoading, setSavedPostLoading] = useState(false);
  const [savedPosts, setSavedPosts] = useState<SavedPostBinds[] | null>(null);
  const { loading, blogs, user } = useUser();
  const [followersActive, setFollowersActive] = useState(false);
  const [followingsActive, setFollowingsActive] = useState(false);
  const [drafts, setDrafts] = useState<draftBinds[] | []>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
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

  const handleFetchingDrafts = async () => {
    try {
      const res = await axios.get<draftsAxios>(
        `${BACKEND_URL}/api/v1/blog/draft`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const drafts = res.data.drafts.map((draft) => ({
        ...draft,
        tags: draft.tags.map((tag) => tag.name),
      }));
      setDrafts(drafts);
      console.log(res.data.msg);
    } catch (e) {
      console.error("Error:", e instanceof Error ? e.message : e);
      handleAlert({
        msg: "Error encountered while fetching drafts",
        type: "error",
      });
    } finally {
      setDraftsLoading(false);
    }
  };

  const handleFetchingSavedPost = async () => {
    try {
      const res = await axios.get<savedPostAxios>(
        `${BACKEND_URL}/api/v1/blog/saved/get`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(res.data.msg);
      const rawBlogs = res.data.blogs;
      const savedBlogs: SavedPostBinds[] = rawBlogs.map((blog) => ({
        ...blog,
        tags: blog.tags.map((tag) => tag.name),
      }));
      setSavedPosts(savedBlogs);
      console.log(savedBlogs);
    } catch (e) {
      console.error("Error:", e instanceof Error ? e.message : e);
      handleAlert({
        msg: "Error encountered while fetching saved posts",
        type: "error",
      });
    } finally {
      setSavedPostLoading(false);
    }
  };

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
      <div className="w-3xl flex flex-col justify-center ">
        <div className="flex ">
          <div className="flex flex-col w-xl gap-y-3">
            <div className="flex items-center gap-7">
              <div className="text-4xl font-semibold">{user?.name}</div>
              <div>
                <Link to={"/profile/edit"}>
                  <button className="px-3 py-0.5 border-2 rounded-md border-gray-300 cursor-pointer hover:bg-gray-100">
                    Edit Profile
                  </button>
                </Link>
              </div>
            </div>
            {user?.profile?.bio ? (
              <div className="text-lg font-medium text-gray-700">
                {user?.profile.bio}
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-700">No Bio</div>
            )}
            <div className="text-gray-600">
              Member since{" "}
              <Date date={user?.createdAt ?? "0000-00-00"} size={"sm"}></Date>
            </div>
          </div>
          {user?.profile.imageUrl ? (
            <div className="w-37 h-37 rounded-full p-1 bg-gradient-to-tr from-gray-400 via-gray-600 to-gray-800 ml-5 mt-2">
              <img
                src={user.profile.imageUrl}
                className="rounded-full h-full w-full object-cover object-center   bg-white"
              />
            </div>
          ) : (
            <div className="w-37 h-37 rounded-full p-1 bg-gradient-to-tr from-gray-400 via-gray-600 to-gray-800 ml-5 mt-2">
              <img
                src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                className="rounded-full h-full w-full    bg-white"
              />
            </div>
          )}
        </div>

        <div className="text-gray-600  flex gap-5 ">
          <div
            className="hover:underline cursor-pointer"
            onClick={() => {
              setPostActive(false);
              setDraftActive(false);
              setSavedActive(false);
              setFollowingsActive(false);
              setFollowersActive(true);
            }}
          >
            {user?.followers} Followers
          </div>
          <div
            className="hover:underline cursor-pointer"
            onClick={() => {
              setPostActive(false);
              setDraftActive(false);
              setSavedActive(false);
              setFollowersActive(false);
              setFollowingsActive(true);
            }}
          >
            {user?.following} Following
          </div>
        </div>
      </div>
      <div className="flex w-3xl border-b-2 border-gray-200 gap-8 mt-10">
        <button
          className={`py-2 cursor-pointer text-lg hover:text-black ${
            postActive ? "text-black border-b-2" : "text-gray-600"
          }`}
          onClick={() => {
            setPostActive(true);
            setDraftActive(false);
            setSavedActive(false);
            setFollowersActive(false);
            setFollowingsActive(false);
          }}
        >
          Posts
        </button>
        <button
          className={`py-2 cursor-pointer text-lg hover:text-black ${
            savedActive ? "text-black border-b-2" : "text-gray-600"
          }`}
          onClick={() => {
            setPostActive(false);
            setDraftActive(false);
            setSavedActive(true);
            setSavedPostLoading(true);
            setFollowersActive(false);
            setFollowingsActive(false);
            handleFetchingSavedPost();
          }}
        >
          Saved
        </button>
        <button
          className={`py-2 cursor-pointer text-lg hover:text-black ${
            draftActive ? "text-black border-b-2" : "text-gray-600"
          }`}
          onClick={() => {
            setPostActive(false);
            setDraftActive(true);
            setDraftsLoading(true);
            setSavedActive(false);
            setFollowersActive(false);
            setFollowingsActive(false);
            handleFetchingDrafts();
          }}
        >
          Draft
        </button>
        <button
          className={`py-2 cursor-pointer text-lg hover:text-black ${
            followersActive ? "text-black border-b-2" : "text-gray-600"
          }`}
          onClick={() => {
            setPostActive(false);
            setDraftActive(false);
            setSavedActive(false);
            setFollowingsActive(false);
            setFollowersActive(true);
          }}
        >
          Followers
        </button>
        <button
          className={`py-2 cursor-pointer text-lg hover:text-black ${
            followingsActive ? "text-black border-b-2" : "text-gray-600"
          }`}
          onClick={() => {
            setPostActive(false);
            setDraftActive(false);
            setSavedActive(false);
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
      {savedPostLoading && (
        <div className="flex justify-center mt-60">
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
      )}
      {!savedPostLoading &&
        savedActive &&
        (savedPosts && savedPosts?.length > 0 ? (
          <div>
            {savedPosts.map((s) => (
              <UsersBlogCard
                key={s.id}
                title={s.title}
                id={s.id}
                content={s.content}
                commentCount={s.commentCount}
                likeCount={s.likeCount}
                hasLiked={s.hasLiked}
                hasSaved={true}
                authorId={s.authorId}
                authorName={s.author.name}
                avatar={s.author.profile?.imageUrl}
                mainImg={s.imgUrl}
                himself={s.himself}
                tags={s.tags}
                createdAt={s.createdAt}
                hasFollowed={s.hasFollowed}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center mt-20 text-2xl text-gray-700">
            No Saved Blogs
          </div>
        ))}
      {draftsLoading && (
        <div className="flex justify-center mt-60">
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
      )}
      {!draftsLoading &&
        draftActive &&
        (drafts && drafts?.length > 0 ? (
          <div>
            {drafts.map((d) => (
              <DraftCard
                key={d.id}
                id={d.id}
                title={d.title}
                tags={d.tags}
                content={d.content}
                updatedAt={d.updatedAt}
                mainImg={d.imgUrl}
                refetch={handleFetchingDrafts}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center mt-20 text-2xl text-gray-700">
            No Drafts
          </div>
        ))}
      {followersActive && <Followers id={user?.id || ""} />}
      {followingsActive && <Followings id={user?.id || ""} />}
    </div>
  );
}
