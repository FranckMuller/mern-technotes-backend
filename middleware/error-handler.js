const { logEvents } = require("./logger");

const errorHandler = (err, req, res, next) => {
  // console.error(err.stack);
  logEvents(`${err.name}:\t${err.message}`, "err-log.txt");
  const status = res.statusCode ? res.statusCode : 500
  
  res.status(status)
  res.json({message: err.message, isError: true});
};

module.exports = errorHandler;
