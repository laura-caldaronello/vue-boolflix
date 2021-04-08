var app = new Vue({
    el: '#root',
    data: {
        api_key: '74414cb486bec78c348850cbf8bf2fc4',
        language: 'it-IT',
        search: '',
        flags: ['us','it','fr','de','es'],
        srcFlagFirst: 'https://www.countryflags.io/',
        srcFlagLast: '/flat/16.png',
        srcPosterFirst: 'https://image.tmdb.org/t/p/',
        srcPosterDimension : 'w342/',
        found: [],
        menuLeft: ['Home','Serie TV','Film','Nuovi e popolari','La mia lista','Guarda di nuovo'],
        menuLeftActive: 0,
        menuRight: []
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
        searching: function() {

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
    
                    got.data.results.forEach((result) => {

                        // avendo fatto la chiamata "multi" posso potenzialmente ottenere anche altre tipologie di informazioni
                        if (result.media_type == 'movie' || result.media_type == 'tv') {

                            // da qui chiamo gli attori
                            result.cast5 = [];
                            axios
                            .get('https://api.themoviedb.org/3/' + result.media_type + '/' + result.id + '/credits?api_key=' + this.api_key + '&language=' + this.language)
                            .then((credits) => {
                                console.log(credits.data.cast);
                                if (credits.data.cast.length != 0) {
                                    for (let i = 0; i < 5; i++) {
                                        if (credits.data.cast[i] != undefined) {
                                            result.cast5.push(credits.data.cast[i]);
                                        }
                                    }
                                }
                                console.log(result.cast5);
                            });

                            // Definisco le stelle
                            result.stars = this.transformVote(result.vote_average);
    
                            // Trasformo la lingua in una nazione per essere coerente con le icone di https://www.countryflags.io
                            result.flag = result.original_language;
                            if (result.flag == 'en') {
                                result.flag = 'us';
                            };
                            
                            console.log(result);

                            this.found.push(result);

                        };

                    });
    
                });
            }
        }
    },
    mounted() {


    }
});
Vue.config.devtools = true;