const jwt = require('jsonwebtoken'); // FIREBASE_REPLACE: Remove later.
const userModel = require('../models/User');

const protect = async (req, res, next) => {
    // console.log("In middleware");

    let token;

    // Check if the 'token' cookie exists
    if (req.cookies.token) {
        // console.log("Got token");
        try {

            token = req.cookies.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 

            req.user = await userModel.findById(decoded.id).select('-password');
            // console.log("heading to next");
            next(); 
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.log("no tokens found");
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};


module.exports = { protect };