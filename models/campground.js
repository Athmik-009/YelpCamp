const mongoose=require('mongoose');
const review = require('./review');
const Schema=mongoose.Schema;

const campgroundSchema=new Schema({
    title:String,
    image:String,
    price:Number,
    description:String,
    location:String,
    reviews:[{//array of references to review documents(one-to-many relationship)
        type:Schema.Types.ObjectId,
        ref:'Review'
    }]
});

module.exports=mongoose.model('Campground',campgroundSchema);