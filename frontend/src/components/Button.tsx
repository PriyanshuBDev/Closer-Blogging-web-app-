type ButtonBinds = {
  placeholder: string;
  onClick: () => void;
};

export function Button(props: ButtonBinds) {
  return (
    <button
      className="flex justify-center min-w-md text-white bg-black rounded-md border-none py-2.5 text-lg font-semibold cursor-pointer hover:opacity-85 focus:outline-none focus:ring-4 focus:ring-gray-300"
      onClick={props.onClick}
    >
      {props.placeholder}
    </button>
  );
}
