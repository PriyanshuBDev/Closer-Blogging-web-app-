import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

export interface Tag {
  name: string;
}
export interface BlogBinds {
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
  tags: string[];
  imgUrl?: string;
}

interface fullBlog extends BlogBinds {
  likeCount: number;
  commentCount: number;
  comments: BlogComments[];
  followedBack: boolean;
  hasLiked: boolean;
  hasSaved: boolean;
  himself: boolean;
}

export interface fullBlogs extends BlogBinds {
  likeCount: number;
  commentCount: number;
  followedBack: boolean;
  hasLiked: boolean;
  hasSaved: boolean;
  himself: boolean;
}
export interface BlogComments {
  id: string;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    profile: {
      imageUrl: string;
    };
  };
}
export interface blogAxiosBind {
  msg: string;
  completePost: {
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
    comments: BlogComments[];
    commentCount: number;
    followedBack: boolean;
    hasLiked: boolean;
    hasSaved: boolean;
    himself: boolean;
  };
}

export const useBlog = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<fullBlog | null>(null);

  useEffect(() => {
    const handleFetchingBlog = async (id: string) => {
      try {
        const res = await axios.get<blogAxiosBind>(
          `${BACKEND_URL}/api/v1/blog/get/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(res.data.msg);
        const raw = res.data.completePost;
        console.log(raw);
        const data: fullBlog = {
          ...raw,
          tags: raw.tags.map((tag) => tag.name),
        };
        return data;
      } catch (e) {
        console.error("Error encountered while fetching blogById: ", e);
        alert(`Error encounterd while fetching the Blog`);
        return null;
      }
    };
    const fetchBlog = async () => {
      try {
        const res = await handleFetchingBlog(id);
        setBlog(res);
      } catch (e) {
        console.error("failed to load the blog:", e);
        alert("Failed to load the blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);
  return { loading, blog };
};

export const useBlogs = (
  handleFetchingBulk: (
    page: number
  ) => Promise<{ blogs: fullBlogs[]; totalPages: number }>,
  page: number
) => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<fullBlogs[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  useEffect(() => {
    setLoading(true);
    const fetchBlogs = async () => {
      try {
        const res = await handleFetchingBulk(page);
        setBlogs(res.blogs);
        setTotalPages(res.totalPages);
      } catch (e) {
        console.error("Failed to load blogs", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [handleFetchingBulk, page]);
  return { blogs, loading, totalPages };
};
