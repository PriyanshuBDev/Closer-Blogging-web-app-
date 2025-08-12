import { Link } from "react-router-dom";

type WarningBinds = {
  btntxt: string;
  title: string;
  to: string;
};

export function Warning(props: WarningBinds) {
  return (
    <div className="text-xl text-gray-500 flex">
      <div>{props.title}</div>
      <Link
        className="cursor-pointer underline hover:text-gray-700 ml-1"
        to={props.to}
      >
        {props.btntxt}
      </Link>
    </div>
  );
}
