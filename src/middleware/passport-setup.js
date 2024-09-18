import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const callbackURL = process.env.NODE_ENV === 'production'
  ? process.env.PROD_GOOGLE_CALLBACK_URL // URL de producción
  : process.env.GOOGLE_CALLBACK_URL; // URL local de desarrollo

// Configuración de la estrategia de Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: callbackURL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Verificar si el usuario ya existe en la base de datos
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
            return done(null, existingUser);
        }

        // Si el usuario no existe, crear uno nuevo
        const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
        });
        await newUser.save();
        done(null, newUser);
    } catch (error) {
        console.error('Error en la estrategia de Passport:', error);
        done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.error('Error en deserialización de Passport:', error);
        done(error, null);
    }
});
