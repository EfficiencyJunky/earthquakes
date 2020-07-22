// Create our map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 5,
  // layers: [streetmap, earthquakes]
});

let minimumEarthquakeMagnitude = 1.5;


let layerControl = undefined;

let earthquakes = {};
let significantEarthquakes = {};
let tectonicPlates = L.geoJson(tectonicPlatesGeoJSON, 
                                { 
                                  pane: 'tectonicPlatesPane',
                                  onEachFeature: (function (feature, layer) {
                                    layer.bindPopup(
                                      "<h3>" + feature.properties.PlateName + " Plate</h3>"
                                    );
                                  }),
                                  style: { fillOpacity: 0.0, weight: 2, opacity: 1, color: 'orange' }
                                }
                              );


let numEarthquakeMaps = 2;
var myAsyncCounter = new asyncCounter(numEarthquakeMaps, createOverlayMaps);



// **************** FUNCTIONS TO GET COLORS FOR CIRCLES BASED ON MAGNITUDE AND LEGEND ******************
function getColorNormal(d) {

  return d > 5.0  ? '#FF0000' :
         d > 4.0  ? '#ff6600' :
         d > 3.0  ? '#FFCC00' :
         d > 2.0   ? '#ccff00' :
         d > 1.0   ? '#66ff00' :
         d > 0.0   ? '#00FF00' :
                    '#00FF00';
}

function getColorSignificant(d) {
  return '#000000';
}

// ************************  API CALL FUNCTIONS TO CREATE THE EARTHQUAKE LAYERS ************************  
// Store our API endpoint inside queryUrl
// var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// var normalEarthquakesQueryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=1989-10-15&endtime=1989-10-20";//&minmagnitude=2.5&minlatitude=20.0&maxlatitude=50.0&minlongitude=220.0&maxlongitude=300.0";
var normalEarthquakesQueryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" + getDateOneWeekAgo() + "&minmagnitude=" + String(minimumEarthquakeMagnitude);// + "&endtime=" + today;//&minmagnitude=2.5&minlatitude=20.0&maxlatitude=50.0&minlongitude=220.0&maxlongitude=300.0";




// Perform a GET request to the query URL
var significantEarthquakesQueryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";




// **************** FUNCTION TO CREATE THE FEATURES FOR EACH API CALL ******************
function createFeatures(earthquakeData, getColor, paneName) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      "<h3>" + feature.properties.place + "</h3>" +
      "<hr>" +
      "<p>" + new Date(feature.properties.time) + //"</p>" +
      "<br>" +
      // "<p>" + "Magnitude: " + feature.properties.mag + "</p>"
      "<b>" + "Magnitude: " + "</b>" + feature.properties.mag + "</p>"
    );
  }

  function createMarkers(feature, latlng) {

    let radius = feature.properties.mag * 3;
    //let color = "#ff7877";
    let color = getColor(feature.properties.mag);

    let geojsonMarkerOptions = {
      // these properties deligate the fill color and opacity
      pane: paneName,
      fillOpacity: 0.8,
      fillColor: color,
      // this properties sets the radius size DUH!
      radius: radius,
      // these properties create the black outline
      color: "#000",
      weight: 1,
      opacity: 1
    };

    return L.circleMarker(latlng, geojsonMarkerOptions);
  }


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: createMarkers
  });

  return earthquakes;

}

function createAndAddBaseMaps(){
  // Define various map layers
  // var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  //   attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  //   maxZoom: 18,
  //   id: "mapbox.streets",
  //   accessToken: API_KEY
  // });

  let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    // maxZoom: maximumZoom,
    // minZoom: minimumZoom,
    id: "mapbox/streets-v11",
    // id: "mapbox.streets",
    accessToken: API_KEY
  });

  // var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  //   attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  //   maxZoom: 18,
  //   id: "mapbox.dark",
  //   accessToken: API_KEY
  // });

  let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      // maxZoom: maximumZoom,
      // minZoom: minimumZoom,
      id: "mapbox/dark-v9",      
      // id: "mapbox.dark",
      accessToken: API_KEY
  });


  // var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  //   attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  //   maxZoom: 18,
  //   id: "mapbox.streets-satellite",
  //   accessToken: API_KEY
  // });  

    let satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      // maxZoom: maximumZoom,
      // minZoom: minimumZoom,
      id: "mapbox/satellite-v9",
      // id: "mapbox.streets-satellite",
      accessToken: API_KEY
  });  


  // var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  //   attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  //   maxZoom: 18,
  //   id: "mapbox.outdoors",
  //   accessToken: API_KEY
  // });  

  // let streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    let outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,      
      // maxZoom: maximumZoom,
      // minZoom: minimumZoom,
      id: "mapbox/outdoors-v9",
      // id: "mapbox.streets-satellite",
      accessToken: API_KEY
  });  

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Outdoors": outdoors,
    "Satellite": satellite,
    "Dark Map": darkmap
  };


  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Significant: significantEarthquakes,
    TectonicPlates: tectonicPlates
  };

  // Create empty overlay object as a placeholder for our overlay layers
  var overlayMaps = {};


  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  layerControl = L.control.layers(baseMaps, overlayMaps, {collapsed: false});

  // add the initial tile layer, 
  streetmap.addTo(myMap);
  layerControl.addTo(myMap);
  createLegend();
  // createlayerControl(baseMaps, overlayMaps);

  // set up our panes and zIndex ordering so they layer correctly when added and removed using the UI control layer
  myMap.createPane('tectonicPlatesPane');
  myMap.getPane('tectonicPlatesPane').style.zIndex = 399;

  myMap.createPane('normalEarthquakesPane');
  myMap.getPane('normalEarthquakesPane').style.zIndex = 400;

  myMap.createPane('significantEarthquakesPane');
  myMap.getPane('significantEarthquakesPane').style.zIndex = 401;

  // add the tectonic plates as soon as possible
  layerControl.addOverlay(tectonicPlates, "Tectonic Plates");
  tectonicPlates.addTo(myMap);

}



// **************** FUNCTION TO CREATE THE FINAL MAP LAYERS ******************
function createOverlayMaps() {  
// function createOverlayMaps(earthquakes, tectonicPlates) {

  // add the overlay layers to the Layer Control object
  layerControl.addOverlay(earthquakes, "Earthquakes");
  
  // remoe the significantEarthquakes Layer
  myMap.removeLayer(significantEarthquakes);
  // earthquakes.addTo(myMap);

  // Add the Earthquakes Layer to the map
  earthquakes.addTo(myMap);

}




function createLegend(){
  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

      // the earthquake grades we will separate colors into for the legend
      let grades = (minimumEarthquakeMagnitude < 1.0) ? [0.0, 1.0, 2.0, 3.0, 4.0, 5.0] : [1.0, 2.0, 3.0, 4.0, 5.0];
      
      // only used if we want to make the labele creation for the grades in the legend more obvious in the code
      let labels = []; 
    
      let div = L.DomUtil.create('div', 'info legend');

      div.innerHTML += '<b>Magnitude</b><br>';

      // loop through our density intervals and generate a label with a colored square for each interval
      for (let i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColorNormal(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      
      if(numEarthquakeMaps == 2){
        div.innerHTML += '<hr>' + '<i style="background:' + getColorSignificant(1) + '"></i> ' + "Significant";
      }

      return div;
  };

  legend.addTo(myMap);
}




// **************** MAIN PROGRAM ******************
// **************** MAIN PROGRAM ******************
// **************** MAIN PROGRAM ******************

createAndAddBaseMaps();

// Perform a GET request to the query URL
d3.json(normalEarthquakesQueryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function along with color seting function and pane name
  earthquakes = createFeatures(data.features, getColorNormal, 'normalEarthquakesPane');
  
  myAsyncCounter.increment();

  console.log("earthquakes created");
  
  // Sending our earthquakes layer to the createMap function
  // createMap(earthquakes, tectonicPlates);
});


d3.json(significantEarthquakesQueryURL, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  significantEarthquakes = createFeatures(data.features, getColorSignificant, 'significantEarthquakesPane');
  
  myAsyncCounter.increment();

  console.log("significant earthquakes created");

  layerControl.addOverlay(significantEarthquakes, "Significant");
  significantEarthquakes.addTo(myMap);
  // significantEarthquakes.addTo(myMap);
  // Sending our earthquakes layer to the createMap function
  // createMap(earthquakes, tectonicPlates);
});






// **************** HELPER FUNCTIONS ******************
// **************** HELPER FUNCTIONS ******************
// **************** HELPER FUNCTIONS ******************

// **************** GET THE DATE 7 DAYS AGO ******************
function getDateOneWeekAgo(){
  let todaysDate = new Date();
  let dd = String(todaysDate.getDate()).padStart(2, '0');
  let mm = String(todaysDate.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = todaysDate.getFullYear();
  
  let today = yyyy + '-' + mm + '-' + dd;
  // console.log("date:", today);
  
  let sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setDate(todaysDate.getDate() - 7);
  let dd2 = String(sevenDaysAgoDate.getDate()).padStart(2, '0');
  let mm2 = String(sevenDaysAgoDate.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy2 = sevenDaysAgoDate.getFullYear();
  
  let sevenDaysAgoString = yyyy2 + '-' + mm2 + '-' + dd2;
  
  console.log("date 7 days:", sevenDaysAgoString);

  return sevenDaysAgoString;
}


// **************** ASYNCRONOUS COUNTER FUNCTIONS TO CONTROL WHEN WE CALL THE "createMap()" FUNCTION ******************
// **************** BECAUSE WE ONLY WANT TO CALL THIS FUNCTION AFTER ALL THE API CALLS HAVE COMPLETED *****************
function asyncCounter(numCalls, callback){
  this.callback = callback;
  this.numCalls = numCalls;
  this.calls = 0;
};

asyncCounter.prototype.increment = function(){

  this.calls += 1;

  if(this.calls === this.numCalls){
      this.callback();
  }
};