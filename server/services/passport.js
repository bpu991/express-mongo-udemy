const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users'); // fetches model class from models dir

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
    .then(user => {
        done(null, user);
    })
});

passport.use(
    new GoogleStrategy(
        {
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: '/auth/google/callback'
        },
        (accessToken, refreshToken, profile, done) => {
            User.findOne({ googleId: profile.id }) // queries db for googleId matching profile.id
                .then((existingUser) => {
                    if (existingUser) { // means user alreadt exists, do not create a new one
                        // console.log(existingUser)
                        done(null, existingUser);
                    } else { // creates a new user with the profile id
                        new User({ googleId: profile.id })
                        .save() //.save() saves data to the database
                        .then(user => done(null, user));
                    }
                })
            
        }
    )
);