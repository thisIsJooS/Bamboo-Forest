const express = require("express");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares/auth");
const authController = require("../controllers/auth");

const router = express.Router();

router.get("/signup", isNotLoggedIn, authController.getSignupPage);

router.post("/signup", isNotLoggedIn, authController.signup);

router.get("/login", isNotLoggedIn, authController.getLoginPage);

router.post("/login", isNotLoggedIn, authController.login);

router.get("/logout", isLoggedIn, authController.logout);

router.get("/forgot-password", isNotLoggedIn, authController.forgotPassword);

router.post("/valid-id", isNotLoggedIn, authController.isValidID);

router.post("/send-reset-mail", isNotLoggedIn, authController.sendResetMail);

router.get(
  "/reset-password",
  isNotLoggedIn,
  authController.getResetPasswordPage
);

router.post("/reset-password", isNotLoggedIn, authController.resetPassword);

// router.get("/kakao", passport.authenticate("kakao"));

// router.get(
//   "/kakao/callback",
//   passport.authenticate("kakao", {
//     failureRedirect: "/",
//   }),
//   (req, res) => {
//     res.redirect("/");
//   }
// );

module.exports = router;
