/**
 * @file src/App.jsx
 * @description Main application root.
 *
 * Delegates all rendering to the centralized RouterProvider.
 * On mount: verifies the httpOnly JWT cookie with the backend
 * to restore session state for new tabs / after cookie expiry.
 */

import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import SmoothScroll from "./lib/SmoothScroll";
import useAuthStore from "./features/auth/store/authStore";

function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  // Runs once on mount — silently verifies the httpOnly cookie
  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <SmoothScroll />
    </>
  );
}

export default App;

