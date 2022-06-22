const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(label({ label: "right meow!" }), timestamp(), myFormat),
  transports: [
    new transports.File({ filename: "log/combined.log" }),
    new transports.File({ filename: "log/error.log", level: "error" }),
  ],
  metaField: null, //this causes the metadata to be stored at the root of the log entry
  responseField: null, // this prevents the response from being included in the metadata (including body and status code)
  requestWhitelist: ["headers", "query"], //these are not included in the standard StackDriver httpRequest
  responseWhitelist: ["body"], // this populates the `res.body` so we can get the response size (not required)

  dynamicMeta: (req, res) => {
    const httpRequest = {};
    const meta = {};
    if (req) {
      meta.httpRequest = httpRequest;
      httpRequest.requestMethod = req.method;
      httpRequest.requestUrl = `${req.protocol}://${req.get("host")}${
        req.originalUrl
      }`;
      httpRequest.protocol = `HTTP/${req.httpVersion}`;
      // httpRequest.remoteIp = req.ip // this includes both ipv6 and ipv4 addresses separated by ':'
      httpRequest.remoteIp =
        req.ip.indexOf(":") >= 0
          ? req.ip.substring(req.ip.lastIndexOf(":") + 1)
          : req.ip; // just ipv4
      httpRequest.requestSize = req.socket.bytesRead;
      httpRequest.userAgent = req.get("User-Agent");
      httpRequest.referrer = req.get("Referrer");
    }
    return meta;
  },
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console({ format: format.simple() }));
}

module.exports = logger;
