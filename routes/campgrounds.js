const express=require('express');
const router=express.Router();
const Campground=require('../models/campground.js');
const ExpressError=require('../utils/ExpressError.js');
const {campgroundSchema}=require('../schemas.js');

const validateCampground = (req, res, next) => {//route level middleware
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg=error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else
        next();
};

router.get('/',async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{ campgrounds });
});
router.get('/new',(req,res)=>{
    if(!req.isAuthenticated()){//isAuthenticated method is added by passport to req object to check if user is logged in
        req.flash('error','You must be signed in first!');
        return res.redirect('/login');
    }
    res.render('campgrounds/new');
});
router.post('/',validateCampground,async(req,res)=>{
    const campground=new Campground(req.body.campground);
    await campground.save();
    req.flash('success','Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
});
router.get('/:id',async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate('reviews');//populate reviews array with actual review documents instead of just their ids
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{ campground });
});
router.get('/:id/edit',async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{ campground });
});
router.put('/:id',validateCampground,async(req,res)=>{
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body.campground);
    req.flash('success','Successfully updated campground!');
    res.redirect(`/campgrounds/${id}`);
});
router.delete('/:id',async(req,res)=>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

module.exports=router;
