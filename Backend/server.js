import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
const app = express();
import userRouter from "./routes/user.Router.js";
import taskRouter from "./routes/task.Router.js";
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB Connect
connectDB();

// !Routes
app.use("/api/user", userRouter);
app.use("/api/tasks", taskRouter);
app.get("/", (req, res) => {
  res.send("API Working");
});

const PORT = process.env.PORT;

app.listen(PORT, (req, res) => {
  console.log(`Server listening at ${PORT}`);
});
