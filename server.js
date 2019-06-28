//Requiring necessary packages

//Handles routing
var express = require("express");

//Handles templating
var exphbs = require("express-handlebars");

//Sets up parsing of info that is sent to the server.
var bodyParser = require("body-parser");

//Sets up ORM for interacting with MongoDB.
var mongoose = require("mongoose");



//Our scraping tools

//Makes HTTP request for HTML page
var request = require("request");

//Scrapes the contents of a page
var cheerio = require("cheerio");

//Requires all models
var db = require("./models");

//Sets up a port for the app to run on
var PORT = process.env.PORT || 3000;

//Initializes Express
var app = express();



//Configuring middleware

//Configures bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Configures Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//Allows the app to use express.static to serve the public folder as a static directory
app.use(express.static("public"));



//Connecting to the DB

//If deployed, use the deployed database. Otherwise use the local mongoMusicScraper database
var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/crypto";

//Sets mongoose to leverage built in JavaScript ES6 Promises
//Connects to the Mongo DB
mongoose.Promise = Promise;






//Routes

//Creates new articles in the Article collection for every article the app scrapes off the site
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.coindesk.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("a.stream-article").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).attr("title");
      result.link = $(this).attr("href");
      result.summary = $(this).children("div.meta").children("p").text();

      console.log(result);

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});





//Gets all Articles from the DB
app.get("/", function (req, res) {
  //Grabs every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      //Creates an object built from the results of the query
      var articlesObject = {
        articles: dbArticle
      };

      //Uses the "index" Handlebars page to load the results of the query into it
      res.render("index", articlesObject);
    })
    .catch(function (err) {
      //If an error occurrs, sends it to the client
      res.json(err);
    });
});





//Grabs a specific Article by ID & populates it with its Comments
app.get("/articles/:id", function (req, res) {
  //Using the ID passed into the ID parameter, prepares a query that finds the Article with the matching ID in the DB...
  db.Article.findOne({ _id: req.params.id })

    //...and populates all of the Comments associated with it
    //This supplies the rest of the Comments' property values to the Article besides just its ID, which was the only Comment property pushed to the Article's Comments array originally
    .populate("note")

    .then(function (dbArticle) {
      //If we were able to successfully find an Article with the given ID, sends it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      //If an error occurs, sends it to the client
      res.json(err);
    });
});





//Saves an Article's associated Comment
app.post("/articles/:id", function (req, res) {
  //Creates a new comment using the information submitted
  db.Comment.create(req.body)

    .then(function (dbComment) {
      //If a Comment was created successfully, finds one Article with an `_id` equal to `req.params.id`
      //Pushes the new Comment into that Article's "Comment" array
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { comment: dbComment._id } },
        { new: true }
      );
    })
    .then(function (dbArticle) {
      //If we were able to successfully update an Article, sends it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      //If an error occurs, sends it to the client
      res.json(err);
    });
});






//Deletes a comment
app.get("/delete/:id", function (req, res) {
  //Queries the Comment collection for a comment with the specified ID
  db.Comment.findOneAndRemove({ _id: req.params.id })

    .then(function (dbDeleted) {
      //If the query was succesful, send the deleted comment back to the client
      res.json(dbDeleted);
    })
    .catch(function (err) {
      //If an error occurs, sends it back to the client
      res.json(err);
    });
});




mongoose.connect(MONGODB_URI);

//Starts the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
