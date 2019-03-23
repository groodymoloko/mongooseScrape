// Require mongoose npm module
const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Create new article schema
const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  saved: {
    type: Boolean,
    default: false
  },
  // Use an array so multiple notes can be stored for the article and retrieved for display later on
  notes: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]
});

// Create Article model using mongoose
const Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
