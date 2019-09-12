const Parse = require('parse/node');
const APP_ID = process.env.APP_ID;
const MASTER_KEY = process.env.MASTER_KEY;

Parse.initialize(APP_ID, null, "YOUR_MASTERKEY");
Parse.serverURL = 'http://localhost:4040/parse';

const investigadoresData = require('./seeds/investigadores');

const loadInvestigadores = (investigadores) => {
  const Investigador = Parse.Object.extend("Investigador");
  investigadores.forEach(data => {
    const investigador = new Investigador();
    investigador.set(data);
    investigador.save();
  });
}

const start = () => {
  loadInvestigadores(investigadoresData);
} 

start();