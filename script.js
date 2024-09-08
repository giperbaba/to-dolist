//JSON.parse()берет строку JSON и преобразует ее в объект JavaScript.
//JSON.stringify()берет объект JavaScript и преобразует его в строку JSON.

let tasks = new Array();

const date = document.getElementById("date");
const time = document.getElementById("time");
const timeOptions = { hour: "2-digit", minute: "2-digit" };

function updateTime() {
  let today = new Date();
  date.textContent = today.toLocaleDateString();
  time.textContent = today.toLocaleTimeString("ru-RU", timeOptions);
}

updateTime();
setInterval(updateTime, 60000);

class Case {
  constructor(id, isDone, description) {
    this.id = id;
    this.isDone = isDone;
    this.description = description;
  }
}

function displayJsonFile(input) {
  let jsonFile = input.files[0];
  let reader = new FileReader();

  reader.addEventListener("loadend", (event) => {
    displayAll(JSON.parse(reader.result));
  });

  reader.readAsText(jsonFile);
}

function displayAll(uploadCases) {
  for (let i = 0; i < uploadCases.length; i++) {
    let task = uploadCases[i];
    tasks.push(task);
    display(task);
  }
}

function display(task) {
  const blockForCasesHTML =
    document.getElementsByClassName("block-for-cases")[0];
  const newCaseHTML = document.createElement("div");
  newCaseHTML.classList.add("case");

  newCaseHTML.appendChild(getCheckboxFor(task));
  newCaseHTML.appendChild(getTextFor(task));
  newCaseHTML.appendChild(
    getDeleteButtonFor(task, blockForCasesHTML, newCaseHTML)
  );

  blockForCasesHTML.prepend(newCaseHTML);
}

function getCheckboxFor(task) {
  const caseCheckboxHTML = document.createElement("input");
  caseCheckboxHTML.setAttribute("type", "checkbox");

  if (task.isDone == "done") {
    caseCheckboxHTML.checked = true;
  }

  caseCheckboxHTML.addEventListener("change", () => {
    updateCaseStatus(task.id, caseCheckboxHTML.checked);
  });

  return caseCheckboxHTML;
}

function getTextFor(task) {
  const caseText = document.createElement("div");
  caseText.classList.add("case-text");
  caseText.innerHTML = task.description;

  caseText.addEventListener("click", () => {
    caseText.setAttribute("contenteditable", "true");
    caseText.focus();

    caseText.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (caseText != "") {
          saveChanges(caseText, task);
        }
      }
    });
  });

  return caseText;
}

function getDeleteButtonFor(task, blockForCasesHTML, newCaseHTML) {
  const deleteButtonHTML = document.createElement("button");
  deleteButtonHTML.innerHTML = "удалить";
  deleteButtonHTML.classList.add("button");
  deleteButtonHTML.setAttribute("id", "delete-buttons");
  deleteButtonHTML.style.float = "right";

  deleteButtonHTML.onclick = () => {
    blockForCasesHTML.removeChild(newCaseHTML);
    tasks = tasks.filter((caseItem) => caseItem !== task);
  };
  return deleteButtonHTML;
}

function saveChanges(caseText, task) {
  caseText.removeAttribute("contenteditable");
  task.description = caseText.innerText;

  tasks = tasks.map((caseItem) =>
    caseItem === task
      ? { ...caseItem, description: task.description }
      : caseItem
  );
}

function updateCaseStatus(id, isChecked) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].isDone = isChecked ? "done" : "notdone";
      break;
    }
  }
}

function addNewCase() {
  let newCaseInput = document.getElementById("case-input");
  let newCase = new Case(generateRandomId(), "notdone", newCaseInput.value);

  if (newCase.description != "") {
    display(newCase);
    newCaseInput.value = "";
    tasks.push(newCase);
  }
}

function generateRandomId() {
  return Math.random().toString(36);
}

function downloadTasksJSON() {
  if (tasks.length != 0) {
    const filename = "data.json";

    const jsonString = JSON.stringify(tasks);

    const dataUri =
      "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);

    const link = document.createElement("a");
    link.href = dataUri;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
