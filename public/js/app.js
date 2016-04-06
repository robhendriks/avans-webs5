var App = function() {
  this._baseUrl = 'http://localhost:3000/api/v1/';
};

App.prototype = {

  constructor: App,

  get baseUrl() {
    return this._baseUrl;
  }

};

var Util = {};

Util.serialize = function(elem) {
  var form = elem.serializeArray();
  var fields = {}, field;
  for (var i = 0; i < form.length; i++) {
    field = form[i];
    fields[field.name] = field.value;
  }
  return fields;
};

window.App = new App();
