export function Skeleton() {
  return (
    <div className="animate-pulse max-w-5xl mt-4 pb-3 border-b-2 border-gray-200">
      <div className="flex items-center gap-3">
        <div className="bg-gray-300 rounded-full h-8.5 w-8.5" />
        <div className="h-6 bg-gray-300 rounded-full w-[20rem]" />
      </div>
      <div className="flex gap-12">
        <div>
          <div className="mt-3 h-6 bg-gray-300 rounded-full w-[40rem]" />
          <div className="mt-3 h-4 bg-gray-300 rounded-full" />
          <div className="mt-3 h-4 bg-gray-300 rounded-full" />
          <div className="mt-3 h-4 bg-gray-300 rounded-full" />
        </div>
        <div className="bg-gray-300 mt-2 rounded-lg w-[13rem] h-[134px]"></div>
      </div>
      <div className="mt-4 h-6  bg-gray-300 rounded-full" />
    </div>
  );
}
