import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ResumePage from "./components/ResumePage";
import "./index.css";


const path = window.location.pathname.replace(/\/+$/, "");
const isResume = path.endsWith("/resume");
const RootComponent = isResume ? ResumePage : App;


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>
);
