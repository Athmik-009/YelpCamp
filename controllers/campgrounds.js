const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req,res)=>{
    // if(!req.isAuthenticated()){//isAuthenticated method is added by passport to req object to check if user is logged in
    //     req.flash('error','You must be signed in first!');
    //     return res.redirect('/login');
    // }//moving this to a middleware
    res.render('campgrounds/new');
};

module.exports.createCampground = async(req,res)=>{//we are adding isLoggedIn middleware to protect this route from postman attacks
    const campground=new Campground(req.body.campground);
    campground.images=req.files.map(f=>({url:f.path,filename:f.filename}));//map over the array of files and create an array of objects with url and filename   
    campground.author=req.user._id;//set the author of the campground to the currently logged in user
    await campground.save();
    req.flash('success','Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground =async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate({//populate the reviews with all their authors
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');//populate reviews array with actual review documents instead of just their ids
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{ campground });
};

module.exports.renderEditForm = async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{ campground });
};

module.exports.updateCampground = async(req,res)=>{
    const { id } = req.params;
    //  const campground=await Campground.findById(req.params.id);
    // if(campground.author.equals(req.user._id)===false){//check if the logged in user is the author of the campground
    //     req.flash('error','You do not have permission to do that!');
    //     return  res.redirect(`/campgrounds/${id}`);
    // }
    const campground=await Campground.findByIdAndUpdate(id, req.body.campground);
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.images.push(...imgs);//push the new images into the images array
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);//delete images from cloudinary
        }
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});//pull operator to remove images whose filename is in the deleteImages array
    }
    req.flash('success','Successfully updated campground!');
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async(req,res)=>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
};