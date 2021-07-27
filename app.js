//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

let items = [];
let workList = [];
let collegeList = [];

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {

    const day = date.getDate();

    res.render("list", { listTitle: day, newListItems: items });
});

app.post("/", function (req, res) {
    // gets the new item & redirects to root route.
    item = req.body.newItem;
    if (req.body.button === "Work") {
        workList.push(item);
        res.redirect("/work");
    } else if (req.body.button === "College") {
        collegeList.push(item);
        res.redirect("/college");
    }
    else {
        items.push(item);
        res.redirect("/");
    }
});

app.get("/work", function (req, res) {
    res.render("list", { listTitle: "Work List", newListItems: workList });
});

app.get("/college", function (req, res) {
    res.render("list", { listTitle: "College List", newListItems: collegeList });
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