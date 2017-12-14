function doXMLHttpRequest() {
  var xhr = new XMLHttpRequest(); 
  xhr.onreadystatechange=function()  {
  if (xhr.readyState==4) {
  if(xhr.status == 200) {
  processResponse(xhr.responseText);
  } else {
  responseArea.innerHTML="Error code " + xhr.status;}
  }}
  xhr.open("GET", "data.json", true); 
  xhr.send(); 
} 
function processResponse(responseJSON) {
  var responseObject = JSON.parse(responseJSON);
  var result = "";
  for (var i = 0; i<responseObject.links.length; i++) {
  var c = responseObject.links[i];
  var names = ["Weather Underground Homepage","Severe Weather","Weather News","Weather Webcams","Marine Weather"]
  var str = names[i];
  result += str.link(c.link);
  result += "\n" + "<br>";
  }
  document.getElementById("demo").innerHTML = result;
}
//drop down adapted from www.https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwjXh5zUn9HWAhVG6CYKHXJjD1UQFggmMAA&url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fcss_dropdowns.asp&usg=AOvVaw2vI5z4nbV1twusqqw3gHX8
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
function dets() {
    var x = document.getElementById("myDetails");
    x.open = true;
}
$(document).ready(function() {
jQuery(function($){
    function weather(){
      //Api taken from wunderground, weather API
      //call to api made here
      $.ajax("https://api.wunderground.com/api/66cfc32e9ed6104f/forecast10day/q/PA/Pittsburgh.json", {
        dataType: 'jsonp',
        success: function(data) {
          // 2nd method text()
          $('div#day1').text(data.forecast.txt_forecast.forecastday[0].title);
          //3rd method html()
          $('div#photo1').html('<img src=' + data.forecast.txt_forecast.forecastday[0].icon_url + '>')
          $('div#weather1').text(data.forecast.txt_forecast.forecastday[0].fcttext);
          $('div#day2').text(data.forecast.txt_forecast.forecastday[2].title);
          $('div#photo2').html('<img src=' + data.forecast.txt_forecast.forecastday[2].icon_url + '>')
          $('div#weather2').text(data.forecast.txt_forecast.forecastday[2].fcttext);
          $('div#day3').text(data.forecast.txt_forecast.forecastday[4].title);
          $('div#photo3').html('<img src=' + data.forecast.txt_forecast.forecastday[4].icon_url + '>')
          $('div#weather3').text(data.forecast.txt_forecast.forecastday[4].fcttext);
          $('div#day4').text(data.forecast.txt_forecast.forecastday[6].title);
          $('div#photo4').html('<img src=' + data.forecast.txt_forecast.forecastday[6].icon_url + '>')
          $('div#weather4').text(data.forecast.txt_forecast.forecastday[6].fcttext);
          $('div#day5').text(data.forecast.txt_forecast.forecastday[8].title);
          $('div#photo5').html('<img src=' + data.forecast.txt_forecast.forecastday[8].icon_url + '>')
          $('div#weather5').text(data.forecast.txt_forecast.forecastday[8].fcttext);
        }

      });
    }
    $("#start_button").click(function(){
        $(this).hide();
            counter = setInterval(timer, 1000); 
        });

    $('a.weather').click(function(x) {
      x.preventDefault();
      $(this).hide();
      weather();
      $('#display').fadeIn(2000);
      $(this).css("font-style", "italic");
    });
     $("h2").each(function(){
      $(this).css("font-style", "italic");
      });

    $('a.hide').click(function(x) {
      x.preventDefault();
      $('#display').hide();
      $('a.weather').show();
    });

    $("#flip").click(function(){
      $("#panel").slideToggle("slow");
    });
    
  })

    var $quizSelection = $("#quizSelection"),
        $quizBox = $("#quizBox"),
        $networkError = $(".network-error"),
        $modalTemplate = $("#modal-template"),
        chosenAnswer,
        quizData,
        undefined = [][+[]];

    $( "a.quiz-select" ).click( function( event ) {
        var data = $(this).data('quiz');
        event.preventDefault();
        $.post( "/quiz-select", {'data': data} )
        .done( function( data ) {
            if(data.error || !data.questions || !data.questions["0"] || !data.questions["0"].question) {
                data.message = data.message || "invalid response";
                data.subMessage = data.subMessage || "Unfortunately the response somehow malformed, sorry for the inconveniences";
                invalidRequest(data.message, data.subMessage);
                return;
            }
            quizData = data;
            wipeQuizData();
            showQuizBox(data);
        })
        .fail( function() {
            showNetworkError();
        });
    });
    function get_question(number){
          var question = questions[number];
          $("#question_title").text("").text(question.question);
          $("#question_options").html("");
          $.each(question.choices, function(i, item){
            $("#question_options").append(item);
          });
      }
    $( ".show-high-score" ).click( function( event ) {
        event.preventDefault();
        showHighScore();
    });
    function timer(){
        count--;
        if (count <= 0) {
     countInterval(counter);
     return;
    }
    $("#timer").html("Time remaining: " + "00:" + count + " secs");
}

    $( ".update-quizzes" ).click( function( event ) {
        $.post( "/updateQuizzes" )
            .done( function( data ) {
                console.log(data);
            })
            .fail( function() {
                showNetworkError();
            });
    });

    $quizBox.find(".well").click( function( event ) {
        $quizBox.find(".well").removeClass("selected");
        $(this).addClass("selected");
        chosenAnswer = $(this).data("answer-letter");
    });

    $( ".submit" ).click( function() {
        if(!chosenAnswer) {
            $quizBox.find(".well").addClass("hovered");
            setTimeout(function(){ $quizBox.find(".well").removeClass("hovered"); }, 2500);
            return;
        }

        $.post( "/submit", {'data': chosenAnswer} )
        .done( function( data ) {
            updateScore(data);
            handleNextRound(data);
        })
        .fail( function() {
            showNetworkError();
        })
        .always( function() {
            chosenAnswer = undefined;
        });
    });
// If answer is invalid or unable to display, popup will form 
    function invalidRequest(message, subMessage) {
        $modalTemplate.find(".modal-title").text(message);
        if (subMessage) { $modalTemplate.find(".modal-body").text(subMessage); }
        $modalTemplate.modal('show');
    }
// Adapted from https://quiz-app.herokuapp.com/
    function showQuizBox(data, questionIndex) {
        questionIndex = questionIndex || "0";
        if (!data.questions[questionIndex]) {
            showHighScore(data.name);
            exitToQuizzes();
            return;
        }
        //displays answer choices
        $quizBox.find(".well").removeClass("hidden");
        $quizBox.find(".well").removeClass("selected");
        $quizBox.find(".question").text(data.questions[questionIndex].question);
        if (data.questions[questionIndex].a)  {
            $quizBox.find(".answer-a").text(data.questions[questionIndex].a);
        } 
        if (data.questions[questionIndex].b)  {
            $quizBox.find(".answer-b").text(data.questions[questionIndex].b);
        } 
        if (data.questions[questionIndex].c)  {
            $quizBox.find(".answer-c").text(data.questions[questionIndex].c);
        } 
        $quizSelection.addClass("hidden");
        $quizBox.removeClass("hidden");
    }
    function handleNextRound(data) {
        if (data.gameFinished) {
            showHighScore(data.name || "all");
            exitToQuizzes();
        } else {
            updateQuizBox(data);
        }
    }

    function updateQuizBox(data) {
        showQuizBox(quizData, data.questionIndex);
    }

    function updateScore(data) {
        $userScore = $(".user-score");
        $userScore.text(Number($userScore.text()) + Number(data.scoreUp));
    }
    // Adapted from http://clockworkchilli.com/blog/7_set_up_a_node.js_server_to_add_a_leaderboard_to_your_game
    function showHighScore(higscoreTable) {
        "use strict";
        higscoreTable = higscoreTable || "all";
        var modalBodyText = "HighScore unfortunately unavailable";
        var modalTitleText = "";
        $.post( "/show-high-score", {'data': higscoreTable} )
            .done( function( data ) {
                $modalTemplate.find(".modal-title").text(data.title + " High Score");
                $modalTemplate.find(".modal-body").text(JSON.stringify(data.body));
                $modalTemplate.modal('show');
            })
            .fail( function() {
                showNetworkError();
            });
    }
//resets quizzes
    function exitToQuizzes() {
        $quizSelection.removeClass("hidden");
        $quizBox.addClass("hidden");
    }

    function wipeQuizData() {
        $userScore = $(".user-score");
        $userScore.text(0);
    }

});





