// App.js
import React, { useState } from 'react';
import { Container, Typography, Button, InputLabel, Input, FormControl, Grid } from '@mui/material';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [numThreads, setNumThreads] = useState(4);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleThreadsChange = (event) => {
    setNumThreads(parseInt(event.target.value, 10));
  };

  const handleProcessClick = async () => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('http://localhost:3001/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          threads: numThreads,
        },
      });

      console.log('Réponse du serveur :', response.data);

      alert('Traitement terminé avec succès.');
    } catch (error) {
      console.error('Erreur lors de la requête vers le serveur :', error);
    }
  };

  return (
    <Container
      maxWidth="md"
      style={{
        marginTop: '50px',
        height: '50vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Application de Traitement
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel htmlFor="file" style={{ marginBottom: '12px' }}>
              Choisissez le fichier txt :
            </InputLabel>
            <Input id="file" type="file" accept=".txt" onChange={handleFileChange} />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel htmlFor="threads" style={{ fontWeight: 'bold', marginBottom: '16px' }}>
              Choisissez le nombre de threads :
            </InputLabel>
            <Input id="threads" type="number" min="1" value={numThreads} onChange={handleThreadsChange} />
          </FormControl>
        </Grid>
        <Grid item xs={12} style={{ marginBottom: '70px' }}>
          <Button variant="contained" color="primary" fullWidth onClick={handleProcessClick}>
            Lancer le Traitement
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
