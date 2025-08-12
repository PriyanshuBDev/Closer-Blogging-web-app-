interface PageButtonBind {
  label: number;
  isActive: boolean;
  onClick: () => void;
}

export function PageButton({ label, isActive, onClick }: PageButtonBind) {
  return (
    <div>
      <button
        onClick={onClick}
        className={`w-10 h-10 rounded-xl cursor-pointer  ${
          isActive
            ? "bg-black border-none text-white"
            : "bg-white border-2 border-gray-400 focus:ring-2 focus:ring-gray-200"
        }`}
      >
        {label}
      </button>
    </div>
  );
}
