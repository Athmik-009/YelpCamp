const mongoose=require('mongoose');
const review = require('./review');
const Schema=mongoose.Schema;

const ImageSchema=new Schema({
    url:String,
    filename:String
});
ImageSchema.virtual('thumbnail').get(function(){//virtual property to get thumbnail version of image
    return this.url.replace('/upload','/upload/w_200');//change the url to get a smaller version of the image
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema=new Schema({
    title:String,
    images:[ImageSchema],
    price:Number,
    description:String,
    location:String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author:{//reference to User model
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[{//array of references to review documents(one-to-many relationship)
        type:Schema.Types.ObjectId,
        ref:'Review'
    }]
},opts);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

campgroundSchema.post('findOneAndDelete', async function(doc) { //middleware to delete all reviews associated with a campground when the campground is deleted
    if (doc) {
        await review.deleteMany({
            _id: { $in: doc.reviews }
        });
    }
});
module.exports=mongoose.model('Campground',campgroundSchema);