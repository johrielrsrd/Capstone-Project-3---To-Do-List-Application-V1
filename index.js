import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { Schema, model } from "mongoose";
import _ from "lodash";

const app = express();
const port = 3000;

mongoose
  .connect("mongodb+srv://admin-john:test123@cluster0.artntf3.mongodb.net/todolistDB")
  .then(() => {
    console.log(`Connected to todolistDB via mongoose on mongoDB`);
  })
  .catch((error) => {
    console.error("Error connecting to database: ", error);
  }); //Initialize connection to database. //mongodb+srv://admin-john:test123@cluster0.artntf3.mongodb.net/todolistDB/

const itemsSchema = new Schema({
  name: String,
});

const Item = model("Item", itemsSchema);

const item1 = new Item({
  name: "Eat Breakfast",
});

const item2 = new Item({
  name: "Eat Lunch",
});

const item3 = new Item({
  name: "Eat Dinner",
});

const defaultItems = [item1, item2, item3];

const listSchema = new Schema({
  name: String,
  items: [itemsSchema],
});

const List = model("List", listSchema);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (req, res) => {
  Item.find().then(function (foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
        .then(() => {
          console.log("Successfully added default items!");
        })
        .catch((error) => {
          console.error("Error adding default items: ", error);
        });
      res.redirect("/");
    } else {
      res.render("index.ejs", {
        foundItem: foundItems,
      });
    }
  });
});

app.get("/favicon.ico", function (req, res) {
  res.redirect("/");
});

app.post("/", (req, res) => {
  const itemName = req.body.taskItem;
  const listName = req.body.customList;

  const newTask = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    newTask.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(newTask);
        foundList.save();
        res.redirect(`/${listName}`);
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

app.post("/delete", (req, res) => {
  const itemToDelete = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.deleteOne({ _id: itemToDelete })
      .then(() => {})
      .catch((error) => {
        console.error(error);
      });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: itemToDelete } } }
    )
      .then(() => {})
      .catch((error) => {
        console.error(error);
      });
    res.redirect(`/${listName}`);
  }
});

app.get("/:customListName", (req, res) => {
  const customList = _.capitalize(req.params.customListName);

  List.findOne({ name: customList })
    .then((foundListItem) => {
      
      if (!foundListItem) {
        console.log("Items are now back");
        const list = new List({
          name: customList,
          items: defaultItems,
        });
        list.save();
        res.redirect(`/${customList}`);
      } else {
        res.render("list.ejs", {
          customName: foundListItem.name,
          foundListItem: foundListItem.items,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
