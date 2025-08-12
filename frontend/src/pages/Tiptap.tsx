import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import "../App.css";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Highlight from "@tiptap/extension-highlight";
import { HoverComponent } from "../components/HoverComponent";
import type { Editor } from "@tiptap/react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { CreateblogAppbar } from "../components/CreateblogAppbar";
import { CustomAlert } from "../components/CustomAlert";

interface intitalDataForEdit {
  iniContent?: string;
  iniTitle?: string;
  iniTags?: string[];
  iniMainImg?: string;
  iniPostId?: string;
}

export const TiptapEditor = ({
  iniContent,
  iniTitle,
  iniTags,
  iniMainImg,
  iniPostId,
}: intitalDataForEdit) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: "text-left",
          },
        },
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc ml-2",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal ml-4",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      ListItem,
      TextAlign.configure({
        types: [`heading`, "paragraph"],
      }),
      Image,
      Placeholder.configure({
        placeholder: "Tell Your Stories Here",
        emptyEditorClass: "is-editor-empty",
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
      Link.configure({
        openOnClick: true,
        autolink: false,
        linkOnPaste: false,
        HTMLAttributes: {
          class: `text-blue-600 underline`,
        },
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: iniContent || "",
  });

  const [showImageModal, setShowImageModal] = useState(false);
  const [mainImgModal, setMainImgModal] = useState(false);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mainImg, setMainImg] = useState("");
  const [showMainImg, setShowMainImg] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tmpTags, setTmpTags] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [warn, setWarn] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const tagsRef = useRef(tags);
  const [alert, setAlert] = useState<null | {
    msg: string;
    type: "success" | "error" | "info" | "warning";
  }>(null);
  const handleAlert = ({
    msg,
    type,
  }: {
    msg: string;
    type: "success" | "error" | "info" | "warning";
  }) => {
    setAlert({ msg, type });
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (iniTags) {
      setTags(iniTags);
    }
    if (iniTitle) {
      setTitle(iniTitle);
    }
    if (iniMainImg) {
      setMainImg(iniMainImg);
      setShowMainImg(true);
    }
  }, [iniContent, iniMainImg, iniTags, iniTitle, editor]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = textareaRef.current.scrollHeight * 2;
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, maxHeight) + "px";
    }
  }, [title]);
  useEffect(() => {
    tagsRef.current = tags;
  }, [tags]);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const isEmptyContent = (html: string) => {
    if (html) return true;
    const text = html.replace(/<[^>]*>/g, "").trim();
    return text.length === 0;
  };

  const handleSubmit = async (published: boolean) => {
    const content = editor?.getHTML() ?? "";
    if (!iniPostId) {
      if (
        !title &&
        isEmptyContent(content) &&
        (!tags || tags.length === 0) &&
        !imageUrl
      ) {
        handleAlert({ msg: "No inputs", type: "warning" });
        return;
      } else {
        if (published === true) {
          if (!title || title.length === 0) {
            handleAlert({ msg: "Missing Title", type: "warning" });
            return;
          }
          if (!tags || tags.length === 0) {
            handleAlert({ msg: "Missing Tag", type: "warning" });
            return;
          }
          if (!mainImg) {
            handleAlert({ msg: "Missing Content", type: "warning" });
            return;
          }
          if (!content) {
            handleAlert({ msg: "Missing content", type: "warning" });
            return;
          }
        }
      }

      setLoading(true);

      try {
        const res = await axios.post(
          `${BACKEND_URL}/api/v1/blog/create`,
          {
            title,
            content,
            published,
            tagsNames: tags,
            imgUrl: mainImg,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = res.data;
        if (published === false) {
          handleAlert({
            msg: "Blog successfully created and saved as drafts",
            type: "success",
          });
          setTimeout(() => {
            navigate("/profile");
          }, 3000);
        } else {
          handleAlert({ msg: `${data.msg}`, type: "success" });
          setTimeout(() => {
            navigate("/blogs");
          }, 3000);
        }
      } catch (e) {
        if (axios.isAxiosError(e)) {
          console.error("Axios error:", e.message);
          handleAlert({
            msg: `${e.response?.data.msg ?? "Unknown error"}`,
            type: "error",
          });
        } else {
          console.log("Error:", e instanceof Error ? e.message : e);
          handleAlert({
            msg: "Unexpected error occured while creating the blog",
            type: "error",
          });
        }
      }
    } else {
      console.log({ title, content, tags, imageUrl });
      if (
        !title &&
        isEmptyContent(content) &&
        (!tags || tags.length === 0) &&
        !imageUrl
      ) {
        handleAlert({ msg: "No inputs", type: "warning" });
        return;
      } else {
        if (published === true) {
          if (!title || title.length === 0) {
            handleAlert({ msg: "Missing Title", type: "warning" });
            return;
          }
          if (!tags || tags.length === 0) {
            handleAlert({ msg: "Missing Tag", type: "warning" });
            return;
          }
          if (!mainImg) {
            handleAlert({ msg: "Missing Content", type: "warning" });
            return;
          }
          if (!content) {
            handleAlert({ msg: "Missing content", type: "warning" });
            return;
          }
        }

        setLoading(true);

        try {
          const res = await axios.put(
            `${BACKEND_URL}/api/v1/blog/update`,
            {
              id: iniPostId,
              title,
              content,
              published,
              tagsNames: tags,
              imgUrl: mainImg,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const data = res.data;
          if (published === false) {
            handleAlert({
              msg: "Blog successfully updated and saved as drafts",
              type: "success",
            });
            setTimeout(() => {
              navigate("/profile");
            }, 3000);
          } else {
            handleAlert({ msg: `${data.msg}`, type: "success" });
            setTimeout(() => {
              navigate("/blogs");
            }, 3000);
          }
        } catch (e) {
          if (axios.isAxiosError(e)) {
            console.error("Axios error:", e.message);
            handleAlert({
              msg: `${e.response?.data.msg ?? "Unknown error"}`,
              type: "error",
            });
          } else {
            console.log("Error:", e instanceof Error ? e.message : e);
            handleAlert({
              msg: "Unexpected error occured while creating the blog",
              type: "error",
            });
          }
        }
      }
    }
  };

  const handleTag = () => {
    const newTag = tmpTags.trim();
    const currentTags = tagsRef.current;
    if (!newTag) return;
    if (currentTags.length >= 5) {
      setShowWarning(true);
      setWarn("You cannot add more than 5");
      setTmpTags("");
      setTimeout(() => {
        setShowWarning(false);
        setWarn("");
      }, 5000);

      return;
    } else if (currentTags.includes(newTag)) {
      setShowWarning(true);
      setWarn("Tag already added");
      setTmpTags("");
      setTimeout(() => {
        setShowWarning(false);
        setWarn("");
      }, 5000);

      return;
    }
    setTags([...currentTags, newTag]);
    setTmpTags("");
    return;
  };

  const handleTagDelete = (remove: string) => {
    setTags(tags.filter((tag) => tag !== remove));
  };

  const handleInsertImage = () => {
    if (!imageUrl || !editor) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setShowImageModal(false);
  };

  if (!editor) return null;

  return (
    <div className="flex">
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-70 ">
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-10 h-10 text-gray-200 animate-spin  fill-black"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
      {alert && (
        <CustomAlert
          msg={alert.msg}
          type={alert.type}
          onClose={() => {
            setAlert(null);
            setLoading(false);
          }}
        />
      )}
      <CreateblogAppbar onClick={handleSubmit}></CreateblogAppbar>
      <div className="w-[70rem] max-w-6xl mt-20 space-y-4">
        <div className="flex gap-2 rounded p-2 bg-white shadow-md ml-[21%] w-[54.3rem]">
          <HoverComponent label="Undo" subLabel="Ctrl+z">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className={`px-3 py-1 rounded shadow-md transition 
        ${
          editor.isActive("undo")
            ? "shadow-md bg-gray-200 font-semibold"
            : "bg-white"
        } 
        hover:bg-gray-100`}
            >
              {" "}
              <div className="py-1.25">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                  />
                </svg>
              </div>
            </button>
          </HoverComponent>
          <HoverComponent label="Redo" subLabel="Ctrl+Shift+z">
            {" "}
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className={`px-3 py-1 rounded shadow-md transition 
        ${
          editor.isActive("redo")
            ? "shadow-md bg-gray-200 font-semibold"
            : "bg-white"
        } 
        hover:bg-gray-100`}
            >
              {" "}
              <div className="py-1.25">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
                  />
                </svg>
              </div>
            </button>
          </HoverComponent>
          <div className="border h-8 mt-1 border-gray-300"></div>
          <HoverComponent label={"Bold"} subLabel="Ctrl+B">
            <ToolbarButton
              editor={editor}
              format="bold"
              label={<strong className="text-lg">B</strong>}
            />
          </HoverComponent>
          <HoverComponent label="Italic" subLabel="Ctrl+l">
            <ToolbarButton
              editor={editor}
              format="italic"
              label={
                <div className="py-1.5 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.25 2.75A.75.75 0 0 1 7 2h6a.75.75 0 0 1 0 1.5h-2.483l-3.429 9H9A.75.75 0 0 1 9 14H3a.75.75 0 0 1 0-1.5h2.483l3.429-9H7a.75.75 0 0 1-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              }
            />
          </HoverComponent>
          <HoverComponent label="Strike" subLabel="Ctrl+Shift+s">
            {" "}
            <ToolbarButton
              editor={editor}
              format="strike"
              label={<s className="text-lg px-0.5">S</s>}
            />
          </HoverComponent>
          <HoverComponent label="Underline" subLabel="Ctrl+U">
            <ToolbarButton
              editor={editor}
              format="underline"
              label={
                <div className="py-1.25">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="size-4.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.75 2a.75.75 0 0 1 .75.75V7a2.5 2.5 0 0 0 5 0V2.75a.75.75 0 0 1 1.5 0V7a4 4 0 0 1-8 0V2.75A.75.75 0 0 1 4.75 2ZM2 13.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              }
            />
          </HoverComponent>
          <div className="border h-8 mt-1 border-gray-300"></div>
          <HoverComponent label="Bullet List" subLabel="*+Space">
            {" "}
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`px-3 py-1 rounded shadow-md transition 
        ${
          editor.isActive("bulletList")
            ? "shadow-md bg-gray-200 font-semibold"
            : "bg-white"
        } 
        hover:bg-gray-100`}
            >
              <div className="py-1.25">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="size-4.5"
                >
                  <path d="M3 4.75a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM6.25 3a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM6.25 7.25a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM6.25 11.5a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM4 12.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM3 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                </svg>
              </div>
            </button>
          </HoverComponent>
          <HoverComponent label="Ordered List" subLabel="1.+Space">
            {" "}
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`px-3 py-1 rounded shadow-md transition 
        ${
          editor.isActive("orderedList")
            ? "shadow-md bg-gray-200 font-semibold"
            : "bg-white"
        } 
        hover:bg-gray-100`}
            >
              <div className="py-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="size-4"
                >
                  <path d="M2.995 1a.625.625 0 1 0 0 1.25h.38v2.125a.625.625 0 1 0 1.25 0v-2.75A.625.625 0 0 0 4 1H2.995ZM3.208 7.385a2.37 2.37 0 0 1 1.027-.124L2.573 8.923a.625.625 0 0 0 .439 1.067l1.987.011a.625.625 0 0 0 .006-1.25l-.49-.003.777-.776c.215-.215.335-.506.335-.809 0-.465-.297-.957-.842-1.078a3.636 3.636 0 0 0-1.993.121.625.625 0 1 0 .416 1.179ZM2.625 11a.625.625 0 1 0 0 1.25H4.25a.125.125 0 0 1 0 .25H3.5a.625.625 0 1 0 0 1.25h.75a.125.125 0 0 1 0 .25H2.625a.625.625 0 1 0 0 1.25H4.25a1.375 1.375 0 0 0 1.153-2.125A1.375 1.375 0 0 0 4.25 11H2.625ZM7.25 2a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-6ZM7.25 7.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-6ZM6.5 13.25a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Z" />
                </svg>
              </div>
            </button>
          </HoverComponent>
          <HoverComponent label="Task List" subLabel="[]+Space">
            {" "}
            <ToolbarButton
              editor={editor}
              format="taskList"
              label={
                <div className="border my-1.25">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              }
            />
          </HoverComponent>
          <div className="border h-8 mt-1 border-gray-300"></div>
          <HoverComponent label="Highlight">
            <button
              onClick={() => editor?.chain().focus().toggleHighlight().run()}
              className={`px-3 py-1 rounded shadow-md transition 
          ${
            editor?.isActive("highlight")
              ? "shadow-md bg-gray-200 font-semibold"
              : "bg-white"
          } 
             hover:bg-gray-100`}
            >
              <div className="py-1.25">
                {" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
                  />
                </svg>
              </div>
            </button>
          </HoverComponent>

          <HoverComponent label="Link">
            <LinkWithPopUp editor={editor}></LinkWithPopUp>
          </HoverComponent>
          <div className="border h-8 mt-1 border-gray-300"></div>
          <HoverComponent label="Left Align" subLabel="Ctrl+Shift+L">
            <button
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
              className={`px-2 py-1.25 rounded shadow-md transition 
        ${
          editor?.isActive({ textAlign: "left" })
            ? "shadow-md bg-gray-200 font-semibold"
            : "bg-white"
        } 
        hover:bg-gray-100`}
            >
              <svg
                className="w-[25px] h-[25px] text-black"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.1"
                  d="M6 6h8m-8 4h12M6 14h8m-8 4h12"
                />
              </svg>
            </button>
          </HoverComponent>

          <HoverComponent label="Center Align" subLabel="Ctrl+Shift+E">
            {" "}
            <button
              onClick={() =>
                editor?.chain().focus().setTextAlign("center").run()
              }
              className={`px-2 py-1.25 rounded shadow-md transition 
        ${
          editor?.isActive({ textAlign: "center" })
            ? "shadow-md bg-gray-200 font-semibold"
            : "bg-white"
        } 
        hover:bg-gray-100`}
            >
              <svg
                className="w-[25px] h-[25px] text-black"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.1"
                  d="M8 6h8M6 10h12M8 14h8M6 18h12"
                />
              </svg>
            </button>
          </HoverComponent>
          <HoverComponent label="Right Align" subLabel="Ctrl+Shift+R">
            <button
              onClick={() =>
                editor?.chain().focus().setTextAlign("right").run()
              }
              className={`px-2 py-1.25 rounded shadow-md transition 
        ${
          editor?.isActive({ textAlign: "right" })
            ? "shadow-md bg-gray-200 font-semibold"
            : "bg-white"
        } 
        hover:bg-gray-100`}
            >
              <svg
                className="w-[25px] h-[25px] text-black"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.1"
                  d="M18 6h-8m8 4H6m12 4h-8m8 4H6"
                />
              </svg>
            </button>
          </HoverComponent>

          <HoverComponent label="Justify Align" subLabel="Ctrl+Shift+J">
            <button
              onClick={() =>
                editor?.chain().focus().setTextAlign("justify").run()
              }
              className={`px-2 py-1.25 rounded shadow-md transition 
        ${
          editor?.isActive({ textAlign: "justify" })
            ? "shadow-md bg-gray-200 font-semibold"
            : "bg-white"
        } 
        hover:bg-gray-100`}
            >
              <svg
                className="w-[25px] h-[25px] text-black"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.1"
                  d="M18 6H6m12 4H6m12 4H6m12 4H6"
                />
              </svg>
            </button>
          </HoverComponent>
          <div className="border h-8 mt-1 border-gray-300"></div>
          <HoverComponent label="Add Image">
            <button
              onClick={() => setShowImageModal(true)}
              className="px-3 py-1.25 rounded shadow-md bg-white hover:bg-gray-100 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="size-5"
              >
                <path
                  fillRule="evenodd"
                  d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm10.5 5.707a.5.5 0 0 0-.146-.353l-1-1a.5.5 0 0 0-.708 0L9.354 9.646a.5.5 0 0 1-.708 0L6.354 7.354a.5.5 0 0 0-.708 0l-2 2a.5.5 0 0 0-.146.353V12a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V9.707ZM12 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                  clipRule="evenodd"
                />
              </svg>
              <div>Add</div>
            </button>
          </HoverComponent>
        </div>
        <div className="ml-[20%] h-screen w-4xl  ">
          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={70}
            value={title}
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
            spellCheck={false}
            onKeyDown={handleKeyDown}
            className="resize-none overflow-hidden text-5xl font-semibold focus:outline-none focus:ring-0 placeholder:font-medium border-l-3 border-gray-300 pl-2 pt-2 font-style w-[90%]"
          />

          <div className="min-h-[450px] ">
            <EditorContent
              editor={editor}
              spellCheck={false}
              className="editor-wrapper overflow-y-scroll max-h-200 pb-10"
            />
          </div>
        </div>

        {showImageModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 ">
            <div className="bg-white p-6 rounded shadow-lg space-y-4 w-full max-w-sm">
              <h2 className="text-lg font-bold">Insert Image</h2>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste image URL here"
                className="w-full border p-2 rounded"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-600 hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInsertImage}
                  className="bg-black text-white px-3 py-1 rounded"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="max-[93rem]:hidden border-x-2 mt-20 border-gray-200 flex flex-col items-center pt-5">
        <div className="pb-5 border-b-2 border-gray-200 flex flex-col items-center justify-center">
          <div>
            <HoverComponent label="Add Main Img">
              <button
                onClick={() => setMainImgModal(true)}
                className="px-3 py-1 rounded shadow-md bg-white hover:bg-gray-100 flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="size-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm10.5 5.707a.5.5 0 0 0-.146-.353l-1-1a.5.5 0 0 0-.708 0L9.354 9.646a.5.5 0 0 1-.708 0L6.354 7.354a.5.5 0 0 0-.708 0l-2 2a.5.5 0 0 0-.146.353V12a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V9.707ZM12 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>Add Main Img</div>
              </button>
            </HoverComponent>
            {mainImgModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 ">
                <div className="bg-white p-6 rounded shadow-lg space-y-4 w-full max-w-sm">
                  <h2 className="text-lg font-bold">Insert Image</h2>
                  <input
                    type="text"
                    value={mainImg}
                    onChange={(e) => setMainImg(e.target.value)}
                    placeholder="Paste image URL here"
                    className="w-full border p-2 rounded"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setMainImgModal(false)}
                      className="text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowMainImg(true);
                        setMainImgModal(false);
                      }}
                      className="bg-black text-white px-3 py-1 rounded"
                    >
                      Insert
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {mainImg && showMainImg ? (
            <img
              src={mainImg}
              className="w-80 h-50 rounded-md shadow-md mx-5 mt-5"
            ></img>
          ) : (
            <div className="w-80 h-50 shadow-md mx-5 mt-5 rounded-md bg-gray-100 text-gray-400 text-xl flex justify-center items-center">
              {" "}
              Image Preview
            </div>
          )}
        </div>
        <div className="w-[22rem] px-4">
          <div className="mt-5">
            <input
              type="text"
              placeholder="Add Tags (upto 5)"
              value={tmpTags}
              onChange={(e) => setTmpTags(e.target.value.trim())}
              maxLength={20}
              className="w-60 bg-gray-100 rounded-lg py-1.5 px-3 shadow-md"
            />

            <button
              className="bg-black text-white py-1.5 px-4 rounded-full ml-2 shadow-md"
              onClick={handleTag}
            >
              Add
            </button>
          </div>
          {showWarning ? <Warning warning={warn} /> : <></>}
          <div
            className={`flex flex-wrap gap-3 w-[21rem] ${
              showWarning ? `mt-1.5` : `mt-8`
            }`}
          >
            {tags.map((tag) => (
              <div className="rounded-full shadow-md px-3 pt-1.5 bg-gray-200 flex">
                <div className="pb-1.5 inline-block">{tag}</div>
                <button className="ml-2" onClick={() => handleTagDelete(tag)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Toolbar Button Component
const ToolbarButton = ({
  editor,
  format,
  label,
}: {
  editor: Editor;
  format: string;
  label: React.ReactNode;
}) => {
  const isActive = editor.isActive(format);

  const commands: Record<string, () => void> = {
    bold: () => editor.chain().focus().toggleBold().run(),
    italic: () => editor.chain().focus().toggleItalic().run(),
    strike: () => editor.chain().focus().toggleStrike().run(),
    underline: () => editor.chain().focus().toggleUnderline().run(),
    bulletList: () => editor.chain().focus().toggleBulletList().run(),
    orderedList: () => editor.chain().focus().toggleOrderedList().run(),
    taskList: () => editor.chain().focus().toggleTaskList().run(),
  };
  const handleClick = () => {
    commands[format]?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1 rounded shadow-md transition 
        ${isActive ? "shadow-md bg-gray-200 font-semibold" : "bg-white"} 
        hover:bg-gray-100`}
    >
      {label}
    </button>
  );
};

const LinkWithPopUp = ({ editor }: { editor: Editor }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex items-center justify-center">
      <button
        onClick={() => {
          setShowLinkInput(true);
          setTimeout(() => linkInputRef.current?.focus(), 50);
        }}
        className={`px-3 py-1 rounded shadow-md transition 
          ${
            editor?.isActive("link")
              ? "shadow-md bg-gray-200 font-semibold"
              : "bg-white"
          } 
             hover:bg-gray-100`}
      >
        <div className="py-1.25">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-4.5"
          >
            <path
              fillRule="evenodd"
              d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {showLinkInput && (
        <div
          className="absolute left-1/2 top-full mt-4 p-2 transform -translate-x-1/2 bg-white shadow-md rounded z-50 w-64"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            ref={linkInputRef}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Paste or type link"
            className="border border-gray-400 p-1 rounded w-60"
          />
          <div>
            <button
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl("");
              }}
              className="text-gray-500 hover:underline mr-2"
            >
              {" "}
              Cancel
            </button>
            <button
              onClick={() => {
                editor
                  ?.chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href: linkUrl })
                  .run();
                setShowLinkInput(false);
                setLinkUrl("");
              }}
              className="bg-black text-white px-2 pb-1 mt-2 rounded cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const Warning = ({ warning }: { warning?: string }) => {
  if (!warning) {
    return;
  }
  return (
    <div className="text-red-500 mt-0.5 opacity-100 transition-opacity duration-300 flex gap-1 pointer-events-none">
      <div className="mt-1.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-4"
        >
          <path
            fillRule="evenodd"
            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {warning}
    </div>
  );
};
