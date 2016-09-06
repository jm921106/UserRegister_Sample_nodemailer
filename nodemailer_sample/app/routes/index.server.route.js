var index = require('../../app/controllers/index.server.controller.js');

/* GET home page. */

module.exports = function (app) {
  app.route('/')
      .get(index.render);
}

