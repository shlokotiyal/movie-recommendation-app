import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [preference, setPreference] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRecommendations = async () => {
    if (!preference) return;

    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/recommend',
        { preference }
      );

      setMovies(response.data.movies);

    } catch (error) {
      console.error(error);
      alert('Error fetching recommendations');
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Movie Recommendation App</h1>

      <input
        type="text"
        placeholder="Enter movie preference..."
        value={preference}
        onChange={(e) => setPreference(e.target.value)}
      />

      <button onClick={getRecommendations}>
        Get Recommendations
      </button>

      {loading && <p>Loading...</p>}

      <div className="movies">
        {movies.map((movie, index) => (
          <div key={index} className="movie-card">
            {movie}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;