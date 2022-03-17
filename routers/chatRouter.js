import express from "express";
import Chat from "../models/Chat.js";
const router = express.Router();

router.route("/:from/:to").get(async (request, response) => {
  const { from, to } = request.params;

  if (!from) {
    response.status(401).send({ message: "From field should be provided" });
    return;
  }
  if (!to) {
    response.status(401).send({ message: "To field should be provided" });
    return;
  }
  try {
    const chats = await Chat.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });
    const projectedChat = chats.map((data) => {
      return {
        fromSelf: data.sender.toString() === from,
        chat: data.message.text,
        date: data.createdAt,
        from: to,
      };
    });
    response.send(projectedChat);
  } catch (err) {
    response.status(401).send({ message: err });
  }
});

router.route("/addChat").post(async (request, response) => {
  const { from, to, message } = request.body;
  if (!from) {
    response.status(401).send({ message: "From field should be provided" });
    return;
  }
  if (!to) {
    response.status(401).send({ message: "To field should be provided" });
    return;
  }
  if (!message) {
    response.status(401).send({ message: "Message should be provided" });
    return;
  }
  try {
    const chats = await Chat.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });
    response.send({ message: "Message added successfully." });
  } catch (err) {
    response.status(500).send({ message: err });
  }
});

export const chatRouter = router;
