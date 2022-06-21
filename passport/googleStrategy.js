const passport = require("passport");
const googleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/user");

module.exports = () => {
  passport.use(
    new googleStrategy(
      {
        clientID: process.env["GOOGLE_CLIENT_ID"],
        clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
        callbackURL: `/auth/callback/google`,
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("google profile", profile);
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "google" },
          });
          if (exUser) {
            done(null, exUser);
          } else {
            const newUser = await User.create({
              email: profile.emails[0].value || "",
              name: profile.displayName || "",
              snsId: profile.id || "",
              provider: "google",
            });
            done(null, newUser);
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
