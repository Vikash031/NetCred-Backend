const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    desc: {
        type: String,
    },
    imageLink: {
        type: String,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ],
    comments:{ //there should be two referencing for comment the first on should be on WHICH POST, and second one should be by WHOM, that is why we made comment.js
        type:Number,
        default:0
    }
},{timestamps:true});

const PostModel = mongoose.model('post', PostSchema);
module.exports = PostModel;