(function (window, Autocomplete) {

    'use strict';

    var searchForm,
        searchInput,
        checkbox,
        checkboxLabel,
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
        position,
        siteIdConverted,
        scrollTopAnimateItem = 0,
        lastHighlighted = -1,
        lastInteration = undefined,
        currentIteration = undefined,
        suggestionTypes = {
            plain_query : "plain",
            store_query : "storequery",
            last_search : "last"
        },
        mouseOverActive,
        autosuggestCache = {};


    /**
     * Init the component
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @example
     * Autocomplete.initialize();
     */
    Autocomplete.prototype.initialize = function () {

        var that = this,
            searchFEStoreParamIdBySite;

        searchForm = this._options.searchForm;
        searchInput = this.$trigger;
        checkbox = this._options.categoryCheckbox;
        checkboxLabel = this._options.categoryCheckboxLabel;
        maxQueryLength = this._options.maxQueryLength || 35;
        searchQuery = this._options.searchQuery;
        searchQueryInCategory = this._options.searchQueryInCategory;
        currentCategory = this._options.currentCategory;
        suggestionsQuantity = this._options.suggestionsQuantity || 6;
        meliDomain = this._options.meliDomain || 'meli.domain';
        platformId = this._options.platformId;
        officialStoreFiltersEnabled = this._options.officialStoreFiltersEnabled;
        officialStoreFilterId = this._options.officialStoreFilterId || "official_store";
        siteId = this._options.siteId || 'MLA';
        isMobile = this._options.isMobile || 'false';
        messages = this._options.messages || {
            'lastSearches': 'Últimas búsquedas',
            'inOfficialStore': 'en tienda oficial',
            'inAllOficialStores': 'en todas las ',
            'officalStoreName': 'tiendas oficiales'
        };
        position = this._position;


        searchFEStoreParamIdBySite = {
            "MLB": "Loja" ,
            "default":"Tienda"
        }

        searchFEStoreParamId = ((siteId in searchFEStoreParamIdBySite) ? searchFEStoreParamIdBySite[siteId] : searchFEStoreParamIdBySite["default"]);


        // Dont show loading icon
        this._options.loadingClass = "";


        // Redifine the Autocomplete _configureShortcuts to fix this issue: https://github.com/mercadolibre/chico/issues/1220
        ch.shortcuts.remove(ch.onkeyenter);
        ch.shortcuts.add(ch.onkeyenter, this.uid, function (event) {
            that.doQuery(that.getSelectedElementMap());
        });


        // Add the last searches queries from the cookies
        if (isMobile === 'false' || isMobile === false){
            this.addLastSearches();
        }


        /**
         * Convert the siteId and platformId for each country in tc, tm, tl, ap.
         * @function
         * @example
         * convertSiteAndPlatform('MLA', ${searchContext.platform});
         */
        function convertSiteAndPlatform (siteId, platformId) {

            platformId = platformId.toUpperCase();

            var sitePlatformCovertionMap = {
                'MLV:TC': 'TCV',
                'MCO:TC': 'TCC',
                'MLV:TM': 'TMV',
                'MCO:TM': 'TMC',
                'MLV:TL': 'TLV',
                'MCO:TL': 'TLC',
                'MLV:TI': 'TIV',
                'MCO:TI': 'TIC',
                'MLM:AP': 'APM'
            };

            if (sitePlatformCovertionMap[siteId+':'+platformId]) {
                siteIdConverted = sitePlatformCovertionMap[siteId+':'+platformId];
            } else {
                siteIdConverted = siteId;
            }
        }

        convertSiteAndPlatform(siteId, platformId);


        // Cache the query and do the ajax request autosuggest
        this.on('type', function (userInput) {
            this.doSuggest(userInput);
        });


        // Do the query when the select event is fire and a suggest y selected
        this.on('select', function () {
            this.doQuery(this.getSelectedElementMap());
        });


        // Add arrows shorcuts
        ch.shortcuts.add(ch.onkeydownarrow, this.uid, this.adecuateCategoryLabel);
        ch.shortcuts.add(ch.onkeyuparrow, this.uid, this.adecuateCategoryLabel);

        ch.shortcuts.add(ch.onkeydownarrow, this.uid, function(e){that.scrollInToView.call(that, e.type)});
        ch.shortcuts.add(ch.onkeyuparrow, this.uid, function(e){that.scrollInToView.call(that, e.type)});


        // Submit the searcj query
        searchForm.submit(function (event) {
            event.preventDefault();
            if (typeof that._highlighted === "undefined" || that._highlighted === null ){
                that.doQuery();
            }
        });


        // Do suggest when the user press down or rigth arrow
        searchForm.keydown(function (ev) {
            // 40 arrow down
            if (ev.keyCode === 40 && !that._popover.isShown()) {
                that.doSuggest("");

            // 39 arrow rigth
            } else if (ev.keyCode === 39 && that._popover.isShown()){
                that.doSuggest("");
            }
        });
    };


    /**
     * Recives the user input text, create the urls (dev / prod enviroment) for the ajax call, fire the ajax call and get the jsonp response
     * of the API with the suggestions.
     * @function
     * @param {String} User write text in search input.
     * @example
     * this.doSuggest(userInput);
     */
    Autocomplete.prototype.doSuggest = function (userInput) {

        var autosuggestUrl,
            extraParameters = {};

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

        userInput = this._el.value;

        if (userInput === undefined || userInput === '') {
            return;
        }

        if (userInput in autosuggestCache){
            this.parseResults(autosuggestCache[userInput]);

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
        this.resetScroll();
    };


    /**
     * Reset the scroll of the scroleable content in the autocomplete component.
     * @function
     * @example
     * this.resetScroll();
     */
    Autocomplete.prototype.resetScroll = function () {
        var scrollableContent = document.querySelector('.ch-popover-content');

        if (scrollableContent) {
            scrollableContent.scrollTop = 0;
            scrollTopAnimateItem = 0;
        }
    };


    /**
     * Convert params yo url
     * @function
     * @param {String} Params in the browser url
     * @example
     * this.convertParamsToUrl(options.data);
     * @returns {response}
     */
    Autocomplete.prototype.convertParamsToUrl = function (params) {
        var response = "?";

        for (var key in params) {
            response += key + "=" + params[key] + "&";
        }

        //remove last &
        response = response.substring(0, response.length - 1);
        return response;
    };


    /**
     * Function used for mobile, cause ZEPTO doesnt allow named JSONP callbacks
     * @function
     * @param {Object} Options object
     * @example
     * this.doJSONPCall({
            'url': autosuggestUrl,
            'data': extraParameters,
            'jsonp': "callback",
            'jsonpCallback': "autocomplete.jsonpCallback"
        });
     */
    Autocomplete.prototype.doJSONPCall = function (options) {

        var script = document.createElement('script'),
            url = options.url + this.convertParamsToUrl(options.data),
            head = $('head');

        url += "&" + options.jsonp + "=" + options.jsonpCallback;

        script.onerror = function() {
            console.log("error on JSONP call to url:" + url);
        }

        script.src = url;

        head.append(script);
    };


    /**
     * Callback of the ajax in the doSuggest function.
     * @function
     * @param {Object} Data from the suggest API.
     * @example
     * autocomplete.jsonpCallback
     */
    Autocomplete.prototype.jsonpCallback = function (data) {
        var jsonResponse = data[2],
            responseQuery = jsonResponse.q;

        autosuggestCache[responseQuery] = jsonResponse;

        if (this._el.value === responseQuery) {
            this.parseResults(jsonResponse);
        }
    };


    /**
     * Get the atributes of the selected suggestion and put it in a object.
     * @function
     * @example
     * this.doQuery(this.getSelectedElementMap());
     * @returns {selectedElementMap}
     */
    Autocomplete.prototype.getSelectedElementMap = function () {
        var selectedElementHtml = this.$container[0].querySelectorAll('li')[this._highlighted],
            selectedElementMap,
            selectedElementHtmlAnchor;

        if (typeof selectedElementHtml != 'undefined' && selectedElementHtml != null ) {

            selectedElementHtmlAnchor = selectedElementHtml;

            if (typeof selectedElementHtmlAnchor != 'undefined' && selectedElementHtmlAnchor != null ) {
                selectedElementMap = {
                    selectedIndex: this._highlighted,
                    url: selectedElementHtmlAnchor.getAttribute('data-url'),
                    query: selectedElementHtmlAnchor.getAttribute('data-query'),
                    positionInBlock: selectedElementHtmlAnchor.getAttribute('num'),
                    sugType: selectedElementHtmlAnchor.getAttribute('data-sug-type')
                }
            }
        }

        if (typeof selectedElementMap === 'undefined'){
            selectedElementMap = {
                selectedIndex: this._highlighted
            };
        }

        return selectedElementMap;
    };


    /**
     * Overwrite the _highlightSuggestion function of Chico to fix an issue.
     */
    Autocomplete.prototype._highlightSuggestion = function ($target) {
       var $suggestion = $target.attr('aria-posinset') ? $target : $target.parents('li[aria-posinset]');

       this._highlighted = ($suggestion[0] !== undefined) ? (parseInt($suggestion.attr('aria-posinset'), 10) - 1) : this._highlighted;

       this._toogleHighlighted();

       return this;
   };


    /**
     * Add class highlighted to the suggestions on mouse over or on key arrow / down
     * @param {String}
     * @function
     * @example
     * that.scrollInToView.call(that, e.type);
     */
    Autocomplete.prototype.scrollInToView = function (eventType) {

        var acPopoverContent = document.querySelector('.ch-popover-content'),
            highlightedElement = document.querySelector('.ch-autocomplete-highlighted'),
            acAutocompleteList = $('.ch-autocomplete-list'),
            acAutocompleteListLi = document.querySelectorAll('.ch-autocomplete-list li'),
            acPopoverContent = $('.ch-popover-content');


        if (eventType === 'up_arrow' && lastHighlighted === 0) {
            this.$container[0].querySelector('ul').children[this._highlighted].className = 'ch-autocomplete-item ';
            this._highlighted = null;

        } else if (eventType === 'up_arrow' && this._highlighted === acAutocompleteListLi.length -1) {
            scrollTopAnimateItem = acAutocompleteList.height() - acPopoverContent.height() + 8;
            acPopoverContent.scrollTop = scrollTopAnimateItem;
        }


        if (highlightedElement) {
            var highlightedElementTopPosition = highlightedElement.getBoundingClientRect().top - 52,
                highlightedElementBottomPosition = highlightedElement.getBoundingClientRect().bottom - 52,
                autocompleteHeigth = acPopoverContent.height(),
                autocompleteListHeigth = acAutocompleteList.height(),
                autocompleteItems = acAutocompleteListLi.length,
                currentItem = highlightedElement.getAttribute('aria-posinset');

            if (highlightedElementBottomPosition > autocompleteHeigth && currentItem <= autocompleteItems) {
                scrollTopAnimateItem += 31;
                acPopoverContent.scrollTop = scrollTopAnimateItem;

            } else if (highlightedElementTopPosition < 0) {
                scrollTopAnimateItem -= 31;
                acPopoverContent.scrollTop = scrollTopAnimateItem;
            }

        } else {
            acPopoverContent.scrollTop = 0;
            scrollTopAnimateItem = 0;
        }

        lastHighlighted = this._highlighted;

        mouseOverActive = false;
        acPopoverContent.css('pointer-events', 'none');

        $(document).on('mousemove', function(e){
            if(mouseOverActive === false){
                mouseOverActive = true;
                acPopoverContent.css('pointer-events', 'auto');
            }
        });

    };


    /**
     * Add class highlighted to the suggestions on mouse over or on key arrow / down
     * @param {Object} Filters queries of jsonp response in ajax call
     * @param {Object} Filters id of jsonp response in ajax call
     * @function
     * @example
     * this.getFilter(firstQuery.filters ,officialStoreFilterId);
     * @returns {filtersArray[i]}
     */
    Autocomplete.prototype.getFilter = function (filtersArray, filterId) {
        for (var i = 0; i < filtersArray.length; i++) {
            //TODO: delete OR when parameter gets migrated
            if (filterId === filtersArray[i].id || "official_store_id" === filtersArray[i].id) {
                return filtersArray[i];
            }
        }
    };


    /**
     * Parse the jsonp, make and add the results
     * @param {Object} results object with all the seggestions in json format
     * @function
     * @example
     * this.parseResults(jsonResponse);
     */
    Autocomplete.prototype.parseResults = function (results) {

        var i,
            queries = results.suggested_queries,
            suggestedResults = [],
            suggestedResultsTO = [],
            suggestedQueriesQtyToShow = queries.length,
            firstQuery = queries[0],
            firstQueryOfficialStoreFilter,
            acList = $('.ch-autocomplete-list'),
            acScrollBar = $('.ps-scrollbar-y-rail');

        if (queries === undefined) {
            return;
        }

        // Reset the scroll
        acList.css('top', '0px');
        acScrollBar.css('top', '0px');


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
                        suggestionMap["text"] = firstQuery.q + " " + '<span>'+ messages.inAllOficialStores +' </span>' + "<span class='store-name'>" + messages.officalStoreName +'</span>';
                    } else {
                        suggestionMap["text"] = firstQuery.q + " " + '<span>'+ messages.inOfficialStore+ ' </span>' + "<span class='store-name'>" + firstQueryOfficialStoreFilter.values[i].name + '</span>';
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

        if (this.isShown()) {
            document.querySelector('.ch-popover-content').scrollTop = 0;
            scrollTopAnimateItem = 0;
        }

    };


    /**
     * Make the official store url to do the search request
     * @param {STring} query
     * @param {String} officialStoreId
     * @param {String} officialStoreName
     * @function
     * @returns {url}
     * @example
     * this.makeOfficialStoreUrl(firstQuery.q, firstQueryOfficialStoreFilter.values[i].id , firstQueryOfficialStoreFilter.values[i].name);
     */
    Autocomplete.prototype.makeOfficialStoreUrl = function (query, officialStoreId, officialStoreName) {
        var url = searchQuery,
            officialStoreParamValue,
            officialStoreParamId;

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
    };


    /**
     * Add or remove the description "Buscar solo en..." in checkbox.
     * @function
     * @returns {this}
     * @example
     * this.adecuateCategoryLabel();
     */
    Autocomplete.prototype.adecuateCategoryLabel = function () {

        if (searchInput.val().length > maxQueryLength) {
            checkboxLabel.addClass('nav-label-small');

        } else {
            checkboxLabel.removeClass('nav-label-small');
        }

        return this;
    };


    /**
     * Append 'last searches' to the autocomplete component.
     * @function
     * @returns {this}
     * @example
     * this.addLastSearches();
     */
    Autocomplete.prototype.addLastSearches = function () {
        var lastSearches = this.getLastSearches();

        // Check if the last searches get from the cookie
        if (typeof lastSearches != 'undefined' && lastSearches != null && lastSearches !== false && lastSearches.length > 0) {
            this._$lastSearchesQueries = $(this.makeTemplate(lastSearches, suggestionTypes.last_search, messages.lastSearches, true)).appendTo(this.$container);
        }

        return this;
    };


    /**
     * Get 'last searches' from cookie.
     * @function
     * @returns {searchesList}
     * @example
     * this.getLastSearches();
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
                    var searchesMap = {},
                        queryText = plainSearches[i].substr(1).toLowerCase(),
                        url = searchQuery.replace('$query', encodeURIComponent(queryText));

                    searchesMap["query"] = queryText;
                    searchesMap["text"] = queryText;
                    searchesMap["url"] = url;
                    searchesList[i] = searchesMap;

                } catch (e) {}
            }

            return searchesList;
        }

    };


    /**
     * Add the official queries to the autocomplete component.
     * @param {Object} oficial store queries.
     * @function
     * @returns {this}
     * @example
     * this.addOfficialStoreQueries(suggestedResultsTO);
     */
    Autocomplete.prototype.addOfficialStoreQueries = function (officialStoreQueries) {

        if (typeof officialStoreQueries != 'undefined' && officialStoreQueries != null && officialStoreQueries.length > 0) {
            this._$lastListOficialStore = $(this.makeTemplate(officialStoreQueries,suggestionTypes.store_query)).insertAfter(this.$container.find('.ch-popover-content'));
        }

        return this;
    };


    /**
     * Make html template list that create the autocomplete component.
     * @param {Object} searches
     * @param {String} sugType
     * @param {String} title
     * @param {String} suggested to input
     * @function
     * @returns {list}
     * @example
     * this.makeTemplate(officialStoreQueries,suggestionTypes.store_query)
     */
    Autocomplete.prototype.makeTemplate = function (searches, sugType, title, suggestedToInput) {

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
                uri = searches[i].url;
                query = searches[i].query;
                text = searches[i].text;

                if (suggestedToInput || title === undefined) {
                    suggestedInInput = searches[i].query;
                }

                list += '<li class="ch-autocomplete-item" data-suggested="'+suggestedInInput+'" num="'+i+'" data-sug-type="' + sugType + '" data-query="' + query + '" data-url="' + uri + '" class="aditional-info-item">'+text+'</li>';
            } catch (e) {}
        }

        list += '</ul></div>';

        return list;
    };


    /**
     * Naturalization and do query to search the input word.
     * @param {Object} selected element
     * @function
     * @returns {list}
     * @example
     * this.doQuery(this.getSelectedElementMap());
     */
    Autocomplete.prototype.doQuery = function (selectedElement) {
        // Saving querys. TODO?: Use trim to remove white spaces:trim(searchInput.val())
        var searchCompleteUrl,
            query;

        if (typeof selectedElement != 'undefined' && selectedElement != null && typeof selectedElement.url != 'undefined' && selectedElement.url != null){
            query = selectedElement.query;
            searchCompleteUrl = selectedElement.url;

        } else {
            query = searchInput.val();

            // Naturalization the query
            if (query && query.length > 0) {
                query = this.naturalization({
                    string: query,
                    replace: ' ',
                    replacement: '-'
                });
            } else {
                // Focus when submit (valid en IE)
                searchInput.focus();
                return false;
            }


            // Category checked
            if (checkbox !== null && checkbox.is(':checked')) {
                searchCompleteUrl = searchQueryInCategory;
            } else {
                searchCompleteUrl = searchQuery;
            }

            // Add query to the URL string
            searchCompleteUrl = searchCompleteUrl.replace('$query', encodeURIComponent(query));
        }

        // Keep format of view: gallery or listing
        if (window.location.href.indexOf('_DisplayType_LF') != -1) {
            searchCompleteUrl += "_DisplayType_LF";
        } else if (window.location.href.indexOf('_DisplayType_G') != -1) {
            searchCompleteUrl += "_DisplayType_G";
        }

        // Adults setting
        if (this.getCookieValue('pr_categ') === 'AD' && searchCompleteUrl.indexOf('_PrCategId_AD') === -1) {
            searchCompleteUrl += '_PrCategId_AD';
        }

        // Test navigation
        if (window.location.href.indexOf('_version_test3') != -1 || window.location.href.indexOf('version=test3') != -1) {
            searchCompleteUrl += '_version_test3';
        } else if (window.location.href.indexOf('_version_test2') != -1 || window.location.href.indexOf('version=test2') != -1) {
            searchCompleteUrl += '_version_test2';
        } else if (window.location.href.indexOf('_version_test') != -1 || window.location.href.indexOf('version=test') != -1) {
            searchCompleteUrl += '_version_test';
        }

        if (window.location.href.indexOf('_autosuggest_test') != -1 || window.location.href.indexOf('autosuggest=test') != -1) {
            searchCompleteUrl += '_autosuggest_test';
        }

        searchCompleteUrl += this.makeTrackingHash(selectedElement , checkbox , query);

        this.setSearchCookies(query);

        location.href = searchCompleteUrl;

        return this;
    };


    /**
     * Add the traking hash to the search url
     * @param {Object} selected element
     * @param {Object} category checkBox
     * @param {String} query
     * @function
     * @returns {hashString}
     * @example
     * this.makeTrackingHash(selectedElement , checkbox , query);
     */
    Autocomplete.prototype.makeTrackingHash = function (selectedElement, categoryCheckBox, query) {

        var trackingList = [],
            selectedIndex,
            posInBlock,
            sugType,
            trackingMapAsString,
            hashString;

        if (typeof selectedElement != 'undefined' && selectedElement != null){
            selectedIndex = selectedElement.selectedIndex;
            posInBlock = selectedElement.positionInBlock;
            sugType = selectedElement.sugType;
        }

        if (typeof query != 'undefined' && query != null){
            trackingList.push ("A:" + query);
        }

        if (typeof sugType != 'undefined' && sugType != null && typeof posInBlock != 'undefined' && posInBlock != null){
            if (sugType === suggestionTypes.last_search){
                trackingList.push ("L:" + posInBlock);
            }
            if (sugType === suggestionTypes.store_query){
                trackingList.push ("T:" + posInBlock);
            }
        } else {
            if (typeof selectedIndex != 'undefined' && selectedIndex != null){
                trackingList.push ("B:" + selectedIndex);
            }
            if (categoryCheckBox !== null && categoryCheckBox.is(':checked') && typeof currentCategory != 'undefined' && currentCategory != null && currentCategory !== '') {  // category chbx + stores not supported
                trackingList.push ("C:" + currentCategory);
            }
        }

        trackingMapAsString = trackingList.join();

        hashString = "#D[" + trackingMapAsString + "]";

        return hashString
    };


    /**
     * Naturalize query
     * @param {Object} conf
     * @function
     * @returns {query}
     * @example
     * this.naturalization({string: query, replace: ' ', replacement: '-'});
     */
    Autocomplete.prototype.naturalization = function (conf) {
        var query = conf.string.toLowerCase(),
            replace = conf.replace,
            replacement = conf.replacement;

        while (query.toString().indexOf(replace) != -1){
            query = query.toString().replace(replace,replacement);
        }
        return query;
    };


    /**
     * Get the cookie from the user browser
     * @param {String} name
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
    };


    /**
     * Set the cookie to the user browser
     * @param {Object} config
     * @function
     * @example
     * this.setCookie({ name: 'LAST_SEARCH', value: query });
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
    };


    /**
     * Set the cookie context
     * @param {String} val
     * @function
     * @example
     * Autocomplete.setContextCookie();
     */
    Autocomplete.prototype.setContextCookie = function (val) {
        var url = urlPms + "/jm/PmsPixel?ck=" + val,
            pixelDiv = document.getElementById("pmspxl");

        if (pixelDiv != null) {
            pixelDiv.innerHTML = "<img width=0 height=0 src='" + url + "'>";
        }
    };


    /**
     * Set the search cookie
     * @param {String} query
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
    };

}(this, this.ch.Autocomplete));