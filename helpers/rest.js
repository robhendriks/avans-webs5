function Rest() { 
  // TODO: Hello World!
}

Rest.prototype = {

  constructor: Rest,

  get badRequest() {
    var err = new Error('Bad Request');
    err.status = 400;
    return err;
  },

  get unauthorized() {
    var err = new Error('Unauthorized');
    err.status = 401;
    return err;
  },

  get notFound() {
    var err = new Error('Not Found');
    err.status = 404;
    return err;
  }

};

module.exports = new Rest();
