/*
 * GOOGLE MAPS
 */
var map;
var mapElem;
var mapMode;
var mapCenter;

var markers = {};
var activeMarkers = [];

function initMap() {  
  mapElem = document.getElementById('map');
  mapMode = 'view';
  mapCenter = {lat: 51.6978162, lng: 5.3036748};
  map = new google.maps.Map(mapElem, {
    center: mapCenter,
    zoom: 14
  });
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
  var iw = new google.maps.InfoWindow({
    content: 'sukout, uwotblud?'
  });

  iw.open(map, this);
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
  mapMode = 'discover';

  $discover.text('View');
  getDiscoverMarkers(setMarkers);
}

function toggleMap(mode) {
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
    .call(function(err, data) {
      if (err) {
        return cb(err);
      }
      waypoints = data;
      cb();
    });
}

function showWaypoints() {
  if (!waypoints || waypoints.length === 0) {
    $waypoints.empty();
    return;
  }

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

function initApp() {
  $race = $('#race');
  $raceName = $('#raceName');
  $raceDesc = $('#raceDesc');

  $waypoints = $('#waypoints');
  $discover = $('#discover').click(toggleMode);

  getRace(showRace);
  getWaypoints(showWaypoints);
}

window.onload = function() {
  App.load(initApp);
};

// var $race,
//     $raceName,
//     $raceDesc,
//     $raceCreated;

// var $waypoints;

// var waypoints = [];

// var first = true;

// var map, 
//     mapCenter,
//     mapMode;

// var markers = [];

// var places;

// function initMap() {
//   mapCenter = {
//     lat: 51.6891176, 
//     lng: 5.286312
//   };

//   map = new google.maps.Map(document.getElementById('map'), {
//     center: mapCenter,
//     zoom: 14
//   });
// }

// function addMarker(data, index) {
//   var position = {lat: data.lat, lng: data.lng};

//   var marker = new google.maps.Marker({
//     position: position,
//     title: data.name
//   });

//   marker.index = index;
//   marker.data = data;
//   marker.addListener('click', toggleMarker);
//   markers.push(marker);
// }

// function toggleMarker() {
//   if (mapMode !== 'view') { return; }
//   map.panTo(this.position);

//   $anchor = $('a[data-id='+this.index+']', $waypoints);
//   $anchor.siblings().removeClass('active');
//   $anchor.addClass('active');
// }

// function setMapOnAll(map) {
//   if (markers.length === 0) return;

//   var bounds = new google.maps.LatLngBounds();
//   var marker;

//   for (var i = 0; i < markers.length; i++) {
//     marker = markers[i];
//     marker.setMap(map);

//     if (map && first) {
//       bounds.extend(marker.position);
//     }
//   }

//   if (!map || !first) return;
//   map.fitBounds(bounds);
//   first = false;
// }

// function switchToView() {
//   $create.text('Create waypoint');
//   $delete.show();

//   setMapOnAll(map);
// }

// function switchToEdit() {
//   $create.text('Cancel');
//   $delete.hide();

//   $('a[data-id]', $waypoints).removeClass('active');

//   setMapOnAll(null);
// }

// function switchToMap(mode) {
//   switch (mode) {
//     default: return;
//     case 'view': switchToView(); break;
//     case 'edit': switchToEdit(); break;
//   }
//   mapMode = mode;
// }

// function toggleWaypoint(evt) {
//   if (mapMode !== 'view') {
//     switchToMap('view');
//   }

//   var $this = $(this);

//   $this.addClass('active');
//   $this.siblings().removeClass('active');

//   var index = $this.attr('data-id');
//   var marker = markers[index];

//   map.panTo(marker.position);

//   evt.preventDefault();
// }

// function createWaypoint() {
//   switchToMap(mapMode === 'edit' ? 'view' : 'edit');
// }

// function deleteWaypoint() {

// }

// function getRace() {
//   Request.get('/api/v1/races/'+race._id)
//     .call(function(err, data) {
//       if (err) {
//         alert(err);
//         return err;
//       }

//       $raceName.text(data.name);
//       $raceDesc.text(data.description);
//       $raceCreated.text($.timeago(data.created));

//       $race.show();
//     });
// }

// function getWaypoints() {
//   Request.get('/api/v1/races/'+race._id+'/waypoints')
//     .call(function(err, data) {
//       if (err) {
//         alert(err);
//         return;
//       }

//       var waypoint;
//       waypoints = [];
      
//       var html = '';

//       for (var n = 0, len = data.length; n < len; n++) {
//         waypoint = data[n];
//         waypoints.push(waypoint);

//         html += '<a class="list-group-item" href="#" data-id="'+n+'">';
//         html += '<i class="fa fa-map-marker"></i>'+waypoint.name+'</a>';

//         addMarker(waypoint, n);
//       }

//       switchToMap('view');
//       $waypoints.html(html).show();
//     });
// }

// function appLoad() {
//   $race = $('#race');
//   $raceName = $('#raceName');
//   $raceDesc = $('#raceDesc');

//   $waypoints = $('#waypoints');

//   $create = $('#create').click(createWaypoint);
//   $delete = $('#delete').click(deleteWaypoint);

//   $('body').on('click', 'a[data-id]', toggleWaypoint);

//   getRace();
//   getWaypoints();
// }

// window.onload = function() {
//   App.load(appLoad);
// };
