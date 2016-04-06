var $alert,
    $race,
    $raceName,
    $raceDescriptio,
    $raceAutho,
    $raceCreate,
    $raceFor,
    $races;

var selectedRace;

function showAlert(message) {
  $alert.html(message.replace(/\n/g, '<br>')).show();
}

function serialize(elem) {
  var form = elem.serializeArray();
  var fields = {}, field;
  for (var i = 0; i < form.length; i++) {
    field = form[i];
    fields[field.name] = field.value;
  }
  return fields;
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
}

function addRace(evt) {
  evt.preventDefault();
  
  var race = serialize($raceForm);
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
      $('a[data-page-id][data-page-id!=' + page + ']', $raceList).on('click', goToPage);
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

function goToPage(evt) {
  evt.preventDefault();
  getRaces($(this).attr('data-page-id'));
}

function getWaypoints() {

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

  selectRace(null);
  getRaces();
}

window.onload = init;
