import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Signin } from "./pages/Signin";
import { Signup } from "./pages/Signup";
import { Blog } from "./pages/Blog";
import { Blogs } from "./pages/Blogs";
import { FilteredBlog } from "./pages/FilteredBlog";
import { ProtectedRoute } from "./pages/ProtectedRoute";
import { TiptapEditor } from "./pages/Tiptap";
import { FilteredBlogByTag } from "./pages/FilteredBlogByTag";
import { Profile } from "./pages/Profile";
import { ProfileEdit } from "./pages/ProfileEdit";
import { OthersProfile } from "./pages/OthersProfile";
import { Notifications } from "./pages/Notification";
import { BlogEdit } from "./pages/BlogEdit";
import { UsersFilter } from "./pages/UsersFilter";
import { Dashboard } from "./pages/Dashboard";

function App() {
  const token = localStorage.getItem("token");
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={token ? "/blogs" : "/dashboard"} />}
          ></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/signin" element={<Signin />}></Route>
          <Route
            path="/blog/:id"
            element={
              <ProtectedRoute>
                <Blog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blogs"
            element={
              <ProtectedRoute>
                <Blogs />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/blogs/:filter"
            element={
              <ProtectedRoute>
                <FilteredBlog />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/tags/:filter"
            element={
              <ProtectedRoute>
                <FilteredBlogByTag />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/blogs/create"
            element={
              <ProtectedRoute>
                <TiptapEditor />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/users/profile/:id"
            element={
              <ProtectedRoute>
                <OthersProfile />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/blog/edit/:id"
            element={
              <ProtectedRoute>
                <BlogEdit></BlogEdit>
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/users/filter/:filter"
            element={
              <ProtectedRoute>
                <UsersFilter />
              </ProtectedRoute>
            }
          ></Route>
          <Route path="/dashboard" element={<Dashboard />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
