//Sets up a function for viewing the comments on a particular article
function viewComments() {
  //Whenever someone clicks a "View Comments" button...
  $(document).on("click", ".view-comments", function() {
    //Save the ID from that button
    var thisId = $(this).attr("data-id");

    //Send a GET request to the server
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      //After the GET request goes through...
      .then(function(data) {
        //Empty all the existing comments in the Comments modal
        $("#existing-comments").empty();

        //Fill in the title of the article at the top of the Comments modal
        $("#article-title").text(data.title);

        //Create a Post button in the Comments modal
        $("#post-button").html(
          ' <button type="button" data-id="' +
            data._id +
            '" class="btn btn-primary post-comment" data-dismiss="modal">Post!</button>'
        );

        //If there's a comment associated with the article...
        if (data.comment) {
          //Go through each comment...
          data.comment.forEach(function(element) {
            //Add the comment's information to the comments section
            //Each comment is placed in a Div that has a class of the comment's ID, & a Delete button that also stores the comment's ID, so that the comment can be easily removed later on
            $("#existing-comments").prepend(
              "<div class = '" +
                element._id +
                "'><strong>" +
                element.name +
                ": </strong><a class='btn btn-info btn-sm delete-comment' data-id = '" +
                element._id +
                "' style='float: right'><span class='glyphicon glyphicon-remove'></span></a><br>" +
                element.body +
                "<br><hr><br></div>"
            );
          });
        }
      });
  });
}



//Sets up a function for posting a new comment
function postComment() {
  //Whenever someone clicks the "Post" button...
  $(document).on("click", ".post-comment", function() {
    //Save the ID from that button
    var thisId = $(this).attr("data-id");

    //Send a POST request to the server
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        //Value taken from the Name input
        name: $("#name").val(),
        // Value taken from Comment textarea
        body: $("#comment").val()
      }
    });

    //Remove the values entered currently typed into the form
    $("#name").val("");
    $("#comment").val("");
  });
}



//Sets up a function for deleting a comment
function deleteComment() {
  //Whenever someone clicks the "X" button next to a comment...
  $(document).on("click", ".delete-comment", function() {
    //Save the ID from that button
    var thisId = $(this).attr("data-id");

    //Send a GET request to the server
    $.ajax({
      method: "GET",
      url: "/delete/" + thisId
    })
      //Once the request is complete, delete the comment off the page
      .then(function(data) {
        $("." + thisId).remove();
      });
  });
}



//Runs all the necessary functions that are defined above
viewComments();
postComment();
deleteComment();
