const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');

const UserSchema=new Schema({
    email:String,
    required:true,
    unique:true
});
UserSchema.plugin(passportLocalMongoose);//adds username,password fields and some methods to UserSchema

module.exports=mongoose.model('User',UserSchema);