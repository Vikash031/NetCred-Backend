const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    content: {
        type: String,
        required: true
    },

    //type of notification: friend or comment

    type: {
        type: String,
        required: true,
        enum: ['friendRequest', 'comment']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    postId: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const NotificationModel = mongoose.model('notification', NotificationSchema);
module.exports = NotificationModel;

