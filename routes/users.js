const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const passport = require('passport');
const { storeReturnTo } = require('../middleware.js');
const users = require('../controllers/users.js');

router.get('/register', users.renderRegister);
router.post('/register', users.register);

router.get('/login', users.renderLogin); 
router.post('/login',
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
    // Now we can use res.locals.returnTo to redirect the user after login
    users.login);
   
router.get('/logout', users.logout);
module.exports = router;