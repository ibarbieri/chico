(function (window, Autocomplete) {
    'use strict';

    var $searchForm,
        $searchInput,
        $checkbox,
        $checkboxLabel,
        maxQueryLength,
        searchQuery,
        searchQueryInCategory,
        currentCategory,
        suggestionsQuantity,
        meliDomain,
        platformId,
        officialStoreFiltersEnabled,
        officialStoreFilterId,
        siteId,
        searchFEStoreParamId,
        messages,
        isMobile,
        position;

    Autocomplete.prototype.autosuggestCache = {};


    /**
     * Init the component
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @example
     * Autocomplete.initialize();
     */
    Autocomplete.prototype.initialize = function () {

        var that = this;

        $searchForm = this._options.searchForm;
        $searchInput = this.$trigger;
        $checkbox = this._options.categoryCheckbox;
        $checkboxLabel = this._options.categoryCheckboxLabel;
        maxQueryLength = this._options.maxQueryLength || 35;
        searchQuery = this._options.searchQuery;
        searchQueryInCategory = this._options.searchQueryInCategory;
        currentCategory = this._options.currentCategory;
        suggestionsQuantity = this._options.suggestionsQuantity || 6;
        meliDomain = this._options.meliDomain || 'meli.domain';
        platformId = this._options.platformId;
        officialStoreFiltersEnabled = this._options.officialStoreFiltersEnabled;
        officialStoreFilterId = this._options.officialStoreFilterId;
        siteId = this._options.siteId || 'MLA';
        isMobile = this._options.isMobile || 'false';
        messages = this._options.messages || {
            'lastSearches': 'Últimas búsquedas',
            'inOfficialStore': 'en tienda oficial',
            'inAllOficialStores': 'en todas las tiendas oficiales'
        };
        position = this._position;


        var searchFEStoreParamIdBySite = {"MLB": "Loja" , "default":"Tienda"};
        searchFEStoreParamId = ((siteId in searchFEStoreParamIdBySite) ? searchFEStoreParamIdBySite[siteId] : searchFEStoreParamIdBySite["default"]);

        this._options.loadingClass = "" //dont show loading icon


        // Add the last searches queries from the cookies
        if (isMobile === 'false' || isMobile === false){
            this.addLastSearches();
        }

        // Converte siteId and PlatformId
        var siteIdConverted;

        function convertSiteAndPlatform (siteId, platformId) {
            var sitePlatformCovertionMap = {
                'MLV:tc': 'TCV',
                'MCO:tc': 'TCC',
                'MLV:tm': 'TMV',
                'MCO:tm': 'TMC',
                'MLV:tl': 'TLV',
                'MCO:tl': 'TLC',
                'MLV:ti': 'TIV',
                'MCO:ti': 'TIC',
                'MLM:ap': 'APM'
            };

            if (sitePlatformCovertionMap[siteId+':'+platformId]) {
                siteIdConverted = sitePlatformCovertionMap[siteId+':'+platformId];
            } else {
                siteIdConverted = siteId;
            }
        }

        convertSiteAndPlatform(siteId, platformId);


        var autosuggestUrl;
        var extraParameters = {};


        if (window.location.href.indexOf('_autosuggest_test') != -1 || window.location.href.indexOf('autosuggest=test') != -1) {
            autosuggestUrl = 'https://api.mercadolibre.com/sites/'+siteIdConverted+'/autosuggest';
            extraParameters["version"]= "test";
        } else if ( window.location.href.indexOf('_autosuggest_nocahe') != -1 || window.location.href.indexOf('autosuggest=nocache') != -1 ) {
            autosuggestUrl = 'https://api.mercadolibre.com/sites/'+siteIdConverted+'/autosuggest';
        } else if (Math.random() < 0.01) { //10% of the traffic direct to webserver, without cache
            autosuggestUrl = 'https://api.mercadolibre.com/sites/'+siteIdConverted+'/autosuggest';
            var date = new Date();
            extraParameters["cacheBypassTimeStamp"] = date.getTime();
        } else {
            autosuggestUrl = 'http://suggestgz.mlapps.com/sites/'+siteIdConverted+'/autosuggest';
        }

        if (officialStoreFiltersEnabled === "true") {
            extraParameters["showFilters"] = true;
        }

        extraParameters["limit"] = suggestionsQuantity;


        // Cache the query and do the ajax request autosuggest
        this.on('type', function (userInput) {
            userInput = this._el.value;

            if (userInput === undefined || userInput === '') {
                return;
            }

            if (userInput in this.autosuggestCache){
                this.parseResults(this.autosuggestCache[userInput]);

            } else {
                extraParameters["q"] = userInput;
                if(isMobile === "true" || isMobile === true){
                    this.doJSONPCall({
                        'url': autosuggestUrl,
                        'data': extraParameters,
                        'jsonp': "callback",
                        'jsonpCallback': "autocomplete.jsonpCallback"
                    });
                } else {
                    $.ajax({
                         'url': autosuggestUrl,
                         'data': extraParameters,
                         'dataType': 'jsonp',
                         'cache': true,
                         'jsonp': "callback",
                         'global': true,
                         'context': this,
                         'crossDomain': true,
                         'jsonpCallback': "autocomplete.jsonpCallback"
                     });
                }
            }

         this.adecuateCategoryLabel();

        });


        // doQuery when the select event is fire and a suggest y selected
        this.on('select', function (e) {
           this.doQuery(this.getSelectedElementMap());
        });


        $searchForm.submit(function (event) {
            event.preventDefault();
            if (typeof that._highlighted === "undefined" || that._highlighted === null ){
                that.doQuery();
            }
        });
    }


    Autocomplete.prototype.convertParamsToUrl = function (params) {
        var response = "?";
        for (var key in params) {
            response += key + "=" + params[key] + "&";
        }
        response = response.substring(0, response.length - 1); //remove last &
        return response;
    }


    //function used for mobile, cause ZEPTO doesnt allow named JSONP callbacks
    Autocomplete.prototype.doJSONPCall = function (options) {

        var script = document.createElement('script'),
            url = options.url + this.convertParamsToUrl(options.data);

        url += "&" + options.jsonp + "=" + options.jsonpCallback;

        script.onerror = function() {
            console.log("error on JSONP call to url:" + url);
        }

        script.src = url

        $('head').append(script);

    }


    Autocomplete.prototype.jsonpCallback = function (data) {
        var jsonResponse = data[2],
            responseQuery = jsonResponse.q;

        this.autosuggestCache[responseQuery] = jsonResponse;

        if (this._el.value === responseQuery) {
            this.parseResults(jsonResponse);
        }
    }


    Autocomplete.prototype.getSelectedElementMap = function () {
        var selectedElementHtml = this.$container[0].querySelectorAll('li')[this._highlighted],
            selectedElementMap;

        if (typeof selectedElementHtml != 'undefined' && selectedElementHtml != null ) {

            var selectedElementHtmlAnchor = selectedElementHtml;

            if (typeof selectedElementHtmlAnchor != 'undefined' && selectedElementHtmlAnchor != null ) {
                selectedElementMap = {
                    selectedIndex: this._highlighted,
                    url: selectedElementHtmlAnchor.getAttribute('data-url'),
                    query: selectedElementHtmlAnchor.getAttribute('data-query')
                }
            }
        }

        if (typeof selectedElementMap === 'undefined'){
            selectedElementMap = {
                selectedIndex: this._highlighted
            }
        }

        return selectedElementMap;
    }


    /**
     * Parse the json and add the results to data array
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @example
     * this.parseResults();
     */
    Autocomplete.prototype.scrollInToView = function () {
        var highlightedElement = document.querySelector('.ch-autocomplete-highlighted');

        if (highlightedElement !== null) {
            highlightedElement.scrollIntoView(false)
        }

    }


    Autocomplete.prototype.getFilter = function (filtersArray, filterId) {
        for (var i = 0; i < filtersArray.length; i++) {
            if (filterId === filtersArray[i].id || "official_store_id" === filtersArray[i].id) { //TODO: delete OR when parameter gets migrated
                return filtersArray[i];
            };
        }
    }


    /**
     * Parse the json and add the results to data array
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @example
     * this.parseResults();
     */
    Autocomplete.prototype.parseResults = function (results) {

        var i,
            queries = results.suggested_queries,
            suggestedResults = [],
            suggestedResultsTO = [],
            suggestedQueriesQtyToShow = queries.length,
            firstQuery = queries[0],
            firstQueryOfficialStoreFilter;

        if (queries === undefined) {
            return;
        }

        if (this._$lastListOficialStore !== undefined) {
            this._$lastListOficialStore.remove();
        }

        if (firstQuery !== undefined && officialStoreFiltersEnabled === "true" && firstQuery.filters !== undefined && firstQuery.filters !== undefined) {

            firstQueryOfficialStoreFilter = this.getFilter(firstQuery.filters ,officialStoreFilterId);

            if (firstQueryOfficialStoreFilter !== undefined) {
                var filtersLength = firstQueryOfficialStoreFilter.values.length;
                for (i = 0; i < filtersLength; i++) {
                    var suggestionMap = {};
                    suggestionMap["query"] = firstQuery.q;
                    if(firstQueryOfficialStoreFilter.values[i].id === "all") {
                        suggestionMap["text"] = firstQuery.q + " " + '<span>'+ messages.inAllOficialStores +'</span>';
                    } else {
                        suggestionMap["text"] = firstQuery.q + " " + '<span>' +messages.inOfficialStore+ " " + firstQueryOfficialStoreFilter.values[i].name+'</span>';
                    }

                    suggestionMap["url"] = this.makeOfficialStoreUrl(firstQuery.q, firstQueryOfficialStoreFilter.values[i].id , firstQueryOfficialStoreFilter.values[i].name)
                    suggestedResultsTO.push(suggestionMap);
                };

                this.addOfficialStoreQueries(suggestedResultsTO);

                if(isMobile === 'false' || isMobile === false){
                    suggestedQueriesQtyToShow = 6;
                } else {
                    suggestedQueriesQtyToShow = 3;
                }
            }
        }

        for (i = 0; i < Math.min(queries.length, suggestedQueriesQtyToShow); i++) {
            suggestedResults.push(queries[i].q);
        };

        this.suggest(suggestedResults);


    }

    /**
     * Make the official store url
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {url}
     * @example
     * this.makeOfficialStoreUrl(firstQuery.q, firstQueryOfficialStoreFilter.values[i].id , firstQueryOfficialStoreFilter.values[i].name);
     */
    Autocomplete.prototype.makeOfficialStoreUrl = function (query , officialStoreId, officialStoreName) {
        var url = searchQuery;
        var officialStoreParamValue,officialStoreParamId;
        url = url.replace('$query', encodeURIComponent(query));

        officialStoreParamId = searchFEStoreParamId;
        if(officialStoreId === "all"){
            officialStoreParamValue = officialStoreId;
        } else {
            officialStoreParamValue = officialStoreName.toLowerCase();
            officialStoreParamValue = officialStoreParamValue.replace(/ /g, '-');
        }

        url += "_" + officialStoreParamId + "_" + officialStoreParamValue;
        return url;
    }


    /**
     * Adds 'last searches' to Autocomplete.
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {Autocomplete}
     * @example
     * Autocomplete.adecuateCategoryLabel();
     */
    Autocomplete.prototype.adecuateCategoryLabel = function () {
        if ($searchInput.val().length > maxQueryLength) {
            $checkboxLabel.addClass('nav-label-small');
        } else {
            $checkboxLabel.removeClass('nav-label-small');
        }

        return this;
    }


    /**
     * Append 'last searches' to input.
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {Autocomplete}
     * @example
     * Autocomplete.addLastSearches();
     */
    Autocomplete.prototype.addLastSearches = function () {
        var lastSearches = this.getLastSearches();

        // Check if the last searches get from the cookie
        if (lastSearches !== false) {
            this._$lastSearchesQueries = $(this.makeTemplate(lastSearches, messages.lastSearches, true)).appendTo(this.$container);
        }

        return this;
    };


    /**
     * Get 'last searches' from cookie.
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {list}
     * @example
     * Autocomplete.getLastSearches();
     */
    Autocomplete.prototype.getLastSearches = function () {

        var isPMSCookie = this.getCookieValue("pmsctx"),
            list,
            plainSearches,
            searchesList = [];

        // The user hasn't cookies. Esc the function becouse there aren't cookies to set as last searchs.
        if (!isPMSCookie) {
            return false;
        }

        plainSearches = isPMSCookie.replace(/\+/g,' ').split('*')[5].split('|');

        // Check if cookie exist and have word
        if (plainSearches != null && plainSearches[0] !=null && plainSearches[0] != '') {

            // Remove the current querie empty by default of the cookie "" that is set when the browser load de page
            // TESTEAR
            plainSearches.pop();

            var i,
                searchesLength = plainSearches.length;

            for (i = 0; i < searchesLength ; i++) {
                try {
                    var searchesMap = {};
                    var queryText = plainSearches[i].substr(1).toLowerCase();
                    var url = searchQuery.replace('$query', encodeURIComponent(queryText));
                    searchesMap["query"] = queryText;
                    searchesMap["text"] = queryText;
                    searchesMap["url"] = url;
                    searchesList[i] = searchesMap;
                }catch (e) {}
            }

            return searchesList;
        }

    };


    /**
     * Add the official
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {list}
     * @example
     */
    Autocomplete.prototype.addOfficialStoreQueries = function (officialStoreQueries) {

        if (officialStoreQueries.length > 0) {
            this._$lastListOficialStore = $(this.makeTemplate(officialStoreQueries)).insertAfter(this.$container.find('.ch-popover-content'));
        }

        return this;
    };


    /**
     * Make html template to the list
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {list}
     * @example
     */
    Autocomplete.prototype.makeTemplate = function (searches, title, suggestedToInput) {

        var searchesLength,
            list,
            uri,
            i,
            suggestedInInput = '',
            officialStore = 'official-store-suggest',
            query,
            text;

        searchesLength = searches.length;

        list  = '<div class="aditional-info">';

        if (title !== undefined) {
            list += '<h4 class="aditional-info-title">' + title +'</h4>';
            officialStore = '';
        }

        list += '<ul class="aditional-info-list'+ ' ' +officialStore+'">';

        for (i = 0; i < searchesLength ; i++) {
            try {
                uri = searches[i].url;  // TODO: ver si hay que encodearla
                query = searches[i].query; // TODO: ver si hay que decodearla
                text = searches[i].text; // TODO: ver si hay que decodearla
                if (suggestedToInput) {
                    suggestedInInput = searches[i].query;
                }

                list += '<li class="ch-autocomplete-item" data-suggested="'+suggestedInInput+'" num="'+i+'" data-query="' + query + '" data-url="' + uri + '" class="aditional-info-item">'+text+'</li>';
            } catch (e) {}
        }

        list += '</ul></div>';

        return list;
    };


    /**
     * Do query
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {list}
     * @example
     * Autocomplete.doQuery();
     */
    Autocomplete.prototype.doQuery = function (selectedElement) {
        // Saving querys. TODO?: Use trim to remove white spaces:trim($searchInput.val())
        var searchCompleteUrl,query;

        if(typeof selectedElement != 'undefined' && selectedElement != null && typeof selectedElement.url != 'undefined' && selectedElement.url != null){
            query = selectedElement.query;
            searchCompleteUrl = selectedElement.url;
        } else {
            query = $searchInput.val();
            // Naturalization the query
            if (query && query.length > 0) {
                query = this.naturalization({
                    string: query,
                    replace: ' ',
                    replacement: '-'
                });
            } else {
                // Focus when submit (valid en IE)
                $searchInput.focus();
                return false;
            }


            // Category checked
            if ($checkbox !== null && $checkbox.is(':checked')) {
                searchCompleteUrl = searchQueryInCategory;
            } else {
                searchCompleteUrl = searchQuery;
            }

            // Add query to the URL string
            searchCompleteUrl = searchCompleteUrl.replace('$query', encodeURIComponent(query));
        }

        // Matener el formato de vistas: gallery o listing
        if (window.location.href.indexOf('_DisplayType_LF') != -1) {
            searchCompleteUrl += "_DisplayType_LF";
        } else {
            searchCompleteUrl += "_DisplayType_G";
        }

        // Adults setting
        if (this.getCookieValue('pr_categ') === 'AD' && searchCompleteUrl.indexOf('_PrCategId_AD') === -1) {
            searchCompleteUrl += '_PrCategId_AD';
        }

        //test navigation
        if        (window.location.href.indexOf('_version_test3') != -1 || window.location.href.indexOf('version=test3') != -1) {
            searchCompleteUrl += '_version_test3';
        } else if (window.location.href.indexOf('_version_test2') != -1 || window.location.href.indexOf('version=test2') != -1) {
            searchCompleteUrl += '_version_test2';
        } else if (window.location.href.indexOf('_version_test') != -1 || window.location.href.indexOf('version=test') != -1) {
            searchCompleteUrl += '_version_test';
        }

        if        (window.location.href.indexOf('_autosuggest_test') != -1 || window.location.href.indexOf('autosuggest=test') != -1) {
            searchCompleteUrl += '_autosuggest_test';
        }

        // Tracking
        if (typeof selectedElement != 'undefined' && selectedElement != null && typeof selectedElement.selectedIndex != 'undefined' && selectedElement.selectedIndex != null){
            if ($checkbox !== null && $checkbox.is(':checked')) {
                searchCompleteUrl += "#D[C:'" + currentCategory + "',B:" + selectedElement.selectedIndex + "]";
            } else {
                searchCompleteUrl += "#D[A:" + query + ",B:" + selectedElement.selectedIndex + "]";
            }
        } else {
            if ($checkbox !== null && $checkbox.is(':checked')) {
                searchCompleteUrl += "#D[C:'" + currentCategory + "']";
            } else {
                searchCompleteUrl += "#D[A:" + query + "]";
            }
        }


        // Cookies
        this.setSearchCookies(query);

        // Redirect
        location.href = searchCompleteUrl;

        return this;
    };


    /**
     * Naturalize query
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {list}
     * @example
     * Autocomplete.naturalization();
     */
    Autocomplete.prototype.naturalization = function (conf) {
        var query = conf.string.toLowerCase(),
            replace = conf.replace,
            replacement = conf.replacement;

        while (query.toString().indexOf(replace) != -1){
            query = query.toString().replace(replace,replacement);
        }
        return query;
    }


    /**
     * Get the cookie from the user browser
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {cookie}
     * @example
     * Autocomplete.getCookieValue();
     */
    Autocomplete.prototype.getCookieValue = function (name) {

        var start = document.cookie.indexOf(name + "="),
            len = start + name.length + 1,
            end = document.cookie.indexOf(";", len);

        if (start == -1) {
            return null;
        }

        if (end == -1) {
            end = document.cookie.length;
        }

        return unescape(document.cookie.substring(len, end));
    }


    /**
     * Set the cookie to the user browser
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @example
     * Autocomplete.setCookie();
     */
    Autocomplete.prototype.setCookie = function (config) {

        var domain = meliDomain,
            today,
            expire;

        config.path = config.path || '/';

        if (config.days !== undefined) {

            today = new Date();
            expire = new Date();

            if (config.days === undefined || config.days === 0) {
                config.days = 1;
            }

            expire.setTime(today.getTime() + 3600000 * 24 * config.days);
            document.cookie = config.name + '=' + config.value + ';path=' + config.path + ';domain=.' + domain + ';expires=' + expire.toGMTString();

        } else {
            document.cookie = config.name + '=' + config.value + ';path=' + config.path + ';domain=.' + domain;
        }
    }


    /**
     * Set the cookie context
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @example
     * Autocomplete.setContextCookie();
     */
    Autocomplete.prototype.setContextCookie = function (val) {
        url = urlPms + "/jm/PmsPixel?ck=" + val;

        var pixelDiv = document.getElementById("pmspxl");

        if (pixelDiv != null) {
            pixelDiv.innerHTML = "<img width=0 height=0 src='" + url + "'>";
        }
    }


    /**
     * Set the search cookie
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @example
     * Autocomplete.setSearchCookies();
     */
    Autocomplete.prototype.setSearchCookies = function (query) {
        try {
            this.setCookie({
                name: 'LAST_SEARCH',
                value: query
            });
        } catch(e) {
            // Nothing
        }
    }

}(this, this.ch.Autocomplete));