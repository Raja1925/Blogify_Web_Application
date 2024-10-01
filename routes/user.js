// const { Router } = require('express');

// const User = require('../models/user'); // Import the User model
// const jwt = require('jsonwebtoken');

// const router = Router();

// router.get('/signin', (req, res) => {
//     return res.render('signin');
// });

// router.get('/signup', (req, res) => {
//     return res.render('signup');
// });

// router.post('/signin', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const token = await User.matchPasswordAndGenerateToken(email, password);
//         // Find user by email to attach to req.user
//         const user = await User.findOne({ email });
//         if (user) {
//             res.cookie('token', token).redirect('/');
//         } else {
//             return res.render('signin', {
//                 error: 'User not found.'
//             });
//         }
//     } catch (error) {
//         return res.render('signin', {
//             error: 'Incorrect email or password'
//         });
//     }
// });

// router.post('/signup', async (req, res) => {
//     const { fullName, email, password } = req.body;

//     try {
//         await User.create({ fullName, email, password });
//         return res.redirect('/');
//     } catch (error) {
//         console.error(error);
//         return res.status(500).render('signup', { error: 'An error occurred. Please try again.' });
//     }
// });

// router.get('/logout', (req, res) => {
//     res.clearCookie('token'); // Clear the authentication cookie
//     return res.redirect('/'); // Redirect to home page
// });

// module.exports = router;

const { Router } = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const router = Router();

router.get('/signin', (req, res) => {
    return res.render('signin');
});

router.get('/signup', (req, res) => {
    return res.render('signup');
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        
        if (token) {
            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }).redirect('/');
        } else {
            return res.render('signin', { error: 'Incorrect email or password' });
        }
    } catch (error) {
        console.error(error);
        return res.render('signin', { error: 'An error occurred. Please try again.' });
    }
});

router.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        const user = await User.create({ fullName, email, password });
        // Optionally, auto-sign in the user after signup
        const token = await user.generateToken(); // Make sure to implement this method in your User model
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        if (error.code === 11000) { // Duplicate key error (email)
            return res.render('signup', { error: 'Email is already in use.' });
        }
        return res.status(500).render('signup', { error: 'An error occurred. Please try again.' });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.redirect('/');
});

module.exports = router;
