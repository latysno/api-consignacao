const express = require('express');
const routesConsignacao = express();
const { registerOrnametation, deleteOrnametation, attOrnametation } = require('../controllers/controllersOrnametation');


routesConsignacao.get('/consignacao',);
routesConsignacao.post('/consignacao', registerOrnametation);
routesConsignacao.delete('/consignacao', deleteOrnametation);
routesConsignacao.put('/consignacao', attOrnametation)


module.exports = routesConsignacao;