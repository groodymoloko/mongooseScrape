// Require all major npm module dependencies
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");
const cheerio = require("cheerio");

// Require all Mongo DB models
const Note = require("./models/Note.js");
const Article = require("./models/Article.js");

// Specify port in format require for Heroku
const PORT = process.env.PORT || 3000;

// Initialize Express server
const app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

// Use handlebars for HTML content rendering
app.engine('handlebars', exphbs({defaultLayout: 'main', partialsDir: path.join(__dirname, "/views/layouts/partials")}));
app.set("view engine", "handlebars");

// Connect to the Heroku DB if it exists, otherwise default to local Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongooseScrape";
mongoose.connect(MONGODB_URI);


// ROUTE: Output non-saved articles in the database to homepage (index) through handlebars
app.get("/", (req, res) => {
  Article.find({"saved": false}, (error, data) => {
    const hbsObject = {
      article: data
    };
    res.render("index", hbsObject);
  });
});

// ROUTE: Output saved articles in the database to Saved Articles page through handlebars
app.get("/saved", (req, res) => {
  Article.find({ "saved": true }).populate("notes").exec((error, articles) => {
      const hbsObject = {
          article: articles
      };
      res.render("saved", hbsObject);
  });
});

// ROUTE: Scrape articles from the Google News website using Axios and Cheerio and send them to the Mongo db
app.get("/scrape", (req, res) => {
  
  let searchTerm = 'hemp';
  let searchUrl = 'https://www.google.com/search?q=' + searchTerm + '&tbm=nws';

  axios.get(searchUrl).then(function(response) {
   
    const $ = cheerio.load(response.data);

    $('div.g').each(function(i, element) {
      let savedData = {};
      savedData.title = $(this).find('.r').text();
      savedData.link = $(this).find('.r').find('a').attr('href').replace('/url?q=', '').split('&')[0];
      savedData.text = $(this).find('.st').text();
      savedData.img = $(this).find('img.th').attr('src');

      // Do not allow duplicates to populate the Mongo database
      Article.countDocuments({"title": savedData.title})
        .then((dbArticle) => {
            if (!dbArticle) {
                console.log("NEW ARTICLE ADDED: " + savedData.title);
                Article.create(savedData)
                    .then((dbArticle) => {})
                    .catch((error) => {
                        // If an error occurred, log it
                        console.log(error);
                    });
            } else {
                console.log("REDUNDANT ARTICLE DONT ADD: " + savedData.title);
            }
        });
    });
    // Send a message to the client
    res.send("Scrape Complete");
  });

});

// ROUTE: This will get all the articles we scraped from the mongo DB
app.get("/articles", (req, res) => {
  // Grab every doc in the Articles array
  Article.find({}, (error, doc) => {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// ROUTE: Will get particular article by its ID along with any notes
app.get("/articles/:id", (req, res) => {
  Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(error) {
      res.json(error);
    });
});

// ROUTE: Will save one article
app.post("/articles/save/:id", (req, res) => {
  Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
      .exec((error, doc) => error ? console.log(error) : res.send(doc));
});

// ROUTE: Make a new note or update existing note
app.post("/notes/save/:id", (req, res) => {
  const newNote = new Note({
    body: req.body.text,
    article: req.params.id
  });
  newNote.save((error, note) => {
    if (error) {
        console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "notes": note } })
        .exec((error) => {
          if (error) {
            console.log(error);
            res.send(error);
          }
          else {
            res.send(note);
          }
        });
    }
  });
});

// ROUTE: Unsave a particular article and all notes for article
app.post("/articles/delete/:id", (req, res) => {
  Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false, "notes": [] })
      .exec((error, doc) => error ? console.log(error) : res.send(doc));
});

// ROUTE: Delete a note from the database
app.delete("/notes/delete/:note_id/:article_id", (req, res) => {
  Note.findOneAndRemove({ "_id": req.params.note_id }, (error) => {
    if (error) {
      console.log(error);
      res.send(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.article_id }, { $pull: { "notes": req.params.note_id } })
        .exec((error) => error ? res.send(error) : res.send("Note Gone!"));
    }
  });
});

// Start the express server
app.listen(PORT, () => {
  console.log("App is now running on port " + PORT + "!");
});
