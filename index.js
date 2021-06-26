
const express = require("express");
const mongoose= require("mongoose");
const _=require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Shashank:"+process.env.password+"@cluster0.bgwkk.mongodb.net/todolistdb?retryWrites=true&w=majority",{useNewUrlParser:true},{ useUnifiedTopology: true });

const itemSchema= {
    name : String
};

const Item = mongoose.model("Item",itemSchema);

const item1= new Item({
    name: "Welcome to your todolist!"
});

const item2= new Item({
    name: "Fill the last field and click + to add items."
});

const item3= new Item({
    name: "<-- click this to remove item from list."
});

const defaultItems=[item1,item2,item3];

const listSchema= {
    name : String,
    items: [itemSchema]
};
const List= mongoose.model("List",listSchema);


app.get("/", function(req, res) {
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems, function(err){
                if(err){console.log(err);}
                else{console.log("Success");}
            });
            res.redirect("/") ;
         }
        else{res.render("list", {listTitle: "Today", newListItems: foundItems});}
    });

    

});

app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const   listName=req.body.list;

    const   item=   new Item({
        name:itemName
    });
    if(listName=="Today"){
        item.save();
        res.redirect("/");
    }
    else{
    List.findOne({name:listName},function(err,fl){
        fl.items.push(item);
        fl.save();
        res.redirect("/"+listName);
    
    });
        }
    });
    

app.post("/delete",function(req,res){
    const   checkedItemId=req.body.checkbox;
    const   listname=req.body.listname;

    if(listname==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
        if(!err){
                console.log("deleted item!");
        }});
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkedItemId}}},function(err,result){
            if(!err){
                res.redirect("/"+listname);
            }
        });
    }
    });


app.get("/about", function(req, res){
    res.render("about");
});

app.get("/:customListname",function(req,res){
    const   customListname= _.capitalize(req.params.customListname);
    List.findOne({name:customListname},function(err,foundlist){
        if(!err){
            if(!foundlist){
                const   foundList=new    List({
                    name:customListname,
                    items:defaultItems
                });
                foundList.save();
                res.render("list", {listTitle: foundList.name, newListItems:foundList.items})
            }
            else{
                res.render("list", {listTitle: foundlist.name, newListItems:foundlist.items})
            }
        }
    });
    
});


app.listen(process.env.PORT, function() {
  console.log("Server started");
});
