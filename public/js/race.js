/*
 * GOOGLE MAPS
 */
var map;
var mapElem;
var mapMode;
var mapCenter;

var markers = {};
var activeMarkers = [];

var selectedMarker;
var selectedWaypoint;
var selectedPlace;

var infoWindow;

function initMap() {  
  mapElem = document.getElementById('map');
  mapMode = 'view';
  mapCenter = {lat: 51.6978162, lng: 5.3036748};
  map = new google.maps.Map(mapElem, {
    center: mapCenter,
    zoom: 14
  });

  infoWindow = new google.maps.InfoWindow();
}

function getMarkerById(id) {
  if (!activeMarkers)
    return false;

  for (var i = 0; i < activeMarkers.length; i++) {
    if (id === activeMarkers[i].waypoint._id)
      return activeMarkers[i];
  }

  return false;
}

function setMarkers(markers) {
  if (activeMarkers && activeMarkers.length > 0) {
    for (var i = 0; i < activeMarkers.length; i++) {
      activeMarkers[i].setMap(null);
    }
  }

  if (!markers || markers.length < 1)
    return; 

  var marker;
  var bounds = new google.maps.LatLngBounds();

  for (var i = 0; i < markers.length; i++) {
    marker = markers[i];
    marker.setMap(map);

    bounds.extend(marker.position);
  }

  activeMarkers = markers;
  map.fitBounds(bounds);
}

function viewClick() {
  selectedMarker = this;

  var waypoint;
  selectedWaypoint = waypoint = this.waypoint;

  var html = '';
  html += '<h5>'+waypoint.name+'</h5>';
  html += '<a href="#" id="removeWaypoint">Remove</a>';

  map.panTo({lat: waypoint.lat, lng: waypoint.lng});

  infoWindow.setContent(html);
  infoWindow.open(map, this);

  highlightWaypoint(waypoint);
}

function getViewMarkers(cb) {
  if (markers.view)
    return cb(markers.view);

  var results = [];
  var result;

  var waypoint;
  var loc;

  for (var i = 0; i < waypoints.length; i++) {
    waypoint = waypoints[i];
    loc = {lat: waypoint.lat, lng: waypoint.lng};

    result = new google.maps.Marker({
      position: loc,
      title: waypoint.name
    });

    result.addListener('click', viewClick);
    result.waypoint = waypoint;

    results.push(result);
  }

  markers.view = results;
  cb(results);
}

function toggleView() {
  mapMode = 'view';

  $discover.text('Discover');
  getViewMarkers(setMarkers);
}

function discoverClick() {
  selectedMarker = this;

  var place;
  selectedPlace = place = this.place;

  var html = '';
  html += '<h5>'+place.name+'</h5>';
  html += '<a href="#" id="addWaypoint">Add</a>';

  map.panTo({lat: place.lat, lng: place.lng});

  infoWindow.setContent(html);
  infoWindow.open(map, this);
}

function getDiscoverMarkers(cb) {
  if (markers.discover)
    return cb(markers.discover);

  Request.get('/api/v1/places/search')
    .body(mapCenter)
    .call(function(err, data) {
      if (err) {
        alert(err);
        return cb([]);
      }

      var places = data.places;
      var place;
      var loc;

      var results = [];
      var result;
      
      for (var i = 0; i < places.length; i++) {
        place = places[i];
        loc = {lat: place.lat, lng: place.lng};

        result = new google.maps.Marker({
          position: loc,
          title: place.name,
          icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
        });

        result.addListener('click', discoverClick);
        result.place = place;

        results.push(result);
      }

      markers.discover = results;
      cb(results);
    });
}

function toggleDiscover() {
  highlightWaypoint(null);
  mapMode = 'discover';

  $discover.text('View');
  getDiscoverMarkers(setMarkers);
}

function toggleMap(mode) {
  infoWindow.close();

  switch(mode) {
    case 'view': toggleView(); break;
    case 'discover': toggleDiscover(); break;
    default: return;
  }
}

function toggleMode() {
  toggleMap(mapMode === 'view' ? 'discover' : 'view');
}

/*
 * APPLICATION
 */
var $race;
var $raceName;
var $raceDesc;

var $waypoints;
var $discover;

var race;
var waypoints;

var first = true;

function getRace(cb) {
  race = null;

  Request.get('/api/v1/races/'+raceId)
    .call(function(err, data) {
      if (err) {
        return cb(err);
      }
      race = data;
      cb();
    })
}

function showRace() {
  if (!race) {
    return;
  }
  $raceName.text(race.name);
  $raceDesc.text(race.description);
}

function getWaypoints(cb) {
  waypoints = [];

  Request.get('/api/v1/races/'+raceId+'/waypoints')
    .body({s: 'created=desc'})
    .call(function(err, data) {
      if (err) {
        return cb(err);
      }
      waypoints = data;
      cb();
    });
}

function showWaypoints() {
  $waypoints.empty();

  if (!waypoints)
    return;

  var waypoint;
  var $anchor;
  for (var i = 0; i < waypoints.length; i++) {
    waypoint = waypoints[i];

    $anchor = $('<a href="#">')
      .attr('data-id', waypoint._id)
      .addClass('list-group-item')
      .text(waypoint.name);

    $waypoints.append($anchor);
  }

  if (first) {
    toggleMap('view');
    first = false;
  }
}

function highlightWaypoint(waypoint) {
  if (mapMode !== 'view')
    return;

  $('a[data-id]', $waypoints).removeClass('active');
  
  if (!waypoint) 
    return;

  var id = waypoint._id;
  $('a[data-id='+id+']', $waypoints).addClass('active');
}

function highlightMarker() {
  $('a[data-id]', $waypoints).removeClass('active');

  if (mapMode !== 'view')
    toggleMode();
  if (!activeMarkers)
    return;

  var $this = $(this).addClass('active');

  var id = $this.attr('data-id');
  var marker = getMarkerById(id);
  if (!marker)
    return;

  google.maps.event.trigger(marker, 'click');
}

function reloadData() {
  getWaypoints(function(err) {
    showWaypoints(err);

    markers.view = null;
    getViewMarkers(function(results) {
      markers.view = results;

      if (mapMode === 'view' && selectedMarker)
        selectedMarker.setMap(null);
    });
  });
}

function addPlace() {
  if (mapMode !== 'discover' || !selectedPlace)
    return;

  var body = {
    name: selectedPlace.name,
    lat: selectedPlace.lat,
    lng: selectedPlace.lng
  };

  Request.post('/api/v1/races/'+raceId+'/waypoints')
    .body(body)
    .call(function(err) {
      if (!err) reloadData();
    });
}

function removeWaypoint() {
  if (mapMode !== 'view' || !selectedWaypoint)
    return;

  var id = selectedWaypoint._id;
  Request.delete('/api/v1/waypoints/'+id)
    .call(function(err) {
      if (err) {
        return;
      }
      reloadData();
    });
}

function initApp() {
  $race = $('#race');
  $raceName = $('#raceName');
  $raceDesc = $('#raceDesc');

  $waypoints = $('#waypoints');
  $discover = $('#discover').click(toggleMode);

  $('body').on('click', 'a[data-id]', highlightMarker);

  $('body').on('click', '#addWaypoint', addPlace);
  $('body').on('click', '#removeWaypoint', removeWaypoint);

  getRace(showRace);
  getWaypoints(showWaypoints);
}

window.onload = function() {
  App.load(initApp);
};
