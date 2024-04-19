import express, { json } from "express";
import cors from "cors";
import router from "./router.js";
import apicache from "apicache-plus";
import { config } from "dotenv"; config();

const API = express();

API.use(cors());
API.use(json());
API.use(apicache("30 minutes"));

API.get("/", async (req, res) => {
    res.status(200).json({ message: "Welcome to mangaoi api! 🎉" });
});

API.use("/api", router);

export default API