const Record = require('./connect');
const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const apikey = 'd5525a90';

app.use(bodyParser.urlencoded({ extended: false }));

// MongoDB connection
mongoose
  .connect('mongodb+srv://WebAPI_Theshan:5$wQHymLBaxk$_.@gettingstarterd.lyo9ver.mongodb.net/Web_API', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error);
  });

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', userSchema);

// Login page
app.get('/', (req, res) => {
  res.send(`
  <center>
  <h2 style="color: #333;">Login Page</h2>
  <form action="/login" method="POST">
    <label for="username" style="display: block; margin-bottom: 10px;">Username:</label>
    <input type="text" id="username" name="username" style="padding: 5px; width: 200px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 10px;" /><br />
    <label for="password" style="display: block; margin-bottom: 10px;">Password:</label>
    <input type="password" id="password" name="password" style="padding: 5px; width: 200px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 10px;" /><br />
    <button type="submit" style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Login</button>
    <p style="margin-top: 10px;">Don't have an account? Click here to register now <button type="button" onclick="window.location.href='/register'" style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Register</button></p>
  </form>
</center>
  `);
});

// Login function
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user in the database
  User.findOne({ username }, (error, user) => {
    if (error) {
      console.log('Error finding user:', error);
      return res.status(500).send('Error finding user');
    }
    if (!user) {
      // User not found
      return res.status(404).send('User not found. Please register first.');
    }

    // Check if the password matches
    if (user.password !== password) {
      return res.status(401).send('Invalid password');
    }

    // Successful login
    const content = `
      <p>Welcome, ${username}! <br><a href="/homepage">Go to homepage</a></p>
    `;
    res.send(htmlLayout("Movie API", content));
  });
});

// Register page
app.get('/register', (req, res) => {
  res.send(`
  <center>
  <h2 style="color: #333;">Register Page</h2>
  <form action="/register" method="POST">
    <label for="username" style="display: block; margin-bottom: 10px;">Username:</label>
    <input type="text" id="username" name="username" style="padding: 5px; width: 200px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 10px;" /><br />
    <label for="password" style="display: block; margin-bottom: 10px;">Password:</label>
    <input type="password" id="password" name="password" style="padding: 5px; width: 200px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 10px;" /><br />
    <button type="submit" style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Register</button>
    <p style="margin-top: 10px;">Already have an account? Click here to login now <button type="button" onclick="window.location.href='/'" style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Login</button></p>
  </form>
</center>

  `);
});

// Register function
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Create a new user object
  const newUser = new User({ username, password });

  // Save the user to the database and checks for existing users
  newUser.save((error) => {
    if (error) {
      console.log('Error saving user:', error);
      return res.status(500).send('Error registering user');
    }
    res.status(200).send('Registration successful! <br> Click here to login now <a href="/">Login</a>');
  });
});

// Set up HTML layout
const htmlLayout = (title, content) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>${title}</title>
    </head>
    <body>
      <h1>${title}</h1>
      ${content}
    </body>
  </html>
`;

// Home page
app.get('/homepage', (req, res) => {
  const content = `
  <style>
  body {
    text-align: center;
    font-family: Arial, sans-serif;
    background-color: #f2f2f2;
  }

  p {
    margin: 20px 0;
    font-size: 20px;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    margin-bottom: 10px;
  }

  a {
    display: inline-block;
    padding: 10px 20px;
    background-color: #333;
    color: #fff;
    text-decoration: none;
    border-radius: 4px;
  }

  a:hover {
    background-color: #555;
  }
</style>
</head>
<body>
<p>Welcome to the Movie API homepage!</p>
<ul>
  <li><a href="/getAllMovie">Get All Movies</a></li>
  <li><a href="/getMovie">Get a Movie</a></li>
  <li><a href="/updateMovie">Update a Movie</a></li>
  <li><a href="/deleteMovie">Delete a Movie</a></li>
  <li><a href="/deleteAllMovie">Delete All Movies</a></li>
</ul>
<p><a href="/">Logout</a></p>
</body>
  `;
  res.send(htmlLayout("Movie API", content));
});

// Get all movies
app.get('/getAllMovie', (req, res) => {
    Record.find({}, (err, movies) => {
      if (err) {
        console.log("Error retrieving movies: " + err);
        const content = `
          <p>Error retrieving movies from the database</p>
          <h4><a href="/homepage">Go back to homepage</a></h4>
        `;
        res.status(500).send(htmlLayout("Get All Movies", content));
      } else {
        let movieList = '';
        movies.forEach((movie) => {
          movieList += `
            <p><strong>Title:</strong> ${movie.movieTitle}</p>
            <p><strong>Year:</strong> ${movie.movieYear}</p>
            <p><strong>Genre:</strong> ${movie.movieDirector}</p>
            
            <hr>
            
          `;
        });
  
        const content = `
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
            }
            h2 {
              color: #333;
            }
            p {
              margin: 0;
              line-height: 1.5;
            }
            strong {
              font-weight: bold;
            }
            hr {
              border: none;
              border-top: 1px solid #ccc;
              margin: 10px 0;
            }
            a {
              color: #007bff;
              text-decoration: none;
            }
          </style>
          <h2>All Movies</h2>
          ${movieList}
          <h4><a href="/homepage">Go back to homepage</a></h4>

        `;
        res.send(htmlLayout("Get All Movies", content));
      }
    });
  });

// Get a movie
app.get('/getMovie', (req, res) => {
  const title = req.query.title || '';

  const form = `
  <style>
  body {
    text-align: center;
    font-family: Arial, sans-serif;
    background-color: #f2f2f2;
  }

  form {
    display: inline-block;
    margin-top: 20px;
  }

  label {
    display: block;
    margin-bottom: 10px;
  }

  input[type="text"] {
    padding: 5px;
    width: 200px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  button[type="submit"] {
    padding: 5px 10px;
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button[type="submit"]:hover {
    background-color: #555;
  }
</style>
</head>
<body>
<form action="/getMovie" method="GET">
  <label for="title">Movie Title:</label>
  <input type="text" id="title" name="title" value="${title}" />
  <button type="submit">Get Movie</button>
</form>
</body>
  `;

  if (!title) {
    const content = `
      <h2>Insert a movie title and get the descriptions</h2>
      ${form}
    `;
    res.send(htmlLayout("Get a Movie", content));
  } else {
    const querystr = `http://www.omdbapi.com/?t=${title}&apikey=${apikey}`;
    axios.get(querystr)
      .then((response) => {
        const Title = response.data.Title;
        const Poster = response.data.Poster;
        const Year = response.data.Year;
        const Director = response.data.Director;

        const filmValue = new Record({
          movieTitle: Title,
          moviePoster: Poster,
          movieYear: Year,
          movieDirector: Director,
        });

        filmValue.save()
          .then(result => {
            console.log("Success: " + result);
          })
          .catch(error => {
            console.log("Error: " + error);
          });

        const content = `
        <style>
        body {
          text-align: center;
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
        }
    
        h2 {
          color: #333;
        }
    
        p {
          margin-bottom: 10px;
        }
    
        img {
          margin: 20px 0;
        }
    
        a {
          color: #333;
          text-decoration: none;
        }
    
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <h2>${Title}</h2>
      <img src="${Poster}" alt="${Title} Poster" width="400" />
      <p>Year: ${Year}</p>
      <p>Director: ${Director}</p>
      <b><p>Record saved</p></b>
      <br>
      <p><a href="/homepage">Go back to homepage</a></p>
    </body>
        `;

        res.send(htmlLayout("Get a Movie", content));
      })
      .catch(error => {
        const content = `
          <h2>Error</h2>
          <p>${error.message}</p>
          <p><a href="/">Go back to homepage</a></p>
        `;

        res.send(htmlLayout("Get a Movie", content));
      });
  }
});

// Update a movie
app.get('/updateMovie', (req, res) => {
  const title = req.query.title || '';
  const director = req.query.director || '';
  const year = req.query.year || '';


  const form = `
  <style>
  body {
    text-align: center;
    font-family: Arial, sans-serif;
    background-color: #f2f2f2;
  }

  form {
    display: inline-block;
    text-align: left;
    background-color: #fff;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 20px;
  }

  label {
    display: block;
    margin-bottom: 10px;
  }

  input[type="text"] {
    padding: 5px;
    width: 200px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  button[type="submit"] {
    padding: 5px 10px;
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button[type="submit"]:hover {
    background-color: #555;
  }
</style>
</head>
<body>
<form action="/updateMovie" method="GET">
  <label for="title">Movie Title:</label>
  <input type="text" id="title" name="title" value="${title}" /><br />
  <label for="director">Director:</label>
  <input type="text" id="director" name="director" value="${director}" /><br />
  <label for="year">Year:</label>
  <input type="text" id="year" name="year" value="${year}" /><br />
  <button type="submit">Update Movie</button>
</form>
</body>
  `;

  if (!title) {
    const content = `
      <h2>Choose a movie title and update the details</h2>
      ${form}
    `;
    res.send(htmlLayout("Update a Movie", content));
  } else {
    Record.findOneAndUpdate(
      { movieTitle: title },
      { $set: { movieTitle: title, movieDirector: director, movieYear: year } },
      { new: true },
      (err, updatedMovie) => {
        if (err) {
          console.log("Error updating movie: " + err);
          const content = `
            <p>Error updating movie in the database</p>
            <p><a href="/homepage">Go back to homepage</a></p>
          `;
          res.status(500).send(htmlLayout("Update a Movie", content));
        } else {
          if (!updatedMovie) {
            const content = `
              <p>No movie found with the title "${title}"</p>
              <p><a href="/updateMovie">Try again</a></p>
              <p><a href="/homepage">Go back to homepage</a></p>
            `;
            res.send(htmlLayout("Update a Movie", content));
          } else {
            const content = `
            <style>
            body {
              text-align: center;
              font-family: Arial, sans-serif;
              background-color: #f2f2f2;
            }
        
            h2 {
              color: #333;
            }
        
            p {
              margin: 10px 0;
            }
        
            a {
              display: inline-block;
              padding: 10px 20px;
              background-color: #333;
              color: #fff;
              text-decoration: none;
              border-radius: 4px;
            }
        
            a:hover {
              background-color: #555;
            }
          </style>
        </head>
        <body>
          <h2>Movie Updated</h2>
          <p>Title: ${updatedMovie.movieTitle}</p>
          <p>Director: ${updatedMovie.movieDirector}</p>
          <p>Year: ${updatedMovie.movieYear}</p>
          <p><a href="/updateMovie">Update another movie</a></p>
          <p><a href="/homepage">Go back to homepage</a></p>
        </body>
            `;
            res.send(htmlLayout("Update a Movie", content));
          }
        }
      }
    );
  }
});

// Delete one movie
app.get('/deleteMovie', (req, res) => {
  const title = req.query.title || '';

  const form = `
  <style>
  body {
    text-align: center;
    font-family: Arial, sans-serif;
    background-color: #f2f2f2;
  }

  form {
    display: inline-block;
    text-align: left;
    background-color: #fff;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 20px;
  }

  label {
    display: block;
    margin-bottom: 10px;
  }

  input[type="text"] {
    padding: 5px;
    width: 200px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  button[type="submit"] {
    padding: 5px 10px;
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button[type="submit"]:hover {
    background-color: #555;
  }
</style>
</head>
<body>
<form action="/deleteMovie" method="GET">
  <label for="title">Movie Title:</label>
  <input type="text" id="title" name="title" value="${title}" />
  <button type="submit">Delete Movie</button>
</form>
</body>
  `;

  if (!title) {
    const content = `
      <h2>Insert the title of the movie you wish to delete</h2>
      ${form}
    `;
    res.send(htmlLayout("Delete a Movie", content));
  } else {
    Record.deleteOne({ movieTitle: title }, function (err) {
      if (err) return handleError(err);
      // Deleted at most one document
    });

    const content = `
    <style>
    body {
      text-align: center;
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
    }

    p {
      margin: 20px 0;
      font-size: 20px;
    }

    a {
      padding: 10px 20px;
      background-color: #333;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
    }

    a:hover {
      background-color: #555;
    }
  </style>
</head>
<body>
  <p>${title} deleted</p>
  <p><a href="/homepage">Go back to homepage</a></p>
</body>
    `;
    res.send(htmlLayout("Delete a Movie", content));
  }
});

// Delete all movies
app.get('/deleteAllMovie', (req, res) => {
  Record.deleteMany({}, (err) => {
    if (err) {
      console.log("Error deleting movies: " + err);
      const content = `
        <p>Error deleting movies from the database</p>
        <p><a href="/homepage">Go back to homepage</a></p>
      `;
      res.status(500).send(htmlLayout("Delete All Movies", content));
    } else {
      console.log("All movies deleted successfully");
      const content = `
      <style>
      body {
        text-align: center;
        font-family: Arial, sans-serif;
        background-color: #f2f2f2;
      }
  
      p {
        margin: 20px 0;
        font-size: 20px;
      }
  
      a {
        padding: 10px 20px;
        background-color: #333;
        color: #fff;
        text-decoration: none;
        border-radius: 4px;
      }
  
      a:hover {
        background-color: #555;
      }
    </style>
  </head>
  <body>
    <p>All movies deleted</p>
    <p><a href="/homepage">Go back to homepage</a></p>
  </body>
      `;
      res.send(htmlLayout("Delete All Movies", content));
    }
  });
});

app.listen(4000);


//npm install axios
//npm install mongoose
//npm install mongodb
//npm install react
//npm install express --save