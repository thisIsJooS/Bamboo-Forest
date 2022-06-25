const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validator");
const { isLoggedIn, isNotLoggedIn } = require("../middlewares/auth");
const authController = require("../controllers/auth");

const router = express.Router();

const validateCredential = [
  body("username")
    .trim()
    .notEmpty()
    .isLength({ min: 4, max: 10 })
    .withMessage(
      "username should be at least 4 characters, at most 10 characters."
    ),
  body("password")
    .trim()
    .isLength({ min: 4 })
    .withMessage(
      "password should be at least 4 characters, at most 10 characters."
    ),
  validate,
];

const validateSignup = [
  ...validateCredential,
  body("useremail")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage("invalid email"),
  validate,
];

router.get("/signup", isNotLoggedIn, authController.getSignupPage);

router.post("/signup", isNotLoggedIn, authController.signup);

router.get("/login", isNotLoggedIn, authController.getLoginPage);

router.get("/login/google", isNotLoggedIn, authController.googleLogin);

router.get("/callback/google", authController.googleCallback);

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

router.get("/withdrawal", isLoggedIn, authController.withdrawAccount);

module.exports = router;
