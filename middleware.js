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
