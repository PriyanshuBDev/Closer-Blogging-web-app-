import { useBlogs } from "../hooks/blog";
import { BlogCard, TagStyle } from "../components/BlogCard";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useCallback, useState } from "react";
import { Appbar } from "../components/Appbar";
import { Pagination } from "../components/Pagination";
import { Repeat } from "../helperComponents/Repeat";
import { Skeleton } from "../components/Skeleton";
import type { Tag } from "../hooks/blog";
import type { fullBlogs } from "../hooks/blog";
import "../App.css";
import { FollowersCard } from "./OthersProfile";
import { useNewUsers, useTrendingTags } from "../hooks/dashboard";

interface BlogRaw {
  title: string;
  content: string;
  id: string;
  authorId: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    profile: {
      imageUrl: string;
    };
  };
  tags: Tag[];
  imgUrl?: string;
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  hasSaved: boolean;
  followedBack: boolean;
  himself: boolean;
}

export interface BlogAxiosRes {
  msg: string;
  blogs: BlogRaw[];
  page: number;
  pageSize: number;
  totalPage: number;
  total: number;
}
interface BlogResponse {
  blogs: fullBlogs[];
  totalPages: number;
}

export function Blogs() {
  const [page, setPage] = useState(1);
  const [allBlogsActive, setAllBlogsActive] = useState(true);
  const [followersBlogsActive, setFollowersBlogsActive] = useState(false);
  const [followingsBlogsActive, setFollowingsBlogsActive] = useState(false);
  const [followersBlogs, setFollowersBlogs] = useState<fullBlogs[]>([]);
  const [followersBlogsPage, setFollowersBlogsPage] = useState(1);
  const [followersBlogsLoading, setFollowersBlogsLoading] = useState(false);
  const [followersBlogsTotalPage, setFollowersBlogsTotalPage] = useState(0);
  const [followingsBlogs, setFollowingsBlogs] = useState<fullBlogs[]>([]);
  const [followingsBlogsPage, setFollowingsBlogsPage] = useState(1);
  const [followingsBlogsLoading, setFollowingsBlogsLoading] = useState(false);
  const [followingsBlogsTotalPage, setFollowingsBlogsTotalPage] = useState(0);
  const { usersLoading, newUsers } = useNewUsers();
  const { trendingTags, tagsLoading } = useTrendingTags();
  const handleFetchingBulk = useCallback(
    async (page: number): Promise<BlogResponse> => {
      try {
        const res = await axios.get<BlogAxiosRes>(
          `${BACKEND_URL}/api/v1/blog/bulk?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const blogs: fullBlogs[] = res.data.blogs.map((blog) => ({
          ...blog,
          tags: blog.tags.map((tag) => tag.name),
        }));
        console.log(res.data.msg);
        return {
          blogs,
          totalPages: Math.ceil(res.data.total / res.data.pageSize),
        };
      } catch (e) {
        console.error("Error encountered while fetching blogs:", e);
        alert("Error encountered while fetching blogs");
        return {
          blogs: [],
          totalPages: 0,
        };
      }
    },
    []
  );
  const { loading, blogs, totalPages } = useBlogs(handleFetchingBulk, page);
  const handleFetchingFollowersBlogs = async () => {
    setFollowersBlogsLoading(true);
    try {
      const res = await axios.get<BlogAxiosRes>(
        `${BACKEND_URL}/api/v1/blog/followers/blogs?page=${followersBlogsPage}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const blogs: fullBlogs[] = res.data.blogs.map((blog) => ({
        ...blog,
        tags: blog.tags.map((tag) => tag.name),
      }));
      console.log(res.data.msg);
      setFollowersBlogs(blogs);
      setFollowersBlogsTotalPage(res.data.totalPage);
    } catch (e) {
      console.error("Error:", e instanceof Error ? e.message : e);
      alert("Error encountered while fetching followers blogs");
    } finally {
      setFollowersBlogsLoading(false);
    }
  };
  const handleFetchingFollowingsBlogs = async () => {
    setFollowingsBlogsLoading(true);
    try {
      const res = await axios.get<BlogAxiosRes>(
        `${BACKEND_URL}/api/v1/blog/followings/blogs?page=${followersBlogsPage}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const blogs: fullBlogs[] = res.data.blogs.map((blog) => ({
        ...blog,
        tags: blog.tags.map((tag) => tag.name),
      }));
      console.log(res.data.msg);
      setFollowingsBlogs(blogs);
      setFollowingsBlogsTotalPage(res.data.totalPage);
    } catch (e) {
      console.error("Error:", e instanceof Error ? e.message : e);
      alert("Error encountered while fetching followings blogs");
    } finally {
      setFollowingsBlogsLoading(false);
    }
  };
  return (
    <div>
      <Appbar></Appbar>
      <div className="grid grid-cols-8 w-screen">
        <div className="col-span-6 mt-20 flex flex-col items-center othersProfile overflow-y-scroll h-screen max-xl:col-span-8">
          <div className="flex w-4xl border-b-2 border-gray-200 gap-8 mt-10">
            <button
              className={`py-2 px-2 cursor-pointer text-lg hover:text-black ${
                allBlogsActive ? "text-black border-b-2" : "text-gray-600"
              }`}
              onClick={() => {
                setAllBlogsActive(true);
                setFollowersBlogsActive(false);
                setFollowingsBlogsActive(false);
              }}
            >
              All
            </button>

            <button
              className={`py-2 cursor-pointer text-lg hover:text-black ${
                followersBlogsActive ? "text-black border-b-2" : "text-gray-600"
              }`}
              onClick={() => {
                setAllBlogsActive(false);
                setFollowingsBlogsActive(false);
                setFollowersBlogsActive(true);
                handleFetchingFollowersBlogs();
              }}
            >
              Followers
            </button>
            <button
              className={`py-2 cursor-pointer text-lg hover:text-black ${
                followingsBlogsActive
                  ? "text-black border-b-2"
                  : "text-gray-600"
              }`}
              onClick={() => {
                setAllBlogsActive(false);
                setFollowersBlogsActive(false);
                setFollowingsBlogsActive(true);
                handleFetchingFollowingsBlogs();
              }}
            >
              Followings
            </button>
          </div>
          {allBlogsActive &&
            (loading ? (
              <div className="mt-2">
                <Repeat count={10}>
                  <Skeleton />
                </Repeat>
              </div>
            ) : (
              <div className="mt-2">
                {blogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    authorName={blog.author.name || "Anonymous"}
                    avatar={blog.author.profile?.imageUrl}
                    title={blog.title}
                    content={blog.content}
                    publishedDate={blog.createdAt}
                    authorId={blog.authorId}
                    id={blog.id}
                    tags={blog.tags}
                    img={blog.imgUrl}
                    hasFollowed={blog.followedBack}
                    likeCount={blog.likeCount}
                    commentCount={blog.commentCount}
                    hasLiked={blog.hasLiked}
                    hasSaved={blog.hasSaved}
                    himself={blog.himself}
                  />
                ))}
                <Pagination
                  setPage={setPage}
                  page={page}
                  totalPages={totalPages}
                ></Pagination>
              </div>
            ))}
          {followersBlogsActive &&
            (followersBlogsLoading ? (
              <div className="mt-2">
                <Repeat count={10}>
                  <Skeleton />
                </Repeat>
              </div>
            ) : (
              <div className="mt-2">
                {followersBlogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    authorName={blog.author.name || "Anonymous"}
                    avatar={blog.author.profile?.imageUrl}
                    title={blog.title}
                    content={blog.content}
                    publishedDate={blog.createdAt}
                    authorId={blog.authorId}
                    id={blog.id}
                    tags={blog.tags}
                    img={blog.imgUrl}
                    hasFollowed={blog.followedBack}
                    likeCount={blog.likeCount}
                    commentCount={blog.commentCount}
                    hasLiked={blog.hasLiked}
                    hasSaved={blog.hasSaved}
                    himself={blog.himself}
                  />
                ))}
                <Pagination
                  setPage={setFollowersBlogsPage}
                  page={followersBlogsPage}
                  totalPages={followersBlogsTotalPage}
                ></Pagination>
              </div>
            ))}
          {followingsBlogsActive &&
            (followingsBlogsLoading ? (
              <div className="mt-2">
                <Repeat count={10}>
                  <Skeleton />
                </Repeat>
              </div>
            ) : (
              <div className="mt-2">
                {followingsBlogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    authorName={blog.author.name || "Anonymous"}
                    avatar={blog.author.profile?.imageUrl}
                    title={blog.title}
                    content={blog.content}
                    publishedDate={blog.createdAt}
                    authorId={blog.authorId}
                    id={blog.id}
                    tags={blog.tags}
                    img={blog.imgUrl}
                    hasFollowed={blog.followedBack}
                    likeCount={blog.likeCount}
                    commentCount={blog.commentCount}
                    hasLiked={blog.hasLiked}
                    hasSaved={blog.hasSaved}
                    himself={blog.himself}
                  />
                ))}
                <Pagination
                  setPage={setFollowingsBlogsPage}
                  page={followingsBlogsPage}
                  totalPages={followingsBlogsTotalPage}
                ></Pagination>
              </div>
            ))}
        </div>
        <div className="col-span-2 border-l-2 max-xl:invisible border-gray-400 w-full mt-20 px-5">
          <div className="h-70 border-b-2 border-gray-200">
            <div className="text-lg font-medium mt-5">Trending Tags</div>
            {tagsLoading ? (
              <div className="animate-pulse max-w-lg mt-5 pb-3">
                <div className="flex items-center gap-3 flex-wrap h-full">
                  <Repeat count={15}>
                    <div className="bg-gray-300 rounded-full h-8.5 w-15.5" />
                  </Repeat>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex gap-x-5 gap-y-3 flex-wrap mt-5">
                  {trendingTags.map((t) => (
                    <TagStyle label={t} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <div className="text-lg font-medium mt-5 ">New Users</div>
            {usersLoading ? (
              <Repeat count={5}>
                {" "}
                <div className="animate-pulse max-w-lg mt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-300 rounded-full h-8.5 w-8.5" />
                    <div className="h-4 w-70 bg-gray-300 rounded-full" />
                  </div>
                </div>
              </Repeat>
            ) : (
              <div className="w-full mt-5">
                {newUsers.map((n) => (
                  <FollowersCard
                    key={n.id}
                    id={n.id}
                    avatar={n.imageUrl}
                    bio={n.bio}
                    hasFollowed={n.followedBack}
                    himself={n.himself}
                    followersCount={n.followersCount}
                    followingId={n.id}
                    name={n.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
