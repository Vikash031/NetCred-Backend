const express = require('express');
const router = express.Router();
const UserController = require('../controller/user')
const Authentication = require('../authentication/auth')

//these routes are defined for controller.user.reg and log
router.post('/register', UserController.register)
router.post('/login', UserController.login)
// this route is for google OAuth2.0
router.post('/google', UserController.loginThroughGmail)

router.put('/update',Authentication.auth,UserController.updateUser)
router.get('/user/:id',UserController.getProfileById)
router.post('/logout',Authentication.auth,UserController.logout)

router.get('/self', Authentication.auth,(req,res)=>{
    return res.status(200).json({
        user:req.user
    })
})

router.get('/findUser', Authentication.auth, UserController.findUser)
router.post('/sendFriendReq',Authentication.auth, UserController.sendFriendRequest)
router.post('/acceptFriendRequest', Authentication.auth, UserController.acceptFriendRequest)

router.delete('/removeFromFriendList/:friendId',Authentication.auth,UserController.removeFromFriend)

router.get('/friendslist',Authentication.auth, UserController.getFriendsList)
router.get('/pendingFriendsList', Authentication.auth, UserController.getPendingFriendList)

module.exports = router;