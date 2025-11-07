const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // if google:
    googleId: {
        type:String
    },
    email:{
        type:String,
        required:true
    },
    password: {
        type:String
    },
    f_name: {
        type:String,
        default:""
    },
    headline: {
        type:String,
        default:""
    },
    curr_company:{
        type: String,
        default:""
    },
    curr_location:{
        type: String,
        default: ""
    },
    profilePic:{
        type: String,
        default:"frontend\public\profpic.png"
    },
    cover_pic:{
        type:String,
        default:"https://i.pinimg.com/736x/0e/04/3e/0e043ef4805b97c9a4e45cf1576e2c8a.jpg"
    },
    about:{
        type:String,
        default:"" 
    },
    // skills:{
//p15,0600
    // }
    experience:[
        {
            designation:{
                type: String,
            },
            company_name:{
                type: String,
            },
            duration:{
                type: String,
            },
            location:{
                type: String,
            }
        }
    ],

    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user', //this is the schema reference
        }
    ],

    pending_friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ],

    resume:{
        type:String,
    },
},{timestamps: true});

const userModel = mongoose.model('user', UserSchema);
module.exports = userModel;