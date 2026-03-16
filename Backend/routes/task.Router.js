import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createTask,
  deleteTaskById,
  getTaskById,
  getTasks,
  updateTaskById,
} from "../controllers/task.Controller.js";

const taskRouter = express.Router();

taskRouter
  .route("/gp")
  .get(authMiddleware, getTasks)
  .post(authMiddleware, createTask);

taskRouter
  .route("/:id/gp")
  .get(authMiddleware, getTaskById)
  .put(authMiddleware, updateTaskById)
  .delete(authMiddleware, deleteTaskById);

export default taskRouter;
