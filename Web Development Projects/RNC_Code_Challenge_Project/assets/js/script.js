const QUIZ_CONFIG = {
    totalQuestions: 3,
    checkboxImages: {
        unchecked: 'assets/images/checkbox-notChecked.png',
        checked: 'assets/images/checkbox-checked.png'
    }
};

const PRESIDENT_DATA = {
    3: {
        name: "Abraham Lincoln",
        photo: "assets/images/presidents/3-lincoln.jpg",
        bio: "Abraham Lincoln (February 12, 1809 – April 15, 1865) was the 16th president of the United States, serving from 1861 until his assassination in 1865. He led the United States through the American Civil War, defeating the Confederate States and playing a major role in the abolition of slavery."
    },
    4: {
        name: "Theodore Roosevelt",
        photo: "assets/images/presidents/4-roosevelt.jpg",
        bio: "Theodore Roosevelt Jr.[b] (October 27, 1858 – January 6, 1919), also known as Teddy or T. R., was the 26th president of the United States, serving from 1901 to 1909. Roosevelt previously was involved in New York politics, including serving as the state's 33rd governor for two years. He served as the 25th vice president under President William McKinley for six months in 1901, assuming the presidency after McKinley's assassination. As president, Roosevelt emerged as a leader of the Republican Party and became a driving force for anti-trust and Progressive Era policies."
    },
    5: {
        name: "Dwight D. Eisenhower",
        photo: "assets/images/presidents/5-eisenhower.jpg",
        bio: "Dwight David Eisenhower[a] (born David Dwight Eisenhower; October 14, 1890 – March 28, 1969) was the 34th president of the United States, serving from 1953 to 1961. During World War II, he was Supreme Commander of the Allied Expeditionary Force in Europe and achieved the five-star rank as General of the Army. Eisenhower planned and supervised two of the most consequential military campaigns of World War II: Operation Torch in the North Africa campaign in 1942–1943 and the invasion of Normandy in 1944."
    },
    6: {
        name: "Ronald Reagan",
        photo: "assets/images/presidents/6-reagan.jpg",
        bio: "Ronald Wilson Reagan[a] (February 6, 1911 – June 5, 2004) was an American politician and actor who served as the 40th president of the United States from 1981 to 1989. A member of the Republican Party, he became an important figure in the American conservative movement. The period encompassing his presidency is known as the Reagan era."
    },
    7: {
        name: "George H. W. Bush",
        photo: "assets/images/presidents/7-hw-bush.jpg",
        bio: "George Herbert Walker Bush[a] (June 12, 1924 – November 30, 2018) was the 41st president of the United States, serving from 1989 to 1993. A member of the Republican Party, he also served as the 43rd vice president under President Ronald Reagan from 1981 to 1989 and previously in various other federal positions.[1]"
    },
    8: {
        name: "George W. Bush",
        photo: "assets/images/presidents/8-w-bush.jpg",
        bio: "George Walker Bush[a] (born July 6, 1946) is an American politician, businessman, and former U.S. Air Force officer who was the 43rd president of the United States from 2001 to 2009. A member of the Republican Party and the eldest son of the 41st president, George H. W. Bush, he served as the 46th governor of Texas from 1995 to 2000."
    },
    9: {
        name: "Donald Trump",
        photo: "assets/images/presidents/9-trump.jpg",
        bio: "Donald John Trump (born June 14, 1946) is an American politician, media personality, and businessman who is the 47th president of the United States. A member of the Republican Party, he served as the 45th president from 2017 to 2021."
    }
};

const quizUtils = {

    // Check if all quiz questions have been answered
    areAllQuestionsAnswered: (answers) => {
        return Object.values(answers).every(answer => answer !== null);
    },

    // Calculate totals
    calculateScore: (answers) => {
        return Object.values(answers).reduce((sum, value) => sum + (value || 0), 0);
    }

};

// Quiz App
$(document).ready(() => {
    let userAnswers = {
        1: null,
        2: null,
        3: null
    };

    // Welcome modal
    const initWelcomeModal = () => {
        const nameModal = new bootstrap.Modal(document.getElementById('nameModal'));
        nameModal.show();
    };

    // Name Submission
    const handleNameSubmit = (e) => {
        e.preventDefault();
        const userName = $('#userName').val().trim();
       
        if (userName) {
            $('#userNameDisplay').text(userName);
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('nameModal'));
            modalInstance.hide();
        }
    };

    // Question 1 with checkbox
    const handleQuestion1Selection = ($answerBox) => {
        const isCurrentlySelected = $answerBox.hasClass('selected');
        const questionValue = $answerBox.data('value');

        if (isCurrentlySelected) {
            $answerBox.removeClass('selected');
            $answerBox.find('.checkbox-icon').attr('src', QUIZ_CONFIG.checkboxImages.unchecked);
            userAnswers[1] = null;
        } else {
            $('.answer-box-q1').removeClass('selected');
            $('.answer-box-q1 .checkbox-icon').attr('src', QUIZ_CONFIG.checkboxImages.unchecked);

            $answerBox.addClass('selected');
            $answerBox.find('.checkbox-icon').attr('src', QUIZ_CONFIG.checkboxImages.checked);
            userAnswers[1] = questionValue;
        }
    };

    // Questions 2 and 3 handler
    const handleStandardSelection = ($answerBox, questionNum) => {
        const questionValue = $answerBox.data('value');

        $(`.answer-box[data-question="${questionNum}"]`).removeClass('selected');
        $answerBox.addClass('selected');
        userAnswers[questionNum] = questionValue;
    };

    // Main click handler
    const handleAnswerClick = function() {
        const $clickedBox = $(this);
        const questionNum = $clickedBox.data('question');

        if (questionNum === 1) {
            handleQuestion1Selection($clickedBox);
        } else {
            handleStandardSelection($clickedBox, questionNum);
        }

        checkAndDisplayResult();
    };

    const checkAndDisplayResult = () => {
        if (quizUtils.areAllQuestionsAnswered(userAnswers)) {
            const totalScore = quizUtils.calculateScore(userAnswers);
            displayPresidentResult(totalScore);
        } else {
            $('#resultSection').hide();
        }
    };

    // Show president result
    const displayPresidentResult = (score) => {
        const president = PRESIDENT_DATA[score];

        if (!president) {
            console.warn(`No president data found for score: ${score}`);
            return;
        }

        $('#presidentPhoto').attr({
            'src': president.photo,
            'alt': president.name
        });
        $('#presidentName').text(`You Got: ${president.name}`);
        $('#presidentBio').text(president.bio);
        $('.score-display').text(score);

        $('#resultSection').show(QUIZ_CONFIG);

    };

    $('#nameForm').on('submit', handleNameSubmit);
    $('.answer-box').on('click', handleAnswerClick);

    initWelcomeModal();
});
