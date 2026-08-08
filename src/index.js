import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
})
import app from "./app.js";
import connectdb from "./db/index.js";

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
    console.log(`App listening on port ${port}`);
});

connectdb()
    .catch((err) => {
        console.error("Server is running, but database features are unavailable", err.message);
    });






