import { config } from "dotenv";

config({ path: ".env" });

export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
export const DB_CONNECTION = process.env.DB_CONNECTION;

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_SECRET;