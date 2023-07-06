const fs = require('fs');
const path = require('path');
const parse = require('csv-parse');
const { default: mongoose } = require('mongoose');

// we want to load data into the mongoose model which will send it to the DB
const planets = require('./planets.mongo');
const { memoryUsage } = require('process');

const results = [];
const habitable = [];

// create a function to create if planet is habitable
function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}
// to deal with the async nature of node
// we use promises
/*
const promise = new Promise((resolve, reject)=> {

});
promise.then((result) => {
    console.log(result);
});
            or
const result = await promise;
console.log(result);
*/

function loadPlanetsData(){
    return new Promise((resolve, reject)=>{

        // createReadStream creates a readable stream that can be chained with emitters
        fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
        // using the pipe function to send a read stream to a write stream
                .pipe(parse.parse({
                    comment: '#',
                    columns: true,
                }))
                .on('data', async (data) => {
                    results.push(data);
                    if (isHabitablePlanet(data)) {
                        // instead of saving it in memoryUsage, we send it to the DB
                        // habitable.push(data);
                        // we use upsert to avoid creating multiple entries
                        // update + insert = upsert
                        await savePlanet(data)
                    }
                })
                .on('error', (error)=> {
                    console.log(error);
                    reject(error);
                })
                .on('end', async () => {
                    // console.log(habitable.map((planet) => {
                    //     return planet['kepler_name'];
                    // }));
                    const countPlanetsFound = await getAllPlanets();
                    console.log(`${countPlanetsFound.length} planets found to be habitable`);
                    resolve();
                });
    } );
}

async function getAllPlanets () {
    // return habitable;
    return await planets.find({},{'_id' : 0 , '__v' : 0});
}

async function savePlanet(planet){
    try {
        await planets.updateOne({
            keplerName: planet.kepler_name,
        }, {
            keplerName: planet.kepler_name
        }, {
            upsert: true
        });
    } catch (err){
        console.error(`Could not save planet: ${err}`);
    }
}
module.exports = {
    loadPlanetsData,
    getAllPlanets,
}