var map;
var zoom;
var geocoder;
var lat_long;
var line;
var poly;
var polyOptions;
var bounds;
var marker;
var temp;
function make_map(pins, polyline){
  //Create the actual map
  var mapOptions = {
    disableDefaultUI: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  bounds = new google.maps.LatLngBounds();
  //Adds the polyline
  line = new google.maps.geometry.encoding.decodePath(polyline);
  poly = new google.maps.Polyline({
    path: line,
       strokeColor: '#000000',
       strokeWeight: 3,
       StrokeOpacity: 1.0,
  });
  poly.setMap(map);
  //Adds the markers
  geocoder = new google.maps.Geocoder();
  if (pins != null) {
    for (var i = 0; i < pins.length; i++){    
      geocoder.geocode( { 'address': pins[i][0]}, function(results, status) {
        marker = new google.maps.Marker({
          position: results[0].geometry.location,
               map: map,
               title: 
        });        
        bounds.extend(marker.position);
        map.fitBounds(bounds);
        zoom = getBoundsZoomLevel(bounds);
        google.maps.event.addListener(marker, 'click', (function(marker) {
          return function() {
            $(showinfo).text(marker.title);
          }
        })(marker));
      });      
    }
  }

}


function getBoundsZoomLevel(bounds) {
  var WORLD_DIM = { height: 256, width: 256 };
  var ZOOM_MAX = 21;

  function latRad(lat) {
    var sin = Math.sin(lat * Math.PI / 180);
    var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }

  function zoom(mapPx, worldPx, fraction) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }

  var ne = bounds.getNorthEast();
  var sw = bounds.getSouthWest();

  var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

  var lngDiff = ne.lng() - sw.lng();
  var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

  var latZoom = zoom(100, WORLD_DIM.height, latFraction);
  var lngZoom = zoom(200, WORLD_DIM.width, lngFraction);

  return Math.min(latZoom, lngZoom, ZOOM_MAX);
}




