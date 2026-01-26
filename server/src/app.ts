import express, { Request, Response } from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import router from "./routes/user.routes.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.use("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timeStamp: new Date().toISOString(),
  });
});

app.use("/api/users", router);

app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

export default app;
