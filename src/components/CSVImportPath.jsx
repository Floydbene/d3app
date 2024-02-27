// utils/parseCoordinates.js
import Papa from 'papaparse';

const parsePaths = async (csvFilePath) => {
  try {
    const response = await fetch(csvFilePath);
    const csvText = await response.text();
    let i = 0
    return new Promise((resolve, reject) => {
     console.log("start")
      Papa.parse(csvText, {
        header: true,
        complete: (result) => {
          const latLongArray = result.data.slice(0, 1500).map((row) => {
            const slat = parseFloat(row.start_lat);
            const slong = parseFloat(row.start_lng);
            const elat = parseFloat(row.end_lat);
            const elong = parseFloat(row.end_lng);
            if (slat > 40 && slat < 42 && elat > 40 && elat < 42 && slong < -80 && slong > -90 && elong < -80 && elong > -90) {
              return {
               start:[slong,slat],
               end:[elong,elat]
              };
            }
            return null;
          }).filter(coords => coords !== null);
          resolve(latLongArray);
          console.log('read');
        },
        error: (error) => reject(error),
      });
    });
  } catch (error) {
    console.error('Error fetching or parsing CSV:', error);
    return [];
  }
};

export default parsePaths;