//Scrape New Articles button
$("#scrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        console.log(data)
        $("#scrapedCount").text("You just scraped some articles. Congrats. You are able to press a button. Here they come!");
        setTimeout(function() {
            window.location = "/"
        }, 5000);
    })
});

//Highlight selected navbar button
$(".navbar-nav li").click(function() {
   $(".navbar-nav li").removeClass("active");
   $(this).addClass("active");
});

//Save Article button
$(".save").on("click", function() {
    let thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).done(function(data) {
        window.location = "/"
    })
});

//Delete Article button (remove entire saved article)
$(".delete").on("click", function() {
    let thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/delete/" + thisId
    }).done(function(data) {
        window.location = "/saved"
    })
});

//Add a Note button
$(".saveNote").on("click", function() {
    let thisId = $(this).attr("data-id");
    if (!$("#noteText" + thisId).val()) {
        alert("Enter a note first nimrod.")
    }else {
      $.ajax({
            method: "POST",
            url: "/notes/save/" + thisId,
            data: {
              text: $("#noteText" + thisId).val()
            }
          }).done(function(data) {
              // Empty the notes section
              $("#noteText" + thisId).val("");
              $(".modalNote").modal("hide");
              window.location = "/saved"
          });
    }
});

//Delete button (on each saved article panel body)
$(".deleteNote").on("click", function() {
    let noteId = $(this).attr("data-note-id");
    let articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/notes/delete/" + noteId + "/" + articleId
    }).done(function(data) {
        console.log(data)
        $(".modalNote").modal("hide");
        window.location = "/saved"
    })
});