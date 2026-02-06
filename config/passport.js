import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // 1. Check if user already exists with this googleId
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
            return done(null, existingUser);
        }

        // 2. Check if user exists with the same email
        const existingEmailUser = await User.findOne({ email: profile.emails[0].value });
        if (existingEmailUser) {
            // Link the googleId to the existing user
            existingEmailUser.googleId = profile.id;
            await existingEmailUser.save();
            return done(null, existingEmailUser);
        }

        // 3. Create new user
        const newUser = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName.replace(/\s+/g, '_').toLowerCase() + Math.random().toString(36).substring(7),
            password: Math.random().toString(36).slice(-8) + '!!Aa1', // Random secure password
            profile: {
                displayName: profile.displayName,
                // avatar: profile.photos[0].value // Assuming you might add avatar later
            },
            onboardingCompleted: true // Google users might skip typical onboarding or default it
        });

        await newUser.save();
        done(null, newUser);

    } catch (err) {
        console.error("Google OAuth Error:", err);
        done(err, null);
    }
}));
