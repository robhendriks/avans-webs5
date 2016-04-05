var $races;
var $race;
var $addRace;

var $pagination;

var metaData;

window.onload = function() {
  $race = $('#race');
  $races = $('#races');
  $addRace = $('#addRace');

  $addRace.submit(function(evt) {
    evt.preventDefault();

    var data = {};

    var form = $(addRace).serializeArray();
    var field;
    for (var i = 0; i < form.length; i++) {
      field = form[i];
      data[field.name] = field.value;
    }

    new App.Request()
      .post('/api/v1/users/' + user.id + '/Races')
      .data(data)
      .exec(function(err, data) {
        if (err && err.error) {
          return alert(err.error);
        }
        $addRace.trigger('reset');
        fetchRaces(1, function() {
          $('.list-group > .list-group-item:first', $races).trigger('click');
        });
      });
  });

  function getMetaData() {
    $pagination = $('ul.pagination', $races);
    metaData = {
      pages: $pagination.attr('data-pages'),
      page: $pagination.attr('data-page'),
      total: $pagination.attr('data-total')
    };
    
    $('a[data-page=' + metaData.page + ']', $pagination).parent().addClass('active');
  }

  function navigateTo(evt) {
    evt.preventDefault();

    var $this = $(this);
    var id = $this.attr('data-id');
    fetchRace(id);

    return false;
  }

  function fetchPage(evt) {
    evt.preventDefault();

    var $this = $(this);
    if ($this.parent().hasClass('active')) {
      return;
    }

    var page = $this.attr('data-page');
    fetchRaces(page);

    return false;
  }

  function fetchRaces(page, cb) {
    page = page || 1;
    new App.Request()
      .url('/api/v1/users/' + user.id + '/races?page=' + page)
      .header('Content-Type', 'text/html')
      .exec(function(err, data) {
        if (err) {
          return;
        }
        $races.html(data);

        $('a[data-id]', $races).on('click', navigateTo);
        $('a[data-page]', $races).on('click', fetchPage);

        getMetaData();
        if (cb) { cb(); }
      });
  }

  function fetchRace(id, cb) {
    new App.Request()
      .url('/api/v1/races/' + id)
      .header('Content-Type', 'text/html')
      .exec(function(err, data) {
        if (err) {
          return;
        }

        $race.html(data);
        if (cb) { cb(); }
      });
  }

  fetchRaces(1);
};
