import { Link } from "react-router-dom";
import { Avatar } from "./Avatar";
import { Date } from "./Date";
import { Like } from "./Like";
import { SavePost } from "./SavePost";
import { Follow } from "./Follow";

interface BlogCardBinds {
  authorName: string;
  avatar: string;
  title: string;
  content: string;
  publishedDate: string;
  id: string;
  authorId: string;
  img?: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
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

export function BlogCard({
  authorName,
  avatar,
  title,
  content,
  publishedDate,
  id,
  authorId,
  img,
  tags,
  likeCount,
  commentCount,
  hasLiked,
  hasSaved,
  hasFollowed,
  himself,
}: BlogCardBinds) {
  return (
    <div className="border-b-2 border-gray-200 w-4xl mt-4">
      <div className="flex items-center gap-3">
        <Link to={`/users/profile/${authorId}`}>
          <Avatar size={"sm"} avatar={avatar}></Avatar>
        </Link>
        <div className="flex items-center gap-1">
          {himself ? (
            <Link to={`/profile`}>
              <div className="font-medium text-lg hover:underline">
                {authorName}{" "}
              </div>
            </Link>
          ) : (
            <Link to={`/users/profile/${authorId}`}>
              <div className="font-medium text-lg hover:underline">
                {authorName}{" "}
              </div>
            </Link>
          )}
          <div className="text-gray-600 mr-5">
            • <Date date={publishedDate} size="md"></Date>
          </div>
          {!himself ? (
            <Follow hasFollowed={hasFollowed} followingId={authorId}></Follow>
          ) : null}
        </div>
      </div>
      <div className="flex gap-5 mt-1.5 justify-between">
        <div>
          <Link to={`/blog/${id}`}>
            <div className="font-bold text-2xl ">{title}</div>
            <div className="text-lg">
              {(() => {
                const plainText = stripHtmlTags(content);
                return plainText.length > 250
                  ? `${plainText.slice(0, 200)}...`
                  : plainText;
              })()}
            </div>
          </Link>
        </div>
        {img ? (
          <img
            src={img}
            className=" h-35 rounded-lg shadow-md object-cover w-51"
          />
        ) : (
          <div className="rounded-lg w-120 h-35 bg-gray-200 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M3.05 3.05a7 7 0 1 1 9.9 9.9 7 7 0 0 1-9.9-9.9Zm1.627.566 7.707 7.707a5.501 5.501 0 0 0-7.707-7.707Zm6.646 8.768L3.616 4.677a5.501 5.501 0 0 0 7.707 7.707Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-3 mb-2">
        <div className="flex gap-5 items-center">
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
          <div className="flex justify-start items-center gap-5">
            <div>
              <div className="">{`${Math.ceil(
                content.length / 400
              )} min read`}</div>
            </div>
          </div>
          {tags && tags.length != 0 ? (
            tags.length > 3 ? (
              <div className="flex gap-3">
                <TagStyle label={tags[0]}></TagStyle>
                <TagStyle label={tags[1]}></TagStyle>
                <TagStyle label={tags[2]}></TagStyle>
              </div>
            ) : tags.length > 1 ? (
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

        <div>
          <SavePost hasSaved={hasSaved} postId={id} />
        </div>
      </div>
    </div>
  );
}

export const TagStyle = ({ label }: { label: string }) => {
  return (
    <Link to={`/tags/${label}`}>
      <div className="rounded-full px-3 py-1 bg-gray-200 text-gray-900 inline-block">
        {label}
      </div>
    </Link>
  );
};
