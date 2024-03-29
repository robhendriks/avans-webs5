var request = require('supertest');
var chai = require('chai');
var spies = require('chai-spies');

chai.use(spies);

var assert = chai.assert;
var should = chai.should()
var expect = chai.expect;

var app = require('../app');

var filter = require('../helpers/filter');
var handlebars = require('../helpers/handlebars');
var rest = require('../helpers/rest');

var crypto = require('crypto');
var auth = require('../modules/auth');

var User = require('../models/user');
var Race = require('../models/race');
var Waypoint = require('../models/waypoint');

describe('Helpers', function() {
	describe('REST', function() {
		it('should have status 400', function() {
			var err = rest.badRequest;
			expect(err.message).to.equal('Bad Request');
			expect(err.status).to.equal(400);
		});
		it('should have status 401', function() {
			var err = rest.unauthorized;
			expect(err.message).to.equal('Unauthorized');
			expect(err.status).to.equal(401);
		});
		it('should have status 404', function() {
			var err = rest.notFound;
			expect(err.message).to.equal('Not Found');
			expect(err.status).to.equal(404);
		});
	});
	describe('Filter', function() {
		it('should parse filter string', function() {
			var req = {query: {q: 'foo=bar', s: 'foo=asc,bar=desc'}};
			var spy = chai.spy();
			filter(req, {}, spy);

			expect(spy).to.be.spy;
			spy.should.have.been.called();

			req.should.have.deep.property('find.foo', 'bar');
			req.should.have.deep.property('sort.foo', 1); // ASC sort
			req.should.have.deep.property('sort.bar', -1); // DESC sort
		});
	});
	describe('Handlebars', function() {
		it('should be called 10 times', function() {
			var spy = chai.spy();
			handlebars.times(10, {fn: spy});

			spy.should.have.been.called.exactly(10);
		});
	});
});

describe('Modules', function() {
	describe('Auth', function() {
		it('should continue', function() {
			var req = {
				isAuthenticated: () => true,
				user: {roles: ['user']}
			};
			var spy = chai.spy();
			auth('user')(req, {}, spy);

			spy.should.have.been.called.once;
		});
		it('should redirect', function() {
			var req = {isAuthenticated: () => false};
			var res = {redirect: chai.spy()};
			var next = chai.spy();

			auth('user')(req, res, next);

			res.redirect.should.have.been.called.with('/auth/signin');
			next.should.not.have.been.called();
		});
	});
});

var dummy;

var date = Date.now();
var fakeId = crypto.randomBytes(12).toString('hex');

describe('Models', function() {
	describe('User', function() {
		it('should create a new user', function(done) {
			new User({
				email: 'test@example.org',
				password: 'test',
				name: {
					first: 'Johnny',
					last: 'Test'
				},
				provider: 'local',
				roles: ['user']
			}).save(function(err, user) {
				if (err) {
					return done(err);
				}
				dummy = user;
				done();
			});
		});
	});
});

var cookie;

describe('Routes', function() {

	describe('Sign in', function() {
		it('should redirect to /', function(done) {
			request(app).post('/auth/signin')
				.send({email: 'test@example.org', password: 'test'})
				.expect('Location', '/')
				.end(function(err, res) {
					if (err) {
						return done(err);
					}
					cookie = res.headers['set-cookie'].pop().split(';')[0];
					done();
				});
		});
	});

	describe('Home', function() {
		it('should load', function(done) {
			request(app).get('/')
				.set('Cookie', cookie)
				.expect(200)
				.end(function(err, res) {
					if (err) {
						return done(err);
					}
					done();
				});
		});
	});
	describe('Profile', function() {
		it('should load', function(done) {
			request(app).get('/profile')
				.set('Cookie', cookie)
				.expect(200)
				.end(function(err, res) {
					if (err) {
						return done(err);
					}
					done();
				});
		});
	});
	describe('Play', function() {
		it('should load', function(done) {
			request(app).get('/play')
				.set('Cookie', cookie)
				.expect(200)
				.end(function(err, res) {
					if (err) {
						return done(err);
					}
					done();
				});
		});
	});
	describe('Docs', function() {
		it('should load', function(done) {
			request(app).get('/docs')
				.set('Cookie', cookie)
				.expect(200)
				.end(function(err, res) {
					if (err) {
						return done(err);
					}
					done();
				});
		});
	});
	describe('Races', function() {
		it('should load', function(done) {
			request(app).get('/races')
				.set('Cookie', cookie)
				.expect(200)
				.end(function(err, res) {
					if (err) {
						return done(err);
					}
					done();
				});
		});
	});
	describe('Race', function() {
		it('should not load', function(done) {
			request(app).get('/races/'+fakeId)
				.set('Cookie', cookie)
				.expect(404)
				.end(function(err, res) {
					if (err) {
						return done(err);
					}
					done();
				});
		});
	});

	describe('User', function() {
		describe('List', function() {
			it('should return a list of users', function(done) {
				request(app).get('/api/v1/users')
					.set('Accept', 'application/json')
					.expect(200)
					.end(function(err, res) {
						if (err) {
							return done(err);
						}
						res.body.should.be.a('array');
						done();
					});
			});
			it('should return a paginated list of users', function(done) {
				request(app).get('/api/v1/users?page=1')
					.set('Accept', 'application/json')
					.expect(200)
					.end(function(err, res) {
						if (err) {
							return done(err);
						}
						res.body.should.be.a('object');
						res.body.should.have.property('page', '1');
						done();
					});
			});
			it('should return a HTML document', function(done) {
				request(app).get('/api/v1/users')
					.set('Accept', 'text/html')
					.expect(200)
					.end(function(err, res) {
						if (err) {
							return done(err);
						}
						res.should.have.property('text');
						res.text.should.be.a('string');
						done();
					});
			});
		});
		describe('Single', function() {
			it('should return a single user', function(done) {
				request(app).get('/api/v1/users/'+dummy.id)
					.set('Accept', 'application/json')
					.expect(200)
					.end(function(err, res) {
						if (err) {
								return done(err);
						}
						res.body.should.be.a('object');
						done();
					});
			});
		});
		describe('Single', function() {
			it('should not return a single user', function(done) {
				request(app).get('/api/v1/users/'+fakeId)
					.set('Accept', 'application/json')
					.expect(404)
					.end(function(err, res) {
						if (err)
							done(err)
						else
							done();
					});
			});
		});
		describe('Race', function() {
			describe('List', function() {
				it('should return a list of races', function(done) {
					request(app).get('/api/v1/users/'+dummy.id+'/races')
						.set('Accept', 'application/json')
						.expect(200)
						.end(function(err, res) {
							if (err) {
								return done(err);
							}
							res.body.should.be.a('array');
							done();
						});
				});
				it('should not return a list of races', function(done) {
					request(app).get('/api/v1/users/'+fakeId+'/races')
						.set('Accept', 'application/json')
						.expect(404)
						.end(function(err, res) {
							if (err)
								done(err)
							else
								done();
						});
				});
			});
			describe('Create', function() {
				it('should create a new race', function(done) {
					var raceCount;
					Race.find({author: dummy.id}).exec()
						.then(function(races) {
							raceCount = races.length;
							request(app). post('/api/v1/users/'+dummy.id+'/races')
								.send({name: date, description: 'Bar'})
								.expect(201)
								.end(function(err, res) {
									if (err) {
										return done(err);
									}

									Race.find({author: dummy.id}).exec()
										.then(function(races) {
											expect(races.length).to.equal(raceCount + 1);
											done();
										})
										.catch(function(err) {
											done(err);
										})
								});
						})
						.catch(function(err) {
							done(err);
						});
				});
				it('should be able to visit', function(done) {
					Race.findOne({name: date}).exec()
						.then(function(race) {
								assert.isOk(race);

								request(app).get('/races/'+race.id)
									.set('Cookie', cookie)
									.expect(200)
									.end(function(err, res) {
										if (err) {
											return done(err);
										}
										done();
									});
						})
						.catch(function(err) {
							done(err);
						});
				});
			});
		});

		describe('Race', function() {
			describe('List', function() {
				it('should return a list of races', function(done) {
					request(app).get('/api/v1/races')
						.set('Accept', 'application/json')
						.expect(200)
						.end(function(err, res) {
							if (err) {
								return done(err);
							}
							res.body.should.be.a('array');
							done();
						});
				});
				it('should return a paginated list of races', function(done) {
					request(app).get('/api/v1/races?page=1')
						.set('Accept', 'application/json')
						.expect(200)
						.end(function(err, res) {
							if (err) {
								return done(err);
							}
							res.body.should.be.a('object');
							res.body.should.have.property('page', '1');
							done();
						});
				});
				it('should return a HTML document', function(done) {
					request(app).get('/api/v1/races')
						.set('Accept', 'text/html')
						.expect(200)
						.end(function(err, res) {
							if (err) {
								return done(err);
							}
							res.should.have.property('text');
							res.text.should.be.a('string');
							done();
						});
				});
			});
			describe('Single', function() {
				it('should return a single race', function(done) {
					Race.findOne({name: date}).exec()
						.then(function(race) {
							assert.isOk(race);

							request(app).get('/api/v1/races/'+race.id)
								.set('Accept', 'application/json')
								.expect(200)
								.end(function(err, res) {
									if (err) {
										return done(err);
									}
									res.body.should.be.a('object');
									done();
								});
						})
						.catch(function(err) {
							done(err);
						});
				});
				it('should not return a single race', function(done) {
					request(app).get('/api/v1/races/'+fakeId)
						.set('Accept', 'application/json')
						.expect(404)
						.end(function(err, res) {
							if (err) {
								return done(err);
							}
							done();
						});
				});
			});
			describe('Waypoints', function() {
				it('should return a list of Waypoints', function(done) {
					Race.findOne({name: date}).exec()
						.then(function(race) {
							assert.isOk(race);

							request(app).get('/api/v1/races/'+race.id+'/waypoints')
								.set('Accept', 'application/json')
								.expect(200)
								.end(function(err, res) {
									if (err) {
										return done(err);
									}
									res.body.should.be.a('array');
									done();
								});
						})
						.catch(function(err) {
							done(err);
						});
				});
				it('should create a new waypoint', function(done) {
					Race.findOne({name: date}).exec()
						.then(function(race) {
							assert.isOk(race);

							var waypointCount;
							Waypoint.find({race: race.id}).exec()
								.then(function(waypoints) {
									waypointCount = waypoints.length;

									request(app).post('/api/v1/races/'+race.id+'/waypoints')
										.send({name: date, lat: 1337.0, lng: 1337.0})
										.expect(201)
										.end(function(err, res) {
											if (err) {
												return done(err);
											}

											Waypoint.find({race: race.id}).exec()
												.then(function(waypoints) {
													expect(waypoints.length).to.equal(waypointCount + 1);
													done();
												})
												.catch(function(err) {
													done(err);
												});
										});
								})
								.catch(function(err) {
									done(err);
								});
						})
						.catch(function(err) {
							done(err);
						});
				});
			});
		});

		describe('Waypoints', function() {
			describe('List', function() {
				it('should return a list of waypoints', function(done) {
					request(app).get('/api/v1/waypoints')
						.set('Accept', 'application/json')
						.expect(200)
						.end(function(err, res) {
							if (err) {
								return done(err);
							}
							res.body.should.be.a('array');
							done();
						});
				});
				it('should return a paginated list of waypoints', function(done) {
					request(app).get('/api/v1/waypoints?page=1')
						.set('Accept', 'application/json')
						.expect(200)
						.end(function(err, res) {
							if (err) {
								return done(err);
							}
							res.body.should.be.a('object');
							res.body.should.have.property('page', '1');
							done();
						});
				});
				it('should return a HTML document', function(done) {
					request(app).get('/api/v1/waypoints')
						.set('Accept', 'text/html')
						.expect(200)
						.end(function(err, res) {
							if (err) {
								return done(err);
							}
							res.should.have.property('text');
							res.text.should.be.a('string');
							done();
						});
				});
			});
			describe('Single', function() {
				it('should return a single waypoint', function(done) {
					Waypoint.findOne({name: date}).exec()
						.then(function(waypoint) {
							assert.isOk(waypoint);

							request(app).get('/api/v1/waypoints/'+waypoint.id)
								.set('Accept', 'application/json')
								.expect(200)
								.end(function(err, res) {
									if (err) {
										return done(err);
									}
									res.body.should.be.a('object');
									done();
								});
						})
						.catch(function(err) {
							done(err);
						});
				});
				it('should not return a single waypoint', function(done) {
					request(app).get('/api/v1/waypoints/'+fakeId)
						.set('Accept', 'application/json')
						.expect(404)
						.end(function(err, res) {
							if (err) {
								return done(err);
							}
							done();
						});
				});
			});
			describe('Delete', function() {
				it('should delete an existing waypoint', function(done) {
					Waypoint.findOne({name: date}).exec()
						.then(function(waypoint) {
							assert.isOk(waypoint);

							var waypointCount;
							Waypoint.find({name: date}).exec()
								.then(function(waypoints) {
									waypointCount = waypoints.length;

									request(app).delete('/api/v1/waypoints/'+waypoint.id)
										.expect(204)
										.end(function(err, res) {
											if (err) {
												return done(err);
											}

											Waypoint.find({name: date}).exec()
												.then(function(waypoints) {
													expect(waypoints.length).to.equal(waypointCount - 1);
													done();
												})
												.catch(function(err) {
													done(err);
												});
										});
								})
								.catch(function(err) {
									done(err);
								});
						})
						.catch(function(err) {
							done(err);
						});
				});
			});
		});

		describe('Race', function() {
			describe('Delete', function() {
				it('should delete an existing race', function(done) {
					Race.findOne({name: date}).exec()
						.then(function(race) {
							assert.isOk(race);

							var raceCount;
							Race.find({name: date}).exec()
								.then(function(races) {
									raceCount = races.length;

									request(app).delete('/api/v1/races/'+race.id)
										.expect(204)
										.end(function(err, res) {
											if (err) {
												return done(err);
											}

											Race.find({name: date}).exec()
												.then(function(races) {
													expect(races.length).to.equal(raceCount - 1);
													done();
												})
												.catch(function(err) {
													done(err);
												});
										});
								})
								.catch(function(err) {
									done(err);
								});
						})
						.catch(function(err) {
							done(err);
						});
				});
			});
		});
	});

	describe('Sign out', function() {
		it('should redirect to /auth/signin', function(done) {
			request(app).get('/auth/signout')
				.set('Cookie', cookie)
				.expect('Location', '/auth/signin')
				.end(function(err, res) {
					if (err) {
						return done(err);
					}
					done();
				});
		});
	});
});

describe('Models', function() {
	describe('User', function() {
		it('should delete an existing user', function(done) {
			User.findByIdAndRemove(dummy.id).exec()
				.then(function(user) {
					assert.isOk(user);
					done();
				})
				.catch(function(err) {
					done(err);
				});
		});
	});
});
