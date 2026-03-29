import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";
import authRouter from "./modules/auth/auth.router";
import listingsRouter from "./modules/listings/listings.router";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (env.NODE_ENV === "production") {
        const allowed =
          env.ALLOWED_ORIGINS?.split(",")
            .map((o) => o.trim())
            .filter(Boolean) ?? [];

        if (allowed.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      }

      callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/listings", listingsRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
