const express = require('express');
const cors = require('cors');
const route = require('./routes');
const port = 8080;
const app = express();


app.use(cors());
app.use(express.json());
app.use(route);

app.listen(port, () => console.log(`${port}`));