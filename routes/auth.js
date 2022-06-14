const express = require("express");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares/auth");
const authController = require("../controllers/auth");

const router = express.Router();

router.get("/signup", isNotLoggedIn, authController.getSignup);

router.post("/signup", isNotLoggedIn, authController.postSignup);

router.get("/login", isNotLoggedIn, authController.getLogin);

router.post("/login", isNotLoggedIn, authController.postLogin);

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
