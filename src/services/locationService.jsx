import { useState } from 'react'

export default function Test() {
  const [location, setLocation] = useState(null);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // save the geolocation coordinates in two variables
        const { latitude, longitude } = position.coords;
        // update the value of userlocation variable
        setLocation([latitude, longitude]);
      },
      // if there was an error getting the users location
      (error) => {
        console.error('Error getting user location:', error);
      }
    );
  }

  return (
    <div id='locationService'>
      <button onClick={getLocation}>Get user location</button>
      {location && (
        <div>
          <h1>{location[0]}</h1>
          <h1>{location[1]}</h1>
        </div>
      )}
    </div>
  )
}

// export function currentLocation() {
//   console.log(1);
//   const toReturn = []
//   if(navigator.geolocation) {
//     console.log(2)
//     navigator.geolocation.getCurrentPosition((coords) => {
//       console.log(3);
//       toReturn[0] = coords.coords.latitude;
//       toReturn[1] = coords.coords.longitude;
//     })
//   }
//   console.log(toReturn)
//   return toReturn
// }