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
const camgroundroutes=require('./routes/campgrounds.js');
const reviewroutes=require('./routes/reviews.js');
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




app.use('/campgrounds',camgroundroutes);//prefix all campground routes with /campgrounds
app.use('/campgrounds/:id/reviews',reviewroutes);//prefix all review routes with /campgrounds/:id/reviews

app.get('/',(req,res)=>{
    res.render('home');
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