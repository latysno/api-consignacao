// controllers/controllersOrnametation.js
const pool = require("../database/connection");
const { format } = require("date-fns");

const result = new Date();
const formattedResult = format(result, 'dd/MM/yyyy');

const fs = require('fs');
const readline = require('readline');
const multer = require('multer');
const path = require('path');


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

    console.log(`Matrícula recebida: ${matricula}, Empresa recebida: ${empresa}`);

    try {
        // Antes de executar a consulta, logar os valores
        const queryText = 'SELECT 1 FROM ornamentacao WHERE matricula = $1 AND numero_empresa = $2';
        console.log(`Query: ${queryText} | Valores: ${matricula}, ${empresa}`);

        const { rowCount } = await pool.query(queryText, [matricula, empresa]);

        // Se nenhum registro foi encontrado
        if (rowCount === 0) {
            console.log('Nenhum registro encontrado no banco de dados.');
            return res.status(404).json({ mensagem: 'Matrícula não encontrada para essa empresa.' });
        }

        // Log antes de executar a exclusão
        console.log(`Deletando matrícula ${matricula} da empresa ${empresa}`);
        await pool.query('DELETE FROM ornamentacao WHERE matricula = $1 AND numero_empresa = $2', [matricula, empresa]);

        return res.status(200).json({ mensagem: `Matrícula ${matricula} da empresa ${empresa} deletada com sucesso` });
    } catch (error) {
        console.error(`Erro ao tentar deletar matrícula: ${error.message}`);
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


// Limite de tamanho do arquivo (5MB)
const upload = multer({ 
    dest: 'uploads/', 
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // Verificar se o arquivo é .txt
        if (file.mimetype !== 'text/plain') {
            return cb(new Error('Por favor, envie um arquivo .txt válido.'));
        }
        cb(null, true);
    }
});

const compareFileWithDB = async (req, res) => {
    const file = req.file;

    // Verificar se o arquivo foi enviado
    if (!file) {
        return res.status(400).json({ mensagem: 'Arquivo não enviado.' });
    }

    const filePath = path.join(__dirname, '..', file.path);
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let linesToKeep = [];
    let lineNumber = 0;

    try {
        for await (const line of rl) {
            lineNumber++;
            const columns = line.split(';').map(item => item.trim());

            // Verificar se a linha possui ao menos dois campos
            if (columns.length < 2) {
                return res.status(400).json({ mensagem: `Erro de formatação na linha ${lineNumber}: menos de dois campos encontrados.` });
            }

            const numero_empresa = columns[0];
            const matricula = columns[1];

            // Validação de numero_empresa e matricula
            if (numero_empresa.length !== 2 || isNaN(numero_empresa)) {
                return res.status(400).json({ mensagem: `Erro de formatação na linha ${lineNumber}: número da empresa inválido.` });
            }

            if (matricula.length !== 10 || isNaN(matricula)) {
                return res.status(400).json({ mensagem: `Erro de formatação na linha ${lineNumber}: matrícula inválida.` });
            }

            // Verifica se existe no banco de dados
            const { rowCount } = await pool.query(
                'SELECT 1 FROM ornamentacao WHERE matricula = $1 AND numero_empresa = $2', 
                [matricula, numero_empresa]
            );

            // Se não encontrar a combinação, manter a linha no novo arquivo
            if (rowCount === 0) {
                linesToKeep.push(line);
            }
        }

        // Gerar um novo arquivo .txt com as linhas que não têm correspondência
        const newFileName = `resultado_${Date.now()}.txt`;
        const newFilePath = path.join(__dirname, '..', 'uploads', newFileName);
        fs.writeFileSync(newFilePath, linesToKeep.join('\n'));

        // Enviar o arquivo gerado de volta ao usuário
        res.download(newFilePath, newFileName);
        
    } catch (error) {
        return res.status(500).json({ mensagem: `Erro ao processar o arquivo na linha ${lineNumber}: ${error.message}` });
    } finally {
        // Remover o arquivo original após o processamento
        fs.unlinkSync(filePath);
    }
};


module.exports = {
    registerOrnametation,
    deleteOrnametation,
    attOrnametation,
    upload, // Exportar o multer como middleware
    compareFileWithDB,
};
