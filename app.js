const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("item", itemsSchema);

//default Items

const item1 = new Item({
  name: "Hello",
});
const item2 = new Item({
  name: "This is second item",
});
const item3 = new Item({
  name: "And this is third item",
});

const defaultItems = [item1, item2, item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}

const List =mongoose.model('List',listSchema);

// Item.insertMany(defaultItems)

app.get("/", function (req, res) {
  findAll();
  async function findAll() {
    const foundItem = await Item.find({});

    if (foundItem.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItem });
    }
  }
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if(listName=== "Today") {

  item.save();
  res.redirect("/");
  }else{
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  // deleteItem();

  // async function deleteItem() {
    if(listName==="Today"){
      Item.findByIdAndRemove(checkedItemId)
      .then(() => {
        res.redirect("/");
      })
      .catch((error) => {
        console.log(`Error deleting user by ID: ${error.message}`);
      });
    }
    else{
      List.findOneAndUpdate({name:listName},{$pull : {items:{_id:checkedItemId}}}).then((err,foundList) => {
      if(err){
        res.redirect("/" + listName)
      }
      })

    }


  // }
});

app.get("/:customListName",(req, res) => {

  const customListName= req.params.customListName;

  List.findOne({name: customListName}).then((foundList)=>{
    if(foundList) {
      //show existing list
     
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});  
    }else{

      //create nem list
      const list =new List({
        name: customListName,
        items:defaultItems
      })
      list.save()
      res.redirect("/"+customListName)
    }
  }).catch((err) => {
  // 
  console.log(" err");
})
})


app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
