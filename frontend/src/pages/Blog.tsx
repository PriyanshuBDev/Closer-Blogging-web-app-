import { Link, useParams } from "react-router-dom";
import { useBlog } from "../hooks/blog";
import { Appbar } from "../components/Appbar";
import { Avatar } from "../components/Avatar";
import { Date } from "../components/Date";
import { Follow } from "../components/Follow";
import { Like } from "../components/Like";
import { SavePost } from "../components/SavePost";
import { Comments } from "../components/Comments";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { TagStyle } from "../components/BlogCard";
import { useAvatar } from "../stateManagement/avatar";

export function Blog() {
  const [showComment, setShowComment] = useState(false);
  const [userComment, setUserComment] = useState("");
  const { id } = useParams();
  const { loading, blog } = useBlog({ id: id || "" });
  const fetchAvatar = useAvatar((s) => s.fetchAvatar);
  const avatar = useAvatar((s) => s.avatar);
  useEffect(() => {
    if (showComment) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showComment]);
  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);
  if (loading) {
    return (
      <div className="pt-30">
        <BlogSkeleton />
      </div>
    );
  }
  if (!blog) {
    console.log(blog);
    return <div>Blog not found</div>;
  }

  const handleComment = async () => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/blog/comment/create/${blog.id}`,
        {
          comment: userComment,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(res.data.msg);
      setUserComment("");
    } catch (e) {
      console.error("Error:", e instanceof Error ? e.message : e);
      alert("Error encountered while commenting");
    }
  };

  return (
    <div className="pb-20">
      <Appbar></Appbar>
      <div className="flex justify-center w-full pb-15 border-b-2 border-gray-100">
        <div className="flex flex-col h-full w-2xl items-start mt-40 ">
          <div className="text-5xl font-bold">{blog.title}</div>
          <div className="flex items-center gap-5 mt-10">
            {!blog.himself ? (
              <Link to={`/users/profile/${blog.authorId}`}>
                <Avatar
                  size={"sm"}
                  avatar={blog.author.profile?.imageUrl}
                ></Avatar>
              </Link>
            ) : (
              <Avatar
                size={"sm"}
                avatar={blog.author.profile?.imageUrl}
              ></Avatar>
            )}
            {!blog.himself ? (
              <Link to={`/users/profile/${blog.authorId}`}>
                <div className="text-lg hover:underline">
                  {blog.author.name}
                </div>
              </Link>
            ) : (
              <div className="text-lg hover:underline">{blog.author.name}</div>
            )}

            {blog.himself ? null : (
              <Follow
                hasFollowed={blog.followedBack}
                followingId={blog.author.id}
              ></Follow>
            )}
            <div className="text-gray-600">
              {`${Math.ceil(blog.content.length / 400)} min read  ·  `}
              <Date date={blog.createdAt} size={"md"}></Date>
            </div>
          </div>

          <div className="flex justify-between items-center min-w-2xl border-y-2 border-gray-100 py-2 pr-20 mt-10">
            <div className="flex justify-between  gap-8 pl-1">
              <Like
                hasLiked={blog.hasLiked}
                postId={blog.id}
                likeCount={blog.likeCount}
              ></Like>
              <button
                className="flex items-center gap-0.5 text-gray-400 hover:text-black cursor-pointer"
                onClick={() => setShowComment(true)}
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
                    d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                  />
                </svg>
                <div className="text-gray-400">{blog.commentCount}</div>
              </button>
            </div>
            <div>
              <SavePost hasSaved={blog.hasSaved} postId={blog.id}></SavePost>
            </div>
          </div>
          <div className="mt-10">
            <img src={blog.imgUrl} className="w-2xl" />
          </div>
          <div
            className="mt-10 text-xl leading-9"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          ></div>
          {blog.tags.length > 0 ? (
            <div className="mt-10 flex gap-5">
              <div className="text-xl font-semibold">Tags:-</div>
              {blog.tags.map((tag) => (
                <TagStyle label={tag} />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="pt-15 flex justify-center flex-col items-center">
        <div className="flex flex-col min-w-2xl max-w-3xl border-b-2 pb-10 border-gray-100">
          <div className="text-2xl font-semibold">
            Responses ({blog.commentCount})
          </div>
          <div className="mt-10">
            <div className="flex items-center text-gray-700 gap-4 text-gr">
              <Avatar size={"sm"} avatar={avatar}></Avatar> Write Your
              Responses...
            </div>
            <div className="flex items-center mt-5 gap-5">
              <div>
                <input
                  type="text"
                  value={userComment}
                  className="bg-gray-100 min-w-[38rem]  h-9 rounded-md px-4"
                  placeholder="What are your thoughts?"
                  onChange={(e) => setUserComment(e.target.value)}
                />
              </div>
              <div>
                <button
                  className="px-3 py-1.5 text-white bg-black rounded-md cursor-pointer hover:opacity-90"
                  onClick={handleComment}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5  min-w-2xl ">
          {blog.comments.length > 0 ? (
            <div>
              {blog.comments.slice(0, 3).map((comment) => (
                <Comments
                  key={comment.id}
                  name={comment.user.name}
                  avatar={comment.user.profile?.imageUrl}
                  content={comment.comment}
                  createdAt={comment.createdAt}
                  width="2xl"
                />
              ))}
              <div>
                <button
                  className="border-1 cursor-pointer text-sm rounded-full px-4 py-1.5 mt-5 hover:bg-gray-100"
                  onClick={() => setShowComment(true)}
                >
                  See all responses
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center mt-5">
              {" "}
              <div className="text-2xl text-gray-600">No comments yet</div>
              <div className="text-xl text-gray-600">Be first</div>
            </div>
          )}
        </div>
      </div>
      <div
        className={`fixed right-0 top-0 left-0 bg-black/40 flex items-center justify-end z-80 transition-opacity duration-500 ${
          showComment
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={` flex justify-center flex-col items-center transition-all duration-500 ease-in-out transform ${
            showComment
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          <div className="bg-white p-5 h-screen w-full max-w-md overflow-y-auto">
            <div className="flex flex-col   border-b-2 pb-10 border-gray-100">
              <div className="flex justify-between ">
                <div className="text-2xl font-semibold">
                  Responses ({blog.commentCount})
                </div>
                <div>
                  <button
                    onClick={() => setShowComment(false)}
                    className="mt-1 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-7 border-t-2 border-gray-100 pt-5">
                <div className="flex items-center text-gray-700 gap-4 text-gr">
                  <Avatar size={"sm"} avatar={avatar}></Avatar> Write Your
                  Responses...
                </div>
                <div className="flex flex-col mt-5 gap-5">
                  <div>
                    <input
                      type="text"
                      value={userComment}
                      className="bg-gray-100 w-sm h-9 rounded-md px-4"
                      placeholder="What are your thoughts?"
                      onChange={(e) => setUserComment(e.target.value)}
                    />
                  </div>
                  <div>
                    <button
                      className="px-3 py-1.5 text-white bg-black rounded-md cursor-pointer hover:opacity-90"
                      onClick={handleComment}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5">
              {blog.comments.length > 0 ? (
                blog.comments.map((comment) => (
                  <Comments
                    key={comment.id}
                    name={comment.user.name}
                    avatar={comment.user.profile?.imageUrl}
                    content={comment.comment}
                    createdAt={comment.createdAt}
                    width="[26rem]"
                  />
                ))
              ) : (
                <div className="flex flex-col justify-center items-center mt-5">
                  {" "}
                  <div className="text-2xl text-gray-600">No comments yet</div>
                  <div className="text-xl text-gray-600">Be first</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
