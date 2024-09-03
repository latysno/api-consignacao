const express = require('express');
const routesConsignacao = express();
const { registerOrnametation, deleteOrnametation } = require('../controllers/controllersOrnametation');


routesConsignacao.get('/consignacao',);
routesConsignacao.post('/consignacao', registerOrnametation);
routesConsignacao.delete('/consignacao', deleteOrnametation);


module.exports = routesConsignacao;