import { PageButton } from "./PageButton";

interface PageButtonBinds {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  page: number;
  totalPages: number;
}

export function Pagination({ setPage, page, totalPages }: PageButtonBinds) {
  return totalPages > 0 ? (
    <div className="flex items-center justify-center mt-20 mb-10 gap-7">
      <div
        onClick={() => {
          if (page != 1) {
            setPage((prev) => prev - 1);
          }
        }}
        className="cursor-pointer"
      >
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
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
      </div>
      {Array.from({ length: totalPages }, (_, i) => (
        <PageButton
          key={i}
          label={i + 1}
          onClick={() => setPage(i + 1)}
          isActive={page === i + 1}
        />
      ))}
      <div
        onClick={() => {
          if (page != totalPages) {
            setPage((prev) => prev + 1);
          }
        }}
        className="cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </svg>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
