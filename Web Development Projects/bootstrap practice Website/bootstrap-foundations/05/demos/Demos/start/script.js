const presidents = [
    {
      name: "Abraham Lincoln",
      description: "Strong leader during the Civil War.",
      value: 3
    },
    {
      name: "Theodore Roosevelt",
      description: "Known for his exuberant personality and range of interests.",
      value: 4
    },
    {
      name: "Ronald Reagan",
      description: "Former actor and Governor of California.",
      value: 5
    },
    {
      name: "John F. Kennedy",
      description: "Youngest elected president and known for his inspirational speeches.",
      value: 6
    },
    {
      name: "Barack Obama",
      description: "First African American president and known for his healthcare reform.",
      value: 7
    },
    {
      name: "George Washington",
      description: "First president of the United States and a Founding Father.",
      value: 8
    },
    {
      name: "Franklin D. Roosevelt",
      description: "Led the country during the Great Depression and World War II.",
      value: 9
    }
];

let questionOneValue = 0;
let questionTwoValue = 0;
let questionThreeValue = 0;
let totalScore = 0;
let userName = "Name";

// when i enter the page launch the modal to get the user's name
$(document).ready(function() {
    $("#exampleModal").modal("show");
});


$(".saveName").click(function() {
    userName = $(".nameInput").val();
    $(".greeting").text("Hello, " + userName);
    $("#exampleModal").modal("hide");
});


$(".answerChoice").click(function() {
    let questionNumber = $(this).attr("question");

    let value = parseInt($(this).attr("value"));

    if($(this).hasClass("chosen")) {
        $(this).removeClass("chosen");
        if (questionNumber === "1") {
            questionOneValue = 0;
        }
        if (questionNumber === "2") {
            questionTwoValue = 0;
        }
        if (questionNumber === "3") {
            questionThreeValue = 0;
        }
        
        return;
    }
    else{
        if (questionNumber === "1") {
            questionOneValue = value;
        }
    
        if (questionNumber === "2") {
            questionTwoValue = value;
        }
    
        if (questionNumber === "3") {
            questionThreeValue = value;
        }
    }

    $(".answerChoice[question='" + questionNumber + "']").removeClass("chosen");
    $(this).addClass("chosen");


    totalScore = questionOneValue + questionTwoValue + questionThreeValue;
    $(".facebookButton").text("Share on Facebook (" + totalScore + ")");
    $(".twitterButton").text("Share on Twitter (" + totalScore + ")");

    if(questionOneValue === 0 || questionTwoValue === 0 || questionThreeValue === 0){
        $(".results").prop("hidden", true);
    }
    else{
        for (let i = 0; i < presidents.length; i++) {
            if (totalScore === presidents[i].value) {
                $(".resultName").text("YOU GOT: " + presidents[i].name);
                $(".resultDescription").text(presidents[i].description);
                $(".results").prop("hidden", false);
                break;
            }
            else{
                $(".resultName").text("No Match");
                $(".resultDescription").text("Try different answers to get a match.");
            }
        }  
    }
});