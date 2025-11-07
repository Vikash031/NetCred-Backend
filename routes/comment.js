const express = require('express');
const router = express.Router();
const Authentication = require('../authentication/auth');
const CommentControllers = require('../controller/comment');

router.post('/',Authentication.auth,CommentControllers.commentPost)

router.get('/:postId',CommentControllers.getCommentByPostId)
module.exports = router;

//chatgpt
router.delete('/:commentId', Authentication.auth, CommentControllers.deleteComment);
