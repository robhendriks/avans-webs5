var assert = require('assert');

var chai = require('chai');
var spies = require('chai-spies');

chai.use(spies);

var should = chai.should()
var expect = chai.expect;

/* Helpers */
var filter = require('../helpers/filter');
var handlebars = require('../helpers/handlebars');

describe('Helpers', function() {
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

/* Modules */
var auth = require('../modules/auth');

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
})
