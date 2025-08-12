import { Avatar } from "./Avatar";
import { Date } from "./Date";

interface CommentsBind {
  avatar: string;
  name: string;
  createdAt: string;
  content: string;
  width: string;
}

export function Comments({
  avatar,
  name,
  createdAt,
  content,
  width,
}: CommentsBind) {
  return (
    <div className=" mt-5 pb-5 border-b-2 border-gray-100">
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <Avatar avatar={avatar} size="sm"></Avatar>
          <div className="">
            <div className="text-sm -mb-1">{name}</div>
            <Date date={createdAt} size={"sm"}></Date>
          </div>
        </div>
        <div>
          <svg
            className="w-6 h-6 text-gray-600 cursor-pointer"
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
        </div>
      </div>
      <div className={`text-wrap pr-3 mt-4 w-${width}`}>{content}</div>
    </div>
  );
}
