interface AvatarBinds {
  avatar?: string;
  size: keyof typeof sizeMap;
}

// const color = [
//   "bg-sky-300",
//   "bg-green-300",
//   "bg-cyan-300",
//   "bg-fuchsia-300",
//   "bg-rose-300",
//   "bg-stone-300",
//   "bg-purple-300",
//   "bg-lime-300",
//   "bg-indigo-300",
//   "bg-red-300",
//   "bg-blue-300",
//   "bg-amber-300",
//   "bg-orange-300",
//   "bg-yellow-300",
// ];
const sizeMap = {
  sm: "w-8 h-8",
  md: "w-11 h-11",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function Avatar({ avatar, size }: AvatarBinds) {
  // const c = color[Math.floor(Math.random() * color.length)];
  const sizeClass = sizeMap[size];
  // const textSize = `text-${text}`;
  return (
    <div
    // className={` inline-flex items-center justify-center ${sizeClass} ${c} overflow-hidden  rounded-full `}
    >
      {avatar ? (
        <img
          src={avatar}
          className={`object-center object-cover ${sizeClass} rounded-full overflow-hidden`}
        />
      ) : (
        <img
          src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
          className={`object-center ${sizeClass} rounded-full overflow-hidden border-2 border-gray-300`}
        />
      )}
    </div>
  );
}
