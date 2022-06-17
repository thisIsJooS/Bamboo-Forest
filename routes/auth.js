const express = require("express");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares/auth");
const authController = require("../controllers/auth");

const router = express.Router();

router.get("/signup", isNotLoggedIn, authController.getSignupPage);

router.post("/signup", isNotLoggedIn, authController.signup);

router.get("/login", isNotLoggedIn, authController.getLoginPage);

router.post("/login", isNotLoggedIn, authController.login);

router.get("/logout", isLoggedIn, authController.logout);

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
