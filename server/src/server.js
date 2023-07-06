const http = require('http');
// const mongoose = require('mongoose');

const app = require('./app');

const { mongoConnect } = require('./services/mongo')
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;
// you can set the port using process.env.ENV_VARIABLE
// you can write "PORT=5600 node src/server.js" in the package.json script
// const MONGO_URL = 'mongodb+srv://nasa-api:CAw6vShyx04c4Lq6@nasa-cluster.y8b1cqq.mongodb.net/nasa?retryWrites=true&w=majority'

const server = http.createServer(app);

// we are moving the db connection to the services folder
// mongoose.connection.once('open',()=> {
//     console.log('MongoDB connection ready!');
// });

// mongoose.connection.on('error', (err) => {
//     console.error(err);
// });

async function startServer(){
    // await mongoose.connect(MONGO_URL
    // //     ,{
    // //     useNewUrlPasrser: true,
    // //     useFindAndModify: false,
    // //     useCreateIndex: true,
    // //     useUnifiedTopology: true,
    // // }
    // )
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchData();
    // await loadLaunchesData();

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}...`);
    });
};

startServer();