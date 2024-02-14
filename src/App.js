import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import faculteLogo1 from './fso.png'; // Importez le premier logo de la faculté
import faculteLogo2 from './ump.png'; // Importez le deuxième logo de la faculté

const App = () => {
  const [file, setFile] = useState(null);
  const [numThreads, setNumThreads] = useState(4);
  const [results, setResults] = useState([]);
  const [res, setRes] = useState(false);
  const [executionChoice, setExecutionChoice] = useState('mpi'); // Default execution choice: MPI
  const [hadopResult,setHadopResult]=useState('');
  const [OpenmpResult,setOpenmpResult]=useState('');
  const [mpiResult,setmpiResult]=useState('');
  const[visibMpi,setVisibMpi]=useState(false);
  const[visibOpenmp,setVisibOpenmp]=useState(false);
  const[visibHadoop,setVisibHadoop]=useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleNumThreadsChange = (event) => {
    setNumThreads(parseInt(event.target.value));
  };

  const handleExecutionChoiceChange = (event) => {
    setExecutionChoice(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setVisibMpi(false);
    setVisibOpenmp(false);
    setVisibHadoop(false);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`http://localhost:3001/process?threads=${numThreads}&execution=${executionChoice}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      switch (executionChoice) {
        case 'mpi':
          setmpiResult(response.data.results);
          setVisibMpi(true);
          setVisibOpenmp(false);
          setVisibHadoop(false);
          console.log(response.data.results);
          console.log("mpi"+mpiResult);
          break;
        case 'openmp':
          setOpenmpResult(response.data.results);
          console.log(response.data.results);
          setVisibOpenmp(true);
          setVisibMpi(false);
          setVisibHadoop(false);
          console.log("open"+OpenmpResult);
          break;
        case 'hadoop':
          setHadopResult(response.data);
          setVisibHadoop(true);
          setVisibOpenmp(false);
          setVisibMpi(false);
          break;
        default:
          break;
      }

      setResults(response.data);
      setRes(true);
    } catch (error) {
      console.error('Error:', error);
      // Gérer l'erreur ici
    }
  };

  return (

     <div className="container">
      <header className="header">
        <div className="logo-container">
          <img src={faculteLogo1} alt="Faculte Logo 1" className="faculte-logo" />
        </div>
        <h1>Algorithmique Parallèle et
Complexité</h1>
        <div className="logo-container">
          <img src={faculteLogo2} alt="Faculte Logo 2" className="faculte-logo" />
        </div>
      </header>
      <br></br>
      <form onSubmit={handleSubmit} className="form">
        <br></br><br></br>
        <label>
        Entrer un fichier :
        <input type="file" onChange={handleFileChange} className="form-control" /></label>
        <label>  Entrer le nombre du threads / precessus :
        <input type="number" value={numThreads} onChange={handleNumThreadsChange} className="form-control" />
        </label>
        <label>
        Choisissez le type d'exécution :
          <select value={executionChoice} onChange={handleExecutionChoiceChange} className="form-control">
            <option value="mpi">MPI</option>
            <option value="openmp">OpenMP</option>
            <option value="hadoop">Hadoop</option>
          </select>
        </label>

        <button type="submit" className="btn btn-primary">Envoyer</button>
      </form>
      {visibOpenmp && (
  <div className="openmp-results">
    <h2>Résultats pour OpenMP</h2>
    {visibOpenmp && (
  <div>
  
    {res && OpenmpResult && OpenmpResult['FinalResult'] && (
      <div>
        <h3>Final Result</h3>
        <ul>
          {OpenmpResult['FinalResult'].map((item, index) => (
            <li key={index}>{Object.keys(item)[0]}: {Object.values(item)[0]}</li>
          ))}
        </ul>
      </div>
    )}
    
    {res && OpenmpResult && OpenmpResult.results && (
      <table>
        <thead>
          <tr>
            <th>Thread</th>
            {OpenmpResult['FinalResult'].map((item, index) => (
              <th key={index}>{Object.keys(item)[0]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {OpenmpResult.results.map((thread, threadIndex) => (
            <tr key={threadIndex}>
              <td>{threadIndex}</td>
              {thread[`Thread ${threadIndex}`].map((data, dataIndex) => (
                <td key={dataIndex}>{Object.values(data)[0]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}

  </div>
)}

{visibMpi && (
  <div className="mpi-results">
    <h2>Résultats pour MPI</h2>
    {res && mpiResult && (
      <div>
        <h3>Results Finals</h3>
        <ul>
          {mpiResult['Process 0'].map((item, idx) => (
            <li key={idx}>
              {Object.keys(item)[0]}: {Object.values(item)[0]}
            </li>
          ))}
        </ul>
        {Object.keys(mpiResult).map((processKey, index) => (
          <div key={index}>

            <h3>Process {processKey}</h3>
            <ul>
              {mpiResult[processKey].map((item, idx) => (
                <li key={idx}>
                  {Object.keys(item)[0]}: {Object.values(item)[0]}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}
  </div>
)}
{visibHadoop ? (
  <div > 
    <h2>Hadoop</h2>
    {hadopResult && hadopResult.word_count ? (
      <table className="hadoop-table">
        <thead>
          <tr>
            <th>Mot </th>
            <th>Nombre d'occurence</th>
          </tr>
        </thead>
        <tbody>
          {hadopResult.word_count.map((item, index) => (
            <tr key={index}>
              <td>{item.word}</td>
              <td>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="wait-message">Attendez...</p>
    )}
  </div>
) :  <p className="wait-message">Attendez...</p>}


      {/* Autres blocs pour afficher MPI et Hadoop */}
    </div>
  );
};

export default App;
