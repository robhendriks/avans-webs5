var App = function() {
  this._baseUrl = 'http://localhost:3000';
};

App.prototype = {

  constructor: App,

  get baseUrl() {
    return this._baseUrl;
  }

};

window.App = new App();
