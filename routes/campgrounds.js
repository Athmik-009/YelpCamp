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
    res.render('campgrounds/new');
});
router.post('/',validateCampground,async(req,res)=>{
    const campground=new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});
router.get('/:id',async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate('reviews');//populate reviews array with actual review documents instead of just their ids
    res.render('campgrounds/show',{ campground });
});
router.get('/:id/edit',async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{ campground });
});
router.put('/:id',validateCampground,async(req,res)=>{
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campgrounds/${id}`);
});
router.delete('/:id',async(req,res)=>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/');
});

module.exports=router;
