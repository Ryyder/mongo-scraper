//scrape event handler
$("#scrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).then(function(data) {
        console.log(data)
        window.location = "/"
    })
});

//save article event handler
$("#save").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).then(function(data) {
        window.location = "/"
    })
});

//delete article event handler
$("#delete").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/delete/" + thisId
    }).then(function(data) {
        window.location = "/saved"
    })
});

//save note event handler
$(".saveNote").on("click", function() {
    var thisId = $(this).attr("data-id");
    if (!$("#noteText" + thisId).val()) {
        alert("please enter a note to save")
    }else {
      $.ajax({
            method: "POST",
            url: "/notes/save/" + thisId,
            data: {
              text: $("#noteText" + thisId).val()
            }
          }).then(function(data) {
              // Log the response
              console.log(data);
              // Empty the notes section
              $("#noteText" + thisId).val("");
              $(".modalNote").modal("hide");
              window.location = "/saved"
          });
    }
});

//delete note event handler
$("#deleteNote").on("click", function() {
    var noteId = $(this).attr("data-note-id");
    var articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/notes/delete/" + noteId + "/" + articleId
    }).then(function(data) {
        console.log(data)
        $(".modalNote").modal("hide");
        window.location = "/saved"
    })
});
