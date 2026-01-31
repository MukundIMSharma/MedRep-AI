import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { ApiError } from "./utils/api-error.js";
dotenv.config();

const app = express();

//basic config
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

//cors config
console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(cookieParser());

//adding the healthcheck routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js"
import ragRouter from "./routes/rag.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/rag", ragRouter);

app.get("/", (req, res) => {
    res.send("This is Holy SHiiii.....");
});

// global error handler
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            data: null
        });
    }

    // Default error response for non-ApiError instances
    console.error("Unexpected Error:", err);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        data: null
    });
});

export default app;