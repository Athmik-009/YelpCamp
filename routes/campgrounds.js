const express=require('express');
const router=express.Router();
const Campground=require('../models/campground.js');
const { isLoggedIn } = require('../middleware.js');
const { authorize } = require('passport');
const {validateCampground,isAuthor}=require('../middleware.js');

router.get('/',async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{ campgrounds });
});
router.get('/new',isLoggedIn,(req,res)=>{
    // if(!req.isAuthenticated()){//isAuthenticated method is added by passport to req object to check if user is logged in
    //     req.flash('error','You must be signed in first!');
    //     return res.redirect('/login');
    // }//moving this to a middleware
    res.render('campgrounds/new');
});
router.post('/',isLoggedIn,isAuthor,validateCampground,async(req,res)=>{//we are adding isLoggedIn middleware to protect this route from postman attacks
    const campground=new Campground(req.body.campground);
    campground.author=req.user._id;//set the author of the campground to the currently logged in user
    await campground.save();
    req.flash('success','Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
});
router.get('/:id',async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate('reviews').populate('author');//populate reviews array with actual review documents instead of just their ids
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{ campground });
});
router.get('/:id/edit',isLoggedIn,isAuthor,async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{ campground });
});
router.put('/:id',isLoggedIn,validateCampground,async(req,res)=>{
    const { id } = req.params;
    //  const campground=await Campground.findById(req.params.id);
    // if(campground.author.equals(req.user._id)===false){//check if the logged in user is the author of the campground
    //     req.flash('error','You do not have permission to do that!');
    //     return  res.redirect(`/campgrounds/${id}`);
    // }
    const campground=await Campground.findByIdAndUpdate(id, req.body.campground);
    req.flash('success','Successfully updated campground!');
    res.redirect(`/campgrounds/${id}`);
});
router.delete('/:id',isLoggedIn,async(req,res)=>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

module.exports=router;
