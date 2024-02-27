// utils/parseCoordinates.js
import Papa from 'papaparse';

const parseCoordinatesCSV = async (csvFilePath) => {
  try {
    const response = await fetch(csvFilePath);
    const csvText = await response.text();
    let i = 0
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        complete: (result) => {
          const latLongArray = result.data.map((row) => {
            const lat = parseFloat(row.LATITUDE);
            const long = parseFloat(row.LONGITUDE);
            if (!isNaN(lat) && !isNaN(long)) {
              return [long, lat];
            }
            return null;
          }).filter(coords => coords !== null);
          resolve(latLongArray);
        },
        error: (error) => reject(error),
      });
    });
  } catch (error) {
    console.error('Error fetching or parsing CSV:', error);
    return [];
  }
};

export default parseCoordinatesCSV;