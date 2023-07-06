const { getAllLaunches, 
        addNewLaunch,
        scheduleNewLaunch,
        existsLaunchWithId,
        abortLaunchById 
    } = require('../../models/launches.model');
const {
    getPagination
} = require('../../services/query')
;

async function httpGetAllLaunches(req, res) {
    console.log(req.query)
    const { skip, limit } = getPagination(req.query);
    const launches = await getAllLaunches(skip, limit);
    return res.status(200).json(launches);
};

async function httpAddNewLaunches(req, res) {
    const launch = req.body;

    if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target){
        return res.status(400).json(
            {
                error: 'Missing required launch property'
            }
        );
    }
    launch.launchDate = new Date(launch.launchDate);

    //to validate dates
    if (launch.launchDate.toString() === 'Invalid Date'){
        return res.status(400).json(
            {
                error: 'Invalid launch date'
            }
        );
    }
                    // or
    if (isNaN(launch.launchDate)){
        return res.status(400).json(
            {
                error: 'Invalid launch date'
            }
        );
    }

    const scheduleResult = await scheduleNewLaunch(launch);
    // console.error(scheduleResult);
    if (!scheduleResult){
        return res.status(201).json(launch);
    }

    return res.status(400).json({ error: scheduleResult});
}

async function httpAbortLaunch(req, res){
    const launchId = +req.params.id;
    const existsLaunch = await existsLaunchWithId(launchId)
    // if launch does not exist
    if (!existsLaunch) {

        return res.status(404).json({
            error: 'Launch not found'
        });
    }

    const aborted = await abortLaunchById(launchId);
    if (!aborted){
        return res.status(400).json({
            error: 'Launch not aborted'
        })
    }
    return res.status(200).json({
        ok: true,
    });
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunches,
    httpAbortLaunch,
}