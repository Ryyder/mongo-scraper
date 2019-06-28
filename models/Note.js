// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Note schema
var NoteSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: "Name is Required"
  },
  body: {
    type: String,
    trim: true,
    required: "Comment is Required"
  }
});

// Create the Note model with the NoteSchema
var Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;
