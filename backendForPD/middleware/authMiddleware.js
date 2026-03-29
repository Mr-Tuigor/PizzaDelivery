const jwt = require('jsonwebtoken'); // FIREBASE_REPLACE: Remove later.
const userModel = require('../models/User');

const protect = async (req, res, next) => {
    // console.log("In middleware");
    try {
    let token;

    // Check if the 'token' cookie exists
    if (req.cookies.token) {
        // console.log("Got token");
            token = req.cookies.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 

            req.user = await userModel.findById(decoded.id).select('-password');
            // console.log("heading to next");
            next(); 
    }

    if (!token) {
        console.log("no tokens found");
        res.status(401).json({ message: 'Not authorized, no token' });
    }

    } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
};

const adminOnly = async (req, res, next) => {
    // console.log("In middleware");
    try {
    let token;

    // Check if the 'token' cookie exists
    if (req.cookies.token) {
        // console.log("Got token");

            token = req.cookies.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 

            req.user = await userModel.findById(decoded.id).select('-password');
            if(req.user.role === "admin"){
                
                next();
            } else {
                throw new Error("You must be admin to visit this page!");
            }
            // console.log("heading to next");
    }

    if (!token) {
        console.log("no tokens found");
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
};

module.exports = { protect, adminOnly };