
var fs = require('fs');
var User = require('./models/user');
var exports = module.exports = {};
var pathToQuizzes = 'json/quizzes/';
var HIGH_SCORE_FILE = 'json/highscore.json';
var QUIZ_JSON = 'Quiz.json';
var QUIZ_ANSWER_KEYS_JSON = 'QuizAnswerKeys.json';
var quizFileNames = fs.readdirSync(pathToQuizzes);
var quizzes = {}; updateQuizzes();

function valid(req) {
    return req.session.quizAnswers && req.session.quizAnswers[req.session.answerIndex];
}
//load up quizzes
exports.updateQuizzes = function() {
    updateQuizzes();
};
//display all the quizzes
exports.getQuizzes= function() {
    return quizzes;
};
//make sure answer is correct on quiz question
//adapted from Mean stack app https://quiz-app.herokuapp.com/
exports.verify = function(){
    $scope.correct = 0;
    $scope.result = false;
    $scope.nextQuestion = function() {
        console.log("Right Answer ", $scope.quiz.rightAnswer);
      if(($scope.selectedOption.option)=== $scope.quiz.rightAnswer){
             $scope.correct++;
      }
      else{
          $scope.correct;
      }      
       $scope.QuestionNo++;
       $scope.quiz = $scope.questionArray[$scope.QuestionNo];
       console.log('seclected option ', $scope.selectedOption.option)
        
       $scope.selectedOption = ""
}
}

exports.validateAnswer = function(req) {
    "use strict";
    let responseJson = {
        'scoreUp': 0,
        'gameFinished': false,
        'name': req.session.quizName
    };
    console.log(JSON.stringify(req.session));
    if(!valid(req)) {
        responseJson.gameFinished = true;
        return responseJson;
    }

    if(empty(req)) {
        return responseJson;
    }

    if(check(req)) {
        req.session.score += 10;
        responseJson.scoreUp = 10;
        responseJson.gameFinished = last(req.session);
        if (responseJson.gameFinished) { saveHighScore(req); }
        return responseJson;
    }

    return responseJson;
};


function last(session) {
    return session.quizLength === session.answerIndex+1;
}

//make sure response isnt empty
function empty(req) {
    return req.body.data.length === 0;
}


// https://medium.com/@rotemtam/build-a-kahoot-clone-with-angularjs-and-firebase-b8b30891d968
exports.loadQuiz = function(selectedQuiz, req) {
    var quiz;
    req.session.answerIndex = 0;

    for ( var key in quizzes ) {
        if (quizzes.hasOwnProperty(key) && selectedQuiz === key) {
            try {
                quiz = JSON.parse(fs.readFileSync(quizzes[key].quizFile, 'utf8'));
                req.session.quizAnswers = JSON.parse(fs.readFileSync(quizzes[key].answerFile, 'utf8'));
                req.session.quizName = quiz.name;
                req.session.quizLength = Object.keys(quiz.questions).length;
                req.session.score = 0;
                break;
            } catch(e) {
                return {error: true, message: "Server error.", subMessage: "the requested quiz unfortunately not available right now. Please select another one!"};
            }
        }
    }
    if (quiz) { return quiz; }
    return {error: true, message: "Invalid quiz request", subMessage: "the requested quiz unfortunately not exists yet. Come back later!"};
};
function check(req) {
    return req.session.quizAnswers[req.session.answerIndex] === req.body.data;
}
// updates the score 
// Adapted from http://clockworkchilli.com/blog/7_set_up_a_node.js_server_to_add_a_leaderboard_to_your_game
exports.showHighScoreFor = function(quizName, req) {
    "use strict";
    var highScore,
        responseJson = {};
    try {
        highScore = JSON.parse(fs.readFileSync(HIGH_SCORE_FILE, 'utf8'));
        highScore.tables = highScore.tables || {};
        highScore.tables.highscore_per_quiz = highScore.tables.highscore_per_quiz || {};
        if (quizName === "all") {
            responseJson.title = "all";
            responseJson.body = highScore.tables.highscore_per_quiz || responseJson;
        } else {
            responseJson.title = quizName;
            responseJson.body = highScore.tables.highscore_per_quiz[quizName] || responseJson;
        }
    } catch (e) {
        responseJson = {'error': true, 'message': 'Server error', 'subMessage': 'Some error happened reading the highscore. Sorry for the inconveniences'};
    }
    return responseJson;
};
function saveHighScore(req) {
    "use strict";
    try {
        let highScore = JSON.parse(fs.readFileSync(HIGH_SCORE_FILE, 'utf8'));
        highScore.tables = highScore.tables || {};
        highScore.tables.highscore_per_quiz = highScore.tables.highscore_per_quiz || {};
        highScore.tables.highscore_per_quiz[req.session.quizName] = highScore.tables.highscore_per_quiz[req.session.quizName] || {};
        highScore.tables.highscore_per_quiz[req.session.quizName][req.user.email] =  highScore.tables.highscore_per_quiz[req.session.quizName][req.user.email] || {};
        highScore.tables.highscore_per_quiz[req.session.quizName][req.user.email] = updateUserScoreIfBetter(highScore.tables.highscore_per_quiz[req.session.quizName][req.user.email], req.session.score);

        console.log(JSON.stringify(highScore));
        fs.writeFileSync(HIGH_SCORE_FILE, JSON.stringify(highScore), 'utf-8');
    } catch (e) {
        console.error(e);
        console.error("Exception while trying to update highscore table");
    }
}

//Adapted from https://stackoverflow.com/questions/11552533/quiz-multiple-choice-field-for-content-node-to-create-quizzes
function updateUserScoreIfBetter(oldScoreObject, newScore) {
    "use strict";
    let newScoreObject = oldScoreObject || {};
    console.log("newScore newScore newScore newScore newScore ");
    console.log(JSON.stringify(newScoreObject));
    console.log(newScore);
    if (isObjectEmpty(newScoreObject)  || newScoreObject.score < newScore) {
        let now = new Date((new Date() - 1000 * 60 * 60)).toISOString();
        newScoreObject.score = newScore;
        newScoreObject.dateTime = now.slice(0, 10) + " " + now.slice(11, 16);
    }
    return newScoreObject;
}
//check to see if no answer is submitted
function isObjectEmpty(o) {
    return Object.getOwnPropertyNames(o).length === 0;
}
//loop through quizzes to find appropriate one
function updateQuizzes() {
    "use strict";
    quizFileNames.forEach(function(fileName) {
        let quizNameGroups = /(.*)Quiz.json/.exec(fileName);
        let answerKeyNameGroups = /(.*)QuizAnswerKeys.json/.exec(fileName);
        let actualQuizName = quizNameGroups ? quizNameGroups[1] : false;
        let actualAnswerKeyName = answerKeyNameGroups ? answerKeyNameGroups[1] : false;
        let quizName = actualQuizName || actualAnswerKeyName;
        quizzes[quizName] = quizzes[quizName] || {};
        if (actualQuizName) { quizzes[quizName].quizFile = [pathToQuizzes + quizName + QUIZ_JSON].join(''); }
        if (quizName) { quizzes[quizName].answerFile = [pathToQuizzes + quizName + QUIZ_ANSWER_KEYS_JSON].join('') }
        quizzes[quizName].category = /(.*)_/.exec(fileName)[1];
        quizzes[quizName].imageName = /(.*)_(.*)(Quiz.json|QuizAnswerKeys.json)/.exec(fileName)[2];
    });
}
