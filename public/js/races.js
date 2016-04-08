var $races,
    $pager;

var $form;

var $search,
    $results;

var cache = null,
    cacheSize = -1,
    cacheReady = false;

var currentPage = -1;

function gotPage(err, data) {
  if (err) { return; }

  var races = data.docs,
      race,
      html;

  for (var n = 0, len = races.length; n < len; n++) {
    race = races[n];

    html  = '<a href="/races/'+race._id+'" class="list-group-item">';
    html += '<h4 class="list-group-item-heading">'+race.name +'</h4>';
    html += '<p class="list-group-item-text">'+race.description+'</p>';
    html += '</a>';

    $races.append(html);
  }

  currentPage = parseInt(data.page);

  html = '';
  for (var n = 1; n <= data.pages; n++) {
    cls = (n === currentPage ? ' class="active"' : '');
    html += '<li'+cls+'><a href="#"data-page="'+n+'">'+n+'</a></li>';
  }

  $pager.html(html);
}

function getPage(page) {
  if (page == currentPage) { return; }

  $races.empty();
  $pager.empty();

  Request.get('/api/v1/users/{user}/races')
    .body({page: (page || 1), limit: 5, s: 'created=desc'})
    .call(gotPage);
}

function navigate(evt) {
  getPage($(this).attr('data-page'));
  evt.preventDefault();
}

function submitForm(evt) {
  evt.preventDefault();

  Request.post('/api/v1/users/{user}/races')
    .body(Util.serialize(this))
    .call(function(err, data) {
      if (err) {
        Util.tErrorize($form, err.errors);
        return;
      }

      getCache();
      getPage();

      Util.tErrorize($form);
      $form.trigger('reset');
    });
}

function getCache() {
  Request.get('/api/v1/users/{user}/races/autocomplete')
    .call(function(err, data) {
      if (err) {
        return;
      }
      cache = data;
      cacheSize = data.length;
      cacheReady = true;
    });
}

function escapeInput(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function searchInput() {
  if (!cacheReady) { return; }

  var value = escapeInput(this.value);
  if (value.length === 0) {
    $results.empty();
    return;
  }

  var html = '', expr, name;
  for (var i = cacheSize - 1; i >= 0; i--) {
    result = cache[i];
    expr = new RegExp('(' + value + ')', 'i');

    if (expr.test(result.name)) {
      name = result.name.replace(expr, function(match, p1) {
        return '<strong>'+p1+'</strong>';
      });
      html += '<a href="/races/'+result._id+'" class="list-group-item">'+name+'</a>';
    }
  }
  $results.html(html);
}

function searchFocus() {
  $results.show();
}

function searchBlur() {
  setTimeout(function() {
    $results.hide();
  }, 200);
}

function appLoad() {
  $pager = $('#pager');
  $races = $('#races');

  $form = $('#form').submit(submitForm);

  $search = $('#search')
    .on('input', searchInput)
    .on('focus', searchFocus)
    .on('blur', searchBlur);
  $results = $('#results').hide();

  $('body').on('click', 'a[data-page]', navigate);

  getCache();
  getPage();
}

window.onload = function() {
  App.load(appLoad);
};
