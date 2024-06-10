// index.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexão com o MongoDB
mongoose.connect('mongodb://localhost:27017/sistema-registro-clientes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Esquema do Cliente
const Cliente = mongoose.model('Cliente', {
  cpf: { type: String, unique: true, required: true },
  nome: { type: String, required: true },
  email: { type: String, required: true },
  estadoCivil: { type: String, required: true },
  endereco: { type: String, required: true },
  telefones: [String],
});

// Função para validar CPF
function validarCPF(cpf) {
  if (!/^\d{11}$/.test(cpf) || cpf === '00000000000' || cpf === '11111111111' || cpf === '22222222222' || cpf === '33333333333' || cpf === '44444444444' || cpf === '55555555555' || cpf === '66666666666' || cpf === '77777777777' || cpf === '88888888888' || cpf === '99999999999') {
    return false;
  }
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) {
    resto = 0;
  }
  if (resto !== parseInt(cpf.charAt(9))) {
    return false;
  }
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) {
    resto = 0;
  }
  if (resto !== parseInt(cpf.charAt(10))) {
    return false;
  }
  return true;
}

app.use(bodyParser.json());

// Rota para criar um novo cliente
app.post('/clientes', async (req, res) => {
  try {
    const { cpf, nome, email, estadoCivil, endereco, telefones } = req.body;

    // Validação do CPF
    if (!validarCPF(cpf)) {
      return res.status(400).json({ message: 'CPF inválido' });
    }

    const cliente = await Cliente.create({ cpf, nome, email, estadoCivil, endereco, telefones });
    res.status(201).json(cliente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para buscar um cliente pelo CPF
app.get('/clientes/:cpf', async (req, res) => {
  try {
    const cliente = await Cliente.findOne({ cpf: req.params.cpf });
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para atualizar um cliente pelo CPF
app.put('/clientes/:cpf', async (req, res) => {
  try {
    const { nome, email, estadoCivil, endereco, telefones } = req.body;
    const cliente = await Cliente.findOneAndUpdate(
      { cpf: req.params.cpf },
      { nome, email, estadoCivil, endereco, telefones },
      { new: true }
    );
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
