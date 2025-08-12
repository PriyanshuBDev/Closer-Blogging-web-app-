import { Quote } from "../components/Quote.tsx";
import { AuthSignUp } from "../components/AuthSignUp.tsx";

export function Signup() {
  return (
    <div className="grid grid-cols-2 max-lg:grid-cols-1">
      <div>
        <AuthSignUp></AuthSignUp>
      </div>
      <div className="max-lg:invisible">
        <Quote></Quote>
      </div>
    </div>
  );
}
