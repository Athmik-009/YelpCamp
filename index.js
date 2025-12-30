const express=require('express');
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const Campground=require('./models/campground');// ./ is used to describe that it a relative path and not an installed npm package
const methodOverride=require('method-override');
const ejsmate=require('ejs-mate');
const ExpressError=require('./utils/ExpressError');
const {campgroundSchema,reviewSchema}=require('./schemas.js');
const Review=require('./models/review');

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/yelpcamp');
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectDB();


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({ extended: true }));//to read form data
app.use(methodOverride('_method'));//to support PUT and DELETE requests
app.engine('ejs',ejsmate);

const validateCampground = (req, res, next) => {//route level middleware
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg=error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else
        next();
};
const validateReview = (req, res, next) => {//route level middleware
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg=error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else
        next();
};

app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/campgrounds',async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{ campgrounds });
});
app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new');
});
app.post('/campgrounds',validateCampground,async(req,res)=>{
    const campground=new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});
app.get('/campgrounds/:id',async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate('reviews');//populate reviews array with actual review documents instead of just their ids
    res.render('campgrounds/show',{ campground });
});
app.get('/campgrounds/:id/edit',async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{ campground });
});
app.put('/campgrounds/:id',validateCampground,async(req,res)=>{
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campgrounds/${id}`);
});
app.get('/makecampground',async(req,res)=>{
    const camp=new Campground({
        title:"My Campground",
        price:"$100",
        description:"This is a beautiful campground",
        location:"Montana"
    });
    await camp.save();
    res.send("Campground created");
});
app.delete('/campgrounds/:id',async(req,res)=>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});
app.post('/campgrounds/:id/reviews',validateReview,async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    const review=new Review(req.body.review);//since you have named the form fields as review[rating], review[body]
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});
app.delete('/campgrounds/:id/reviews/:reviewId',async(req,res)=>{//delete a review for a particular campground
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });//pull operator removes the reviewId from the reviews array of the campground  
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
});
app.use((req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});// app.all('*', (req, res, next) => {  //only runs if no other route matches
app.use((err,req,res,next)=>{  //no need to use try catch block in express 5 and above it will catch async errors automatically
    console.error(err.stack);
    if(!err.statusCode) err.statusCode = 500;
    if(!err.message) err.message = 'Something went wrong';
    res.status(err.statusCode).render('error', { statusCode: err.statusCode, message: err.message });
});
app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});