const express=require('express');
const router=express.Router({ mergeParams: true });//to access :id from parent route,it was not required in campgrounds.js because :id(params) was not in parent route
const Campground=require('../models/campground.js');
const Review=require('../models/review');
const ExpressError=require('../utils/ExpressError.js');
const {reviewSchema}=require('../schemas.js');
const { validateReview,isLoggedIn,isReviewAuthor } = require('../middleware.js');
const reviews=require('../controllers/reviews.js');

router.post('/',isLoggedIn,validateReview,reviews.createReview);

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,reviews.deleteReview);

module.exports=router;