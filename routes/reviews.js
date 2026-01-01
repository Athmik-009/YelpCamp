const express=require('express');
const router=express.Router({ mergeParams: true });//to access :id from parent route,it was not required in campgrounds.js because :id(params) was not in parent route
const Campground=require('../models/campground.js');
const Review=require('../models/review');
const ExpressError=require('../utils/ExpressError.js');
const {reviewSchema}=require('../schemas.js');
const { validateReview } = require('../middleware.js');

router.post('/',validateReview,async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    const review=new Review(req.body.review);//since you have named the form fields as review[rating], review[body]
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
});
router.delete('/:reviewId',async(req,res)=>{//delete a review for a particular campground
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });//pull operator removes the reviewId from the reviews array of the campground  
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
});

module.exports=router;