import type { ChangeEvent } from "react";

type InputBinds = {
  title: string;
  placeholder: string;
  type: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function InputBar(props: InputBinds) {
  return (
    <div className="flex flex-col justify-start mt-4">
      <div className="text-xl font-medium mb-2">{props.title}</div>
      <input
        className="border-solid border-2 border-gray-300 rounded-md text-gray-600 font-medium text-lg p-2 px-3 min-w-md"
        type={props.type}
        placeholder={props.placeholder}
        onChange={props.onChange}
      />
    </div>
  );
}
