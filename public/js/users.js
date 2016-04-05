var $users;
var $user;

var $total;
var $pagination;

var metaData;

window.onload = function() {
  $user = $('#user');
  $users = $('#users');

  function getMetaData() {
    $pagination = $('ul.pagination', $users);
    
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
    fetchUser(id);

    return false;
  }

  function fetchPage(evt) {
    evt.preventDefault();

    var $this = $(this);
    if ($this.parent().hasClass('active')) {
      return;
    }

    var page = $this.attr('data-page');
    fetchUsers(page);

    return false;
  }

  function fetchUsers(page, cb) {
    page = page || 1;
    new App.Request()
      .url('/api/v1/users/?page=' + page)
      .header('Content-Type', 'text/html')
      .exec(function(err, data) {
        if (err) {
          return;
        }
        $users.html(data);

        $('a[data-id]', $users).on('click', navigateTo);
        $('a[data-page]', $users).on('click', fetchPage);

        getMetaData();
        if (cb) { cb(); }
      });
  }

  function fetchUser(id, cb) {
    new App.Request()
      .url('/api/v1/users/' + id)
      .header('Content-Type', 'text/html')
      .exec(function(err, data) {
        if (err) {
          return;
        }

        $user.html(data);
        if (cb) { cb(); }
      });
  }

  fetchUsers(1);
};
