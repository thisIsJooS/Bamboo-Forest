const passport = require("passport");
const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.getSignup = function (req, res, next) {
  res.render("register");
};

exports.postSignup = async function (req, res, next) {
  const { username, password } = req.body;

  try {
    const exUser = await User.findOne({ where: { username } });
    if (exUser) {
      return res.render("register", {
        error_message: "이미 존재하는 아이디입니다.",
      });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      username,
      password: hash,
    });
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getLogin = function (req, res, next) {
  res.render("login");
};

exports.postLogin = function (req, res, next) {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.render("login", {
        error_message: "존재하지 않는 회원입니다. 다시 로그인해주세요.",
      });
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
};

exports.logout = function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy();
    res.redirect("/");
  });
};
