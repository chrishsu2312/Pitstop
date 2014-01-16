//view-source:http://acleach.me.uk/gmaps/v3/plotaddresses.htm
var map;
var zoom;
var infowindow;
var bounds;
var delay = 100;

function make_map(pins, polyline){
  map_logic();  
  polyline_logic(polyline); 
  marker_logic(pins);
}

function map_logic(){
  var mapOptions = {
    center: new google.maps.LatLng(37.322426, -122.024094),
    zoom: 14,
    disableDefaultUI: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  infowindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();
}

function polyline_logic(polyline){
  var line = new google.maps.geometry.encoding.decodePath(polyline);
  poly = new google.maps.Polyline({
    path: line,
       strokeColor: '#000000',
       strokeWeight: 3,
       StrokeOpacity: 1.0,
  });
  poly.setMap(map);
}

function marker_logic(pins){
  function callback(index) {
    return function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        addMarker(pins[index][1], pins[index][2], results[0].geometry.location);
      }else{
        console.log(pins[index][1]);
      }
    };
  }

  for (var item in pins) {
    var geocoder = new google.maps.Geocoder();    
    var geoOptions = {
      address: pins[item][0]
    };
    geocoder.geocode(geoOptions, callback(item));
  }
}

function response(data, requestStatus, xhrObject) {
  console.log(data);
}

function addMarker(item, url, coor){
  marker = new google.maps.Marker({
    position: coor,
         map: map,
         text: item,
         url: url
  });
  google.maps.event.addListener(marker, 'click', (function(marker) {
    return function() {
      infowindow.setContent('<p>'+marker.text+" "+marker.url+'</p>');
      infowindow.open(map, marker);
      $(info).html('<p>'+marker.text+'</p>');
      $.ajax({type: 'GET',
        url: '/place/'+marker.url,        
        success: response
       });
    }
  })(marker));
  bounds.extend(marker.position);
  map.fitBounds(bounds);
  zoom = getBoundsZoomLevel(bounds);
}


//Something magic from Eddie
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
