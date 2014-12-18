(function (window, Autocomplete) {
    'use strict';

    var $searchForm,
        $searchInput,
        $checkbox,
        $checkboxLabel,
        maxQueryLength,
        lastSearchesText,
        searchQuery,
        searchQueryInCategory,
        meliDomain,
        platformId,
        officialStoreFiltersEnabled,
        officialStoreFilterId,
        siteId,
        genericAditionalInfo;


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
        maxQueryLength = this._options.maxQueryLength || 15;
        lastSearchesText = this._options.lastSearchesText || 'Últimas búsquedas';
        searchQuery = this._options.searchQuery;
        searchQueryInCategory = this._options.searchQueryInCategory;
        meliDomain = this._options.meliDomain || 'meli.domain';
        platformId = this._options.platformId;
        officialStoreFiltersEnabled = this._options.officialStoreFiltersEnabled;
        officialStoreFilterId = this._options.officialStoreFilterId;
        siteId = this._options.siteId || 'MLA';
        genericAditionalInfo = this._options.genericAditionalInfo || 'en todas las Tiendas Oficiales';


        // REDIFINE the Autocomplete _configureShortcuts to fix this issue: https://github.com/mercadolibre/chico/issues/1220
        ch.shortcuts.remove(ch.onkeyenter);
        ch.shortcuts.add(ch.onkeyenter, this.uid, function (event) {
            that._selectSuggestion();
        });


        // Add the last searches queries from the cookies
        this.addLastSearches();


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


        // Crete autosuggest url
        var autosuggestUrl = 'https://api.mercadolibre.com/sites/'+siteIdConverted+'/autosuggest?version=test&showFilters='+officialStoreFiltersEnabled+'&q=';

        // Temp
        autosuggestUrl = 'http://suggestgz.mlapps.com/sites/'+siteIdConverted+'/autosuggest?version=test&showFilters='+officialStoreFiltersEnabled+'&q=';


        this.on('type', function (userInput) {
             $.ajax({
                 'url': autosuggestUrl+userInput,
                 'dataType': 'jsonp',
                 'cache': false,
                 'global': true,
                 'context': this,
                 'crossDomain': true,
                 success: function (data) {
                    this.parseResults(data);
                 }
             });

             this.adecuateCategoryLabel();
        });


        // doQuery when the select event is fire and a suggest y selected
        this.on('select', function (e) {
           this.doQuery({
               element: this._highlighted
           });
        });


        ch.shortcuts.add(ch.onkeydownarrow, this.uid, this.adecuateCategoryLabel);
        ch.shortcuts.add(ch.onkeyuparrow, this.uid, this.adecuateCategoryLabel);

        ch.shortcuts.add(ch.onkeydownarrow, this.uid, this.scrollInToView);
        ch.shortcuts.add(ch.onkeyuparrow, this.uid, this.scrollInToView);

        $searchForm.submit(function (event) {
            event.preventDefault();
            that.doQuery();
        });
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
            if (filterId === filtersArray[i].id) {
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
            queries = results[2].suggested_queries,
            suggestedResults = [],
            suggestedResultsTO = [],
            suggestedQueriesLength = queries.length;

        if (queries === undefined) {
            return;
        }

        var firstQuery = queries[0],
            firstQueryOficialStoreFilter;

        if (firstQuery !== undefined && officialStoreFiltersEnabled === 'true') {

            firstQueryOficialStoreFilter = this.getFilter(firstQuery.filters ,officialStoreFilterId);

            if (firstQueryOficialStoreFilter !== undefined) {
                var filtersLength = firstQueryOficialStoreFilter.values.length;

                for (i = 0; i < filtersLength; i++) {
                    suggestedResultsTO.push('<strong>' + firstQuery.q + '</strong> ' + '<span>'+firstQueryOficialStoreFilter.values[i].name+'</span>');

                };

                // Add the last <li>. It's the generic option tha always appear.
                suggestedResultsTO.push('<strong>' + firstQuery.q + '</strong> ' + '<span>'+genericAditionalInfo+'</span>');

                // Add the official store queries suggested
                this.addOfficialStoreQueries(suggestedResultsTO);
            }

        }

        for (i = 0; i < suggestedQueriesLength; i++) {
            suggestedResults.push(queries[i].q);
        };

        this.suggest(suggestedResults);
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
            this._$lastSearchesQueries = $(this.makeTemplate(lastSearches, lastSearchesText, true)).appendTo(this.$container);
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
            searches;

        // The user hasn't cookies. Esc the function becouse there aren't cookies to set as last searchs.
        if (!isPMSCookie) {
            return false;
        }

        searches = isPMSCookie.replace(/\+/g,' ').split('*')[5].split('|');

        // Check if cookie exist and have word
        if (searches != null && searches[0] !=null && searches[0] != '') {

            // Remove the current querie empty by default of the cookie "" that is set when the browser load de page
            // TESTEAR
            searches.pop();

            var i,
                searchesLength = searches.length;

            for (i = 0; i < searchesLength ; i++) {
                searches[i] = searches[i].substr(1).toLowerCase();
            }

            // Return the searches array
            return searches;
        }

    };


    /**
     * Add the official
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {list}
     * @example
     * Autocomplete.doQuery();
     */
    Autocomplete.prototype.addOfficialStoreQueries = function (officialStoreQueries) {

        if (this._$lastListOficialStore !== undefined) {
            this._$lastListOficialStore.remove();
        }

        // Check if the officialStoreQueries was get from the api
        if (officialStoreQueries !== false) {
            this._$lastListOficialStore = $(this.makeTemplate(officialStoreQueries)).insertAfter($('.ch-popover-content'));
        }

        return this;
    };


    /**
     * Make html template to the list
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {list}
     * @example
     * Autocomplete.doQuery();
     */
    Autocomplete.prototype.makeTemplate = function (searches, title, suggestedToInput) {

        var searchesLength,
            list,
            uri,
            i,
            suggestedInInput = '',
            officialStore = 'official-store';

        searchesLength = searches.length;

        list  = '<div class="aditional-info">';

        if (title !== undefined) {
            list += '<h4 class="aditional-info-title">' + title +'</h4>';
            officialStore = '';
        }

        list += '<ul class="aditional-info-list'+ ' ' +officialStore+'">';

        for (i = 0; i < searchesLength ; i++) {
            try {
                uri = decodeURI(searches[i]);
            } catch (e) {}


            if (suggestedToInput) {
                suggestedInInput = searches[i];
            }

            list += '<li class="ch-autocomplete-item" data-suggested="'+suggestedInInput+'"><a num="'+i+'" href="/'+uri+'" class="aditional-info-item">'+searches[i]+'</a></li>';

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
    Autocomplete.prototype.doQuery = function (tracking) {
        // Saving querys. TODO?: Use trim to remove white spaces:trim($searchInput.val())
        var query = $searchInput.val();

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

        var searchCompleteUrl;


        // Category checked
        if ($checkbox !== null && $checkbox.is(':checked')) {
            searchCompleteUrl = searchQueryInCategory;
        } else {
            searchCompleteUrl = searchQuery;
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

        // Add query to the URL string
        searchCompleteUrl = searchCompleteUrl.replace('$query', encodeURIComponent(query));


        // Tracking
        if (typeof tracking != 'undefined'){
            // Matener el formato de vistas: gallery o listing
            if ($checkbox !== null && $checkbox.is(':checked')) {
                searchCompleteUrl += "#D[C:'']";
            } else {
                searchCompleteUrl = searchCompleteUrl + '#D[A:' + query + ',B:' + tracking.element + ']';
            }
        }

        // Cookies
        console.info('revisar seteo de cookie');
        this.setSearchCookies(query);

        // Redirect
        location.href = searchCompleteUrl;
        console.info(searchCompleteUrl);

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
            // Only if PMS active
            // this.setCookie({
            //     name: 'ml_list',
            //     value: 'searching'
            // });
            this.setCookie({
                name: 'LAST_SEARCH',
                value: query
            });
        } catch(e) {
            // Nothing
        }
    }

}(this, this.ch.Autocomplete));


// TODO: migrate to a vanilla javascript scroll
/*! perfect-scrollbar - v0.5.8
* http://noraesae.github.com/perfect-scrollbar/
* Copyright (c) 2014 Hyunje Alex Jun; Licensed MIT */
(function(e){"use strict";"function"==typeof define&&define.amd?define(["jquery"],e):"object"==typeof exports?e(require("jquery")):e(jQuery)})(function(e){"use strict";function t(e){return"string"==typeof e?parseInt(e,10):~~e}var o={wheelSpeed:1,wheelPropagation:!1,swipePropagation:!0,minScrollbarLength:null,maxScrollbarLength:null,useBothWheelAxes:!1,useKeyboard:!0,suppressScrollX:!1,suppressScrollY:!1,scrollXMarginOffset:0,scrollYMarginOffset:0,includePadding:!1},n=0,r=function(){var e=n++;return function(t){var o=".perfect-scrollbar-"+e;return t===void 0?o:t+o}},l="WebkitAppearance"in document.documentElement.style;e.fn.perfectScrollbar=function(n,i){return this.each(function(){function a(e,o){var n=e+o,r=D-R;j=0>n?0:n>r?r:n;var l=t(j*(Y-D)/(D-R));M.scrollTop(l)}function s(e,o){var n=e+o,r=E-k;W=0>n?0:n>r?r:n;var l=t(W*(C-E)/(E-k));M.scrollLeft(l)}function c(e){return P.minScrollbarLength&&(e=Math.max(e,P.minScrollbarLength)),P.maxScrollbarLength&&(e=Math.min(e,P.maxScrollbarLength)),e}function u(){var e={width:I};e.left=B?M.scrollLeft()+E-C:M.scrollLeft(),N?e.bottom=_-M.scrollTop():e.top=Q+M.scrollTop(),H.css(e);var t={top:M.scrollTop(),height:A};Z?t.right=B?C-M.scrollLeft()-V-J.outerWidth():V-M.scrollLeft():t.left=B?M.scrollLeft()+2*E-C-$-J.outerWidth():$+M.scrollLeft(),G.css(t),U.css({left:W,width:k-z}),J.css({top:j,height:R-et})}function d(){M.removeClass("ps-active-x"),M.removeClass("ps-active-y"),E=P.includePadding?M.innerWidth():M.width(),D=P.includePadding?M.innerHeight():M.height(),C=M.prop("scrollWidth"),Y=M.prop("scrollHeight"),!P.suppressScrollX&&C>E+P.scrollXMarginOffset?(X=!0,I=E-F,k=c(t(I*E/C)),W=t(M.scrollLeft()*(I-k)/(C-E))):(X=!1,k=0,W=0,M.scrollLeft(0)),!P.suppressScrollY&&Y>D+P.scrollYMarginOffset?(O=!0,A=D-tt,R=c(t(A*D/Y)),j=t(M.scrollTop()*(A-R)/(Y-D))):(O=!1,R=0,j=0,M.scrollTop(0)),W>=I-k&&(W=I-k),j>=A-R&&(j=A-R),u(),X&&M.addClass("ps-active-x"),O&&M.addClass("ps-active-y")}function p(){var t,o,n=function(e){s(t,e.pageX-o),d(),e.stopPropagation(),e.preventDefault()},r=function(){H.removeClass("in-scrolling"),e(q).unbind(K("mousemove"),n)};U.bind(K("mousedown"),function(l){o=l.pageX,t=U.position().left,H.addClass("in-scrolling"),e(q).bind(K("mousemove"),n),e(q).one(K("mouseup"),r),l.stopPropagation(),l.preventDefault()}),t=o=null}function f(){var t,o,n=function(e){a(t,e.pageY-o),d(),e.stopPropagation(),e.preventDefault()},r=function(){G.removeClass("in-scrolling"),e(q).unbind(K("mousemove"),n)};J.bind(K("mousedown"),function(l){o=l.pageY,t=J.position().top,G.addClass("in-scrolling"),e(q).bind(K("mousemove"),n),e(q).one(K("mouseup"),r),l.stopPropagation(),l.preventDefault()}),t=o=null}function v(e,t){var o=M.scrollTop();if(0===e){if(!O)return!1;if(0===o&&t>0||o>=Y-D&&0>t)return!P.wheelPropagation}var n=M.scrollLeft();if(0===t){if(!X)return!1;if(0===n&&0>e||n>=C-E&&e>0)return!P.wheelPropagation}return!0}function g(e,t){var o=M.scrollTop(),n=M.scrollLeft(),r=Math.abs(e),l=Math.abs(t);if(l>r){if(0>t&&o===Y-D||t>0&&0===o)return!P.swipePropagation}else if(r>l&&(0>e&&n===C-E||e>0&&0===n))return!P.swipePropagation;return!0}function b(){function e(e){var t=e.originalEvent.deltaX,o=-1*e.originalEvent.deltaY;return(t===void 0||o===void 0)&&(t=-1*e.originalEvent.wheelDeltaX/6,o=e.originalEvent.wheelDeltaY/6),e.originalEvent.deltaMode&&1===e.originalEvent.deltaMode&&(t*=10,o*=10),t!==t&&o!==o&&(t=0,o=e.originalEvent.wheelDelta),[t,o]}function t(t){if(l||!(M.find("select:focus").length>0)){var n=e(t),r=n[0],i=n[1];o=!1,P.useBothWheelAxes?O&&!X?(i?M.scrollTop(M.scrollTop()-i*P.wheelSpeed):M.scrollTop(M.scrollTop()+r*P.wheelSpeed),o=!0):X&&!O&&(r?M.scrollLeft(M.scrollLeft()+r*P.wheelSpeed):M.scrollLeft(M.scrollLeft()-i*P.wheelSpeed),o=!0):(M.scrollTop(M.scrollTop()-i*P.wheelSpeed),M.scrollLeft(M.scrollLeft()+r*P.wheelSpeed)),d(),o=o||v(r,i),o&&(t.stopPropagation(),t.preventDefault())}}var o=!1;window.onwheel!==void 0?M.bind(K("wheel"),t):window.onmousewheel!==void 0&&M.bind(K("mousewheel"),t)}function h(){var t=!1;M.bind(K("mouseenter"),function(){t=!0}),M.bind(K("mouseleave"),function(){t=!1});var o=!1;e(q).bind(K("keydown"),function(n){if((!n.isDefaultPrevented||!n.isDefaultPrevented())&&t){for(var r=document.activeElement?document.activeElement:q.activeElement;r.shadowRoot;)r=r.shadowRoot.activeElement;if(!e(r).is(":input,[contenteditable]")){var l=0,i=0;switch(n.which){case 37:l=-30;break;case 38:i=30;break;case 39:l=30;break;case 40:i=-30;break;case 33:i=90;break;case 32:case 34:i=-90;break;case 35:i=n.ctrlKey?-Y:-D;break;case 36:i=n.ctrlKey?M.scrollTop():D;break;default:return}M.scrollTop(M.scrollTop()-i),M.scrollLeft(M.scrollLeft()+l),o=v(l,i),o&&n.preventDefault()}}})}function w(){function e(e){e.stopPropagation()}J.bind(K("click"),e),G.bind(K("click"),function(e){var o=t(R/2),n=e.pageY-G.offset().top-o,r=D-R,l=n/r;0>l?l=0:l>1&&(l=1),M.scrollTop((Y-D)*l)}),U.bind(K("click"),e),H.bind(K("click"),function(e){var o=t(k/2),n=e.pageX-H.offset().left-o,r=E-k,l=n/r;0>l?l=0:l>1&&(l=1),M.scrollLeft((C-E)*l)})}function m(){function t(){var e=window.getSelection?window.getSelection():document.getSlection?document.getSlection():{rangeCount:0};return 0===e.rangeCount?null:e.getRangeAt(0).commonAncestorContainer}function o(){r||(r=setInterval(function(){return x()?(M.scrollTop(M.scrollTop()+l.top),M.scrollLeft(M.scrollLeft()+l.left),d(),void 0):(clearInterval(r),void 0)},50))}function n(){r&&(clearInterval(r),r=null),H.removeClass("in-scrolling"),G.removeClass("in-scrolling")}var r=null,l={top:0,left:0},i=!1;e(q).bind(K("selectionchange"),function(){e.contains(M[0],t())?i=!0:(i=!1,n())}),e(window).bind(K("mouseup"),function(){i&&(i=!1,n())}),e(window).bind(K("mousemove"),function(e){if(i){var t={x:e.pageX,y:e.pageY},r=M.offset(),a={left:r.left,right:r.left+M.outerWidth(),top:r.top,bottom:r.top+M.outerHeight()};t.x<a.left+3?(l.left=-5,H.addClass("in-scrolling")):t.x>a.right-3?(l.left=5,H.addClass("in-scrolling")):l.left=0,t.y<a.top+3?(l.top=5>a.top+3-t.y?-5:-20,G.addClass("in-scrolling")):t.y>a.bottom-3?(l.top=5>t.y-a.bottom+3?5:20,G.addClass("in-scrolling")):l.top=0,0===l.top&&0===l.left?n():o()}})}function T(t,o){function n(e,t){M.scrollTop(M.scrollTop()-t),M.scrollLeft(M.scrollLeft()-e),d()}function r(){h=!0}function l(){h=!1}function i(e){return e.originalEvent.targetTouches?e.originalEvent.targetTouches[0]:e.originalEvent}function a(e){var t=e.originalEvent;return t.targetTouches&&1===t.targetTouches.length?!0:t.pointerType&&"mouse"!==t.pointerType&&t.pointerType!==t.MSPOINTER_TYPE_MOUSE?!0:!1}function s(e){if(a(e)){w=!0;var t=i(e);p.pageX=t.pageX,p.pageY=t.pageY,f=(new Date).getTime(),null!==b&&clearInterval(b),e.stopPropagation()}}function c(e){if(!h&&w&&a(e)){var t=i(e),o={pageX:t.pageX,pageY:t.pageY},r=o.pageX-p.pageX,l=o.pageY-p.pageY;n(r,l),p=o;var s=(new Date).getTime(),c=s-f;c>0&&(v.x=r/c,v.y=l/c,f=s),g(r,l)&&(e.stopPropagation(),e.preventDefault())}}function u(){!h&&w&&(w=!1,clearInterval(b),b=setInterval(function(){return x()?.01>Math.abs(v.x)&&.01>Math.abs(v.y)?(clearInterval(b),void 0):(n(30*v.x,30*v.y),v.x*=.8,v.y*=.8,void 0):(clearInterval(b),void 0)},10))}var p={},f=0,v={},b=null,h=!1,w=!1;t&&(e(window).bind(K("touchstart"),r),e(window).bind(K("touchend"),l),M.bind(K("touchstart"),s),M.bind(K("touchmove"),c),M.bind(K("touchend"),u)),o&&(window.PointerEvent?(e(window).bind(K("pointerdown"),r),e(window).bind(K("pointerup"),l),M.bind(K("pointerdown"),s),M.bind(K("pointermove"),c),M.bind(K("pointerup"),u)):window.MSPointerEvent&&(e(window).bind(K("MSPointerDown"),r),e(window).bind(K("MSPointerUp"),l),M.bind(K("MSPointerDown"),s),M.bind(K("MSPointerMove"),c),M.bind(K("MSPointerUp"),u)))}function y(){M.bind(K("scroll"),function(){d()})}function L(){M.unbind(K()),e(window).unbind(K()),e(q).unbind(K()),M.data("perfect-scrollbar",null),M.data("perfect-scrollbar-update",null),M.data("perfect-scrollbar-destroy",null),U.remove(),J.remove(),H.remove(),G.remove(),M=H=G=U=J=X=O=E=D=C=Y=k=W=_=N=Q=R=j=V=Z=$=B=K=null}function S(){d(),y(),p(),f(),w(),m(),b(),(ot||nt)&&T(ot,nt),P.useKeyboard&&h(),M.data("perfect-scrollbar",M),M.data("perfect-scrollbar-update",d),M.data("perfect-scrollbar-destroy",L)}var P=e.extend(!0,{},o),M=e(this),x=function(){return!!M};if("object"==typeof n?e.extend(!0,P,n):i=n,"update"===i)return M.data("perfect-scrollbar-update")&&M.data("perfect-scrollbar-update")(),M;if("destroy"===i)return M.data("perfect-scrollbar-destroy")&&M.data("perfect-scrollbar-destroy")(),M;if(M.data("perfect-scrollbar"))return M.data("perfect-scrollbar");M.addClass("ps-container");var E,D,C,Y,X,k,W,I,O,R,j,A,B="rtl"===M.css("direction"),K=r(),q=this.ownerDocument||document,H=e("<div class='ps-scrollbar-x-rail'>").appendTo(M),U=e("<div class='ps-scrollbar-x'>").appendTo(H),_=t(H.css("bottom")),N=_===_,Q=N?null:t(H.css("top")),z=t(H.css("borderLeftWidth"))+t(H.css("borderRightWidth")),F=t(H.css("marginLeft"))+t(H.css("marginRight")),G=e("<div class='ps-scrollbar-y-rail'>").appendTo(M),J=e("<div class='ps-scrollbar-y'>").appendTo(G),V=t(G.css("right")),Z=V===V,$=Z?null:t(G.css("left")),et=t(G.css("borderTopWidth"))+t(G.css("borderBottomWidth")),tt=t(G.css("marginTop"))+t(G.css("marginBottom")),ot="ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch,nt=null!==window.navigator.msMaxTouchPoints;return S(),M})}});