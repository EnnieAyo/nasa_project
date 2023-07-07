const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URL = process.env.MONGODB_URL;


mongoose.connection.once('open',()=> {
    console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function mongoConnect() {
    await mongoose.connect(MONGO_URL
        //     ,{
        //     useNewUrlPasrser: true,
        //     useFindAndModify: false,
        //     useCreateIndex: true,
        //     useUnifiedTopology: true,
        // }
        );
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect,
}