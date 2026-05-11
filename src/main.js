import "./style.css";
import { mountMaintenanceApp } from "./mountApp.js";

const root = document.getElementById("app");
if (root) {
  mountMaintenanceApp(root);
}
