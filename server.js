import express from "express";
import process from "process";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { apiRoutes } from "./routes/api.js";
import initDatabase from "./config/seed.js";

const app = express();
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

apiRoutes(app);

initDatabase();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});