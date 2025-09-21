import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ResumePage from "./components/ResumePage";
import "./index.css";

const saved = sessionStorage.getItem("gh_redirect_path");
if (saved) {
  history.replaceState(null, "", saved);
  sessionStorage.removeItem("gh_redirect_path");
}

/** Normalize path by removing the BASE_URL prefix (e.g. '/your-repo/') */
const BASE = import.meta.env.BASE_URL; // comes from vite.config.ts base
const cleanPath = location.pathname
  .replace(BASE, "/")     // strip repo base
  .replace(/\/+$/, "/");  // trim trailing slashes

const RootComponent = cleanPath === "/resume" ? ResumePage : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>
);
