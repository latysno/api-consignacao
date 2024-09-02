const express = require('express');
const routesConsignacao = express();
const { registerOrnametation } = require('../controllers/controllersOrnametation');


routesConsignacao.get('/consignacao',);
routesConsignacao.post('/consignacao', registerOrnametation);
routesConsignacao.delete('/consignacao',);


module.exports = routesConsignacao;