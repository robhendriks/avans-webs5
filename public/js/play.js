var $races;
var $waypoints;
var $users;
var $activity;

var socket;

var races;
var selectedRace;

var waypoints;
var selectedWaypoint;

function getRaces(cb) {
  Request.get('/api/v1/races') 
    .call(function(err, data) {
      if (err) {
        return cb(err);
      }
      races = data;
      cb(null);
    });
}

function showRaces(err) {
  $races.empty();

  if (err) {
    // alert('Unable to get races.');
    return;
  }

  var race;
  var html = '';

  for (var i = 0; i < races.length; i++) {
    race = races[i];

    html += '<a href="#" class="list-group-item" data-race="'+i+'">';
    html += '<h4 class="list-group-item-heading">'+race.name+'</h4>';
    html += '<p class="list-group-item-text">by '+race.author.email+'</p>';
    html += '</a>'
  }

  $races.html(html);
}

function selectRace(evt) {
  evt.preventDefault();

  var $this = $(this);
  $this.addClass('active');
  $this.siblings().removeClass('active');

  var id = $this.attr('data-race');
  var race = selectedRace = races[id];

  socket.emit('join race', {race: selectedRace});

  getWaypoints(showWaypoints);
}

function getWaypoints(cb) {
  if (!selectedRace)
    return;

  Request.get('/api/v1/races/'+selectedRace._id+'/waypoints')
    .call(function(err, data) {
      if (err) {
        return cb(err);
      }
      waypoints = data;
      cb();
    });
}

function showWaypoints(err) {
  $waypoints.empty();

  if (err) {
    alert('Unable to get waypoints.');
    return;
  }

  var waypoint;
  var html = '';

  for (var i = 0; i < waypoints.length; i++) {
    waypoint = waypoints[i];

    html += '<a href="#" class="list-group-item" data-waypoint="'+i+'">';
    html += waypoint.name;
    html += '</a>'
  }

  $waypoints.html(html);
}

function selectWaypoint(evt) {
  evt.preventDefault();

  var $this = $(this);
  $this.addClass('active');
  $this.siblings().removeClass('active');

  var id = $this.attr('data-waypoint');
  var waypoint = waypoints[id];

  socket.emit('check in', {waypoint: waypoint});
}

function addUser(user) {
  var html = '<li class="list-group-item" data-user="'+user._id+'">';
  html += user.email+'</li>';
  $users.append(html);
}

function removeUser(user) {
  $('li[data-user='+user._id+']', $users).remove();
}

function appLoad() {
  socket = io.connect('/');

  socket.on('connect', function() {
    socket.emit('announce', {user: App.user});
  });

  socket.on('handshake', function() {
    getRaces(showRaces);
  });

  socket.on('joined race', function(data) {
    $users.empty();
    $activity.empty();

    for (var i = 0; i < data.users.length; i++)
      addUser(data.users[i]);
  });

  socket.on('user joined', function(data) {
    addUser(data.user);
  });

  socket.on('user left', function(data) {
    removeUser(data.user);
  });

  socket.on('activity', function(data) {
    var count = $('li', $activity).length;
    if (count === 5)
      $('li:first', $activity).remove();

    var html = '<li class="list-group-item">';
    html += '<span class="label label-success">'+data.data.who+'</span> '
    html += data.data.where;
    html += '</li>';

    $activity.append(html);
  });

  $races = $('#races');
  $waypoints = $('#waypoints');
  $users = $('#users');
  $activity = $('#activity');

  $('body').on('click', 'a[data-race]', selectRace);
  $('body').on('click', 'a[data-waypoint]', selectWaypoint);
}

window.onload = function() {
  App.load(appLoad);
};
