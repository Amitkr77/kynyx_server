const fs = require("fs");
const path = require("path");

module.exports = (err, req, res, next) => {
  const log = `[${new Date().toISOString()}] ${err.stack}\n`;
  fs.appendFileSync(path.join(__dirname, "../logs/error.log"), log);

  res.status(500).json({ error: "Internal Server Error" });
};
