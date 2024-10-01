let tasks = new Array();

const date = document.getElementById("date");
const time = document.getElementById("time");
const timeOptions = { hour: "2-digit", minute: "2-digit" };

function updateTime() {
  let today = new Date();
  date.textContent = today.toLocaleDateString();
  time.textContent = today.toLocaleTimeString("ru-RU", timeOptions);
}

class Case {
  constructor(id, isDone, description) {
    this.id = id;
    this.isDone = isDone;
    this.description = description;
  }
}

window.onload = function () {
  updateTime();
  loadTasks();
  setInterval(updateTime, 60000);
};

function addNewCase() {
  let newCaseInput = document.getElementById("case-input");
  let task = { isDone: false, description: newCaseInput.value };

  if (task.description !== "") {
    createTaskPostRequest(task)
      .then((data) => {
        let savedTaskId = data.id;
        let newCase = new Case(savedTaskId, false, newCaseInput.value);

        tasks.push(newCase);
        display(newCase);
        newCaseInput.value = "";
      })
      .catch((error) => console.error("ошибка при создании задачи:", error));
  }
}

//визуальная часть

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

  if (task.isDone == true) {
    caseCheckboxHTML.checked = true;
  }

  caseCheckboxHTML.addEventListener("change", () => {
    updateCaseIsDone(task.id, caseCheckboxHTML.checked);
  });

  return caseCheckboxHTML;
}

function updateCaseIsDone(id, isChecked) {
  console.log(id);
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].isDone = isChecked ? true : false;
      break;
    }
  }
  updateCaseStatusPutRequest(id, isChecked);
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
          updateCaseDescription(caseText, task);
        }
      }
    });
  });

  return caseText;
}

function updateCaseDescription(caseText, task) {
  caseText.removeAttribute("contenteditable");
  task.description = caseText.innerText;

  tasks = tasks.map((caseItem) =>
    caseItem === task
      ? { ...caseItem, description: task.description }
      : caseItem
  );
  updateCaseDescriptionPutRequest(task.id, task.description);
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
    deleteCaseRequest(task.id)
  };
  return deleteButtonHTML;
}

//запросы

function loadTasks() {
  fetch("http://localhost:8090/api/todo_list")
    .then((response) => {
      if (!response.ok) {
        throw new Error("ошибка при загрузке задач");
      }
      return response.json();
    })
    .then((tasksFromServer) => {
      tasksFromServer.forEach((taskData) => {
        let task = new Case(taskData.id, taskData.isDone, taskData.description);
        tasks.push(task);
        display(task);
      });
    })
    .catch((error) => console.error("ошибка при загрузке задач:", error));
}

function createTaskPostRequest(task) {
  return fetch("http://localhost:8090/api/todo_list/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Ошибка при создании задачи");
    }
    return response.json();
  });
}

function updateCaseStatusPutRequest(id, isChecked) {
  fetch(`http://localhost:8090/api/todo_list/update/is_done/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ "isDone": isChecked }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("ошибка при обновлении статуса задачи");
    }
    return response.json();
  });
}

function updateCaseDescriptionPutRequest(id, newDescription) {
  fetch(`http://localhost:8090/api/todo_list/update/desc/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newDescription: newDescription }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("ошибка при обновлении описания задачи");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("ошибка при обновлении описания задачи:", error);
    });
}

function deleteCaseRequest(id) {
  fetch(`http://localhost:8090/api/todo_list/delete/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка при удалении задачи");
      }
    })
    .catch((error) => {
      console.error("ошибка при удалении задачи:", error);
    });
}


//работа с json files

function displayJsonFile(input) {
  let jsonFile = input.files[0];
  let reader = new FileReader();

  reader.addEventListener("loadend", (event) => {
    displayAll(JSON.parse(reader.result));
  });

  reader.readAsText(jsonFile);
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
