// Url + Endpoints
const url = "http://localhost:3000";
const scenariosUrl = url + "/Scenarios";
const scoresUrl = url + "/Scores";

const button1 = document.getElementById("choice_1");
const button2 = document.getElementById("choice_2");

// Groups
const groupA = document.getElementById("group_A");
const groupB = document.getElementById("group_B");
const groupC = document.getElementById("group_C");
let groupStats = [50, 50, 50];
// Text Box
const textBox = document.getElementById("textBox");
const choiceExpanded = document.getElementById("choice_expanded");
//choiceExpanded.style.color = "maroon";
//choiceExpanded.style.fontSize = "large";

// This will change the speed of the game by making each decision more impactful to overall score
let multiplier = 1;
let score = 0;

// Helper functions

// Renders text box
function fillTextBox(text) {
  textBox.innerText = text.prompt_text;
  button1.innerText = text.choices[0].preview;
  button2.innerText = text.choices[1].preview;
}

// Renders Stat Box
function fillStatBox() {
  groupA.innerText = `Social: ${groupStats[0]}`;
  groupB.innerText = `School: ${groupStats[1]}`;
  groupC.innerText = `Health: ${groupStats[2]}`;
  choiceExpanded.innerText = "";
}

// Adds the changes to the scores with respect to the multiplier
function statAdder(stats) {
  // Change multiplier
  stats = stats.map((stat) => Math.round(stat * multiplier));

  groupStats[0] += stats[0];
  groupStats[1] += stats[1];
  groupStats[2] += stats[2];
  groupStats.forEach((stat) => statMaxLimiter(stat));
  fillStatBox();
  score += 1;
}

// Generates a certain number within a given range
function randomNumberGenerator(range) {
  return Math.floor(Math.random() * range);
}
// This stops score from going over 100
function statMaxLimiter(stat) {
  if (stat > 100) {
    groupStats[groupStats.indexOf(stat)] = 100;
  }
}

// If score goes below zero, game ends
function statMinChecker(stat) {
  if (stat <= 0) {
    gameOver();
  }
}

// Determines what happens when the game ends
let loss = false;
function gameOver() {
  if(!loss){
    textBox.innerText = "Game over";
    button1.remove();
    button2.remove();
    createForm();
    loss = true;
  }
}

// Gameplay
fetch(scenariosUrl)
  .then((res) => res.json())
  .then((scenarios) => {
    let currScenario = scenarios[0];

    fillTextBox(currScenario);
    fillStatBox();

    // Event listeners

    button1.addEventListener("click", () => {
      fetch(scenariosUrl)
        .then((res) => res.json())
        .then((scenarios) => {
          statAdder(scenarios[currScenario.id - 1].choices[0].change); // Takes current scenario and adds it changes to the total stats

          let rng = randomNumberGenerator(scenarios.length - 1) + 1; // This randomly selects a scenario except for scenario 1.
          currScenario = scenarios[rng];

          fillTextBox(currScenario);
          groupStats.forEach(statMinChecker); // Checks to see if any score is below zero
        });
    });

    // Button 2 functions identical to button 1.
    button2.addEventListener("click", () => {
      fetch(scenariosUrl)
        .then((res) => res.json())
        .then((scenarios) => {
          statAdder(scenarios[currScenario.id - 1].choices[1].change);
          let rng = randomNumberGenerator(scenarios.length - 1) + 1;
          currScenario = scenarios[rng];
          fillTextBox(currScenario);
          groupStats.forEach(statMinChecker);
        });
    });

    //  Mouse Hover functionality
    button1.addEventListener("mouseover", () => {
      choiceExpanded.textContent =
        scenarios[currScenario.id - 1].choices[0].choice_text; // Hover on, text appears
    });
    button1.addEventListener("mouseleave", () => {
      // Hover off, text disappears
      choiceExpanded.textContent = "";
    });

    // Same as lines 119 - 127
    button2.addEventListener("mouseover", () => {
      choiceExpanded.textContent =
        scenarios[currScenario.id - 1].choices[1].choice_text;
    });
    button2.addEventListener("mouseleave", () => {
      choiceExpanded.textContent = "";
    });
  });

// LeaderBoard

// Creates a form
function createForm() {
  const form = document.createElement("form");
  form.setAttribute("id", "myForm");

  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Enter your name: ";
  const nameInput = document.createElement("input");
  nameInput.setAttribute("type", "text");
  nameInput.setAttribute("name", "name");

  form.appendChild(nameLabel);
  form.appendChild(nameInput);
  choiceExpanded.appendChild(form);
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      formSubmit();
      formRemove();
    }
  });
}

// Posts and persists what the user inputs to the database.
function formSubmit() {
  const nameInput = document.forms["myForm"]["name"].value;
  fetch(scoresUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    body: JSON.stringify({
      name: nameInput,
      score: score,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Successful post", data);
      showScoreBoard();
    })
    .catch((error) => {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    });
}

// Removes form
function formRemove() {
  document.getElementById("myForm").remove();
}

function showScoreBoard() {
  fetch(scoresUrl)
    .then((res) => res.json())
    .then((scores) => {
      // Creates Leaderboard title
      const title = document.createElement("span");
      title.innerText = "Leaderboard";
      choiceExpanded.appendChild(title);

      // Goes through database and returns top three scores
      const sortedScores = scores.sort((a, b) => b.score - a.score);
      const topThree = sortedScores.slice(0, 3);
      const list = document.createElement("ul");

      // Creates elements for each score
      topThree.forEach((score) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${score.name}: ${score.score}`;
        list.appendChild(listItem);
      });
      choiceExpanded.appendChild(list);

      // Creates user score element
      const playerScore = document.createElement("p");
      playerScore.style.flexDirection = "column";
      playerScore.innerText = `Your score: ${score}`;
      choiceExpanded.appendChild(playerScore);
    });
}

// Allows for multiplier variable to be adjusted
document.addEventListener("keydown", (e) => {
  if (e.key === "/") {
    multiplier = prompt("Decision multiplier");
  }
  console.log(multiplier);
});
