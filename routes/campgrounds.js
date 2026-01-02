const express=require('express');
const router=express.Router();
const Campground=require('../models/campground.js');
const { isLoggedIn } = require('../middleware.js');
const { authorize } = require('passport');
const {validateCampground,isAuthor}=require('../middleware.js');
const campgrounds=require('../controllers/campgrounds.js');
const { render } = require('ejs');

router.get('/',campgrounds.index);

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.post('/',isLoggedIn,isAuthor,validateCampground,campgrounds.createCampground);

router.get('/:id',campgrounds.showCampground);

router.get('/:id/edit',isLoggedIn,isAuthor,campgrounds.renderEditForm);

router.put('/:id',isLoggedIn,validateCampground,isAuthor,campgrounds.updateCampground);

router.delete('/:id',isLoggedIn,isAuthor,campgrounds.deleteCampground);

module.exports=router;
