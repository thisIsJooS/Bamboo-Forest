const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport");
const helmet = require("helmet");
const hpp = require("hpp");
const checkToken = require("./middlewares/checkToken");
const rateLimit = require("./middlewares/rate-limiter");
const cors = require("cors");
const paginate = require("express-paginate");

dotenv.config();
const indexRouter = require("./routes/index");
const boardRouter = require("./routes/boards");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const fs = require("fs");
const logger = require("./logger/logger");
const csurf = require("csurf");
const csrfProtection = csurf({ cookie: true });

const { sequelize } = require("./models");
const passportConfig = require("./passport");
const app = express();
passportConfig();
checkToken();
app.set("port", process.env.PORT || 8000);
app.set("view engine", "njk");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(hpp());
} else {
  app.use(morgan("dev"));
}

const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 1000,
  },
};

const corsOption = {
  origin: process.env.CORS_ALLOW_ORIGIN,
  optionSuccessStatus: 200, // 200 으로 자동응답
  credentials: true, // Access-Control-Allow-Credentials: true
};

app.use(morgan("dev"));
app.use(cors(corsOption));
app.use(rateLimit);
app.use(express.static(path.join(__dirname, "public")));
app.use("/pre-img", express.static(path.join(__dirname, "pre-uploads")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());

app.use(paginate.middleware(10, 50));

app.use("/", indexRouter);
app.use("/board", boardRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  logger.info("404 Not found");
  logger.error(
    `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${req.user?.name} `
  );
  res.status(404).render("404");
});

app.use((error, req, res, next) => {
  console.error(error);
  logger.info("500 Internal Server Error");
  logger.error(
    `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${req.user?.name} `
  );
  res.status(500).render("500");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
