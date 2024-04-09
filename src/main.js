import express, { json } from "express";
import cors from "cors";
import router from "./router.js";

const API = express();

API.use(cors());
API.use(json());

API.get("/", async (req, res) => {
    res.status(200).json({ message: "Mangaze API 🎉" });
});

API.use("/api", router);

export default API