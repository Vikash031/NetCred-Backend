    const express = require('express');
    const app = express();
    const cookieParser = require('cookie-parser');
    const cors = require('cors');
    const { Server } = require('socket.io');
    const http = require('http');
    const server = http.createServer(app);


    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ['GET', 'POST'],
        }
    });

    require('./connection');
    require('dotenv').config({ path: "./config.env" });

    const PORT = process.env.PORT || 4000;  //from env file

    app.use(express.json());
    app.use(cookieParser());

    app.use(cors({
        credentials: true,
        origin: "http://localhost:5173"
    }))

    io.on('connection', (socket) => {
        console.log('User Connected')

        socket.on("joinConversation", (conversationId) => {
            console.log(`User joined Conversation ID of ${conversationId}`)
            socket.join(conversationId)
        })

        socket.on("sendMessage", (convId, messageDetail) => {
            console.log("message Sent");
            io.to(convId).emit("receiveMessage", messageDetail);
        });


    })

    const UserRoutes = require('./routes/user');
    const PostRoutes = require('./routes/post');
    const NotificationRoutes = require('./routes/notification');
    const CommentRoutes = require('./routes/comment');
    const ConversationRoutes = require('./routes/conversations');
    const MessageRoutes = require('./routes/message')

    const MemoryRoutes = require('./routes/memory') 


    app.use('/api/auth', UserRoutes);
    app.use('/api/post', PostRoutes);
    app.use('/api/notification', NotificationRoutes);
    app.use('/api/comment', CommentRoutes);
    app.use('/api/conversation', ConversationRoutes)
    app.use('/api/message', MessageRoutes)
    app.use('/api/memory', MemoryRoutes);


    server.listen(PORT, () => {
        console.log("Backend server is running on port", PORT)
    })
