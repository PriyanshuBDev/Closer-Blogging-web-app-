import { useEffect, useState } from "react";
import type { fullBlogs } from "./blog";
import axios from "axios";
import { BACKEND_URL } from "../config";
import type { BlogAxiosRes } from "../pages/Blogs";

export interface FilterBinds {
  filter: string;
  page: number;
}
export const useBlogFilter = ({ filter, page }: FilterBinds) => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<fullBlogs[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const handleFetchingFilteredBlog = async ({
      filter,
      page,
    }: FilterBinds) => {
      try {
        const res = await axios.get<BlogAxiosRes>(
          `${BACKEND_URL}/api/v1/blog/filter?filter=${filter}&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(res.data.msg);
        const blogs: fullBlogs[] = res.data.blogs.map((blog) => ({
          ...blog,
          tags: blog.tags.map((tag) => tag.name),
        }));
        setBlogs(blogs);
        setTotalPages(res.data.totalPage);
        setTotal(res.data.total);
      } catch (e) {
        console.error("Error encountered while fetching blog by filter: ", e);
      } finally {
        setLoading(false);
      }
    };

    handleFetchingFilteredBlog({ filter, page });
  }, [filter, page]);
  return { loading, blogs, total, totalPages };
};

interface UserFilterBinds {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  followedBack: boolean;
  himself: boolean;
}

interface UserFilterAxios {
  msg: string;
  users: UserFilterBinds[];
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
}

export const useUserFilter = ({ filter, page }: FilterBinds) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserFilterBinds[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const handleFetchingFilteredUser = async ({
      filter,
      page,
    }: FilterBinds) => {
      try {
        const res = await axios.get<UserFilterAxios>(
          `${BACKEND_URL}/api/v1/user/bulk/filter?filter=${filter}&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(res.data.msg);
        setUsers(res.data.users);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      } catch (e) {
        console.error("Error encountered while fetching users by filter: ", e);
        alert("Error encountered while fetching the users");
      } finally {
        setLoading(false);
      }
    };

    handleFetchingFilteredUser({ filter, page });
  }, [filter, page]);
  return { loading, users, total, totalPages };
};

export const useBlogByTagFilter = ({ filter, page }: FilterBinds) => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<fullBlogs[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const handleFetchingFilteredBlogByTag = async ({
      filter,
      page,
    }: FilterBinds) => {
      try {
        const res = await axios.get<BlogAxiosRes>(
          `${BACKEND_URL}/api/v1/blog/tags/filter?filter=${filter}&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(res.data.msg);
        const blogs: fullBlogs[] = res.data.blogs.map((blog) => ({
          ...blog,
          tags: blog.tags.map((tag) => tag.name),
        }));
        setBlogs(blogs);
        setTotalPages(res.data.totalPage);
        setTotal(res.data.total);
      } catch (e) {
        console.error("Error encountered while fetching blog by filter: ", e);
      } finally {
        setLoading(false);
      }
    };
    handleFetchingFilteredBlogByTag({ filter, page });
  }, [filter, page]);
  return { loading, blogs, total, totalPages };
};
