// Store the URL for the GeoJSON data
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Add Leaflet tile layers
const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google'
});

const grayscale = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

const outdoors = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create a Leaflet map object
const myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    layers: [satellite]
});

// Define basemaps
const baseMaps = {
    "Satellite": satellite,
    "Streets": streets,
    "Grayscale": grayscale,
    "Outdoors": outdoors
};

// Define the earthquake layer group and tectonic plate layer groups for the map
const earthquakeData = new L.LayerGroup();
const tectonics = new L.LayerGroup();

// Define the overlays and link the layer groups to separate overlays
const overlays = {
    "Earthquakes": earthquakeData,
    "Tectonic Plates": tectonics
};

// Add a control layer and pass in baseMaps and overlays
L.control.layers(baseMaps, overlays).addTo(myMap);

// This styleInfo function will dictate the styling for all earthquake points on the map
function styleInfo(feature) {
    return {
        color: chooseColor(feature.geometry.coordinates[2]),
        radius: chooseRadius(feature.properties.mag),
        fillColor: chooseColor(feature.geometry.coordinates[2])
    };
}

// Define a function to choose the fillColor of the earthquake based on earthquake depth
function chooseColor(depth) {
    if (depth <= 10) return "red";
    else if (depth > 10 && depth <= 25) return "orange";
    else if (depth > 25 && depth <= 40) return "yellow";
    else if (depth > 40 && depth <= 55) return "pink";
    else if (depth > 55 && depth <= 70) return "blue";
    else return "green";
}

// Define a function to determine the radius of each earthquake marker
function chooseRadius(magnitude) {
    return magnitude * 5;
}

// Earthquake JSON data with d3
d3.json(url).then(function (data) {
    L.geoJson(data, {
        pointToLayer: function (feature, latlon) {
            return L.circleMarker(latlon).bindPopup(feature.id);
        },
        style: styleInfo
    }).addTo(earthquakeData);
    earthquakeData.addTo(myMap);

    // This function pulls the tectonic plate data and draws a purple line over the plates
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (data) {
        L.geoJson(data, {
            color: "purple",
            weight: 3
        }).addTo(tectonics);
        tectonics.addTo(myMap);
    });
});

// Create legend
const legend = L.control({ position: "bottomright" });
legend.onAdd = function () {
    const div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Depth Color Legend</h4>";
    div.innerHTML += '<i style="background: red"></i><span>(Depth < 10)</span><br>';
    div.innerHTML += '<i style="background: orange"></i><span>(10 < Depth <= 25)</span><br>';
    div.innerHTML += '<i style="background: yellow"></i><span>(25 < Depth <= 40)</span><br>';
    div.innerHTML += '<i style="background: pink"></i><span>(40 < Depth <= 55)</span><br>';
    div.innerHTML += '<i style="background: blue"></i><span>(55 < Depth <= 70)</span><br>';
    div.innerHTML += '<i style="background: green"></i><span>(Depth > 70)</span><br>';

    return div;
};
legend.addTo(myMap);
