import { Warning } from "./Warning";
import { InputBar } from "./InputBar";
import { Button } from "./Button";
import { useCallback, useState } from "react";
import axios from "axios";
import type { UserSchema } from "pbdev-medium-common";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { CustomAlert } from "./CustomAlert";

export const AuthSignIn = () => {
  const [alert, setAlert] = useState<null | {
    msg: string;
    type: "success" | "error" | "info" | "warning";
  }>(null);
  const handleAlert = useCallback(
    (alert: {
      msg: string;
      type: "success" | "error" | "info" | "warning";
    }) => {
      setAlert(alert);
      setTimeout(() => setAlert(null), 3000);
    },
    []
  );
  const [postInputs, setPostInputs] = useState<UserSchema>({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  async function handleSendRequest() {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/user/signin`,
        postInputs
      );
      const data = res.data;
      localStorage.setItem("token", data.token);
      handleAlert({ msg: `${data.msg}`, type: "success" });
      setTimeout(() => navigate("/blogs"), 3000);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error("Axios error:", e.message);
        handleAlert({
          msg: `${e.response?.data.msg ?? "Unknown error"}`,
          type: "error",
        });
      } else {
        console.log("Error:", e instanceof Error ? e.message : e);
        handleAlert({ msg: "Unexpected error occured.", type: "error" });
      }
    }
  }
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      {alert && (
        <CustomAlert
          msg={alert.msg}
          type={alert.type}
          onClose={() => {
            setAlert(null);
          }}
        />
      )}
      <div className="flex flex-col justify-center items-center">
        <div className="text-4xl font-bold mb-2">Login your account</div>
        <Warning
          btntxt={"SignUp"}
          title={"Create an account?"}
          to={"/signUp"}
        ></Warning>
      </div>
      <div className="mt-3">
        <InputBar
          title={"Email"}
          placeholder={"m@example.com"}
          type={"email"}
          onChange={(e) =>
            setPostInputs((c) => ({
              ...c,
              email: e.target.value,
            }))
          }
        ></InputBar>
        <InputBar
          title={"Password"}
          placeholder={"12345"}
          type={"password"}
          onChange={(e) =>
            setPostInputs((c) => ({
              ...c,
              password: e.target.value,
            }))
          }
        ></InputBar>
      </div>
      <div className="mt-7">
        <Button onClick={handleSendRequest} placeholder="Sign In"></Button>
      </div>
    </div>
  );
};
