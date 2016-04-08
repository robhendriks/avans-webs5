var Util,
    App,
    Request;


/*
 * Util.js
 */
Util = {

  serialize: function(elem) {
    var form = $(elem).serializeArray();
    var fields = {}, field;
    for (var i = 0; i < form.length; i++) {
      field = form[i];
      fields[field.name] = field.value;
    }
    return fields;
  },

  format: function(format, params) {
    if (typeof format !== 'string') {
      throw new TypeError('format expected string');
    }
    if (typeof params !== 'object') {
      throw new TypeError('params expected object');
    }

    return format.replace(/\{([^\}]+)\}/g, function(match, p1, offset, str) {
      return (p1 in params ? params[p1] : str);
    });
  },

  tErrorize: function(elem, errors) {
    var $groups = $('.form-group', $form),
        $group;

    if (!errors) {
      $groups.removeClass('has-error');
      $groups.children('span').hide();
      return;
    }

    var path,
        error;
    $groups.each(function() {
      $group = $(this);
      
      path = $group.attr('data-path');
      if (!(path in errors)) {
        $group.removeClass('has-error');
        $group.children('.help-block').hide();
        return;
      }
      error = errors[path]; 
      $group.addClass('has-error');
      $group.children('.help-block').text(error).show();
    });
  }

};

/*
 * App.js
 */

App = function() {
  this.user = null;
  this.args = {};
};

App.prototype = {
  constructor: App,

  load: function(cb) {
    var self = this;

    Request.get('/api/v1/users/whoami')
      .call(function(err, user) {
        if (err) {
          return;
        }
        self.user = user;
        self.args['user'] = user._id;
        cb();
      });
  }
};

/* 
 * Request.js
 */

Request = function() {
  this._url = null;
  this._method = 'GET';
  this._headers = {};
  this._body = null;
};

Request.prototype = {
  constructor: Request,

  url: function(url) {
    this._url = Util.format(url, App.args);
    return this;
  },

  method: function(method) {
    this._method = method;
    return this;
  },

  header: function(key, value) {
    this._headers[key] = value;
    return this;
  },

  body: function(body) {
    this._body = body;
    return this;
  },

  get: function(url) {
    return this.method('GET').url(url);
  },

  put: function(data) {
    return this.method('PUT').url(url);
  },

  post: function(url) {
    return this.method('POST').url(url);
  },

  delete: function(url) {
    return this.method('DELETE').url(url);
  },

  call: function(cb) {
    $.ajax({
      url: this._url,
      type: this._method,
      data: this._body,
      headers: this._headers
    })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var json, err;
        if ((json = jqXHR.responseJSON) && (err = json.error)) {
          if (typeof err !== 'object') {
            return cb(new Error(err));
          }
          var cause = new Error(err.message);
          cause.errors = err.errors;
          return cb(cause);
        }
        cb(new Error(errorThrown));
      })
      .done(function(data, textStatus, jqXHR) {
        cb(null, data);
      });
  }
};

Request.get = function(url) {
  return new Request().get(url);
};

Request.put = function(url) {
  return new Request().put(url);
};

Request.post = function(url) {
  return new Request().post(url);
};

Request.delete = function(url) {
  return new Request().delete(url);
};

window.App = new App();
window.Request = Request;
