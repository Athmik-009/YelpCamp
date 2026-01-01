module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {//isAuthenticated method is added by passport to req object to check if user is logged in
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};