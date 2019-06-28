//Requires the Mongoose ORM
var mongoose = require("mongoose");

//Saves a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, creates a new ArticleSchema object
var ArticleSchema = new Schema({

  title: {
    type: String,
    unique: true,
    required: true
  },

  link: {
    type: String,
    unique: true,
    required: true
  },

  summary: {
    type: String,
    unique: true,
    required: true
  },

  // 'note' is an array of note objects that stores each note's ID
  // The ref property links the ObjectId to the note model
  // This allows us to populate the Article with an associated note
  note: [
    {
      //"Schema.Types.ObjectID" is a special mongoose type that finds the ID of that item in the notes collection
      type: Schema.Types.ObjectId,

      //This looks into that collection & finds the ID of each item in it
      ref: "note"
    }
  ]
});

//This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

//Exports the Article model
module.exports = Article;
