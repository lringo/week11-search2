const express = require('express');
const axios = require('axios');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/search', (req, res) => {
    res.render('search', { movieDetails:'' });
});

app.post('/search', (req, res) => {
    let userMovieTitle = req.body.movieTitle;

    let movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=fed0579523be006c8483df4c1246f7a6&query=${userMovieTitle}`;
    let genresUrl = 'https://api.themoviedb.org/3/genre/movie/list?api_key=fed0579523be006c8483df4c1246f7a6&language=en-US';
    
    let endpoints = [movieUrl, genresUrl];

    axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
    .then(axios.spread((movie, genres) => {
        const [movieRaw] = movie.data.results;
        let movieGenreIds =movieRaw.genre_ids;
        let movieGenres = genres.data.genres;
        
        let movieGenresArray = [];

        for(let i = 0; i < movieGenreIds.length; i++){
            for(let j = 0; j < movieGenres.length; j++) {
                if(movieGenreIds[i] === movieGenres[j].id){
                    movieGenresArray.push(movieGenres[j].name);
                }
            }
        }
        
        let genresToDisplay = '';
        movieGenresArray.forEach(genre => {
            genresToDisplay = genresToDisplay + `${genre}, `;
        });

        genresToDisplay = genresToDisplay.slice(0, -2) + '.';

        

    let movieData = {
        title: movieRaw.title,
        year: new Date(movieRaw.release_date).getFullYear(),
        genres: genresToDisplay,
        overview: movieRaw.overview,
        posterUrl: `https://image.tmdb.org/t/p/w500${movieRaw.poster_path}`
    };

    res.render('search', {movieDetails: movieData});

    }));

});

app.listen(process.env.PORT || 3000, () => {
    console.log('server is running.')
});