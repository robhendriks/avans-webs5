var dateFormat = require('handlebars-dateformat');

module.exports = {
  dateFormat: dateFormat,
  
  times: function (n, block) {
    var result = '';
    for (var i = 1; i <= n; i++) {
      result += block.fn(i);
    }
    return result;
  },

  eq: function(a, b) {
    return a === b;
  }

};
