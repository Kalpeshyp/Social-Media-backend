import express from "express"
// import cors from "cors"

const app = express();

app.get("/", (req, res) => {
  res.send("hello");
})

app.listen(8080, (req, res) => {
  console.log(`app listen on port ${8080}`);

})