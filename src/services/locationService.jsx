import { useState } from 'react'

// export function Test() {
//   const [location, setLocation] = useState(null);

//   const getLocation = () => {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         // save the geolocation coordinates in two variables
//         const { latitude, longitude } = position.coords;
//         // update the value of userlocation variable
//         setLocation([latitude, longitude]);
//       },
//       // if there was an error getting the users location
//       (error) => {
//         console.error('Error getting user location:', error);
//       }
//     );
//   }

//   return (
//     <div id='locationService'>
//       <button onClick={getLocation}>Get user location</button>
//       {location && (
//         <div>
//           <h1>{location[0]}</h1>
//           <h1>{location[1]}</h1>
//         </div>
//       )}
//     </div>
//   )
// }

export async function currentLocation() {
  const toReturn = []
  if(navigator.geolocation) {
    await navigator.geolocation.getCurrentPosition((coords) => {
      toReturn[0] = coords.coords.latitude;
      toReturn[1] = coords.coords.longitude;
    })
  }
  return toReturn
}


/**
 * Calculates distance using haversine formula
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 * Returns approx distance between 2 points in km
 * Since distance should be small, the difference between calculated and actual distance 
 * should be small as well
 */
export  default function calculateDistance(lat1, lon1, lat2, lon2) {
  const latDelta = lat2 - lat1;
  const lonDelta = lon2 - lon1;
  const haversine = (Math.sin(latDelta/2) * Math.sin(latDelta/2)) + (Math.cos(lon1)*Math.cos(lon2)*((1-Math.cos(lonDelta))/2))

  const haversine_radians = haversine * Math.PI/180;
  /**
   * Average radius of earth, since radius at equator and radis at the poles differ
   * @see https://en.wikipedia.org/wiki/Earth_radius
   */
  const radius = 6371.2  

  const distance = haversine_radians * radius;
  return distance;

}