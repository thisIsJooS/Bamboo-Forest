const passport = require("passport");
const { User, AuthToken } = require("../models");

const bcrypt = require("bcrypt");
const mailer = require("../mail/mailer");
const crypto = require("crypto");
const schedule = require("node-schedule");

exports.getSignupPage = function (req, res, next) {
  res.render("register");
};

exports.signup = async function (req, res, next) {
  const { username, password, useremail } = req.body;

  try {
    const exID = await User.findOne({ where: { name: username } });
    if (exID) {
      return res.render("register", {
        error_message: "이미 존재하는 아이디입니다.",
      });
    }

    const exEmail = await User.findOne({ where: { email: useremail } });
    if (exEmail) {
      return res.render("register", {
        error_message: "이미 가입된 이메일입니다.",
      });
    }

    const hash = await bcrypt.hash(password, 12);
    await User.create({
      name: username,
      password: hash,
      email: useremail,
    });
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getLoginPage = function (req, res, next) {
  res.render("login", {
    next_url: req.query?.next_url,
    message: req.query?.message,
  });
};

exports.login = function (req, res, next) {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.render("login", {
        error_message: "회원정보가 일치하지 않습니다. 다시 로그인해주세요.",
      });
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }

      if (req.query.next_url) {
        return res.redirect(req.query.next_url);
      } else {
        return res.redirect("/");
      }
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
};

exports.logout = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy();
    res.redirect("/");
  });
};

exports.forgotPassword = function (req, res) {
  res.render("forgot-password");
};

exports.isValidID = async function (req, res, next) {
  const inputID = req.body.inputID;
  try {
    const user = await User.findOne({ where: { name: inputID } });

    if (user) {
      return res.json({ username: user.name });
    } else {
      return res.json({ error_message: "Not valid ID" });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.sendResetMail = async function (req, res, next) {
  const username = req.body.username;
  try {
    const user = await User.findOne({ where: { name: username } });
    const userEmail = user.email;

    const authenticatedToken = await AuthToken.create({
      token: crypto.randomBytes(20).toString("hex"),
      userId: user.id,
    });
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 3);
    schedule.scheduleJob(expires, async () => {
      await AuthToken.destroy({
        where: { token: authenticatedToken.token, userId: user.id },
      });
    });

    const emailParam = {
      toEmail: userEmail,
      subject: "비밀번호 초기화 이메일입니다.",
      text: `비밀번호 초기화를 위해서는 아래의 URL을 클릭하여 주세요. http://127.0.0.1:8001/auth/reset-password?token=${authenticatedToken.token}`,
    };

    mailer.sendGmail(emailParam, next);
    return res.json({
      message:
        "메일이 성공적으로 전송되었습니다. 메일이 보이지 않는다면 스팸메일함을 확인해 주세요.",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getResetPasswordPage = function (req, res, next) {
  res.render("reset-password", { token: req.query.token });
};

exports.resetPassword = async function (req, res, next) {
  try {
    const token = req.body.token;
    const authenticatedToken = await AuthToken.findOne({
      where: { token: token },
    });

    if (!authenticatedToken) {
      const message = encodeURIComponent("만료된 토큰입니다.");
      res.redirect(`/?error=${message}`);
    }

    const hash = await bcrypt.hash(req.body.password, 12);
    await User.update(
      {
        password: hash,
      },
      {
        where: { id: authenticatedToken.userId },
      }
    );

    res.write(
      "<script>alert('Your password has been successfully changed!! ');window.location='/';</script>"
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
};
