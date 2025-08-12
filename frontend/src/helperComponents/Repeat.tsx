import React from "react";

export const Repeat = ({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <React.Fragment key={i}>{children}</React.Fragment>
      ))}
    </>
  );
};
