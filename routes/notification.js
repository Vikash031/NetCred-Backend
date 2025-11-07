const express = require('express');
const router = express.Router();
const Authentication = require('../authentication/auth');
const NotificationController = require('../controller/notification')

//get notifications
router.get('/',Authentication.auth,NotificationController.getNotification)

//color change after reading notification
router.put('/isRead',Authentication.auth,NotificationController.updateRead)

router.get('/activeNotification',Authentication.auth,NotificationController.activeNotify)



module.exports = router;