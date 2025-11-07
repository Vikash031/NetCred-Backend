//different schemas for conversations, and the chats

const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]
}, { timestamps: true });

const ConversationModel = mongoose.model("conversation", ConversationSchema);
module.exports = ConversationModel;
