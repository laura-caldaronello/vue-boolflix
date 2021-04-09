var app = new Vue({
    el: '#root',
    data: {
        api_key: '74414cb486bec78c348850cbf8bf2fc4',
        language: 'it-IT',
        search: '',
        searchOpen: false,
        flags: ['us','it','fr','de','es'],
        srcFlagFirst: 'https://www.countryflags.io/',
        srcFlagLast: '/flat/16.png',
        srcPosterFirst: 'https://image.tmdb.org/t/p/',
        srcPosterDimension : 'w342/',
        found: [],
        detailsRequested: ['credits'],
        detailsPushed: ['cast5'],
        menuLeft: ['Home','Serie TV','Film','Nuovi e popolari','La mia lista','Guarda di nuovo'],
        menuLeftActive: 0,
        tvGenres: [],
        movieGenres: [],
        selectedGenre: 'All'
    },
    methods: {
        transformVote: function(vote) {
            return Math.ceil(vote / 2);
        },
        includeFlag: function(flag) {
            return this.flags.includes(flag);
        },
        isRightType: function(item) {
            if  (   this.menuLeftActive == 0 || 
                    (this.menuLeftActive == 1 && item.media_type == 'tv') ||
                    (this.menuLeftActive == 2 && item.media_type == 'movie')
                    // qui metterò eventualmente le altre opzioni
                ) {
                    return true;
            }
            else {
                return false;
            };
        },
        openingClosing: function() {
            this.searchOpen = !this.searchOpen;
        },
        searching: function() {

            // per quanto riguarda i generi devo definire una conversione chiamando la lista dei generi; i dati devono essere disponibili alla ricerca quindi questa è la prima chiamata che va fatta e le altre cose sono nel suo then
            axios
            .get('https://api.themoviedb.org/3/genre/movie/list',
                {params: {
                    api_key: this.api_key,
                    language: this.language,
                }})
            .then((gotGenres) => {

                // quando ho finito di chiamare i generi movie allora chiamo quelli tv
                axios
                .get('https://api.themoviedb.org/3/genre/tv/list',
                    {params: {
                        api_key: this.api_key,
                        language: this.language,
                    }})
                .then((gotGenres2) => {

                    // reset
                    this.found = [];
    
                    if (this.search != '') {
                        axios
                        .get('https://api.themoviedb.org/3/search/multi',
                            {params: {
                                api_key: this.api_key,
                                language: this.language,
                                query: this.search
                            }}
                        )
                        .then((got) => {
    
                            // inserisco i generi nel data
                            this.tvGenres.push(...gotGenres2.data.genres);
                            this.movieGenres.push(...gotGenres.data.genres);

                            got.data.results.forEach((result) => {
    
                                // avendo fatto la chiamata "multi" posso potenzialmente ottenere anche altre tipologie di informazioni
                                if (result.media_type == 'movie' || result.media_type == 'tv') {
    
                                    // inserisco i generi differenziando tra movie e serie. si potrebbe ottimizzare
                                    result.genre_names = [];
                                    if (result.media_type == 'movie') {
                                        this.movieGenres.forEach((genre) => {
                                            if (result.genre_ids.includes(genre.id)) {
                                                result.genre_names.push(genre.name);
                                            };
                                        });
                                    }
                                    else if (result.media_type == 'tv') {
                                        this.tvGenres.forEach((genre) => {
                                            if (result.genre_ids.includes(genre.id)) {
                                                result.genre_names.push(genre.name);
                                            };
                                        });
                                    }
    
                                    // da qui chiamo gli attori generalizzando le chiamate (in caso volessi successivamente chiamare altri dettagli del film)
                                    for (let i = 0; i < this.detailsRequested.length; i++) {
                                        // reset
                                        result[this.detailsPushed[i]] = [];
                                        // chiamata
                                        axios
                                        .get('https://api.themoviedb.org/3/' + result.media_type + '/' + result.id + '/' + this.detailsRequested[i] + '?api_key=' + this.api_key + '&language=' + this.language)
                                        .then((got) => {
                                            if (this.detailsRequested[i] == 'credits') {
                                                if (got.data.cast.length != 0) {
                                                    for (let i = 0; i < 5; i++) {
                                                        if (got.data.cast[i] != undefined) {
                                                            result.cast5.push(got.data.cast[i]);
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    }
    
                                    // Definisco le stelle
                                    result.stars = this.transformVote(result.vote_average);
            
                                    // Trasformo la lingua in una nazione per essere coerente con le icone di https://www.countryflags.io
                                    result.flag = result.original_language;
                                    if (result.flag == 'en') {
                                        result.flag = 'us';
                                    };
    
                                    this.found.push(result);
    
                                };
    
                            });
            
                        });
                    }

                })

            });                    

        }
    },
    mounted() {


    }
});
Vue.config.devtools = true;