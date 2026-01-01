const ExpressError=require('./utils/ExpressError.js');
const {campgroundSchema}=require('./schemas.js');
const Campground=require('./models/campground.js');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {//isAuthenticated method is added by passport to req object to check if user is logged in
        req.session.returnTo = req.originalUrl;//store the url they are requesting
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};
module.exports.validateCampground = (req, res, next) => {//route level middleware
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg=error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else
        next();
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};
module.exports.validateReview = (req, res, next) => {//route level middleware
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg=error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else
        next();
};