const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

// const launches = new Map();

let latestFlightNumber = 100;

// we are using mongoose now
// mapping the launch object to the responses of the spacex api
// const launch = {
//     flightNumber: 100, //flight_number
//     mission: "Kelpler Exploration Xi",//name
//     rocket: "Explorer IS1", //rocket.name
//     launchDate: new Date(2030, 11, 27),//date_local
//     target: 'Kepler-442 b',// not appilicable
//     customer: ['NASA', 'ZTM'],//payload.customers for each payload
//     upcoming: true,//upcoming
//     success: true,//success
// };

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";
// saveLaunch(launch);

async function populateLaunches() {
    console.log("Downloading launch data from spacex API...");
    const response = await axios.post(SPACEX_API_URL,
        {
            query: {},
            options : {
                populate : [
                    {
                        path : 'rocket',
                        select : {
                            name : 1
                        }
                    },
                    {
                        path: 'payloads',
                        select: {
                            'customers': 1
                        }
                    }
                ],
                pagination: false
            }
        });

        if (response.status !== 200){
            console.log('Problem downloading launch data');
            throw new Error('Launch data download failed');
        }
        const launchDocs = response.data.docs;
        for (const launchDoc of launchDocs){
            const payloads = launchDoc['payloads'];
            const customers = payloads.flatMap((payload) =>{
                return payload['customers'];
            });
            const launch ={
                flightNumber: launchDoc['flight_number'],
                mission: launchDoc['name'],
                rocket: launchDoc['rocket']['name'],
                launchDate: new Date(launchDoc['date_local']),
                upcoming: launchDoc['upcoming'],
                success: launchDoc['success'],
                customer: customers,
            }

            console.log(`${launch.flightNumber} ${launch.rocket}`);
            //populate Database
            await saveLaunch(launch);
        }
}
async function loadLaunchData (){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });

    if (firstLaunch) {
        console.log("Launch data already exists...");
    } else{
        await populateLaunches();
    }
}
// launches.set(launch.flightNumber, launch);
// console.log(launches);

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId){
    // return launches.has(launchId);
    return await  findLaunch({flightNumber: launchId,});
}

async function getLatestFlightNumber(params) {
    const latestLaunch = await launchesDatabase
        .findOne({})
        .sort('-flightNumber'); //the "-" sorts it in reverse order i.e desc
    if (!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit){
    // return Array.from(launches.values())
    return await launchesDatabase
        .find({},{'_id' : 0 , '__v' : 0})
        .sort({flightNumber: 1}) //sort in ascending or
        // .sort('flightNumber') //sort in ascending
        .skip(skip)
        .limit(limit);
}

async function saveLaunch(launch) {
    try{
    await launchesDatabase.findOneAndUpdate({
        flightNumber : launch.flightNumber
    }, launch,
    {
        upsert: true,
    });
    }catch (err) {
        console.error(err.stack);
        return (err.message);
        // throw err;
    }
}

// we are no longer using this 
function  addNewLaunch(launch) {
    latestFlightNumber++;
    launches.set(
        latestFlightNumber,
        Object.assign(launch, {
            flightNumber: latestFlightNumber,
            customer: ['Zero to mastery', 'NASA'],
            upcoming: true,
            success: true,
    }))
}

async function scheduleNewLaunch(launch) {
    try{
    const planet = await planets.findOne({
        keplerName : launch.target,
    });

    if (!planet) {
        // throw new Error('No matching planet found!');
        throw new Error('No matching planet found!');
        // return { error: 'No matching planet found!'};
    }
    const newFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customer: ['Zero to mastery', 'NASA'],
        flightNumber: newFlightNumber,
    })
    console.log(`The new flightNmuber is ${newFlightNumber}`);
    await saveLaunch(newLaunch);
    }catch (err) {
        console.error(err.stack);
        return (err.message);
        // throw err;
    }
}

async function abortLaunchById (launchId){
    // launches.delete(launchId);
    // or
    // const aborted = launches.get(launchId)
    // aborted.upcoming = false;
    // aborted.success = false;
    // return aborted;
    const aborted =  await launchesDatabase.updateOne({
        flightNumber: launchId,
    },{
        upcoming: false,
        success: false,
    });
    // return aborted.ok === 1 && aborted. nModified ===1;
    return aborted;
}

module.exports = {
    loadLaunchData,
    existsLaunchWithId,
    getAllLaunches,
    addNewLaunch,
    scheduleNewLaunch,
    abortLaunchById,
};