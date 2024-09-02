const pool = require("../database/connection");
const {format, isDate} = require ("date-fns");

const result = (new Date());
const formattedResult = format(result, 'dd/MM/yyyy');
// console.log(formattedResult);


const registerOrnametation = async (req, res) => {
    const {empresa, matricula, sei} = req.body 
    const codEmpresas = [3, 4, 6, 7, 8, 13, 16, 18, 23, 24];

    
    try {
        if (!empresa && !matricula) {
            return res.status(400).json({mensagem: 'campo obrigatório' }); 
        }
        if(!codEmpresas.includes(empresa)){
            return res.status(400).json({mensagem: 'Código da empresa não corresponde com a lista do nosso banco'});
        }

        if (sei.length < 25) {
            return res.status(400).json({mensagem: 'SEI incorreto !' }); 
        }

        if (matricula.length !== 10) {
            return res.status(400).json({mensagem: 'matricula incorreto !' }); 
        }
        
        const validarMatricula = `select matricula from ornamentacao where matricula = $1`

        const {rowCount} = await pool.query(validarMatricula,[matricula]);

        if(rowCount > 0){
            return res.status(400).json({mensagem: '...'});
        }
        
        const {rows} = await pool.query(
            `insert into ornamentacao (numero_empresa, matricula, data, sei)
            values
            ($1, $2, $3, $4) returning *
            `, [empresa, matricula, formattedResult, sei]);

            // Formatar a data após a inserção
        const insertedRow = rows[0];
        const formattedDate = format(new Date(insertedRow.data), 'dd/MM/yyyy');

        // Atualizar o row com a data formatada para a resposta
        insertedRow.data = formattedDate;

            return res.status(201).json(rows[0])

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = {
    registerOrnametation
}
