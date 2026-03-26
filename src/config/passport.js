import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import redis from './redis.js';
import { JWT_SECRET } from './env.js';

const extractToken = ExtractJwt.fromAuthHeaderAsBearerToken();

passport.use(new JwtStrategy(
  {
    jwtFromRequest: extractToken,
    secretOrKey: JWT_SECRET,
    passReqToCallback: true,
  },
  async (req, payload, done) => {
    try {
      const token = extractToken(req);

      // Reject tokens that were invalidated via logout
      const blacklisted = await redis.get(`blacklist:${token}`);
      if (blacklisted) {
        return done(null, false, { message: 'Token inválido. Por favor inicia sesión nuevamente.' });
      }

      // Attach raw token so logout can blacklist it
      req.token = token;

      return done(null, { id: payload.sub, email: payload.email });
    } catch (err) {
      return done(err, false);
    }
  },
));

export default passport;
