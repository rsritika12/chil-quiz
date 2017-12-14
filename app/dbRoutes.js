//Adapted from 67-328 slides
// include my model for this application
var mong = require("../models/user.js")

// Define the routes for this controller
exports.init = function(app) {
  app.get('/', homepage); // The homepage page
 
  // The collection parameter maps directly to the mongoDB collection
  app.post('/:collection', doUpdate); // CRUD Update
}

/********** CRUD Update *******************************************************/
doUpdate = function(req, res){
  // filter on user and name of list, which cannot be updated
  var filter = {"username": req.session.username, "score": req.body.filter};
  // if there no update operation defined, render an error page.
  if (!req.body.update) {
    res.render("No update operation defined"});
    return;
  }
  var update = {"$set":{"score":req.body.update}};
   
  mongoModel.update(  req.params.collection, filter, update,
		                  function(status) {
              				  res.render(obj: status);
		                  });
}


 