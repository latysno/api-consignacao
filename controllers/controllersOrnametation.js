const pool = require("../database/connection");
const {format, isValid, parseISO, isDate} = require ("date-fns");

const result = (new Date());
const formattedResult = format(result, 'dd/MM/yyyy');



const registerOrnametation = async (req, res) => {
    const {empresa, matricula, data_ornamentacao, sei} = req.body 
    const codEmpresas = [3, 4, 6, 7, 8, 13, 16, 18, 23, 24];

    const isValidMonthYear = (monthYearString) => {
        // Regex para validar o formato MM/YYYY
        const regex = /^(0[1-9]|1[0-2])\/(20\d{2})$/;
        return regex.test(monthYearString);
    };

    
    try {
        if (!empresa) {
            return res.status(400).json({mensagem: 'campo obrigatório' }); 
        }

        if(!matricula){
            return res.status(400).json({mensagem: 'campo obrigatório' }); 
        }

        if(!data_ornamentacao){
            return res.status(400).json({mensagem: 'campo obrigatório' }); 
        }

        if(!codEmpresas.includes(empresa)){
            return res.status(400).json({mensagem: 'Código da empresa não corresponde com a lista do nosso banco'});
        }


        if (!isValidMonthYear(data_ornamentacao)){
            return res.status(400).json({ mensagem: "O formato da data informada deve ser MM/YYYY" });
        }

        
        if (matricula.trim().length !== 10) {
            return res.status(400).json({mensagem: 'matricula incorreto !' }); 
        }

        if (sei.trim().length < 25) {
            return res.status(400).json({mensagem: 'SEI incorreto !' }); 
        }

        
        const validarMatricula = `select matricula from ornamentacao where matricula = $1`

        const {rowCount} = await pool.query(validarMatricula,[matricula]);

        if(rowCount > 0){
            return res.status(400).json({mensagem: 'matricula já existe!'});
        }
        
        const {rows} = await pool.query(
            `insert into ornamentacao (numero_empresa, matricula, data, data_ornamentacao, sei)
            values
            ($1, $2, $3, $4, $5) returning *
            `, [empresa, matricula, formattedResult, data_ornamentacao, sei]);


            return res.status(201).json(rows[0])

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const deleteOrnametation = async (req, res) =>{

    const { matricula } = req.query;

    try {
            // console.log(matricula);

            const deleteConsignacao = `select * from ornamentacao where matricula = $1`;

            const {rowCount} = await pool.query(deleteConsignacao,[matricula])
            
            if (rowCount < 1) {
                return res.status(404).json({mensagem:`matricula ${matricula} não encontrada no banco de dados`})
            }

            const deleteQuery = `DELETE FROM ornamentacao WHERE matricula = $1`;
            await pool.query(deleteQuery, [matricula]);

            return res.status(200).json({ mensagem: `Matrícula ${matricula} deletada com sucesso` });

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }

} 

module.exports = {
    registerOrnametation,
    deleteOrnametation
}
