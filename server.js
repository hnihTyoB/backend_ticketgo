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

// config session
// app.use(session({
//     cookie: {
//         maxAge: 7 * 24 * 60 * 60 * 1000 // ms
//     },
//     secret: 'a santa at nasa',
//     // Forces session save even if unchanged
//     resave: true,

//     // Saves unmodified sessions
//     saveUninitialized: true,
//     store: new PrismaSessionStore(
//         new PrismaClient(),
//         {
//             // Clears expired sessions every 1 hour
//             checkPeriod: 1 * 60 * 60 * 1000,  //ms
//             dbRecordIdIsSessionId: true,
//             dbRecordIdFunction: undefined,
//         }
//     )
// }));

// config passport
// app.use(passport.initialize());
// app.use(passport.authenticate('session'));

// configPassportLocal();

// config local
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// api routes
apiRoutes(app);

// seed database
initDatabase();

// handle 404 not found
// app.use((req, res) => {
//     res.render("status/404.ejs");
// })

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});