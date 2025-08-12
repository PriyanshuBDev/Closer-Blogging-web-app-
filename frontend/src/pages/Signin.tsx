import { Quote } from "../components/Quote.tsx";
import { AuthSignIn } from "../components/AuthSignIn.tsx";

export function Signin() {
  return (
    <div className="grid grid-cols-2 max-lg:grid-cols-1">
      <div>
        <AuthSignIn></AuthSignIn>
      </div>
      <div className="max-lg:invisible">
        <Quote></Quote>
      </div>
    </div>
  );
}
