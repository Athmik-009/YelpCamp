const mongoose=require('mongoose');
const review = require('./review');
const Schema=mongoose.Schema;

const campgroundSchema=new Schema({
    title:String,
    image:String,
    price:Number,
    description:String,
    location:String,
    author:{//reference to User model
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[{//array of references to review documents(one-to-many relationship)
        type:Schema.Types.ObjectId,
        ref:'Review'
    }]
});

campgroundSchema.post('findOneAndDelete', async function(doc) { //middleware to delete all reviews associated with a campground when the campground is deleted
    if (doc) {
        await review.deleteMany({
            _id: { $in: doc.reviews }
        });
    }
});
module.exports=mongoose.model('Campground',campgroundSchema);