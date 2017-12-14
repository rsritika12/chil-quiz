var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var users = JSON.parse(fs.readFileSync('./json/user.json', 'utf8'));
var exports = module.exports = {};
var mongoClient = require('mongodb').MongoClient;

/*
 * This connection_string is for mongodb running locally.
 * Change nameOfMyDb to reflect the name you want for your database
 */
var connection_string = 'ritika:1234@ds135876.mlab.com:35876/user-info';

/*
 * If OPENSHIFT env variables have values, then this app must be running on 
 * OPENSHIFT.  Therefore use the connection info in the OPENSHIFT environment
 * variables to replace the connection_string.
 */
 // logging in and sign up done through https://scotch.io/tutorials/easy-node-authentication-setup-and-local
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}
// Global variable of the connected database
var mongoDB; 

// Use connect method to connect to the MongoDB server
mongoClient.connect('mongodb://'+connection_string, function(err, db) {
  if (err) doError(err);
  console.log("Connected to MongoDB server at: "+connection_string);
  mongoDB = db; // Make reference to db globally available.
});
exports.findOne = function (user, callback) {
    var email = user.email;
    for (var i = 0; i < users.length; i++) {
        var act_user = users[i];
        act_user.validPassword = function (password) {
            if (act_user["password"].length > 0) {
                return validatePassword(password, act_user["password"]);
            }
            return false;
        };

        if (act_user["email"] === user.email) {
            callback(null, act_user);
            return;
        }
    }
    callback(null, null);
};

mongoClient.connect('mongodb://ritika:1234@ds113566.mlab.com:13566/game-scores', (err, database) => {
  if (err) return console.log(err)
  db = database
   {
  var cursor = db.collection('scores').find()
}
});

//checks against generated profile id when user logs in
exports.findOneBasedOnProfileId = function (profileId, callback) {
    for (var i = 0; i < users.length; i++) {
        var act_user = users[i];
        if (act_user["profileId"] === profileId) {
            callback(null, act_user);
            return;
        }
    }
    callback(null, null);
};

exports.findById = function (id, callback) {
    for (var i = 0; i < users.length; i++) {
        if (users[i]["id"] === id) {
            callback(null, users[i]);
            return;
        }
    }
    callback(null, null);
};
// source hashing https://blog.ghaiklor.com/profiling-nodejs-applications-1609b77afe4e
//// generating a hash
exports.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//// checking if password is valid
//https://github.com/google/google-api-nodejs-client/501
function validatePassword(password, encryptedPassword) {
    return bcrypt.compareSync(password, encryptedPassword);
}
//schema for a user who logs in 
exports.userSchema = {
    'local': {
        'email': '',
        'password': ''
    }
};
exports.scoreSchema = {
    'local': {
        'email': '',
        'password': '',
        'score': ''
    }
};
//creates a random id to identify person through random ints
exports.generateId = function () {
    var id = rand() + rand() + '-' + rand() + '-' + rand() + '-' + rand() + '-' + rand() + rand() + rand();
    for (var i = 0; i < users.length; i++) {
        if (users[i]["id"] === id) {
            return this.generateId();
        }
    }
    return id;
};

function rand() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

exports.save = function (newUser, callback) {
    users.push(newUser);
    try {
        fs.writeFileSync('./json/user.json', JSON.stringify(users));
        console.log('User saved');
        callback();
    } catch (e) {
        return;
    }
};

