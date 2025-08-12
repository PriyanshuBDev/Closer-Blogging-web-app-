import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BACKEND_URL } from "../config";

interface AvatarBinds {
  avatar: string;
  fetchAvatar: () => Promise<void>;
  setAvatar: (url: string) => void;
}

export const useAvatar = create<AvatarBinds>()(
  persist(
    (set) => ({
      avatar:
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      setAvatar: (url) => set({ avatar: url }),
      fetchAvatar: async () => {
        if (!localStorage.getItem("token")) {
          return;
        }
        try {
          const res = await axios.get(`${BACKEND_URL}/api/v1/user/avatar`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          set({ avatar: res.data.userAvatar.profile.imageUrl });
        } catch (e) {
          console.log("Error:", e);
          localStorage.removeItem("token");
          alert("Invalid token");
        }
      },
    }),
    { name: "avatar-storage" }
  )
);
