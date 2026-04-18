import bcrypt from "bcrypt";
import User from "../models/user.models.js";
import profile from "../models/profile.model.js"

const registered = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password || !username)
      return res.status(400).json({ message: "All field is required" });
    const User = await User.findOne({
      email,
    });
    if (User) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new User({
      name,
      email,
      password: password,
      username,
    });

    await newUser.save();

    const profile = new profile({ userId: newUser._id });
    return res.json({ message: "User created succesfull" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
