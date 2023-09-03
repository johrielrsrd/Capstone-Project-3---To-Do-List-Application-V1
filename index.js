import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

let taskListDay = [];
var taskToAddDay = "";
let dataDay = {
  addedTaskDay: taskListDay,
};

let taskListWork = [];
var taskToAddWork = "";
let dataWork = {
  addedTaskWork: taskListWork,
};

app.use(bodyParser.urlencoded({ extended: true }));

function addTaskToListDay(req, res, next) {
  taskToAddDay = req.body["taskDay"];
  next();
}

app.use(addTaskToListDay);

function addTaskToListWork(req, res, next) {
  taskToAddWork = req.body["taskWork"];
  next();
}

app.use(addTaskToListWork);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs", dataDay);
});

app.post("/", (req, res) => {
  taskListDay.push(taskToAddDay);
  res.render("index.ejs", dataDay);
});

app.get("/work", (req, res) => {
  res.render("work.ejs", dataWork);
});

app.post("/addWork", (req, res) => {
  taskListWork.push(taskToAddWork);
  res.render("work.ejs", dataWork);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});

