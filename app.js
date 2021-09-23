//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

// let items = [];
// let workList = [];
// let collegeList = [];

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongoose.connect('mongodb://localhost:27017/todolistDB');
// mongoose.connect('mongodb+srv://devanshu-todolist:mCnR074Q9wjPnIrk@cluster0.u3rck.mongodb.net/todolistDB?retryWrites=true&w=majority');
const uri = process.env.MONGODB_URI;
mongoose.connect(uri);
const itemSchema = mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your To-Do List!"
});
const item2 = new Item({
    name: "Hit + to save a Task."
});
const item3 = new Item({
    name: "<-- Hit this to mark completed."
});

const defaultItems = [item1, item2, item3];

const ListSchema = mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", ListSchema);

app.get("/", function (req, res) {
    Item.find({}, function (err, DBitems) {
        if (DBitems.length === 0) {
            Item.insertMany(defaultItems, function (e) {
                if (e) {
                    console.log(e);
                } else {
                    console.log("Successfully added defaults items to DB.")
                }
            });
            // items added, now redirect to display them
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newListItems: DBitems });
        }
    });
});

app.get("/:query", function (req, res) {
    const customListName = _.capitalize(req.params.query);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                // create new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                console.log("query redirect name " + customListName);
                res.redirect("/" + customListName);
            } else {
                // display existing list
                console.log("foundlist len for " + foundList.name + ": " + foundList.items.length);
                if (foundList.items.length === 0) {
                    // items[] is found empty, update it to fill defaults
                    List.findOneAndUpdate({ name: customListName }, { $set: { items: defaultItems } }, function (err, foundList) {
                        if (!err) {
                            res.redirect("/" + customListName);
                        }
                    });
                } else {
                    res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
                }
            }
        }

    });


});

app.post("/", function (req, res) {
    // gets the new item & redirects to root route.
    const newItemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: newItemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

});

app.post("/delete", function (req, res) {
    const idToDelete = req.body.checkbox;
    const listName = req.body.listTitle;

    if (listName === "Today") {
        Item.deleteOne({ '_id': idToDelete }, e => {
            if (e) {
                console.log(e);
            } else {
                console.log("Checked Off " + idToDelete);
            }
        });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: idToDelete } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(process.env.PORT || 4000, function () {
    let PORT;
    if (process.env.PORT === undefined) {
        PORT = 4000;
    } else {
        PORT = process.env.PORT;
    }

    console.log("server running on port " + PORT);
});