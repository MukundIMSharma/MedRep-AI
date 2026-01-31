import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
})
import app from "./app.js";
import connectdb from "./db/index.js";

const port = process.env.PORT || 3000;

connectdb()
    .then(() => {
        app.listen(port, () => {
            console.log(`App listening on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error", err);
        process.exit(1);
    })






