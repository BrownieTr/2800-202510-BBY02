import { useState } from 'react'



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
export function calculateDistance(lat1, lon1, lat2, lon2) {
  lat1 = parseFloat(lat1)
  lon1 = parseFloat(lon1)
  lat2 = parseFloat(lat2)
  lon2 = parseFloat(lon2)
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