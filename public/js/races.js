var $modal;
    
var $race,
    $raceName,
    $raceDescription,
    $raceAuthor,
    $raceCreated,
    $newRace,
    $raceList;
    
var $waypoint,
    $waypointList;

var selectedRace;

var formCache = {};
var currentForm;

function okModal(evt) {
  evt.preventDefault();
}

function cancelModal(evt) {
  evt.preventDefault();
}

function getForm(name, cb) {
  if (name in formCache) {
    return cb(null, formCache[name]);
  }

  new App.Request()
    .get('forms/' + name)
    .exec(function(err, data) {
      if (err) {
        return cb(err, null);
      }
      formCache[name] = data;
      return cb(null, data);
    });
}

function setForm(name) {
  if (currentForm && currentForm.name === name) {
    $modal.modal('show');
    return;
  }

  getForm(name, function(err, form) {
    if (err) {
      return alert(err);
    }

    form.name = name;
    form.elem = $('form', $modal);
    currentForm = form;

    $('.modal-body', $modal).html(form.html);
    $('.modal-title', $modal).text(form.title);

    $modal.modal('show');
  });
};

function showAlert(message) {
  $alert.html(message.replace(/\n/g, '<br>')).show();
}

function newRace(evt) {
  evt.preventDefault();
  setForm('race');
}

function newWaypoint(evt) {
  evt.preventDefault();
  setForm('waypoint');
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

// function addRace() {
//   evt.preventDefault();
  
//   var race = Util.serialize($raceForm);
//   new App.Request()
//     .post('users/' + user.id + '/races')
//     .data(race)
//     .exec(function(err, data) {
//       if (err) {
//         return showAlert(err);
//       }
//       $raceForm.trigger('reset');
//       getRaces(1, true);
//     });
// }

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
  $modal = $('#modal');

  $race = $('#race');
  $raceName = $('#raceName');
  $raceDescription = $('#raceDescription');
  $raceAuthor = $('#raceAuthor');
  $raceCreated = $('#raceCreated');
  $newRace = $('#newRace');
  $raceList = $('#raceList');

  $waypoints = $('#waypoint');
  $waypointList = $('#waypointList');

  $('body').on('click', '#newRace', newRace);
  $('body').on('click', '#newWaypoint', newWaypoint);

  $('body').on('click', '#modal-ok', okModal);
  $('body').on('click', '#modal-cancel', cancelModal);

  selectRace(null);
  getRaces();
}

window.onload = init;
