var app = new Vue({
    el: '#root',
    data: {
        search: '',
        found: []
    },
    methods: {
        searching: function() {

            this.search = document.getElementById('searchInput').value;
            this.search = this.search.replace(/ /g,'+');

            // reset
            this.found = [];

            if (this.search != '') {
                axios
                .get('https://api.themoviedb.org/3/search/multi?api_key=74414cb486bec78c348850cbf8bf2fc4&language=it-IT&query=' + this.search)
                .then((got) => {
    
                    got.data.results.forEach((result) => {

                        if (result.media_type == 'movie' || result.media_type == 'tv') {

                            // Definisco le stelle
                            result.stars = Math.floor(result.vote_average / 2) + 1;
    
                            // Trasformo la lingua in una nazione per essere coerente con le icone di https://www.countryflags.io
                            result.flag = result.original_language;
                            switch (result.flag) {
                                case 'en':
                                    result.flag = 'us';
                                    break;
                                case 'da':
                                    result.flag = 'dk';
                                    break;
                                case 'el':
                                    result.flag = 'gr';
                                    break;
                            };
    
                            this.found.push(result);
    
                            console.log(result);

                        }

                    });
    
                });
            }
        }
    },
    mounted() {


    }
});
Vue.config.devtools = true;