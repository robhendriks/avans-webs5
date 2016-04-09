var io;
var clients = {};

/*
 * Race
 */
var Race = function(id) {
  this.id = id;
  this.clients = {};
  this.size = 0;
};

Race.prototype = {
  constructor: Race,

  join: function(client) {
    this.broadcast('user joined', {user: client.user});

    client.socket.emit('joined race', {users: this.users});

    this.clients[client.id] = client;
    this.size++;
  },

  leave: function(client) {
    delete this.clients[client.id];
    this.size--;

    this.broadcast('user left', {user: client.user});
  },

  checkIn: function(client, waypoint) {
    this.broadcast('activity', {
      type: 'check-in',
      data: {
        who: client.user.email,
        where: waypoint.name
      }
    });
  },

  broadcast: function(name, data) {
    for (var id in this.clients) {
      this.clients[id].socket.emit(name, data);
    }
  },

  get users() {
    var users = [];
    for (var id in this.clients) {
      users.push(this.clients[id].user);
    }
    return users;
  }
};

Race.races = {};

Race.findById = function(id) {
  return (id in this.races ? this.races[id] : false);
};

Race.findOrCreate = function(id) {
  var race;
  if (race = this.findById(id))
    return race;

  this.races[id] = race = new Race(id);
  return race;
};

Race.join = function(id, client) {
  Race.findOrCreate(id).join(client);
};

Race.leave = function(id, client) {
  Race.findOrCreate(id).leave(client);
};

Race.leaveAll = function(client) {
  for (var id in this.races) {
    this.races[id].leave(client);
  }
};

Race.checkIn = function(id, client, waypoint) {
  Race.findOrCreate(id).checkIn(client, waypoint);
};

/*
 * Client
 */
var Client = function(socket) {
  this.id = socket.id;
  this.socket = socket;
  this.user = null;
  this.race = null;
  this.init();
};

Client.prototype = {
  constructor: Client,

  init: function() {
    this.socket.on('announce', this.onAnnounce.bind(this));
    this.socket.on('join race', this.onJoinRace.bind(this));
    this.socket.on('check in', this.onCheckIn.bind(this));
  },

  onAnnounce: function(data) {
    this.user = data.user;
    this.socket.emit('handshake');
  },

  onJoinRace: function(data) {
    if (this.race) {
      Race.leave(this.race._id, this);
    }

    this.race = data.race;
    Race.join(this.race._id, this);
  },

  onCheckIn: function(data) {
    if (!this.race)
      return;

    Race.checkIn(this.race._id, this, data.waypoint);
  }
};

module.exports = function(http) {
  io = require('socket.io')(http);

  io.on('connection', function(socket) {
    var client = new Client(socket);
    clients[socket.id] = client;

    socket.on('disconnect', function() {
      Race.leaveAll(clients[socket.id]);
      delete clients[socket.id];
    });
  });
};
