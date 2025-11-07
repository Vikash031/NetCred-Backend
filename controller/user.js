const User = require('../models/user')
const bcryptjs = require('bcryptjs')
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const NotificationModal = require('../models/notification')


const cookieOptions = {
    httpOnly: true,
    secure: false,  //set to true in production
    sameSite: 'Lax' //set to none in production
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.loginThroughGmail = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();

        //sub returns googleId from user model and gives it to payload
        const { sub, email, name, picture } = payload;

        let userExist = await User.findOne({ email });

        if (!userExist) {
            //register new user 
            userExist = await User.create({
                googleId: sub,
                email,
                f_name: name,
                profilePic: picture
            });
        }
        let jwttoken = jwt.sign({ userId: userExist._id }, process.env.JWT_PRIVATE_KEY);
        res.cookie('token', jwttoken, cookieOptions);
        return res.status(200).json({ user: userExist });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.register = async (req, res) => {
    try {
        let { email, password, f_name } = req.body;
        let isUserExist = await User.findOne({ email });
        if (isUserExist) {
            res.status(400).json({ error: "Already have an account with this Email. Please try with other email" });
        }
        // encryption is happening here
        const hashedPassword = await bcryptjs.hash(password, 10);

        const newUser = new User({ email, password: hashedPassword, f_name });
        await newUser.save();

        return res.status(201).json({ message: 'User registered successfully', success: 'yes', data: newUser });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        const userExist = await User.findOne({ email });

        if(userExist && !userExist.password){
            return res.status(400).json({error:'Please Login through Google'})
        }

        if (userExist && await bcryptjs.compare(password, userExist.password)) {
            let token = jwt.sign({ userId: userExist._id }, process.env.JWT_PRIVATE_KEY);
            res.cookie('token', token, cookieOptions)
            return res.json({ message: 'Logged in successfully', success: 'true', userExist })
        } else {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { user } = req.body;
        const isExist = await User.findById(req.user._id);
        if (!isExist) {
            return res.status(400).json({ error: 'User Doesnt exist' });
        }
        const updateData = await User.findByIdAndUpdate(isExist._id, user);

        const userData = await User.findById(req.user._id);
        res.status(200).json({
            message: "User updated successfully",
            user: userData
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const isExist = await User.findById(id);
        if (!isExist) {
            return res.status(400).json({ error: 'No Such User Exist' });
        }
        return res.status(200).json({
            message: "User fetched successfully",
            user: isExist
        });

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.logout = async (req, res) => {
    res.clearCookie('token', cookieOptions).json({ message: 'Logged Out Successfully' });
}

exports.findUser = async (req, res) => {
    try {
        let { query } = req.query;
        const users = await User.find({
            $and: [
                { _id: { $ne: req.user._id } },
                {
                    $or: [
                        { name: { $regex: new RegExp(`^${query}`, 'i') } },
                        { email: { $regex: new RegExp(`^${query}`, 'i') } }
                    ]
                }
            ]
        });

        return res.status(201).json({
            message: "Fetched Member",
            users: users
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.sendFriendRequest = async (req, res) => {
    try {
        const sender = req.user._id;
        const { reciever } = req.body;

        const userExist = await User.findById(reciever);
        if (!userExist) {
            return res.status(400).json({
                error: "No such user exist."
            });
        };

        const index = req.user.friends.findIndex(id => id.equals(reciever));
        if (index !== -1) {
            return res.status(400).json({
                error: "Already Friend"
            });
        }

        const lastIndex = userExist.pending_friends.findIndex(id => id.equals(req.user._id));

        if (lastIndex !== -1) {
            return res.status(400).json({
                error: "Already Sent Request"
            });
        }
        //send the request into pending list
        userExist.pending_friends.push(sender);
        let content = `${req.user.f_name} has sent you friend request`;
        const notification = new NotificationModal({ sender, reciever, content, type: "friendRequest" });
        await notification.save();
        await userExist.save();

        res.status(200).json({
            message: "Friend Request Sent",
        })

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}


//format
// exports. = async(req,res)=>{
//     try{

//     }
//     catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Server error', message: err.message });
//     }
// }

exports.acceptFriendRequest = async (req, res) => {
    try {
        let { friendId } = req.body;
        let selfId = req.user._id;

        const friendData = await User.findById(friendId);
        if (!friendData) {
            return res.status(400).json({
                error: "No such user exist."
            })
        }

        const index = req.user.pending_friends.findIndex(id => id.equals(friendId));

        if (index != -1) {
            req.user.pending_friends.splice(index, 1);
        } else {
            return res.status(400).json({
                error: "No any request from such user"
            })
        }
        req.user.friends.push(friendId);

        friendData.friends.push(req.user._id);

        let content = `${req.user.f_name} has accepted your friend request`;
        const notification = new NotificationModal({ sender: req.user._id, reciever: friendId, content, type: "friendRequest" });
        await notification.save();

        await friendData.save();
        await req.user.save();

        return res.status(200).json({
            message: "You both are connected now."
        })

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getFriendsList = async (req, res) => {
    try {
        let friendsList = await req.user.populate('friends');
        return res.status(200).json({
            friends: friendsList.friends
        })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getPendingFriendList = async (req, res) => {
    try {
        let pendingFriendsList = await req.user.populate('pending_friends');
        return res.status(200).json({
            pendingFriends: pendingFriendsList.pending_friends
        })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.removeFromFriend = async (req, res) => {
    try {
        let selfId = req.user._id;
        let { friendId } = req.params;

        const friendData = await User.findById(friendId);
        if (!friendData) {
            return res.status(400).json({
                error: "No such user exist."
            })
        }

        const index = req.user.friends.findIndex(id => id.equals(friendId));
        const friendIndex = friendData.friends.findIndex(id => id.equals(selfId));

        if (index !== -1) {
            req.user.friends.splice(index, 1);
        } else {
            return res.status(400).json({
                error: "No any request from such user"
            })
        }

        if (friendIndex !== -1) {
            friendData.friends.splice(friendIndex, 1)
        } else {
            return res.status(400).json({
                error: "No any request from such user"
            })
        }

        await req.user.save();
        await friendData.save();
        return res.status(200).json({
            message:"You both are disconnected now."
        })

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}
