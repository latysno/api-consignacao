// controllers/controllersOrnametation.js
const pool = require("../database/connection");
const { format } = require("date-fns");

const result = new Date();
const formattedResult = format(result, 'dd/MM/yyyy');

// Inclusão com validação de matrícula e empresa existente
const registerOrnametation = async (req, res) => {
    const { empresa, matricula, data_ornamentacao, sei } = req.body;
    const codEmpresas = [3, 4, 6, 7, 8, 13, 16, 18, 23, 24];

    const isValidMonthYear = (monthYearString) => {
        const regex = /^(0[1-9]|1[0-2])\/(19[6-9][0-9]|20[0-9]{2}|2100)$/;
        return regex.test(monthYearString);
    };

    try {
        if (!empresa || !matricula || !data_ornamentacao) {
            return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios' });
        }

        if (!codEmpresas.includes(empresa)) {
            return res.status(400).json({ mensagem: 'Código da empresa inválido' });
        }

        if (!isValidMonthYear(data_ornamentacao)) {
            return res.status(400).json({ mensagem: 'O formato da data informada deve ser MM/YYYY' });
        }

        if (matricula.trim().length !== 10) {
            return res.status(400).json({ mensagem: 'Matrícula deve ter 10 caracteres' });
        }

        if (sei && sei.trim().length > 25) {
            return res.status(400).json({ mensagem: 'SEI pode ter no máximo 25 caracteres.' });
        }

        // Verifica se a matrícula já existe para a mesma empresa
        const { rowCount } = await pool.query(
            'SELECT 1 FROM ornamentacao WHERE matricula = $1 AND numero_empresa = $2', 
            [matricula, empresa]
        );
        if (rowCount > 0) {
            return res.status(400).json({ mensagem: 'Matrícula já existe para essa empresa!' });
        }

        const { rows } = await pool.query(
            `INSERT INTO ornamentacao (numero_empresa, matricula, data, data_ornamentacao, sei)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [empresa, matricula, formattedResult, data_ornamentacao, sei || null]
        );

        return res.status(201).json({ mensagem: 'Registro incluído com sucesso!', dados: rows[0] });
    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
};

// Exclusão com resposta correta
const deleteOrnametation = async (req, res) => {
    const { matricula, empresa } = req.query;

    try {
        const { rowCount } = await pool.query(
            'SELECT 1 FROM ornamentacao WHERE matricula = $1 AND numero_empresa = $2', 
            [matricula, empresa]
        );

        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Matrícula não encontrada para essa empresa.' });
        }

        await pool.query('DELETE FROM ornamentacao WHERE matricula = $1 AND numero_empresa = $2', [matricula, empresa]);
        return res.status(200).json({ mensagem: `Matrícula ${matricula} da empresa ${empresa} deletada com sucesso` });
    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
};

// Edição com atualização parcial
const attOrnametation = async (req, res) => {
    const { empresa, matricula, data_ornamentacao, sei } = req.body;
    const codEmpresas = [3, 4, 6, 7, 8, 13, 16, 18, 23, 24];

    const isValidMonthYear = (monthYearString) => {
        const regex = /^(0[1-9]|1[0-2])\/(19[6-9][0-9]|20[0-9]{2}|2100)$/;
        return regex.test(monthYearString);
    };

    try {
        if (!matricula || !empresa) {
            return res.status(400).json({ mensagem: 'Campos obrigatórios: matrícula e empresa' });
        }

        const { rowCount } = await pool.query(
            'SELECT 1 FROM ornamentacao WHERE matricula = $1 AND numero_empresa = $2', 
            [matricula, empresa]
        );
        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Matrícula não encontrada para essa empresa.' });
        }

        const fieldsToUpdate = [];
        const valuesToUpdate = [];

        if (empresa) {
            if (!codEmpresas.includes(empresa)) {
                return res.status(400).json({ mensagem: 'Código da empresa inválido' });
            }
            fieldsToUpdate.push('numero_empresa');
            valuesToUpdate.push(empresa);
        }

        if (data_ornamentacao) {
            if (!isValidMonthYear(data_ornamentacao)) {
                return res.status(400).json({ mensagem: 'O formato da data informada deve ser MM/YYYY' });
            }
            fieldsToUpdate.push('data_ornamentacao');
            valuesToUpdate.push(data_ornamentacao);
        }

        if (sei) {
            if (sei.trim().length > 25) {
                return res.status(400).json({ mensagem: 'SEI pode ter no máximo 25 caracteres.' });
            }
            fieldsToUpdate.push('sei');
            valuesToUpdate.push(sei);
        }

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ mensagem: 'Nenhum campo para atualizar foi fornecido' });
        }

        // Gerar query dinâmica
        const setClause = fieldsToUpdate.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const updateQuery = `UPDATE ornamentacao SET ${setClause} WHERE matricula = $${fieldsToUpdate.length + 1} AND numero_empresa = $${fieldsToUpdate.length + 2} RETURNING *`;

        valuesToUpdate.push(matricula);
        valuesToUpdate.push(empresa);
        const { rows: updatedRows } = await pool.query(updateQuery, valuesToUpdate);

        return res.status(200).json({ mensagem: 'Dados atualizados com sucesso!', dados: updatedRows[0] });
    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
};

module.exports = {
    registerOrnametation,
    deleteOrnametation,
    attOrnametation,
};
