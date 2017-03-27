var mongoose=require("mongoose");

var userSchema= mongoose.Schema({
    username:String,
    password:String,
    firstName:String,
    lastName:String,
    email:String,
    phone:String,
    dateofbirth:Date
},{collection:'user.project.collection'});



module.exports=userSchema;