import { Avatar } from "./Avatar";
import { Follow } from "./Follow";

interface FollowCardBinds {
  avatar: string;
  bio?: string;
  name: string;
  hasFollowed: boolean;
  himself: boolean;
  followingId: string;
}

export function FollowCard({
  avatar,
  bio,
  name,
  hasFollowed,
  himself,
  followingId,
}: FollowCardBinds) {
  return (
    <div className="flex items-center w-2xl mt-8 gap-5">
      <Avatar avatar={avatar} size="md"></Avatar>
      <div>
        <div>{name}</div>
        {bio && bio.length > 0 ? (
          <div className="text-gray-600 text-sm text-wrap w-md">{bio}</div>
        ) : null}
      </div>
      {himself ? null : (
        <div className="ml-5">
          <Follow hasFollowed={hasFollowed} followingId={followingId}></Follow>
        </div>
      )}
    </div>
  );
}
