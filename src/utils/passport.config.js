import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { UsersModel } from "../models/users.models.js";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new Strategy(options, async (jwt_payload, done) => {
    try {
      const user = await UsersModel().getUserById(jwt_payload.id);
      delete user.password;
      delete user.created_at;

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error);
    }
  })
);

export default passport;
