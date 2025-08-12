import { useEffect, useState } from "react";
import type { Tag } from "./blog";
import axios from "axios";
import { BACKEND_URL } from "../config";

interface UseProfileBlogBind {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imgUrl: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  hasSaved: boolean;
}

interface UseProfileUserBind {
  id: string;
  name: string;
  createdAt: string;
  profile: {
    bio: string;
    longBio: string;
    imageUrl: string;
  };
  followers: number;
  following: number;
}

interface UseProfileAxios {
  msg: string;
  blogs: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    imgUrl: string;
    tags: Tag[];
    likeCount: number;
    commentCount: number;
    hasLiked: boolean;
    hasSaved: boolean;
  }[];
  user: {
    id: string;
    name: string;
    createdAt: string;
    profile: {
      bio: string;
      longBio: string;
      imageUrl: string;
    };
    followers: number;
    following: number;
  };
}
export function useUser() {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<UseProfileBlogBind[] | null>(null);
  const [user, setUser] = useState<UseProfileUserBind | null>(null);

  useEffect(() => {
    const handleFetchingProfile = async () => {
      try {
        const res = await axios.get<UseProfileAxios>(
          `${BACKEND_URL}/api/v1/profile/get`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(res.data);
        const rawBlogs = res.data.blogs;
        const fullBlogs: UseProfileBlogBind[] = rawBlogs.map((blog) => ({
          ...blog,
          tags: blog.tags.map((tag) => tag.name),
        }));
        setBlogs(fullBlogs);
        setUser(res.data.user);
        console.log(res.data.msg);
      } catch (e) {
        console.error("Error:", e instanceof Error ? e.message : e);
        alert("Error encountered while fetching your details");
      } finally {
        setLoading(false);
      }
    };
    handleFetchingProfile();
  }, []);
  return { loading, user, blogs };
}

interface UseOtherUserBinds {
  id: string;
  name: string;
  createdAt: string;
  profile: {
    bio: string;
    longBio: string;
    imageUrl: string;
  };
  followersCount: number;
  followingsCount: number;
  hasFollowed: boolean;
}

interface UseOtherUserBlogsBinds {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imgUrl: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  hasSaved: boolean;
}

interface useOtherUserFsBinds {
  id: string;
  name: string;
  profile: {
    imageUrl: string;
    bio: string;
  };
  hasFollowed: boolean;
  himself: boolean;
  followersCount: number;
}
interface useOtherUserAxios {
  msg: string;
  user: UseOtherUserBinds;
  blogs: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    imgUrl: string;
    tags: Tag[];
    likeCount: number;
    commentCount: number;
    hasLiked: boolean;
    hasSaved: boolean;
  }[];

  completeFollowers: useOtherUserFsBinds[];
}

export function useOtherUser({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UseOtherUserBinds | null>(null);
  const [blogs, setBlogs] = useState<UseOtherUserBlogsBinds[] | null>(null);
  const [followers, setFollowers] = useState<useOtherUserFsBinds[]>([]);

  useEffect(() => {
    const handleFetchingOthersProfile = async () => {
      try {
        const res = await axios.get<useOtherUserAxios>(
          `${BACKEND_URL}/api/v1/profile/specific/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const rawBlogs = res.data.blogs;
        const fullBlogs: UseOtherUserBlogsBinds[] = rawBlogs.map((blog) => ({
          ...blog,
          tags: blog.tags.map((tag) => tag.name),
        }));
        setBlogs(fullBlogs);
        setUser(res.data.user);
        setFollowers(res.data.completeFollowers);
        console.log(res.data.msg);
        console.log(res.data.completeFollowers);
      } catch (e) {
        console.error("Error:", e instanceof Error ? e.message : e);
        alert("Error encountered while fetching users details");
      } finally {
        setLoading(false);
      }
    };
    handleFetchingOthersProfile();
  }, [id]);
  useEffect(() => {
    if (followers) {
      console.log("Updated followers:", followers);
    }
  }, [followers]);
  return { loading, blogs, user, followers };
}
