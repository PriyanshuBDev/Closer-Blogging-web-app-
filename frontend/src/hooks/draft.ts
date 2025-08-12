import { useEffect, useState } from "react";
import type { Tag } from "./blog";
import axios from "axios";
import { BACKEND_URL } from "../config";

export interface draftBinds {
  id: string;
  title: string;
  content: string;
  authorId: string;
  imgUrl: string;
  tags: string[];
  updatedAt: string;
}

export interface draftsAxios {
  msg: string;
  drafts: {
    id: string;
    title: string;
    content: string;
    authorId: string;
    imgUrl: string;
    tags: Tag[];
    updatedAt: string;
  }[];
}

export function useDrafts() {
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<draftBinds[] | []>([]);

  useEffect(() => {
    const handleFetchingDrafts = async () => {
      try {
        const res = await axios.get<draftsAxios>(
          `${BACKEND_URL}/api/v1/blog/draft`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const drafts = res.data.drafts.map((draft) => ({
          ...draft,
          tags: draft.tags.map((tag) => tag.name),
        }));
        setDrafts(drafts);
        console.log(res.data.msg);
      } catch (e) {
        console.error("Error:", e instanceof Error ? e.message : e);
        alert("Error encountered while fetching drafts");
      } finally {
        setLoading(false);
      }
    };
    handleFetchingDrafts();
  }, []);
  return { loading, drafts };
}

interface draftAxios {
  msg: string;
  draft: {
    id: string;
    title: string;
    content: string;
    authorId: string;
    imgUrl: string;
    tags: Tag[];
    updatedAt: string;
  };
}
export function useDraft({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<draftBinds | null>(null);

  useEffect(() => {
    const handleFetchingDraft = async () => {
      try {
        const res = await axios.get<draftAxios>(
          `${BACKEND_URL}/api/v1/blog/draft/get/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const completeDraft = {
          ...res.data.draft,
          tags: res.data.draft.tags.map((tag) => tag.name),
        };
        setDraft(completeDraft);
        console.log(res.data.msg);
      } catch (e) {
        console.error("Error:", e instanceof Error ? e.message : e);
        alert("Error encountered while fetching drafts");
      } finally {
        setLoading(false);
      }
    };
    handleFetchingDraft();
  }, [id]);
  return { loading, draft };
}
