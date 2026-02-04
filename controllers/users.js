const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        
        // Use setPassword (from passport-local-mongoose) instead of register method to avoid hook issues
        user.setPassword(password);
        const registeredUser = await user.save();
        
        // Promisify req.login to avoid callback issues
        await new Promise((resolve, reject) => {
            req.login(registeredUser, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        
        req.flash('success', 'Welcome to YelpCamp!');
        res.redirect('/campgrounds');
       
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }           
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login =  (req, res) => {
        req.flash('success', 'Welcome back!');
        const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
        delete req.session.returnTo; // clean up session
        res.redirect(redirectUrl);
    };

module.exports.logout =  (req, res) => {
    req.logout(() => {
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};