(function (window, Autocomplete) {
    'use strict';

    /**
     * Adds 'last searches' to Autocomplete.
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {Autocomplete}
     * @example
     * // Add last searches
     * Autocomplete.addLastSearches();
     */
    Autocomplete.prototype.addLastSearches = function () {
        
        var lastSearches;

        lastSearches = this.getLastSearches();

        this.$container.append(lastSearches);
        
        return this;
    };


    Autocomplete.prototype.getLastSearches = function () {
        
        var searches = '',
            list = '',
            isPMSCookie;

        isPMSCookie = this.getCookieValue("pmsctx");

        if (isPMSCookie) {
            var i,
                len,
                searches = isPMSCookie.replace(/\+/g,' ').split('*')[5].split('|'),
                text;

                //chequeo que la Cookie ademas de existir tenga palabrass
                if (searches != null && searches[0] !=null && searches[0] != '') {
                    searches.pop();
                    
                    list  = '<div class="last-searches">';
                    // list += '<h4 class="last-searches-title">' + settings.suggest.txt.lastSearch +'</h4>';
                    list += '<h4 class="last-searches-title">' + 'ultimas busquedas' +'</h4>';
                    list += '<ul class="last-searches-list">';

                    len = searches.length;
                    for (i = 0; i < len ; i++) {
                        text = searches[i];
                        text = text.substring(1,text.length).toLowerCase();

                        try {
                            text = decodeURI(text);
                        } catch (e) {}

                        list += '<li><a num="'+i+'" href="/'+text+'" class="last-searches-item">'+text+'</a></li>';
                    }

                    list += '</ul></div>';
                }
        }

        return list;
    };


    Autocomplete.prototype.getCookieValue = function (name) {
    
        var start=document.cookie.indexOf(name+"="),
        len=start+name.length+1;
        if (start == -1){
            return null;
        }
        var end=document.cookie.indexOf(";",len);
        if (end==-1){
            end=document.cookie.length;
        }
        return unescape(document.cookie.substring(len,end));
    }


    

}(this, this.ch.Autocomplete));
