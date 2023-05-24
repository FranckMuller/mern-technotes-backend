require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { logger, logEvents } = require("./middleware/log-events");
const errorHandler = require("./middleware/error-handler");
const corsOptions = require("./config/cors-options");
const connectDb = require("./config/db-conn");

connectDb();
const PORT = process.env.PORT || 3500;
const app = express();
app.use(cors(corsOptions));
app.use(logger);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "/public")));

app.use("/", require("./routes/root"));
app.use("/users", require("./routes/user-route"));
app.use("/notes", require("./routes/note-route"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts(".html")) {
    return res.sendFile(path.join(__dirname, "views", "404.html"));
  }
  if (req.accepts(".json")) {
    return res.json("404 not found");
  }
  res.type("txt").send("404 not found");
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log("err");
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongo-err.log"
  );
});
