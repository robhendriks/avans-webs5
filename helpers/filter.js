function parseStr(str, cb) {
  if (!str || str.length === 0) {
    return {};
  }
  var obj = {};

  var pairs = str.split(',');
  var pair;

  for (var n = 0, len = pairs.length; n < len; n++) {
    pair = cb(pairs[n].split('=', 2));
    if (pair !== false) {
      obj[pair[0]] = pair[1];
    }
  }

  return obj;
}

function parse(req, key, cb) {
  var val;
  if (!(val = req.query[key])) {
    return {};
  }
  return parseStr(val, cb);
}

function getQuery(req) {
  var q;
  if (!(q = req.query.q)) {
    return {};
  }
  return parseStr(q, function(pair) {
    return [0, 1];
  });
}

function parseQuery(pair) {
  return (pair.length == 2 ? pair : false);
}

function getSort(str) {
  switch (str.toLowerCase()) {
    case 'asc': return 1;
    case 'desc': return -1;
    default: return 1;
  }
}

function parseSort(pair) {
  if (pair.length == 2) {
    pair[1] = getSort(pair[1]);
    return pair;
  }
  if (pair.length == 1) {
    pair[1] = getSort('asc');
    return pair;
  }
  return false;
}

module.exports = function(req, res, next) {
  req.find = parse(req, 'q', parseQuery);
  req.sort = parse(req, 's', parseSort);
  next();
};
