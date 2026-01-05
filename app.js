if(process.env.NODE_ENV!=='production'){
    require('dotenv').config();
}
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const Campground=require('./models/campground.js');// ./ is used to describe that it a relative path and not an installed npm package
const methodOverride=require('method-override');
const ejsmate=require('ejs-mate');
const ExpressError=require('./utils/ExpressError.js');
const {campgroundSchema,reviewSchema}=require('./schemas.js');
const Review=require('./models/review.js');
const camgroundroutes=require('./routes/campgrounds.js');
const reviewroutes=require('./routes/reviews.js');
const userroutes=require('./routes/users.js');
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');

const session=require('express-session');
const flash=require('connect-flash');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user.js');
const { name } = require('ejs');

const app=express();
app.set('query parser', 'extended');

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
app.use(express.static(path.join(__dirname,'public')));//static files like css,js,img will be served from public folder
app.use(sanitizeV5({ replaceWith: '_' }));//to sanitize user input to prevent mongo injection attacks

const sessionConfig={
    name:'session',//name of the session id cookie changed from default 'connect.sid' to 'session' for security reasons
    secret:'thisshouldbeabettersecret!',//used to sign the session id cookie
    resave:false,
    saveUninitialized:true,
    cookie:{//cookie settings for the session
        httpOnly:true,//client side js cannot access the cookie
        // secure:true,//cookie will only be sent over https
        expires:Date.now()+1000*60*60*24*7,//1 week from now
        maxAge:1000*60*60*24*7
    }
};

app.use(session(sessionConfig));//sessions are used to store data between requests it sends a cookie to the client with a session id
app.use(flash());

app.use(passport.initialize());//passport middleware to handle authentication
app.use(passport.session());//passport to use sessions
passport.use(new LocalStrategy(User.authenticate()));//using local strategy for authentication which is authenticate method present in User model provided by passport-local-mongoose

passport.serializeUser(User.serializeUser());//how to store user in session
passport.deserializeUser(User.deserializeUser());//how to get user from session

app.use((req,res,next)=>{//middleware to make flash messages and current user available in all templates 
    res.locals.currentUser=req.user;//req.user is added by passport and contains the currently logged in user
    res.locals.success=req.flash('success');//flash messages with key 'success'
    res.locals.error=req.flash('error');
    next();
});

app.use('/', userroutes);//prefix all user routes with /users
app.use('/campgrounds',camgroundroutes);//prefix all campground routes with /campgrounds
app.use('/campgrounds/:id/reviews',reviewroutes);//prefix all review routes with /campgrounds/:id/reviews

app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/fakeuser',async(req,res)=>{
    const user=new User({email:'asdf@gmail.com',username:'asdf'});
    const newUser=await User.register(user,'chicken');//register method provided by passport-local-mongoose to create a new user with hashed password
    res.send(newUser);
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

// Catch-all for routes that don't match any handler
app.use((req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Centralized error handler. Only print stack traces in development.
app.use((err, req, res, next) => {
    if (app.get('env') === 'development') {
        console.error(err.stack);
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    res.status(statusCode).render('error', { statusCode, message });
});
app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});