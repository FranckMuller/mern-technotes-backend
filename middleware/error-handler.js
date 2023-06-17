const { logEvents } = require("./logger");

const errorHandler = (err, req, res, next) => {
  // console.error(err.stack);
  logEvents(`${err.name}:\t${err.message}`, "err-log.txt");
  res.status(500).json(err.message);
};

module.exports = errorHandler;
