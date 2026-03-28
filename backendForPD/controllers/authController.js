const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



// generates token for browser
function getToken(user, res) {
    try{
    const token = jwt.sign({ id: user._id, role:user.role }, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    });

    const options = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };

        return {token, options};
    } catch (error){
        res.status(500).json({
            message: error.message
        })
    }
}

//Registerr
const registerUser = async (req, res) => {
    try{
    const { username, email, password } = req.body;

    const user = await User.findOne({ email });

    if(user) {
        return res.status(400).json({ 
            message: "User Already Exists"
         });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        username,
        email,
        password: hashedPassword
    });
    let { token, options} = await getToken(newUser, res);

    res.status(201)
        .cookie('token', token, options)
        .json({
            message: "Registration Successful",
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,

        });
    
    } catch(error){
        console.log(error.message);
        res.status(500).json({
        message: "Server error"
    });
    }

}

// Login
const loginUser = async (req, res) => {
    try{
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if(!user) {
        return res.status(400).json({ 
            message: "User not Exists"
         });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if(!isPasswordMatched) {
        return res.status(400).json({ 
            message: "Invalid Credentials"
         });
    }
    let {token, options} = await getToken(user, 200, res);
   return res.status(200)
        .cookie('token', token, options)
        .json({
            message: "Login Successful",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                }
        })


    } catch(error){
        console.log(error.message);
    }

}

// Logout
const logoutUser = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ message: "Logout Successfully"});
};

const getUser = async (req, res) =>{
    
    try{
    const user = await User.findById(req.user._id);
    
    if(!user){
        return res.status(400).json({
            message: "Invalid or Expired token, re-login please"
        });
    }
    res.status(200).json({
        message: "User Found",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
        });
    } catch(err){
        res.status(500).json({
            message: err.message
        });
        console.log(err.message);
    }
}

// Update Email
const updateUserDetail = async (req, res) => {
    try {
        let { newEmail } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            
            const userExists = await User.findOne({ email: newEmail });

            if(userExists) return res.status(400).json({
            message: "Email already exists"
            });
            user.email = newEmail;
            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                email: updatedUser.newEmail
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Update Password
const updateUserPassword = async (req, res) => {
    try {
        let { oldPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user._id);

        if(!user || !user.password){
            return res.status(400).json({ message: "Something went wrong" });
        }
       
        const isMatched = await bcrypt.compare(oldPassword, user.password);

        if(!isMatched) return res.status(400).json({ message: "Invalid Credentials" });
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        const updatedUser = await user.save();



    } catch(error){
        res.status(500).json({ message: error.message });
    }
}

module.exports = { registerUser, loginUser, logoutUser, updateUserDetail, updateUserPassword, getUser };