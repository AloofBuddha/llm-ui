import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat.js";
import { PORT } from "./config/env.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", chatRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
