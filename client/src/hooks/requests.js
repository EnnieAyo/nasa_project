const API_URL = 'http://localhost:8000/v1';

// Load planets and return as JSON.
async function httpGetPlanets() {
  const response = await fetch(`${API_URL}/planets'`);
  return await response.json();
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
  const response = await fetch(`${API_URL}/launches'`);
  // we have to return a sorted data
  const fetchedLaunches =  await response.json();
  return fetchedLaunches.sort((a, b) => {
    return a.flightNumber - b.flightNumber;
  });
}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
  // to handle error use try and catch
  try{

    const response = await fetch(`${API_URL}/launches'`, {
      method: "post",
      body: JSON.stringify(launch),
      headers: {
        "Content-Type": "application/json", 
      }
    }
    );
    return response;
  } catch(err){
    const response = {
      ok: false,
    };
    return response;
  };

}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try{

    const response = await fetch(`${API_URL}/launches/${id}`, {
      method: "delete",
    }
    );
    return response;
  } catch(err){
    const response = {
      ok: false,
    };
    return response;
  };
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};