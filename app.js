//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { application } = require("express");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sanjay:test1234@cluster0.ebg0onl.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name:String
});

const listSchema = new mongoose.Schema({
  name:String, item:[itemSchema]
});

const Item = mongoose.model("Item",itemSchema);

const List = mongoose.model("List",listSchema);

const item1 = new Item({
  name:"Complete Homework"
});

const item2 = new Item({
  name:"Do Not Complete Homework"
});

const item3 = new Item({
  name:"I dont care --- Complete Homework"
});

const defaultItems = [item1,item2,item3];

app.get("/", function(req, res) {

  Item.find({},function(err,result){
    if(err){console.log("Error!");}
    else if(result.length == 0){
        Item.insertMany(defaultItems,function(err){
        if(err){console.log("Eror while inserting data!");}
        else{console.log("Successfully insert data")};
        });
        res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems:result});
      }
  });

});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(err){console.log("Error while searching for route!");}
    else if(!foundList){
      //create new list
      const list = new List({
        name:customListName, item:defaultItems
      });
       list.save();
       res.redirect("/"+customListName);
    }
    else{ //show existing list
      res.render("list",{listTitle: foundList.name, newListItems: foundList.item });
    }
  })
  
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.item.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
  
});

app.post("/delete",function(req,res){
  const checkeditemID = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkeditemID,function(err){
      if(!err){
        console.log("Removed element without error!"); 
        res.redirect("/");}
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull: {item: {_id: checkeditemID}}}, function(err){
      if(!err){res.redirect("/"+listName);}
    });
  }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
