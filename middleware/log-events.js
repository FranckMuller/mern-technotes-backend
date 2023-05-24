const fs = require("fs");
const path = require("path");
const { format } = require("date-fns");
const { v4: uuid } = require("uuid");

fsPromises = fs.promises;

const logEvents = async (message, logEvent) => {
  const date = `${format(new Date(), "dd MMM y\tHH:mm:ss")}`;
  const logItem = `${date}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logEvent),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, "req-log.txt");
  next();
};

module.exports = {
  logger,
  logEvents
};
