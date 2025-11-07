const CommentModel = require('../models/comment')
const PostModel = require('../models/post')
const NotificationModal = require('../models/notification')

exports.commentPost = async (req, res) => {
    try {

        const { postId, comment } = req.body;
        const userId = req.user._id;

        const postExist = await PostModel.findById(postId).populate("user");
        if (!postExist) {
            return res.status(400).json({ error: 'No such post found' });
        }

        postExist.comments = postExist.comments + 1;
        await postExist.save();

        const newComment = new CommentModel({ user: userId, post: postId, comment });
        await newComment.save();

        const populatedComment = await CommentModel.findById(newComment._id).populate('user', 'f_name headline profilePic');

        const content = `${req.user.f_name} has commented on your Post`;
        const notification = new NotificationModal({ sender: userId, reciever: postExist.user._id, content, type: 'comment', postId: postId.toString() })

        await notification.save();
        return res.status(200).json({
            message:"Commented Successfully",
            count : populatedComment
        })


    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}
//chatgpt:
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await CommentModel.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    await CommentModel.findByIdAndDelete(commentId);
    await PostModel.findByIdAndUpdate(comment.post, { $inc: { comments: -1 } });

    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCommentByPostId = async(req,res)=>{
    try{
        const {postId} = req.params;
        const isPostExist = await PostModel.findById(postId);
        if(!isPostExist){
            return res.status(400).json({ error: 'No such post found' });
        }
        const comments = await CommentModel.find({post:postId}).sort({ createdAt: -1 }).populate("user","f_name headline profilePic");
        return res.status(201).json({
            message:"Comments fetched",
            comments:comments
        })
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error',message:err.message });
    }
}
