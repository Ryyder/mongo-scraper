// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var axios = require("axios");
var exphbs = require("express-handlebars");

// Requiring Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Scraping tools
var cheerio = require("cheerio");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

//Define port
var port = process.env.PORT || 3000

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

app.engine("handlebars", exphbs({
  defaultLayout: "main",
  partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

// Database configuration with mongoose
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/crypto";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//our scrape...
app.get("/scrape", (req, res) => {
  // First, we grab the body of the html with axios
  axios.get("https://www.coindesk.com/").then((response) => {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every a.stream-article element, and do the following:
    $("a.stream-article").each((i, element) => {
      // Save an empty result object
      var result = {};

      // at this level, we can extract the title and href from the <a> element. We can also extract the summary by going down a level to the div.meta -> p element, and grabbing the text out of it. We then save them as properties of the result object
      result.title = $(this).attr("title");
      result.link = $(this).attr("href");
      result.summary = $(this).children("div.meta").children("p").text();

      console.log(result);

      //we create a new entry using the Article model
      //pass the result object to entry
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save((err, doc) => {
        // log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

//GET requests to render Handlebars pages
app.get("/", (req, res) => {
  //find the articles with saved false boolean
  Article.find({ saved: false }, (error, data) => {
    //put the data in our hbsobject
    var hbsObject = {
      article: data
    };
    console.log(hbsObject);
    //render our home page with the hbsobject
    res.render("home", hbsObject);
  });
});

//our saved api path...
app.get("/saved", (req, res) => {
  //find article by saved true boolean and populate the note
  Article.find({ saved: true }).populate("notes").exec((error, articles) => {
    //put the article in our hbsobject
    var hbsObject = {
      article: articles
    };
    //render our saved page with the hbsobject
    res.render("saved", hbsObject);
  });
});

// query to find the articles we scraped....
app.get("/articles", (req, res) => {
  // Grab every doc in the Articles array
  Article.find({}, (error, doc) => {
    // log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// query the article by it's ObjectId
app.get("/articles/:id", (req, res) => {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
    //populate all of the notes associated with it
    .populate("note")
    // now, execute our query
    .exec((error, doc) => {
      // log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise, send the doc to the browser as a json object
      else {
        res.json(doc);
      }
    });
});


// Save an article
app.post("/articles/save/:id", (req, res) => {
  // query by the article id to find and update its saved boolean
  Article.findOneAndUpdate({ _id: req.params.id }, { saved: true })
    // execute the above query
    .exec((err, doc) => {
      // log any errors
      if (err) {
        console.log(err);
      }
      else {
        // Or send the document to the browser
        res.send(doc);
      }
    });
});

// Delete an article
app.post("/articles/delete/:id", (req, res) => {
  // Use the article id to find and update its saved boolean
  Article.findOneAndUpdate({ _id: req.params.id }, { saved: false, notes: [] })
    // execute the above query
    .exec((err, doc) => {
      // log any errors
      if (err) {
        console.log(err);
      }
      else {
        // Or send the document to the browser
        res.send(doc);
      }
    });
});


// our new note...
app.post("/notes/save/:id", (req, res) => {
  // the new note and pass the req.body to the entry
  var newNote = new Note({
    body: req.body.text,
    article: req.params.id
  });
  console.log(req.body)
  // save the new note the db
  newNote.save((error, note) => {
    // log errors
    if (error) {
      console.log(error);
    }
    else {
      // query by using the article id to find and update it's notes
      Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: note } })
        // execute the above query
        .exec((err) => {
          // log any errors
          if (err) {
            console.log(err);
            res.send(err);
          }
          else {
            // send the note to the browser
            res.send(note);
          }
        });
    }
  });
});

// our delete note .....
app.delete("/notes/delete/:note_id/:article_id", (req, res) => {
  // query by the note id to find and delete it
  Note.findOneAndRemove({ _id: req.params.note_id }, (err) => {
    // log any errors
    if (err) {
      console.log(err);
      res.send(err);
    }
    else {
      Article.findOneAndUpdate({ _id: req.params.article_id }, { $pull: { notes: req.params.note_id } })
        // execute the query
        .exec((err) => {
          // log any errors
          if (err) {
            console.log(err);
            res.send(err);
          }
          else {
            // Or send the note to the browser
            res.send("Note Deleted");
          }
        });
    }
  });
});

// Listen on port
app.listen(port, function () {
  console.log("App running on port " + port);
});

