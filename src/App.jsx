import React from 'react'
// import App from './App.jsx'
import './index.css'
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import {ArcLayer,LineLayer} from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';
import {FlyToInterpolator}  from 'deck.gl';
import parseCoordinatesCSV from './components/CSVImportStatic';
import parsePaths from './components/CSVImportPath';
import { useState, useEffect, useCallback } from 'react';
import collisions from './data/sample.csv';
import rides from './data/5000_rides.csv'
import GL from '@luma.gl/constants';
import {GeoJsonLayer, PolygonLayer,ScatterplotLayer} from '@deck.gl/layers';
// import GL from '@luma.gl/constants';
import {scaleThreshold} from 'd3-scale';

const VC_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json'; // eslint-disable-line

const landCover = [
  [
    [-123.0, 49.196],
    [-123.0, 49.324],
    [-123.306, 49.324],
    [-123.306, 49.196]
  ]
];

function getColor(d) {
  const z = d.start[2];
  const r = z / 10000;

  return [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r)];
}



export const COLOR_SCALE = scaleThreshold()
  .domain([-0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2])
  .range([
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // zero
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38]
  ]);




const material = {
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51]
};

export const lwc = 'https://tiles.basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
export const dwc = "https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"


export const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];



export default function App({
  radius = 80,
  upperPercentile = 100,
  coverage = 1,
  onLoadingComplete,
  getWidth = 1,
  getHeight = 1,
}) {
  const [data, setCoordinates] = useState([]);
  const [paths, setPaths] = useState([]);
  const [where, setWhere] = useState("NYC")
  const [mapStyle, setMapStyle] = useState(dwc);
  const [isVisible, setIsVisible] = useState(true); // Controls the visibility of the modal
  const handleCloseClick = () => {
    setIsVisible(false); // Hides the modal when the button is clicked
  };
  const [initialViewState, setInitialViewState] = useState({
    longitude: -73.9,
      latitude: 40.6,
      zoom: 10.3,
      minZoom: 5,
      maxZoom: 15,
      pitch: 40,
      bearing: 0,
  });
  const goToNYC = useCallback(() => {
    setWhere("NYC")
    setInitialViewState({
      longitude: -73.9,
      latitude: 40.6,
      zoom: 10.3,
      minZoom: 5,
      maxZoom: 15,
      pitch: 40,
      bearing: 0,
      transitionDuration: 2000,
      transitionInterpolator: new FlyToInterpolator()
    })
  }, []);
  const goToVC = useCallback(() => {
    setWhere("VC")
    setInitialViewState({
      longitude: -123.17,
      latitude: 49.25,
      zoom: 10.5,
      minZoom: 5,
      maxZoom: 15,
      pitch: 40,
      bearing: 100,
      transitionDuration: 2000,
      transitionInterpolator: new FlyToInterpolator()
    })
  }, []);
  const goToChicago = useCallback(() => {
    setWhere("CHI")
    setInitialViewState({
      longitude: -87.6,
      latitude: 41.85,
      zoom: 10.5,
      minZoom: 5,
      maxZoom: 15,
      pitch: 40,
      bearing: -60,
      transitionDuration: 2000,
      transitionInterpolator: new FlyToInterpolator()
    })
  }, []);
  const switchStyle = () => {
    if (mapStyle == lwc){
      setMapStyle(dwc)
    }
    else{
      setMapStyle(lwc)
    }
  }

  useEffect(() => {
    const loadCoordinates = async () => {
      const resp = await parseCoordinatesCSV(collisions);
      const resp2 = await parsePaths(rides)
      setPaths(resp2)
      setCoordinates(resp);
      onLoadingComplete();
    };
    loadCoordinates();
  }, [onLoadingComplete]);
  

  const layers = [
    new PolygonLayer({
      id: 'ground',
      data: landCover,
      stroked: false,
      getPolygon: f => f,
      getFillColor: [0, 0, 0, 0]
    }),
    new GeoJsonLayer({
      id: 'geojson',
      data: VC_URL,
      opacity: 1,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: f => Math.sqrt(f.properties.valuePerSqm) * 10,
      getFillColor: f => COLOR_SCALE(f.properties.growth),
      getLineColor: [255, 255, 255],
      pickable: true
    }),
    new ArcLayer({
      id: 'bike-paths',
      data: paths,
      opacity: 0.5,
      getSourcePosition: d => d.start,
      getTargetPosition: d => d.end,
      getColor,
      getWidth,
      getHeight,
      pickable: true,
      getSourceColor: d => [50, 140, 250],
      getTargetColor: d => [100, 140, 250],
    }),
    new HexagonLayer({
      id: 'heatmap',
      colorRange,
      coverage,
      data,
      elevationRange: [0, 400],
      elevationScale: data && data.length ? 50 : 0,
      extruded: true,
      getPosition: d => d,
      pickable: true,
      radius,
      upperPercentile,
      material,

      transitions: {
        elevationScale: 400
      }
    })
  ];
  
  return (
    <>
    {isVisible && 
    <div className="modalBackground">
      <div className="modalContainer">
        <div className="modalHeader">
          <h2>Welcome!</h2>
        </div>
        <div className="modalContent">
          <p>This application uses deck.gl to visualize data on cities like Vancouver, NYC, and Chicago.</p>
          <p>Use the buttons to navigate and adjust lighting settings for different views.</p>
        </div>
        <div className="modalFooter">
          <button onClick={handleCloseClick}>Got it!</button>
        </div>
      </div>
    </div>}
    <div className="canvas">
    <div className="overlay">
      <p>{where == "CHI"&& <><h2>Chicago</h2>This visualization displays 1,500 sampled bike trips from Chicago's Divvy bike-share program. It maps out the starting and ending points of trips throughout the city, providing a visual representation of bike trip patterns and popular routes.</>}
      {where == "NYC"&& <><h2>New York City</h2>This bar chart visualizes the accident rates in New York City for the year 2019. It breaks down incidents by borough, showing a comparative analysis of accident frequencies across different areas of the city.</>}
      {where == "VC"&& <><h2>Vancouver</h2>This chart offers a visual representation of housing prices in Vancouver, using a polygonal design to depict price variations across different neighborhoods. The chart categorizes areas by price range, giving a snapshot of the real estate market's landscape.




 </>}
      </p>
      <div className="btns">
        <button className="switchy" onClick={()=> switchStyle()} style={{
          margin: "0 auto",
          bottom: "5rem",
        }}>{mapStyle == lwc? <>Dark Setting</>: <>Light Setting</>}</button>
        <button className="switchy" onClick={()=> goToNYC()} style={{
          margin: "0 auto",
          bottom: "5rem",
          zIndex:"1",
        }}>Go to NYC</button>
        <button className="switchy" onClick={()=> goToChicago()} style={{
          margin: "0 auto",
          bottom: "5rem",
          zIndex:"1",
        }}>Go to Chicago</button>
        <button className="switchy" onClick={()=> goToVC()} style={{
          margin: "0 auto",
          bottom: "5rem",
          zIndex:"1",
        }}>Go to Vancouver</button>
      </div>
    </div>





    <DeckGL
      layers={layers}
      initialViewState={initialViewState}
      controller={true}
      pickingRadius={5}
      // getTooltip={getTooltip}
      parameters={{
        blendFunc: [GL.SRC_ALPHA, GL.ONE, GL.ONE_MINUS_DST_ALPHA, GL.ONE],
        blendEquation: GL.FUNC_ADD
      }}
    >
      
      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
    </div>
    </>
  );
}