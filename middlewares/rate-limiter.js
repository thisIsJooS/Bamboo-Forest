const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
  windowMs: process.env.RATELIMIT_WINDOWMS, // ms
  max: process.env.RATELIMIT_MAXREQUEST, // limit each IP to 100 requests per windowMs
});
