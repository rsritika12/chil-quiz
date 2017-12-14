// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;

// load up the user model
var User = require('../app/models/user');

// logging in, sign up, authentication done through https://scotch.io/tutorials/easy-node-authentication-setup-and-local
module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    
     passport.use('login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            User.findOne({ 'email' :  email }, function(err, user) {
                if (err) return done(err);
                if (!user) return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, user);
            });

        }));


    passport.use('signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        process.nextTick(function() {
            User.findOne({ 'email' :  email }, function(err, user) {
                if (err)
                    return done(err);

                // check to see if theres already a user with that email
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email/username is already taken.'));
                } else {
                    var newUser = createNewUser(email, password);
                    return done(null, newUser);
                }
            });
        });
    }));

};

function createNewUser(email, password, profileId, profileToken, name) {
    var newUser = {};
    newUser.email    = email;
    newUser.name    = name;
    newUser.password = password === "" ? password : User.generateHash(password);
    newUser.id = User.generateId();
    newUser.profileId = profileId || "-";

    // save the user
    User.save(newUser, function(err) {
        if (err) {
            console.log("error: ", err);
            throw err;
        }
    });
    console.log("new user:", JSON.stringify(newUser));
    return newUser;
}