/**
 * Uses IPInfo instead of navigator.geolocation since this is a lot faster. 
 */
export async function currentLocation() {
  //gets the location from ipinfo
  const request = await fetch("https://ipinfo.io/json?token=7ea3e31d9b35e6")
  //turns the data into a JSON object
  const jsonResponse = await request.json()

  //Since jsonResponse.loc outputs a string, split it into 
  const location = jsonResponse.loc.split(",");
  const locationNum = []
  locationNum[0] = parseFloat(location[0])
  locationNum[1] = parseFloat(location[1])

  return locationNum
}


/**
 * Calculates distance using haversine formula
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 * Returns approx distance between 2 points in km
 * Since distance should be small, the difference between calculated and actual distance 
 * should be small as well
 */
export default function calculateDistance(lat1, lon1, lat2, lon2) {
  // Convert all inputs to numbers
  lat1 = parseFloat(lat1);
  lon1 = parseFloat(lon1);
  lat2 = parseFloat(lat2);
  lon2 = parseFloat(lon2);
  
  // Convert degrees to radians
  const lat1Rad = lat1 * Math.PI/180;
  const lon1Rad = lon1 * Math.PI/180;
  const lat2Rad = lat2 * Math.PI/180;
  const lon2Rad = lon2 * Math.PI/180;
  
  // Calculate deltas
  const latDelta = lat2Rad - lat1Rad;
  const lonDelta = lon2Rad - lon1Rad;
  
  // Haversine formula (already in radians)
  const a = Math.sin(latDelta/2) * Math.sin(latDelta/2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(lonDelta/2) * Math.sin(lonDelta/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  /**
   * Average radius of earth, since radius at equator and radius at the poles differ
   * @see https://en.wikipedia.org/wiki/Earth_radius
   */
  const radius = 6371.2;
  
  // Calculate the distance
  const distance = radius * c;
  return distance;
}