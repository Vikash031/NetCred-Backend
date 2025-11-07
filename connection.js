// const mongoose = require('mongoose');

// //NetCred

// mongoose.connect('mongodb://localhost:27017/NetCred').then(res=>{
//     console.log("Database Successfully connected")
// }).catch(err=>{
//     console.log(err)
// })


// const mongoose = require('mongoose');

// // NetCred

// mongoose.connect('mongodb+srv://netcred_admin:ecc@1234@netcred.gdluxnx.mongodb.net/?appName=NetCred')
//     .then(res => {
//         console.log("Database Successfully connected to MongoDB Atlas")
//     })
//     .catch(err => {
//         console.log(err)
//     })


const mongoose = require('mongoose');

// NetCred

mongoose.connect('mongodb+srv://netcred_admin:ecc1234@cluster0.bhpvxuw.mongodb.net/?appName=Cluster0')
    .then(() => {
        console.log("Database Successfully connected to MongoDB Atlas");
    })
    .catch((err) => {
        console.log(err);
    });

