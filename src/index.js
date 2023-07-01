import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import MovieAppProvider from './context/MovieContext';

ReactDOM.render(
  <React.StrictMode>
    <MovieAppProvider>
      <App />
    </MovieAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);


reportWebVitals();
