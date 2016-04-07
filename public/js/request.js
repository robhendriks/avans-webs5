App.Request = function() {
  this._method = 'GET';
  this._url = null;
  this._data = {};
  this._headers = {};
};

App.Request.prototype = {
  
  constructor: App.Request,

  method: function(method) {
    this._method = method;
    return this;
  },

  url: function(url) {
    this._url = App.baseUrl + Util.format(url, App.args);
    return this;
  },

  data: function(data) {
    this._data = data;
    return this;
  },

  header: function(key, value) {
    this._headers[key] = value;
    return this;
  },

  headers: function(headers) {
    this._headers = headers;
    return this;
  },

  get: function(url) {
    return this._setup('GET', url);
  },

  put: function(url) {
    return this._setup('PUT', url);
  },

  post: function(url) {
    return this._setup('POST', url);
  },

  delete: function(url) {
    return this._setup('DELETE', url);
  },

  _setup: function(method, url) {
    this.method(method);
    return this.url(url);
  },

  exec: function(cb) {
    if (!this._url) {
      var err = new Error('Invalid URL');
      return cb(err);
    }
    $.ajax({
      type: this._method,
      url: this._url,
      data: this._data,
      headers: this._headers
    })
      .fail(function(jqXHR, textStatus, errorThrown) {
        var json = jqXHR.responseJSON, error;
        if (json && (error = json.error)) {
          if (typeof error !== 'object') {
            return cb(new Error(error));
          }
          var err = new Error(error.message);
          err.errors = error.errors;
          return cb(err);
        }

        cb(new Error(errorThrown));
      })
      .done(function(data, textStatus, jqXHR) {
        return cb(null, data);
      });
  }

};
