const route = require('express').Router();
const rotasConsignacao = require('./routesConsignacao');

route.use(rotasConsignacao);

module.exports = route;