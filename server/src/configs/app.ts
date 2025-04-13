import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

dotenv.config();

import userRoutes from "../routes/user.route";
import {
  errorHandler,
  handleSyntaxError,
  notFound,
} from "../middlewares/error.middleware";
import type { ErrorRequestHandler } from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
app.use(
  cors({
    // origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/api/users", userRoutes);
app.use(handleSyntaxError as ErrorRequestHandler);
app.use(notFound);
app.use(errorHandler as ErrorRequestHandler);

export default app;

