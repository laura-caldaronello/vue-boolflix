var app = new Vue({
    el: '#root',
    data: {
        search: '',
        movies: []
    },
    methods: {
        searching: function() {

            this.search = document.getElementById('searchInput').value;
            this.search = this.search.replace(/ /g,'+');

            // reset
            this.movies = [];

            if (this.search != '') {
                axios
                .get('https://api.themoviedb.org/3/search/movie?api_key=74414cb486bec78c348850cbf8bf2fc4&language=it-IT&query=' + this.search)
                .then((got) => {
    
                    got.data.results.forEach((result) => {

                        // Definisco le stelle
                        result.stars = Math.floor(result.vote_average / 2) + 1;

                        // Trasformo la lingua in una nazione per essere coerente con le icone di https://www.countryflags.io
                        result.flag = result.original_language;
                        if (result.flag == 'en') {
                            result.flag = 'us';
                        }

                        this.movies.push(result);

                        console.log(result);

                    });
    
                });    
            }
        }
    },
    mounted() {


    }
});
Vue.config.devtools = true;