import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/rtl-fix.css"; // استيراد ملف CSS الخاص بدعم RTL
import { FontLoader } from "./lib/font-loader";

createRoot(document.getElementById("root")!).render(
  <>
    <FontLoader />
    <App />
  </>
);
