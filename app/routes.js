// var redis = require('redis');
var quizServer = require('./quizServer');


// logging in and sign up done through https://scotch.io/tutorials/easy-node-authentication-setup-and-local
module.exports = function(app, passport) {
    // Log time on console
    //https://stackoverflow.com/questions/10645994/node-js-how-to-format-a-date-string-in-utc
    app.use(function (req, res, next) {
        var now = new Date((new Date() - 1000 * 60 * 60)).toISOString();
        console.log(now.slice(0, 10) + " " + now.slice(11, 16));
        next();
    });
    //allows for ability to login in 
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });
    // process the login form
     app.post('/login', passport.authenticate('login', {
         successRedirect : '/creative', // redirect to the secure profile section
         failureRedirect : '/login', // redirect back to the signup page if there is an error
         failureFlash : true 
     }));

   //allows for ability to sign up 
    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('signup', {
        successRedirect : '/creative', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.get('/creative', isLoggedIn, function(req, res) {
        res.render('creative.ejs', {
            user : req.user,
            quizzes: quizServer.getQuizzes()
        });
    });

    app.get('/creative/*',function(req, res) {
        res.redirect('/creative');
    });

    app.post('/submit', function(req, res) {
        responseData = quizServer.validateAnswer(req);
        req.session.answerIndex+=1;
        console.log(req.session.answerIndex);
        responseData.questionIndex = req.session.answerIndex;
        res.send(responseData);
    });

    app.post('/quiz-select', function(req, res) {
        if (!req.body || !req.body.data) {
            console.log("error, invalid request");
            res.send({error: true, message: "invalid request", subMessage: "Please use the valid quizzes, do not try to come up with new ones :)"});
        } else {
            var selectedQuiz = req.body.data;
            console.log("selectedQuiz: " + selectedQuiz);
            res.send(quizServer.loadQuiz(selectedQuiz, req));
        }
    });
    // display the high score http://clockworkchilli.com/blog/7_set_up_a_node.js_server_to_add_a_leaderboard_to_your_game
    app.post('/show-high-score', function(req, res) {
        if (!req.body || !req.body.data) {
            console.log("error, invalid request");
            res.send({error: true, message: "invalid request", subMessage: "Sorry, but I cannot show Highscore without a valid request"});
        } else {
            var quizName = req.body.data;
            console.log("Highscore for: " + quizName + " has been requested");
            res.send(quizServer.showHighScoreFor(quizName, req));
        }
    });

  
};

// private methods ======================================================================
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

function censor(censor) {
    var i = 0;

    return function(key, value) {
        if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
            return '[Circular]';

        if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
            return '[Unknown]';

        ++i; // so we know we aren't using the original object anymore

        return value;
    }
}

