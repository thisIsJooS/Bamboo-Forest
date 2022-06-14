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

dotenv.config();
const boardsRouter = require("./routes/boardsRouter");
const authRouter = require("./routes/authRouter");

app.use("/boards", boardsRouter);
app.use("/auth", authRouter);
