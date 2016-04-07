var router = require('express').Router();

var rest = require('../../helpers/rest');

var forms = {
  race: {
    title: 'Add race',
    view: 'forms/race'
  },
  waypoint: {
    title: 'Add waypoint',
    view: 'forms/waypoint'
  }
};

router.route('/')
  .get(function(req, res) {
    res.json(Object.keys(forms));
  });

router.route('/:slug')
  .get(function(req, res, next) {
    if (!(req.params.slug in forms)) {
      return next(rest.notFound);
    }
    var form = forms[req.params.slug];
    form.layout = false;
    res.render(form.view, form, function(err, html) {
      if (err) {
        return next(err);
      }
      res.json({
        title: form.title,
        html: html
      });
    });
  });

module.exports = router;
