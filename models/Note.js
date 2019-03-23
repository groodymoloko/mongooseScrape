// Require mongoose npm module
const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Ceate a new NoteSchema object tied to a particular article ID
const NoteSchema = new Schema({
  body: {
      type: String
  },
  article: {
      type: Schema.Types.ObjectId,
      ref: "Article"
  }
});

// This creates our model from the above schema, using mongoose's model method
const Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;
