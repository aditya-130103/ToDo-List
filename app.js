//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://aditya13:aditya184040@cluster0.xsk1gq1.mongodb.net/?retryWrites=true&w=majority");

const itemsSchema={
  name:String,
}

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welecome to your ToDoList"
});

const item2=new Item({
  name:"Hit the + button to add a new item"
});

const item3=new Item({
  name:"<--Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);
//Item.insertMany(defaultItems);

app.get("/", async(req, res)=>
{
  try{
    const article=await Item.find({});
    res.render("list",{listTitle:"Today",newListItems:article});
  }
  catch(err)
  {
    console.log(err);
  }
});

app.post("/", async(req, res)=>{

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item=new Item({
    name:itemName,
  });
  if(listName==="Today")
  {
    await Item.insert({item});
    res.redirect("/");
  }
  else
  {
    const list=await List.findOne({name:listName});
    if(list)
    {
      list.items.push(item);
      await list.save();
      res.redirect("/"+listName);
    }
  }
  
});

app.post("/delete",async(req,res)=>{
  try{
    const checkedItemId=req.body.checkbox;
    const listName = req.body.listName;

    if(listName==="Today")
    {
      Item.findByIdAndRemove(checkedItemId).exec();
      res.redirect("/");
    }
    else
    {
      const updatelist=await List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}}).exec();
      if(updatelist)
      {
        res.redirect("/"+listName);
      }
    }
    
  }
  catch(err)
  {
    console.log(err);
  }
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

//CREATE EXPRESS ROUTE PARAMETERS
app.get("/:customListName",async(req,res)=>{
  const customListName=_.capitalize(req.params.customListName);

  try{
    const list=await List.findOne({name:customListName});
    if(list)
    {
      res.render("list", {listTitle: list.name, newListItems: list.items});
    }
    else
    {
      const newList=new List({
        name:customListName,
        items:defaultItems,
      });
      await newList.save();
      res.redirect("/"+customListName);
    }
  }
  catch(err)
  {
    console.log(err);
  }
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
