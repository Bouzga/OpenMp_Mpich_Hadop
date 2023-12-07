const express = require('express');
const app = express();
const port = 3001;
const { spawn } = require('child_process');

app.post('/process', async (req, res) => {
  try {
    const numThreads = req.query.threads;

    // Ajoutez ces en-têtes pour autoriser les requêtes CORS
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    const process = spawn('./progopenmp');

    process.stdout.on('data', (data) => {
      console.log(`Sortie du programme C : ${data}`);
    });

    process.on('close', (code) => {
      console.log(`Le programme C s'est terminé avec le code ${code}`);
      res.json({ success: true, message: 'Traitement terminé avec succès.' });
    });
  } catch (error) {
    console.error('Erreur lors du traitement dans le serveur :', error);
    res.status(500).json({ success: false, message: 'Erreur lors du traitement.' });
  }
});

// Cette route sert à des fins de préfligth pour les requêtes CORS
app.options('/process', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Serveur backend écoutant sur le port ${port}`);
});

