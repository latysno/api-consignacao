const pool = require("../database/connection")

const registerOrnametation = async (req, res) => {
    const {empresa, matricula, sei} = req.body 
    const codEmpresas = [3, 4, 6, 7, 8, 13, 16, 18, 23, 24];

    
    try {
        if(!codEmpresas.includes(empresa)){
            return res.status(400).json({mensagem: 'Código da empresa não corresponde com a lista do nosso banco'});
        }

        const validarMatricula = `select matricula from ornamentacao where matricula = $1`

        console.log(";;;");
        const {rowCount} = await pool.query(validarMatricula,[matricula]);

        if(rowCount > 0){
            return res.status(400).json({mensagem: '...'});
        }
        
        const {rows} = await pool.query(
            `insert into consignacao (empresa, matricula, sei)
            values
            ($1, $2, $3) returning *
            `, [empresa, matricula, sei]);

            return res.status(201).json(rows[0])

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = {
    registerOrnametation
}
