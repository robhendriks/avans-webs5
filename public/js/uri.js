App.Uri = function() {
  this._uri = null;
  this._parts = null;
};

App.Uri.prototype = {

  constructor: App.Uri,

  escape: function(str) {
    try {
      return decodeURIComponent(str).trim();
    } catch(err) {
      throw new Error('Unable to parse URI');
    }
  },

  parse: function(str) {
    var parts = [];
    var tokens = str.split('/');
    var token;
    for (var i = 0; i < tokens.length; i++) {
      token = tokens[i];
      if (token.length === 0) {
        continue;
      } else if (!token.match(/^[0-9a-z -_]+$/i)) {
        throw new Error('URI contains invalid character(s)');
      }
      parts.push(this.escape(token));
    }
    this._parts = parts;
    this._uri = '/' + parts.join('/');
    return this;
  },

  prepend: function(that) {
    return new App.Uri().parse(that.uri + this.uri);
  },

  append: function(that) {
    return new App.Uri().parse(this.uri + that.uri);
  },

  get uri() {
    return this._uri;
  },

  get parts() {
    return this._parts;
  }

};

App.Uri.parse = function(str) {
  return new App.Uri().parse(str);
};
