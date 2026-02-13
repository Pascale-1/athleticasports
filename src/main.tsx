import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error("App initialization failed:", error);
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `<div style="padding:20px;font-family:sans-serif;">
      <h2>App Error</h2>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <pre style="font-size:12px;overflow:auto;max-height:300px;">${error instanceof Error ? error.stack : ""}</pre>
    </div>`;
  }
}
