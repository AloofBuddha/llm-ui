import dotenv from "dotenv";

dotenv.config();

export const XAI_API_KEY = process.env.XAI_API_KEY;
export const PORT = process.env.PORT || 3001;
