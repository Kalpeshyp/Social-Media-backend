import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose"
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello");
});

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL);
    console.log(connection.connection.host);
  } catch (error) {
    console.log(error);
  }
};
connectDB();

app.listen(8080, (req, res) => {
  console.log(`app listen on port ${8080}`);
});
