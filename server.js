const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('uncaughtException - ❌​ Desligando... ❌');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {}).then(() => console.log('Conexão com o banco de dados estabelecida'));

const port = process.env.PORT || 3030;

const server = app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
});

process.on('uncaughtRejection', (err) => {
  console.log('Unhandled Promise Rejected - ❌​ Desligando... ❌');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, ❌​ Desligando e acabando as req restantes... ❌');
  server.close(() => {
    console.log('Processo finalizado');
  });
});
