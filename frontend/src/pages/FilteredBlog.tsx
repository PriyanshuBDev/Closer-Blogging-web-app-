import { BlogCard } from "../components/BlogCard";
import { Pagination } from "../components/Pagination";
import { Repeat } from "../helperComponents/Repeat";
import { Skeleton } from "../components/Skeleton";
import { useState } from "react";
import { Appbar } from "../components/Appbar";
import { useBlogFilter } from "../hooks/filter";
import { useParams } from "react-router-dom";

export function FilteredBlog() {
  const [page, setPage] = useState(1);
  const { filter } = useParams();
  const currentFilter = filter ?? "";
  const { loading, blogs, total, totalPages } = useBlogFilter({
    filter: currentFilter,
    page,
  });
  if (!filter && filter === undefined) {
    return <div>Please enter a valid filter.</div>;
  }
  return (
    <div>
      <Appbar></Appbar>
      <div className="flex justify-center">
        <div className=" flex justify-start mt-20 text-gray-500 font-semibold text-2xl">
          Found: {total} Blogs
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center">
        {loading ? (
          <div className="mt-2">
            <Repeat count={10}>
              <Skeleton />
            </Repeat>
          </div>
        ) : blogs.length === 0 && !blogs ? (
          <div className="mt-4 text-gray-500">
            No blogs found for tag:- "{currentFilter}"
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
                img={blog.imgUrl}
                tags={blog.tags}
                hasFollowed={blog.followedBack}
                likeCount={blog.likeCount}
                commentCount={blog.commentCount}
                hasLiked={blog.hasLiked}
                hasSaved={blog.hasSaved}
                himself={blog.himself}
              />
            ))}
          </div>
        )}
      </div>
      <Pagination
        setPage={setPage}
        page={page}
        totalPages={totalPages}
      ></Pagination>
    </div>
  );
}
