import { Avatar } from "./Avatar";
import { Date } from "./Date";
import { Like } from "./Like";
import { SavePost } from "./SavePost";
import { TagStyle } from "./BlogCard";
import { Link } from "react-router-dom";
import { Follow } from "./Follow";

interface UserBlogBind {
  id: string;
  title: string;
  content: string;
  mainImg?: string;
  authorName: string;
  authorId: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  tags: string[];
  avatar?: string;
  hasLiked: boolean;
  hasSaved: boolean;
  hasFollowed: boolean;
  himself: boolean;
}
function stripHtmlTags(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}
export function UsersBlogCard({
  id,
  title,
  content,
  mainImg,
  authorId,
  authorName,
  likeCount,
  commentCount,
  createdAt,
  tags,
  avatar,
  hasLiked,
  hasSaved,
  hasFollowed,
  himself,
}: UserBlogBind) {
  return (
    <div className="border-2 border-gray-200 p-5 rounded-md w-2xl mt-6">
      <div className="flex items-center gap-4 mb-5">
        {himself ? (
          <Avatar size={"sm"} avatar={avatar}></Avatar>
        ) : (
          <Link to={`/user/${id}`}>
            <Avatar size={"sm"} avatar={avatar}></Avatar>
          </Link>
        )}
        <div>
          <div className="-mb-1.5 text-lg">{authorName}</div>
          <div className="text-gray-600 text-sm">
            {`${Math.ceil(content.length / 400)} min read  ·  `}
            <Date date={createdAt} size={"sm"}></Date>
          </div>
        </div>
        {himself ? null : (
          <Follow followingId={authorId} hasFollowed={hasFollowed} />
        )}
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
      <Link to={`/blog/${id}`}>
        {" "}
        <div className="text-2xl font-semibold mt-3 hover:underline">
          {title}
        </div>
      </Link>
      <div className="text-lg text-wrap leading-6 text-gray-700 mt-2">
        {(() => {
          const plainText = stripHtmlTags(content);
          return plainText.length > 100
            ? `${plainText.slice(0, 100)}...`
            : plainText;
        })()}
      </div>
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
      <div className="flex justify-between items-center mt-3">
        <div className="flex gap-5">
          <Like likeCount={likeCount} hasLiked={hasLiked} postId={id} />
          <button className="flex items-center gap-0.5 text-gray-400 hover:text-black cursor-pointer">
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
            <div className="text-gray-400">{commentCount}</div>
          </button>
        </div>
        <div>
          <SavePost hasSaved={hasSaved} postId={id} />
        </div>
      </div>
    </div>
  );
}
