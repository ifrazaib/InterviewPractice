const mongoose = require('mongoose');


// creating user schema...
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 6,
    },
},
    {
        timestamps: true,
});



module.exports = mongoose.model('user', userSchema);