import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 5000;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://mern-auth-hassaan.vercel.app"],
    methods: ["POST", "PUT", "GET", "DELETE", "CREATE"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Deployment has done.");
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.listen(port, () => {
  console.log("Server is started on port 5000...");
});
