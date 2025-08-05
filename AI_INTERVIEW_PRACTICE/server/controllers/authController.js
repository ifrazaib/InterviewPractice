const user = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



// register function...
const registerUser = async (req, res) => {
  
    try {

        const { name, email, password } = req.body;

        const userExist = await user.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const newUser = await user.create({
            name,
            email,
            password: hashedPassword,
        });


        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '30s',
        });

        res.status(201).json({
          success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } 
    catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message })
    }

};





// login function...
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await user.findOne({ email });
    if (!foundUser) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET, {
      expiresIn: '30s', 
    });

    res.json({
      token,
      user: {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
      },
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};






module.exports = { registerUser, loginUser };