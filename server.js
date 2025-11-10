import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { apiRoutes } from "./src/routes/api.js";
// import { initDatabase } from "./src/config/seed.js";
import { checkValidJWT } from "./src/middlewares/jwt.js";
import process from "process";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import passport from "passport";
import { configPassportLocal } from "./src/middlewares/passport.local.js";
// import { initDatabase } from "./src/config/seed.js";
import { vnpayCallback } from "./src/controllers/cart.controller.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8888'],
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "../ticket-go-ptit/public/images")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000 // ms
    },
    secret: 'sunflower',

    resave: true,

    saveUninitialized: true,
    store: new PrismaSessionStore(
        new PrismaClient(),
        {
            // Clears expired sessions every 1 hour
            checkPeriod: 1 * 60 * 60 * 1000,  //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }
    )
}));

app.use(passport.initialize());
app.use(passport.authenticate('session'));

configPassportLocal();

// VNPAY callback route - không cần authentication (VNPAY gọi từ bên ngoài)
app.get("/api/carts/vnpay-callback", vnpayCallback);

app.use("/api", checkValidJWT);

apiRoutes(app);


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
});
