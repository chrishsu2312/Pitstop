var map;
var arr;

function make_map(start, place, end, polylinefirst, polylinesecond){
  map_logic();  
  polyline_logic(polylinefirst, polylinesecond); 
  marker_logic(start, place, end);
}
function map_logic(){
  var mapOptions = {
    center: new google.maps.LatLng(37.322426, -122.024094),
    zoom: 14,
    disableDefaultUI: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map-canvas-directions"), mapOptions);
  infowindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();
}

function polyline_logic(first, second){
  var line1 = new google.maps.geometry.encoding.decodePath(first);
  poly1 = new google.maps.Polyline({
    path: line1,
    strokeColor: '#000000',
    strokeWeight: 5,
    StrokeOpacity: 1.0,
  });
  poly1.setMap(map);
  var line2 = new google.maps.geometry.encoding.decodePath(second);
  poly2 = new google.maps.Polyline({
    path: line2,
    strokeColor: '#C0C0C0',
    strokeWeight: 5,
    StrokeOpacity: 1.0,
  });
  poly2.setMap(map);
}

function marker_logic(start, place, end){
  arr = [start, place, end]
  function callback(index) {
    return function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        addMarker(arr[index], results[0].geometry.location);
      }else{
        console.log(arr[index]);
      }
    };
  }

  for (var item in arr) {
    var geocoder = new google.maps.Geocoder();    
    var geoOptions = {
      address: arr[item]
    };
    console.log(arr[item]);
    geocoder.geocode(geoOptions, callback(item));
  }
}

function addMarker(item, coor){
  marker = new google.maps.Marker({
    position: coor,
         map: map,
         text: item,
  });
  
  google.maps.event.addListener(marker, 'click', (function(marker) {
    return function() {
      infowindow.setContent('<p>'+marker.text+'</p>');
      infowindow.open(map, marker);
    }
  })(marker));
  bounds.extend(marker.position);
  map.fitBounds(bounds);
  zoom = getBoundsZoomLevel(bounds);
}
