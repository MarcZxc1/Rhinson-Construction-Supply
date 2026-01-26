import express from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));
app.use("/health", (req, res) => {
    res.send({
        healthy: "OK",
    });
});
app.use(notFoundHandler);
// Error handler - must be last
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map