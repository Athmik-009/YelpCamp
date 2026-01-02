const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    const review=new Review(req.body.review);//since you have named the form fields as review[rating], review[body]
    review.author=req.user._id;//set the author of the review to the currently logged in user
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async(req,res)=>{//delete a review for a particular campground
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });//pull operator removes the reviewId from the reviews array of the campground  
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
};