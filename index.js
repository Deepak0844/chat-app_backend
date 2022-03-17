import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { authRouter } from "./routers/authRouter.js";
import { userRouter } from "./routers/userRouter.js";
import { chatRouter } from "./routers/chatRouter.js";
import { Server } from "socket.io";

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));

app.get("/", (request, response) => {
  response.send("home");
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/chat", chatRouter);

const server = app.listen(PORT, () => {
  console.log("Server started", PORT);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("socket-connected");
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.message);
    }
  });
});
