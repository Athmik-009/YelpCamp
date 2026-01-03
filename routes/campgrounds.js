const express=require('express');
const router=express.Router();
const Campground=require('../models/campground.js');
const { isLoggedIn } = require('../middleware.js');
const { authorize } = require('passport');
const {validateCampground,isAuthor}=require('../middleware.js');
const campgrounds=require('../controllers/campgrounds.js');
const { render } = require('ejs');
const multer  = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.get('/',campgrounds.index);

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.post('/', isLoggedIn, upload.array('image'), validateCampground, campgrounds.createCampground);
// router.post('/',upload.array('image'),(req,res)=>{
//     console.log(req.files);
//     res.send("File uploaded successfully");
// });

router.get('/:id',campgrounds.showCampground);

router.get('/:id/edit',isLoggedIn,isAuthor,campgrounds.renderEditForm);

router.put('/:id',isLoggedIn,isAuthor,upload.array('image'),validateCampground,campgrounds.updateCampground);

router.delete('/:id',isLoggedIn,isAuthor,campgrounds.deleteCampground);

module.exports=router;
