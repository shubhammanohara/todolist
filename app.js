//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-shubham:<PASSWORD>@cluster0.wn5ko.mongodb.net/todolistDB?retryWrites=true&w=majority", { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });

const itemSchema=new mongoose.Schema({
  name: String
});

const Item = mongoose.model("item", itemSchema);

const item1=new Item(
  {
    name: "welcome to your todoList!"
  }
);

const item2=new Item(
  {
    name: "hit + button to add items to the list"
  }
);

const item3=new Item({
  name: "<-- hit this to delete item from the list"
});

const defaultItems=[item1,item2,item3];

const listSchema=new mongoose.Schema({
  name:String,
  item:[itemSchema]
});

const List=mongoose.model("list", listSchema);


const workItems = [];

app.get("/", function(req, res) {

  Item.find({},function(err, foundItems){
      if(foundItems.length===0){
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }else{
            console.log("sucessfully added items to the array!");
          }
        });
        res.redirect("/");
      }else{
          res.render("list", {listTitle: "today", newListItems: foundItems});
      }

  });
});

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name: newItem
  });

  if(listName==="today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.item.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="today"){
    Item.findByIdAndRemo
    ve(checkedItemId, function(err){
      if(!err){
        console.log("successfully removed");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{item:{_id:checkedItemId}}},function(err, foundList){
      if(!err){
          res.redirect("/"+listName);
      }
    })
  }

});

app.get("/:customRout",function(req,res){
  const customRout= _.capitalize(req.params.customRout);

  List.findOne({name: customRout}, function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customRout,
          item:defaultItems
        });

        list.save();
        res.redirect("/" + customRout);
      }else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.item});
      };
    };
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

let port= process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on Successfully");
});
