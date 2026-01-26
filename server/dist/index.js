import app from "./app.js";
import { createServer } from "http";
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT;
const httpServer = createServer(app);
httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map