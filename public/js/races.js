var $alert,
    $race,
    $raceName,
    $raceDescription,
    $raceAuthor,
    $raceCreated,
    $raceForm,
    $raceList,
    $waypoint,
    $waypointList;

var selectedRace;

function showAlert(message) {
  $alert.html(message.replace(/\n/g, '<br>')).show();
}

function selectRace(race) {
  if (!race) {
    selectedRace = null;
    $race.hide();
    return;
  }

  selectedRace = race;
  
  $race.show();
  $raceName.text(race.name);
  $raceDescription.text(race.description);
  $raceAuthor.text(race.author.email);
  $raceCreated.timeago('update', race.created);

  $('a[data-race-id!=' + race._id + ']', $raceList).removeClass('active');
  $('a[data-race-id=' + race._id + ']', $raceList).addClass('active');

  getWaypoints();
}

function addRace(evt) {
  evt.preventDefault();
  
  var race = Util.serialize($raceForm);
  new App.Request()
    .post('users/' + user.id + '/races')
    .data(race)
    .exec(function(err, data) {
      if (err) {
        return showAlert(err);
      }
      $raceForm.trigger('reset');
      getRaces(1, true);
    });
}

function getRace(raceId) {
  new App.Request()
    .get('races/' + raceId)
    .exec(function(err, race) {
      if (err) {
        return alert(err);
      }
      selectRace(race);
    });
}

function getRaces(page, select) {
  page = page || 1;
  select = select || false;

  new App.Request()
    .get('users/' + user.id + '/races?page=' + page)
    .header('Content-Type', 'text/html')
    .exec(function(err, html) {
      if (err) {
        return alert(err);
      }

      $raceList.html(html);

      $('a[data-race-id]', $raceList).on('click', goToRace);
      $('a[data-page-id][data-page-id!=' + page + ']', $raceList).on('click', goToRaces);
      $('a[data-page-id=' + page + ']', $raceList).parent().addClass('active');

      if (select === true) {
        $('a[data-race-id]:first').click();
      }
      if (selectedRace) {
        $('a[data-race-id=' + selectedRace._id + ']', $raceList).addClass('active');
      }
    });
}

function goToRace(evt) {
  evt.preventDefault();
  getRace($(this).attr('data-race-id'));
}

function goToRaces(evt) {
  evt.preventDefault();
  getRaces($(this).attr('data-page-id'));
}

function goToWaypoint(evt) {
  evt.preventDefault();
  alert('m8');
}

function goToWaypoints(evt) {
  evt.preventDefault();
  getWaypoints($(this).attr('data-page-id'));
}

function getWaypoints(page) {
  if (!selectedRace) { return; }

  page = page || 1;

  new App.Request()
    .get('races/' + selectedRace._id + '/waypoints?page=' + page)
    .header('Content-Type', 'text/html')
    .exec(function(err, html) {
      if (err) {
        return alert(err);
      }

      $waypointList.html(html);

      $('a[data-waypoint-id]', $waypointList).on('click', goToWaypoint);
      $('a[data-page-id][data-page-id!=' + page + ']', $waypointList).on('click', goToWaypoints);
      $('a[data-page-id=' + page + ']', $waypointList).parent().addClass('active');
    });
}

function init() {
  $alert = $('#alert').hide();

  $race = $('#race');
  $raceName = $('#raceName');
  $raceDescription = $('#raceDescription');
  $raceAuthor = $('#raceAuthor');
  $raceCreated = $('#raceCreated');

  $raceForm = $('#raceForm');
  $raceForm.submit(addRace);

  $raceList = $('#raceList');

  $waypoints = $('#waypoint');
  $waypointList = $('#waypointList');

  selectRace(null);
  getRaces();
}

window.onload = init;
