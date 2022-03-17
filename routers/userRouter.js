import express from "express";
import User from "../models/User.js";
import { genPassword } from "../helper.js";
const router = express.Router();

//get all users
router.route("/allUsers/:id").get(async (request, response) => {
  const { id } = request.params;
  try {
    const user = await User.find({
      _id: { $ne: id },
      isVerified: { $eq: true },
    }).select(["email", "userName", "profilePic"]);
    response.send(user);
  } catch (err) {
    response.status(500).send(err);
  }
});

//update
router.put("/:id", async (request, response) => {
  console.log(request.body);
  try {
    const { id } = request.params;
    const { _id, userName } = request.body;
    const userNameFromDB = await User.findOne({ userName });
    const user = await User.findOne({ _id });
    //account owner can updtate his/her account
    if (id === _id) {
      if (
        userNameFromDB &&
        user._id.toString() != userNameFromDB._id.toString()
      ) {
        response.status(401).send({ message: "Username already exists" });
        return;
      }
      if (
        request.body.password &&
        !/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@!#%&]).{8,}$/g.test(
          request.body.password
        )
      ) {
        response
          .status(401)
          .send({ message: "Password pattern does not match" });
        return;
      }
      if (request.body.password) {
        request.body.password = await genPassword(request.body.password);
      }
      if (request.body.password && request.body.password.length < 8) {
        response.status(401).send({ msg: "Password Must be longer" });
        return;
      }

      const updateUser = await User.findByIdAndUpdate(
        id,
        {
          $set: request.body,
        },
        { new: true }
      );
      response.send(updateUser);
    } else {
      response.status(401).send({ message: "You don't have permission" });
    }
  } catch (err) {
    response.status(500).send(err);
  }
});

//Delete User

router.delete("/:id", async (request, response) => {
  const { id } = request.params;
  const { _id } = request.body;
  //account owner can delete his/her account
  if (id === _id) {
    const user = await User.findById(id); // check if the user is available
    if (user) {
      //if user available
      await User.findByIdAndDelete({ _id: id });
      response.send({ message: "User has been deleted" });
    } else {
      response.status(404).send({ message: "user not found" });
    }
  } else {
    response.status(401).send({ message: "you dont have permission" });
  }
});

export const userRouter = router;
