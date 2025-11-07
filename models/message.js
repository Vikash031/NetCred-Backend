const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({

    //conversation spelling should be same as exported otw problem
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "conversation" //this spelling
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user" //belongs to user schema
    },
    message: {
        type: String,
    },
    picture: {
        type: String
    }

}, { timestamps: true });

const MessageModel = mongoose.model("message", MessageSchema);
module.exports = MessageModel;