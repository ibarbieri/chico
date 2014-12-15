/*!
 * Chico UI v1.1.1
 * http://chico-ui.com.ar/
 *
 * Copyright (c) 2014, MercadoLibre.com
 * Released under the MIT license.
 * http://chico-ui.com.ar/license
 */


(function (window, $) {
	'use strict';

var ac = {},

        /**
         * Reference to the window jQuery or Zepto Selector.
         * @private
         * @type {(jQuerySelector | ZeptoSelector)}
         */
        $window = $(window),

        /**
         * Reference to the navigator object.
         * @private
         * @type {Object}
         */
        navigator = window.navigator,

        /**
         * Reference to the userAgent.
         * @private
         * @type {String}
         */
        userAgent = navigator.userAgent,

        /**
         * Reference to the HTMLDocument.
         * @private
         * @type {Object}
         */
        document = window.document,

        /**
         * Reference to the document jQuery or Zepto Selector.
         * @private
         * @type {(jQuerySelector | ZeptoSelector)}
         */
        $document = $(document),

        /**
         * Reference to the HTMLBodyElement.
         * @private
         * @type {HTMLBodyElement}
         */
        body = document.body,

        /**
         * Reference to the body jQuery or Zepto Selector.
         * @private
         * @type {(jQuerySelector | ZeptoSelector)}
         */
        $body = $(body),

        /**
         * Reference to the HTMLhtmlElement.
         * @private
         * @type {HTMLhtmlElement}
         */
        html = document.getElementsByTagName('html')[0],

        /**
         * Reference to the html jQuery or Zepto Selector.
         * @private
         * @type {(jQuerySelector | ZeptoSelector)}
         */
        $html = $(html),

        /**
         * Reference to the Object Contructor.
         * @private
         * @constructor
         */
        Object = window.Object,

        /**
         * Reference to the Array Contructor.
         * @private
         * @constructor
         */
        Array = window.Array,

        /**
         * Reference to the vendor prefix of the current browser.
         * @constant
         * @private
         * @type {String}
         * @link http://lea.verou.me/2009/02/find-the-vendor-prefix-of-the-current-browser
         */
        VENDOR_PREFIX = (function () {

            var regex = /^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/,
                styleDeclaration = document.getElementsByTagName('script')[0].style,
                prop;

            for (prop in styleDeclaration) {
                if (regex.test(prop)) {
                    return prop.match(regex)[0].toLowerCase();
                }
            }

            // Nothing found so far? Webkit does not enumerate over the CSS properties of the style object.
            // However (prop in style) returns the correct value, so we'll have to test for
            // the precence of a specific property
            if ('WebkitOpacity' in styleDeclaration) { return 'webkit'; }
            if ('KhtmlOpacity' in styleDeclaration) { return 'khtml'; }

            return '';
        }());
ac.util = {

        /**
         * Returns true if an object is an array, false if it is not.
         * @param {Object} obj The object to be checked.
         * @returns {Boolean}
         * @example
         * ac.util.isArray([1, 2, 3]); // true
         */
        'isArray': (function () {
            if (typeof Array.isArray === 'function') {
                return Array.isArray;
            }

            return function (obj) {
                if (obj === undefined) {
                    throw new Error('"ac.util.isArray(obj)": It must receive a parameter.');
                }

                return (Object.prototype.toString.call(obj) === '[object Array]');
            };
        }()),

        /**
         * Checks if the url given is right to load content.
         * @param {String} url The url to be checked.
         * @returns {Boolean}
         * @example
         * ac.util.isUrl('www.chico-ui.com.ar'); // true
         */
        'isUrl': function (url) {
            if (url === undefined || typeof url !== 'string') {
                return false;
            }

            /*
            # RegExp

            https://github.com/mercadolibre/chico/issues/579#issuecomment-5206670

            ```javascript
            1   1.1                        1.2   1.3  1.4       1.5       1.6                   2                      3               4                    5
            /^(((https|http|ftp|file):\/\/)|www\.|\.\/|(\.\.\/)+|(\/{1,2})|(\d{1,3}\.){3}\d{1,3})(((\w+|-)(\.?)(\/?))+)(\:\d{1,5}){0,1}(((\w+|-)(\.?)(\/?))+)((\?)(\w+=(\w?)+(&?))+)?$/
            ```

            ## Description
            1. Checks for the start of the URL
                1. if starts with a protocols followed by :// Example: file://chico
                2. if start with www followed by . (dot) Example: www.chico
                3. if starts with ./
                4. if starts with ../ and can repeat one or more times
                5. if start with double slash // Example: //chico.server
                6. if start with an ip address
            2. Checks the domain
              letters, dash followed by a dot or by a slash. All this group can repeat one or more times
            3. Ports
             Zero or one time
            4. Idem to point two
            5. QueryString pairs

            ## Allowed URLs
            1. http://www.mercadolibre.com
            2. http://mercadolibre.com/
            3. http://mercadolibre.com:8080?hola=
            4. http://mercadolibre.com/pepe
            5. http://localhost:2020
            6. http://192.168.1.1
            7. http://192.168.1.1:9090
            8. www.mercadolibre.com
            9. /mercadolibre
            10. /mercadolibre/mercado
            11. /tooltip?siteId=MLA&categId=1744&buyingMode=buy_it_now&listingTypeId=bronze
            12. ./pepe
            13. ../../mercado/
            14. www.mercadolibre.com?siteId=MLA&categId=1744&buyingMode=buy_it_now&listingTypeId=bronze
            15. www.mercado-libre.com
            16. http://ui.ml.com:8080/ajax.html

            ## Forbiden URLs
            1. http://
            2. http://www&
            3. http://hola=
            4. /../../mercado/
            5. /mercado/../pepe
            6. mercadolibre.com
            7. mercado/mercado
            8. localhost:8080/mercadolibre
            9. pepe/../pepe.html
            10. /pepe/../pepe.html
            11. 192.168.1.1
            12. localhost:8080/pepe
            13. localhost:80-80
            14. www.mercadolibre.com?siteId=MLA&categId=1744&buyi ngMode=buy_it_now&listingTypeId=bronze
            15. `<asd src="www.mercadolibre.com">`
            16. Mercadolibre.................
            17. /laksjdlkasjd../
            18. /..pepe..
            19. /pepe..
            20. pepe:/
            21. /:pepe
            22. dadadas.pepe
            23. qdasdasda
            24. http://ui.ml.com:8080:8080/ajax.html
            */
            return ((/^(((https|http|ftp|file):\/\/)|www\.|\.\/|(\.\.\/)+|(\/{1,2})|(\d{1,3}\.){3}\d{1,3})(((\w+|-)(\.?)(\/?))+)(\:\d{1,5}){0,1}(((\w+|-)(\.?)(\/?)(#?))+)((\?)(\w+=(\w?)+(&?))+)?(\w+#\w+)?$/).test(url));
        },

        /**
         * Determines if a specified element is an instance of $.
         * @param {Object} $el The element to be checked as instance of $.
         * @returns {Boolean}
         * @example
         * ac.util.is$($('element')); // true
         */
        'is$': (function () {
            if ($.zepto === undefined) {
                return function ($el) {
                    return $el instanceof $;
                };
            } else {
                return function ($el) {
                    return $.zepto.isZ($el);
                };
            }
        }()),

        /**
         * Adds CSS rules to disable text selection highlighting.
         * @param {...jQuerySelector} jQuery or Zepto Selector to disable text selection highlighting.
         * @example
         * ac.util.avoidTextSelection($(selector));
         */
        'avoidTextSelection': function () {
            var args = arguments,
                len = arguments.length,
                i = 0;

            if (arguments.length < 1) {
                throw new Error('"ac.util.avoidTextSelection(selector);": The selector parameter is required.');
            }

            for (i; i < len; i += 1) {

                if (!(args[i] instanceof $ || $.zepto.isZ(args[i]))) {
                    throw new Error('"ac.util.avoidTextSelection(selector);": The parameter must be a jQuery or Zepto selector.');
                }

                if ($html.hasClass('lt-ie10')) {
                    args[i].attr('unselectable', 'on');

                } else {
                    args[i].addClass('ac-user-no-select');
                }

            }
        },

        /**
         * Gives the final used values of all the CSS properties of an element.
         * @param {HTMLElement} el The HTMLElement for which to get the computed style.
         * @param {string} prop The name of the CSS property to test.
         * @returns {CSSStyleDeclaration}
         * @link http://www.quirksmode.org/dom/getstyles.html
         * @example
         * ac.util.getStyles(HTMLElement, 'color'); // true
         */
        'getStyles': function (el, prop) {

            if (el === undefined || !(el.nodeType === 1)) {
                throw new Error('"ac.util.getStyles(el, prop)": The "el" parameter is required and must be a HTMLElement.');
            }

            if (prop === undefined || typeof prop !== 'string') {
                throw new Error('"ac.util.getStyles(el, prop)": The "prop" parameter is required and must be a string.');
            }

            if (window.getComputedStyle) {
                return window.getComputedStyle(el, "").getPropertyValue(prop);
            // IE
            } else {
                // Turn style name into camel notation
                prop = prop.replace(/\-(\w)/g, function (str, $1) { return $1.toUpperCase(); });
                return el.currentStyle[prop];
            }
        },

        /**
         * Returns a shallow-copied clone of the object.
         * @param {Object} obj The object to copy.
         * @returns {Object}
         * @example
         * ac.util.clone(object);
         */
        'clone': function (obj) {
            if (obj === undefined || typeof obj !== 'object') {
                throw new Error('"ac.util.clone(obj)": The "obj" parameter is required and must be a object.');
            }

            var copy = {},
                prop;

            for (prop in obj) {
                if (obj[prop] !== undefined) {
                    copy[prop] = obj[prop];
                }
            }

            return copy;
        },

        /**
         * Inherits the prototype methods from one constructor into another. The parent will be accessible through the obj.super property.
         * @param {Function} obj The object that have new members.
         * @param {Function} superConstructor The construsctor Class.
         * @returns {Object}
         * @exampleDescription
         * @example
         * ac.util.inherit(obj, parent);
         */
        'inherits': function (obj, superConstructor) {

            if (obj === undefined || typeof obj !== 'function') {
                throw new Error('"ac.util.inherits(obj, superConstructor)": The "obj" parameter is required and must be a constructor function.');
            }

            if (superConstructor === undefined || typeof superConstructor !== 'function') {
                throw new Error('"ac.util.inherits(obj, superConstructor)": The "superConstructor" parameter is required and must be a constructor function.');
            }

            var child = obj.prototype || {};
            obj.prototype = $.extend(child, superConstructor.prototype);

            return superConstructor.prototype;
        },

        /**
         * Prevent default actions of a given event.
         * @param {Event} event The event ot be prevented.
         * @returns {Object}
         * @example
         * ac.util.prevent(event);
         */
        prevent: function (event) {
            if (typeof event === 'object') {
                event.preventDefault();
            }
        },

        /**
         * Get the current vertical and horizontal positions of the scroll bar.
         * @returns {Object}
         * @example
         * ac.util.getScroll();
         */
        'getScroll': function () {
            return {
                'left': window.pageXOffset || document.documentElement.scrollLeft || 0,
                'top': window.pageYOffset || document.documentElement.scrollTop || 0
            };
        },

        /**
         * Get the current outer dimensions of an element.
         * @param {HTMLElement} el A given HTMLElement.
         * @returns {Object}
         * @example
         * ac.util.getOuterDimensions(el);
         */
        'getOuterDimensions': function (el) {
            var obj = el.getBoundingClientRect();

            return {
                'width': (obj.right - obj.left),
                'height': (obj.bottom - obj.top)
            };
        },

        /**
         * Get the current offset of an element.
         * @param {HTMLElement} el A given HTMLElement.
         * @returns {Object}
         * @example
         * ac.util.getOffset(el);
         */
        'getOffset': function (el) {

            var rect = el.getBoundingClientRect(),
                fixedParent = ac.util.getPositionedParent(el, 'fixed'),
                scroll = ac.util.getScroll(),
                offset = {
                    'left': rect.left,
                    'top': rect.top
                };

            if (ac.util.getStyles(el, 'position') !== 'fixed' && fixedParent === null) {
                offset.left += scroll.left;
                offset.top += scroll.top;
            }

            return offset;
        },

        /**
         * Get the current parentNode with the given position.
         * @param {HTMLElement} el A given HTMLElement.
         * @param {String} position A given position (static, relative, fixed or absolute).
         * @returns {HTMLElement}
         * @example
         * ac.util.getPositionedParent(el, 'fixed');
         */
        'getPositionedParent': function (el, position) {
            var currentParent = el.offsetParent,
                parent;

            while (parent === undefined) {

                if (currentParent === null) {
                    parent = null;
                    break;
                }

                if (ac.util.getStyles(currentParent, 'position') !== position) {
                    currentParent = currentParent.offsetParent;
                } else {
                    parent = currentParent;
                }

            };

            return parent;
        },

        /**
         * Reference to the vendor prefix of the current browser.
         * @constant
         * @memberof ac.util
         * @type {String}
         * @link http://lea.verou.me/2009/02/find-the-vendor-prefix-of-the-current-browser
         * @example
         * ac.util.VENDOR_PREFIX === 'webkit';
         */
        'VENDOR_PREFIX': (function () {

            var regex = /^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/,
                styleDeclaration = document.getElementsByTagName('script')[0].style,
                prop;

            for (prop in styleDeclaration) {
                if (regex.test(prop)) {
                    return prop.match(regex)[0].toLowerCase();
                }
            }

            // Nothing found so far? Webkit does not enumerate over the CSS properties of the style object.
            // However (prop in style) returns the correct value, so we'll have to test for
            // the precence of a specific property
            if ('WebkitOpacity' in styleDeclaration) { return 'webkit'; }
            if ('KhtmlOpacity' in styleDeclaration) { return 'khtml'; }

            return '';
        }()),

        /**
         * zIndex values.
         * @type {Number}
         * @example
         * ac.util.zIndex += 1;
         */
        'zIndex': 1000
    };
ac.util.fixLabels = function () {
        var labels = document.getElementsByTagName('label'),
            target_id,
            el,
            i = 0;

        function labelTap() {
            el = document.getElementById(this.getAttribute('for'));
            if (['radio', 'checkbox'].indexOf(el.getAttribute('type')) !== -1) {
                el.setAttribute('selected', !el.getAttribute('selected'));
            } else {
                el.focus();
            }
        }

        for (; labels[i]; i += 1) {
            if (labels[i].getAttribute('for')) {
                $(labels[i]).on(ac.onpointertap, labelTap);
            }
        }
    };

    /**
     * Cancel pointers if the user scroll.
     * @name cancelPointerOnScroll
     * @memberof ac.util
     */
    ac.util.cancelPointerOnScroll = function () {
        $document.on('touchmove', function () {
            ac.pointerCanceled = true;

            $document.one('touchend', function () {
                ac.pointerCanceled = false;
            });
        });
    };

    /*!
     * MBP - Mobile boilerplate helper functions
     * @name MBP
     * @memberof ac.util
     * @namespace
     * @see View on <a href="https://github.com/h5bp/mobile-boilerplate" target="_blank">https://github.com/h5bp/mobile-boilerplate</a>
     */
    ac.util.MBP = {

        // Fix for iPhone viewport scale bug
        // http://www.blog.highub.com/mobile-2/a-fix-for-iphone-viewport-scale-bug/
        'viewportmeta': $('meta[name=viewport]'),

        'gestureStart': function () {
            ac.util.MBP.viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
        },

        'scaleFix': function () {
            if (ac.util.MBP.viewportmeta && /iPhone|iPad|iPod/.test(userAgent) && !/Opera Mini/.test(userAgent)) {
                ac.util.MBP.viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0';
                document.addEventListener('gesturestart', ac.util.MBP.gestureStart, false);
            }
        },

        /*
        * Normalized hide address bar for iOS & Android
        * (c) Scott Jehl, scottjehl.com
        * MIT License
        */
        // If we cache this we don't need to re-calibrate everytime we call
        // the hide url bar
        'BODY_SCROLL_TOP': false,

        // It should be up to the mobile
        'hideUrlBar': function () {
            // if there is a hash, or MBP.BODY_SCROLL_TOP hasn't been set yet, wait till that happens
            if (!window.location.hash && ac.util.MBP.BODY_SCROLL_TOP !== false) {
                window.scrollTo( 0, ac.util.MBP.BODY_SCROLL_TOP === 1 ? 0 : 1 );
            }
        },

        'hideUrlBarOnLoad': function () {
            // If there's a hash, or addEventListener is undefined, stop here
            if( !window.location.hash && window.addEventListener ) {

                var scrollTop = ac.util.getScroll().top;

                //scroll to 1
                window.scrollTo(0, 1);
                ac.util.MBP.BODY_SCROLL_TOP = 1;

                //reset to 0 on bodyready, if needed
                var bodycheck = setInterval(function () {
                    if(body) {
                        clearInterval(bodycheck);
                        ac.util.MBP.BODY_SCROLL_TOP = scrollTop;
                        ac.util.MBP.hideUrlBar();
                    }
                }, 15 );

                window.addEventListener('load', function() {
                    setTimeout(function () {
                        //at load, if user hasn't scrolled more than 20 or so...
                        if(scrollTop < 20) {
                            //reset to hide addr bar at onload
                            ac.util.MBP.hideUrlBar();
                        }
                    }, 0);
                });
            }
        },

        // Prevent iOS from zooming onfocus
        // https://github.com/h5bp/mobile-boilerplate/pull/108
        'preventZoom': function () {
            var formFields = $('input, select, textarea'),
                contentString = 'width=device-width,initial-scale=1,maximum-scale=',
                i = 0;

            for (; i < formFields.length; i += 1) {

                formFields[i].onfocus = function() {
                    ac.util.MBP.viewportmeta.content = contentString + '1';
                };

                formFields[i].onblur = function () {
                    ac.util.MBP.viewportmeta.content = contentString + '10';
                };
            }
        }
    };
ac.support = {

        /**
         * Verify that CSS Transitions are supported (or any of its browser-specific implementations).
         * @type {Boolean}
         * @link http://gist.github.com/373874
         * @example
         * if (ac.support.transition) {
         *     // Some code here!
         * }
         */
        'transition': body.style.WebkitTransition !== undefined || body.style.MozTransition !== undefined || body.style.MSTransition !== undefined || body.style.OTransition !== undefined || body.style.transition !== undefined,

        /**
         * Checks if the $ library has fx methods.
         * @type {Boolean}
         * @example
         * if (ac.support.fx) {
         *     // Some code here!
         * }
         */
        'fx': !!$.fn.slideDown,

        /**
         * Checks if the User Agent support touch events.
         * @type {Boolean}
         * @example
         * if (ac.support.touch) {
         *     // Some code here!
         * }
         */
        'touch': 'createTouch' in document
    };
ac.onlayoutchange = 'layoutchange';

    /**
     * Equivalent to 'resize'.
     * @constant
     * @memberof ch
     * @type {String}
     */
    ac.onresize = 'resize';

    /**
     * Equivalent to 'scroll'.
     * @constant
     * @memberof ch
     * @type {String}
     */
    ac.onscroll = 'scroll';

    /**
     * Equivalent to 'touchstart' or 'mousedown', depending on device capabilities.
     * @constant
     * @memberof ch
     * @type {String}
     * @link http://www.w3.org/TR/2013/WD-pointerevents-20130115/#dfn-pointerdown | Pointer Events W3C Working Draft
     */
    ac.onpointerdown = (ac.support.touch) ? 'touchstart' : 'mousedown';

    /**
     * Equivalent to 'touchend' or 'mouseup', depending on device capabilities.
     * @constant
     * @memberof ch
     * @type {String}
     * @link http://www.w3.org/TR/2013/WD-pointerevents-20130115/#dfn-pointerup | Pointer Events W3C Working Draft
     */
    ac.onpointerup = (ac.support.touch) ? 'touchend' : 'mouseup';

    /**
     * Equivalent to 'touchmove' or 'mousemove', depending on device capabilities.
     * @constant
     * @memberof ch
     * @type {String}
     * @link http://www.w3.org/TR/2013/WD-pointerevents-20130115/#dfn-pointermove | Pointer Events W3C Working Draft
     */
    ac.onpointermove = (ac.support.touch) ? 'touchmove' : 'mousemove';

    /**
     * Equivalent to 'touchend' or 'click', depending on device capabilities.
     * @constant
     * @memberof ch
     * @type {String}
     * @link http://www.w3.org/TR/2013/WD-pointerevents-20130115/#list-of-pointer-events | Pointer Events W3C Working Draft
     */
    ac.onpointertap = (ac.support.touch) ? 'touchend' : 'click';

    /**
     * Equivalent to 'touchstart' or 'mouseenter', depending on device capabilities.
     * @constant
     * @memberof ch
     * @type {String}
     * @link http://www.w3.org/TR/2013/WD-pointerevents-20130115/#dfn-pointerenter | Pointer Events W3C Working Draft
     */
    ac.onpointerenter = (ac.support.touch) ? 'touchstart' : 'mouseenter';

    /**
     * Equivalent to 'touchend' or 'mouseleave', depending on device capabilities.
     * @constant
     * @memberof ch
     * @type {String}
     * @link http://www.w3.org/TR/2013/WD-pointerevents-20130115/#dfn-pointerleave | Pointer Events W3C Working Draft
     */
    ac.onpointerleave = (ac.support.touch) ? 'touchend' : 'mouseleave';

    /**
     * Alphanumeric keys event.
     * @constant
     * @memberof ch
     * @type {String}
     */
    ac.onkeyinput = ('oninput' in document.createElement('input')) ? 'input' : 'keydown';
ac.factory = function (Klass, fn) {
        /**
         * Identification of the constructor, in lowercases.
         * @type {String}
         */
        var name = Klass.prototype.name,

            /**
             * Reference to the class name. When it's a preset, take its constructor name via the "preset" property.
             * @type {String}
             */
            constructorName = Klass.prototype._preset || name;

        /**
         * The class constructor exposed directly into the "ch" namespace.
         * @exampleDescription Creating a component instance by specifying a query selector and a configuration object.
         * @example
         * ac.Component($('#example'), {
         *     'key': 'value'
         * });
         */
        // Uses the function.name property (non-standard) on the newest browsers OR
        // uppercases the first letter from the identification name of the constructor
        ac[(name.charAt(0).toUpperCase() + name.substr(1))] = Klass;

        /**
         * The class constructor exposed into the "$" namespace.
         * @ignore
         * @exampleDescription Creating a component instance by specifying a query selector and a configuration object.
         * @example
         * $.component($('#example'), {
         *     'key': 'value'
         * });
         * @exampleDescription Creating a component instance by specifying only a query selector. The default options of each component will be used.
         * @example
         * $.component($('#example')});
         * @exampleDescription Creating a component instance by specifying only a cofiguration object. It only works on compatible components, when those doesn't depends on a element to be created.
         * @example
         * $.component({
         *     'key': 'value'
         * });
         * @exampleDescription Creating a component instance by no specifying parameters. It only works on compatible components, when those doesn't depends on a element to be created. The default options of each component will be used.
         * @example
         * $.component();
         */
        $[name] = function ($el, options) {
            // Create a new instance of the constructor and return it
            return new Klass($el, options);
        };

        /**
         * The class constructor exposed as a "$" plugin.
         */
        $.fn[name] = function (options) {

            // Collection with each instanced component
            var components = [];

            // Normalize options
            options = (fn !== undefined) ? fn.apply(this, arguments) : options;

            // Analize every match of the main query selector
            $.each(this, function () {
                // Get into the "$" scope
                var $el = $(this),
                    // Try to get the "data" reference to this component related to the element
                    data = $el.data(constructorName);

                // When this component isn't related to the element via data, create a new instance and save
                if (data === undefined) {

                    // Save the reference to this instance into the element data
                    data = new Klass($el, options);
                    $el.data(constructorName, data);

                } else {

                    if (data.emit !== undefined) {
                        data.emit('exist', options);
                    }
                }

                // Add the component reference to the final collection
                components.push(data);

            });

            // Return the instance/instances of components
            return (components.length > 1) ? components : components[0];
        };
    };
    // Remove no-js classname
    $html.removeClass('no-js');

    // Iphone scale fix
    ac.util.MBP.scaleFix();

    // Hide navigation url bar
    ac.util.MBP.hideUrlBarOnLoad();

    // Prevent zoom onfocus
    ac.util.MBP.preventZoom();

    // Fix the broken iPad/iPhone form label click issue
    ac.util.fixLabels();

    // Cancel pointers if the user scroll.
    ac.util.cancelPointerOnScroll();

    // Exposse private $ (Zepto) into ac.$
    ac.$ = $;
	ac.version = '1.1.1';
	window.ac = ac;
}(this, this.$));
(function (ch) {
    'use strict';

    /**
     * Event Emitter Class for the browser.
     * @memberof ch
     * @constructor
     * @returns {Object} Returns a new instance of EventEmitter.
     * @example
     * // Create a new instance of EventEmitter.
     * var emitter = new ac.EventEmitter();
     * @example
     * // Inheriting from EventEmitter.
     * ac.util.inherits(Component, ac.EventEmitter);
     */
    function EventEmitter() {}

    /**
     * Adds a listener to the collection for a specified event.
     * @memberof! ac.EventEmitter.prototype
     * @function
     * @param {String} event The event name to subscribe.
     * @param {Function} listener Listener function.
     * @param {Boolean} once Indicate if a listener function will be called only one time.
     * @returns {component}
     * @example
     * // Will add an event listener to 'ready' event.
     * component.on('ready', listener);
     */
    EventEmitter.prototype.on = function (event, listener, once) {

        if (event === undefined) {
            throw new Error('ac.EventEmitter - "on(event, listener)": It should receive an event.');
        }

        if (listener === undefined) {
            throw new Error('ac.EventEmitter - "on(event, listener)": It should receive a listener function.');
        }

        this._eventsCollection = this._eventsCollection || {};

        listener.once = once || false;

        if (this._eventsCollection[event] === undefined) {
            this._eventsCollection[event] = [];
        }

        this._eventsCollection[event].push(listener);

        return this;
    };

    /**
     * Adds a listener to the collection for a specified event to will execute only once.
     * @memberof! ac.EventEmitter.prototype
     * @function
     * @param {String} event Event name.
     * @param {Function} listener Listener function.
     * @returns {component}
     * @example
     * // Will add an event handler to 'contentLoad' event once.
     * component.once('contentLoad', listener);
     */
    EventEmitter.prototype.once = function (event, listener) {

        this.on(event, listener, true);

        return this;
    };

    /**
     * Removes a listener from the collection for a specified event.
     * @memberof! ac.EventEmitter.prototype
     * @function
     * @param {String} event Event name.
     * @param {Function} listener Listener function.
     * @returns {component}
     * @example
     * // Will remove event listener to 'ready' event.
     * component.off('ready', listener);
     */
    EventEmitter.prototype.off = function (event, listener) {

        if (event === undefined) {
            throw new Error('EventEmitter - "off(event, listener)": It should receive an event.');
        }

        if (listener === undefined) {
            throw new Error('EventEmitter - "off(event, listener)": It should receive a listener function.');
        }

        var listeners = this._eventsCollection[event],
            i = 0,
            len;

        if (listeners !== undefined) {
            len = listeners.length;
            for (i; i < len; i += 1) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        }

        return this;
    };

    /**
     * Returns all listeners from the collection for a specified event.
     * @memberof! ac.EventEmitter.prototype
     * @function
     * @param {String} event The event name.
     * @returns {Array}
     * @example
     * // Returns listeners from 'ready' event.
     * component.getListeners('ready');
     */
    EventEmitter.prototype.getListeners = function (event) {
        if (event === undefined) {
            throw new Error('ac.EventEmitter - "getListeners(event)": It should receive an event.');
        }

        return this._eventsCollection[event];
    };

    /**
     * Execute each item in the listener collection in order with the specified data.
     * @memberof! ac.EventEmitter.prototype
     * @function
     * @param {String} event The name of the event you want to emit.
     * @param {...Object} var_args Data to pass to the listeners.
     * @returns {component}
     * @example
     * // Will emit the 'ready' event with 'param1' and 'param2' as arguments.
     * component.emit('ready', 'param1', 'param2');
     */
    EventEmitter.prototype.emit = function () {

        var args = Array.prototype.slice.call(arguments, 0), // converted to array
            event = args.shift(), // Store and remove events from args
            listeners,
            i = 0,
            len;

        if (event === undefined) {
            throw new Error('ac.EventEmitter - "emit(event)": It should receive an event.');
        }

        if (typeof event === 'string') {
            event = {'type': event};
        }

        if (!event.target) {
            event.target = this;
        }

        if (this._eventsCollection !== undefined && this._eventsCollection[event.type] !== undefined) {
            listeners = this._eventsCollection[event.type];
            len = listeners.length;

            for (i; i < len; i += 1) {
                listeners[i].apply(this, args);

                if (listeners[i].once) {
                    this.off(event.type, listeners[i]);
                    len -= 1;
                    i -= 1;
                }
            }
        }

        return this;
    };

    // Expose EventEmitter
    ac.EventEmitter = EventEmitter;

}(this.ch));
(function ($, ch) {
    'use strict';

    /**
     * Add a function to manage components content.
     * @memberOf ch
     * @mixin
     * @returns {Function}
     */
    function Content() {

        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var that = this,
            defaults = {
                'method': this._options.method,
                'params': this._options.params,
                'cache': this._options.cache,
                'async': this._options.async,
                'waiting': this._options.waiting
            };

        /**
         * Set async content into component's container and emits the current event.
         * @private
         */
        function setAsyncContent(event) {

            that._$content.html(event.response);

            /**
             * Event emitted when the content change.
             * @event ac.Content#contentchange
             * @private
             */
            that.emit('_contentchange');

            /**
             * Event emitted if the content is loaded successfully.
             * @event ac.Content#contentdone
             * @ignore
             */

            /**
             * Event emitted when the content is loading.
             * @event ac.Content#contentwaiting
             * @example
             * // Subscribe to "contentwaiting" event.
             * component.on('contentwaiting', function (event) {
             *     // Some code here!
             * });
             */

            /**
             * Event emitted if the content isn't loaded successfully.
             * @event ac.Content#contenterror
             * @example
             * // Subscribe to "contenterror" event.
             * component.on('contenterror', function (event) {
             *     // Some code here!
             * });
             */

            that.emit('content' + event.status, event);
        }

        /**
         * Set content into component's container and emits the contentdone event.
         * @private
         */
        function setContent(content) {

            that._$content.html(content);

            that._options.cache = true;

            /**
             * Event emitted when the content change.
             * @event ac.Content#contentchange
             * @private
             */
            that.emit('_contentchange');

            /**
             * Event emitted if the content is loaded successfully.
             * @event ac.Content#contentdone
             * @example
             * // Subscribe to "contentdone" event.
             * component.on('contentdone', function (event) {
             *     // Some code here!
             * });
             */
            that.emit('contentdone');
        }

        /**
         * Get async content with given URL.
         * @private
         */
        function getAsyncContent(url, options) {
            // Initial options to be merged with the user's options
            options = $.extend({
                'method': 'GET',
                'params': '',
                'async': true,
                'waiting': '<div class="ac-loading-large"></div>'
            }, options || defaults);

            if (options.cache !== undefined) {
                that._options.cache = options.cache;
            }

            // Set loading
            setAsyncContent({
                'status': 'waiting',
                'response': options.waiting
            });

            // Make async request
            $.ajax({
                'url': url,
                'type': options.method,
                'data': 'x=x' + ((options.params !== '') ? '&' + options.params : ''),
                'cache': that._options.cache,
                'async': options.async,
                'beforeSend': function (jqXHR) {
                    // Set the AJAX default HTTP headers
                    jqXHR.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                },
                'success': function (data) {
                    // Send the result data to the client
                    setAsyncContent({
                        'status': 'done',
                        'response': data
                    });
                },
                'error': function (jqXHR, textStatus, errorThrown) {
                    // Send a defined error message
                    setAsyncContent({
                        'status': 'error',
                        'response': '<p>Error on ajax call.</p>',

                         // Grab all the parameters into a JSON to send to the client
                        'data': {
                            'jqXHR': jqXHR,
                            'textStatus': textStatus,
                            'errorThrown': errorThrown
                        }
                    });
                }
            });
        }

        /**
         * Allows to manage the components content.
         * @function
         * @memberof! ac.Content#
         * @param {(String | jQuerySelector | ZeptoSelector)} content The content that will be used by a component.
         * @param {Object} [options] A custom options to be used with content loaded by ajax.
         * @param {String} [options.method] The type of request ("POST" or "GET") to load content by ajax. Default: "GET".
         * @param {String} [options.params] Params like query string to be sent to the server.
         * @param {Boolean} [options.cache] Force to cache the request by the browser. Default: true.
         * @param {Boolean} [options.async] Force to sent request asynchronously. Default: true.
         * @param {(String | jQuerySelector | ZeptoSelector)} [options.waiting] Temporary content to use while the ajax request is loading.
         * @example
         * // Update content with some string.
         * component.content('Some new content here!');
         * @example
         * // Update content that will be loaded by ajax with custom options.
         * component.content('http://chico-ui.com.ar/ajax', {
         *     'cache': false,
         *     'params': 'x-request=true'
         * });
         */
        this.content = function (content, options) {

            // Returns the last updated content.
            if (content === undefined) {
                return that._$content.html();
            }

            that._options.content = content;

            if (that._options.cache === undefined) {
                that._options.cache = true;
            }

            if (typeof content === 'string') {
                // Case 1: AJAX call
                if (ac.util.isUrl(content)) {
                    getAsyncContent(content, options);
                // Case 2: Plain text
                } else {
                    setContent(content);
                }
            // Case 3: jQuery/Zepto/HTML Element
            } else if (ac.util.is$(content) || content.nodeType !== undefined) {
                setContent($(content).remove(null, true).removeClass('ac-hide'));
            }

            return that;
        };

        // Loads content once. If the cache is disabled the content loads in each show.
        this.once('_show', function () {

            that.content(that._options.content);

            that.on('show', function () {
                if (!that._options.cache) {
                    that.content(that._options.content);
                }
            });
        });
    }

    ac.Content = Content;

}(this.ac.$, this.ch));
(function (ch) {
    'use strict';

    var toggleEffects = {
        'slideDown': 'slideUp',
        'slideUp': 'slideDown',
        'fadeIn': 'fadeOut',
        'fadeOut': 'fadeIn'
    };

    /**
     * The Collapsible class gives to components the ability to shown or hidden its container.
     * @memberOf ch
     * @mixin
     * @returns {Function} Returns a private function.
     */
    function Collapsible() {

        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var that = this,
            triggerClass = 'ac-' + this.name + '-trigger-on',
            fx = this._options.fx,
            useEffects = (ac.support.fx && fx !== 'none' && fx !== false);

        function showCallback() {
            that.$container.removeClass('ac-hide').attr('aria-hidden', 'false');

            /**
             * Event emitted when the componentg is shown.
             * @event ac.Collapsible#show
             * @example
             * // Subscribe to "show" event.
             * collapsible.on('show', function () {
             *     // Some code here!
             * });
             */
            that.emit('show');
        }

        function hideCallback() {
            that.$container.addClass('ac-hide').attr('aria-hidden', 'true');

            /**
             * Event emitted when the component is hidden.
             * @event ac.Collapsible#hide
             * @example
             * // Subscribe to "hide" event.
             * collapsible.on('hide', function () {
             *     // Some code here!
             * });
             */
            that.emit('hide');
        }

        this._shown = false;

        /**
         * Shows the component container.
         * @function
         * @private
         */
        this._show = function () {

            that._shown = true;

            if (that.$trigger !== undefined) {
                that.$trigger.addClass(triggerClass);
            }

            /**
             * Event emitted before the component is shown.
             * @event ac.Collapsible#beforeshow
             * @example
             * // Subscribe to "beforeshow" event.
             * collapsible.on('beforeshow', function () {
             *     // Some code here!
             * });
             */
            that.emit('beforeshow');

            // Animate or not
            if (useEffects) {
                that.$container[fx]('fast', showCallback);
            } else {
                showCallback();
            }

            that.emit('_show');

            return that;
        };

        /**
         * Hides the component container.
         * @function
         * @private
         */
        this._hide = function () {

            that._shown = false;

            if (that.$trigger !== undefined) {
                that.$trigger.removeClass(triggerClass);
            }

            /**
             * Event emitted before the component is hidden.
             * @event ac.Collapsible#beforehide
             * @example
             * // Subscribe to "beforehide" event.
             * collapsible.on('beforehide', function () {
             *     // Some code here!
             * });
             */
            that.emit('beforehide');

            // Animate or not
            if (useEffects) {
                that.$container[toggleEffects[fx]]('fast', hideCallback);
            } else {
                hideCallback();
            }

            return that;
        };

        /**
         * Shows or hides the component.
         * @function
         * @private
         */
        this._toggle = function () {

            if (that._shown) {
                that.hide();
            } else {
                that.show();
            }

            return that;
        };

        this.on('disable', this.hide);
    }

    ac.Collapsible = Collapsible;

}(this.ch));
(function (window, $, ch) {
    'use strict';

    var $window = $(window),
        resized = false,
        scrolled = false,
        requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
        }());

    function update() {

        var eve = (resized ? ac.onresize : ac.onscroll);

        // Refresh viewport
        this.refresh();

        // Change status
        resized = false;
        scrolled = false;

        /**
         * Event emitted when the dimensions of the viewport changes.
         * @event ac.viewport#resize
         * @example
         * ac.viewport.on('resize', function () {
         *     // Some code here!
         * });
         */

        /**
         * Event emitted when the viewport is scrolled.
         * @event ac.viewport#scroll
         * @example
         * ac.viewport.on('scroll', function () {
         *     // Some code here!
         * });
         */

        // Emits the current event
        this.emit(eve);
    }

    /**
     * The Viewport is a component to ease viewport management. You can get the dimensions of the viewport and beyond, which can be quite helpful to perform some checks with JavaScript.
     * @memberof ch
     * @constructor
     * @augments ac.EventEmitter
     * @requires ac.util
     * @returns {viewport} Returns a new instance of Viewport.
     */
    function Viewport() {
        this._init();
    }

    ac.util.inherits(Viewport, ac.EventEmitter);

    /**
     * Initialize a new instance of Viewport.
     * @memberof! ac.Viewport.prototype
     * @function
     * @private
     * @returns {viewport}
     */
    Viewport.prototype._init = function () {

        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var that = this;

        /**
         * Element representing the visible area.
         * @memberof! ac.viewport#element
         * @type {(jQuerySelector | ZeptoSelector)}
         */
        this.$el = $window;

        this.refresh();

        $window
            .on(ac.onresize + '.viewport', function () {
                // No changing, exit
                if (!resized) {
                    resized = true;

                    /**
                     * requestAnimationFrame
                     */
                    requestAnimFrame(function updateResize() {
                        update.call(that);
                    });
                }
            })
            .on(ac.onscroll + '.viewport', function () {
                // No changing, exit
                if (!scrolled) {
                    scrolled = true;

                    /**
                     * requestAnimationFrame
                     */
                    requestAnimFrame(function updateScroll() {
                        update.call(that);
                    });
                }
            });
    };

    /**
     * Calculates/updates the client rects of viewport (in pixels).
     * @memberof! ac.Viewport.prototype
     * @function
     * @returns {viewport}
     * @example
     * // Update the client rects of the viewport.
     * ac.viewport.calculateClientRect();
     */
    Viewport.prototype.calculateClientRect = function () {
        /**
         * The current top client rect of the viewport (in pixels).
         * @public
         * @name ac.Viewport#top
         * @type {Number}
         * @example
         * // Checks if the top client rect of the viewport is equal to 0.
         * (ac.viewport.top === 0) ? 'Yes': 'No';
         */

         /**
         * The current left client rect of the viewport (in pixels).
         * @public
         * @name ac.Viewport#left
         * @type {Number}
         * @example
         * // Checks if the left client rect of the viewport is equal to 0.
         * (ac.viewport.left === 0) ? 'Yes': 'No';
         */
        this.top = this.left = 0;

        /**
         * The current bottom client rect of the viewport (in pixels).
         * @public
         * @name ac.Viewport#bottom
         * @type {Number}
         * @example
         * // Checks if the bottom client rect of the viewport is equal to a number.
         * (ac.viewport.bottom === 900) ? 'Yes': 'No';
         */
        this.bottom = this.$el.height();

        /**
         * The current right client rect of the viewport (in pixels).
         * @public
         * @name ac.Viewport#right
         * @type {Number}
         * @example
         * // Checks if the right client rect of the viewport is equal to a number.
         * (ac.viewport.bottom === 1200) ? 'Yes': 'No';
         */
        this.right = this.$el.width();

        return this;
    };

    /**
     * Calculates/updates the dimensions (width and height) of the viewport (in pixels).
     * @memberof! ac.Viewport.prototype
     * @function
     * @returns {viewport}
     * @example
     * // Update the dimensions values of the viewport.
     * ac.viewport.calculateDimensions();
     */
    Viewport.prototype.calculateDimensions = function () {
        this.calculateClientRect();

        /**
         * The current height of the viewport (in pixels).
         * @public
         * @name ac.Viewport#height
         * @type Number
         * @example
         * // Checks if the height of the viewport is equal to a number.
         * (ac.viewport.height === 700) ? 'Yes': 'No';
         */
        this.height = this.bottom;

        /**
         * The current width of the viewport (in pixels).
         * @public
         * @name ac.Viewport#width
         * @type Number
         * @example
         * // Checks if the height of the viewport is equal to a number.
         * (ac.viewport.width === 1200) ? 'Yes': 'No';
         */
        this.width = this.right;

        return this;
    };

    /**
     * Calculates/updates the viewport position.
     * @memberof! ac.Viewport.prototype
     * @function
     * @returns {viewport}
     * @example
     * // Update the offest values of the viewport.
     * ac.viewport.calculateOffset();
     */
    Viewport.prototype.calculateOffset = function () {

        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var scroll = ac.util.getScroll();

        /**
         * The offset top of the viewport.
         * @memberof! ac.Viewport#offsetTop
         * @type {Number}
         * @example
         * // Checks if the offset top of the viewport is equal to a number.
         * (ac.viewport.offsetTop === 200) ? 'Yes': 'No';
         */
        this.offsetTop = scroll.top;

        /**
         * The offset left of the viewport.
         * @memberof! ac.Viewport#offsetLeft
         * @type {Number}
         * @example
         * // Checks if the offset left of the viewport is equal to a number.
         * (ac.viewport.offsetLeft === 200) ? 'Yes': 'No';
         */
        this.offsetLeft = scroll.left;

        /**
         * The offset right of the viewport.
         * @memberof! ac.Viewport#offsetRight
         * @type {Number}
         * @example
         * // Checks if the offset right of the viewport is equal to a number.
         * (ac.viewport.offsetRight === 200) ? 'Yes': 'No';
         */
        this.offsetRight = this.left + this.width;

        /**
         * The offset bottom of the viewport.
         * @memberof! ac.Viewport#offsetBottom
         * @type {Number}
         * @example
         * // Checks if the offset bottom of the viewport is equal to a number.
         * (ac.viewport.offsetBottom === 200) ? 'Yes': 'No';
         */
        this.offsetBottom = this.offsetTop + this.height;

        return this;
    };

    /**
     * Rertuns/updates the viewport orientation: landscape or portrait.
     * @memberof! ac.Viewport.prototype
     * @function
     * @returns {viewport}
     * @example
     * // Update the dimensions values of the viewport.
     * ac.viewport.calculateDimensions();
     */
    Viewport.prototype.calculateOrientation = function () {
        /** The viewport orientation: landscape or portrait.
         * @memberof! ac.Viewport#orientation
         * @type {String}
         * @example
         * // Checks if the orientation is "landscape".
         * (ac.viewport.orientation === 'landscape') ? 'Yes': 'No';
         */
        this.orientation = (Math.abs(this.$el.orientation) === 90) ? 'landscape' : 'portrait';

        return this;
    };

    /**
     * Calculates if an element is completely located in the viewport.
     * @memberof! ac.Viewport.prototype
     * @function
     * @returns {Boolean}
     * @params {HTMLElement} el A given HMTLElement.
     * @example
     * // Checks if an element is in the viewport.
     * ac.viewport.inViewport(HTMLElement) ? 'Yes': 'No';
     */
    Viewport.prototype.inViewport = function (el) {
        var r = el.getBoundingClientRect();

        return (r.top > 0) && (r.right < this.width) && (r.bottom < this.height) && (r.left > 0);
    };

    /**
     * Calculates if an element is visible in the viewport.
     * @memberof! ac.Viewport.prototype
     * @function
     * @returns {Boolean}
     * @params {HTMLElement} el A given HTMLElement.
     * @example
     * // Checks if an element is visible.
     * ac.viewport.isVisisble(HTMLElement) ? 'Yes': 'No';
     */
    Viewport.prototype.isVisible = function (el) {
        var r = el.getBoundingClientRect();

        return (r.height >= this.offsetTop);
    };

    /**
     * Upadtes the viewport dimension, viewport positions and orietation.
     * @memberof! ac.Viewport.prototype
     * @function
     * @returns {viewport}
     * @example
     * // Refreshs the viewport.
     * ac.viewport.refresh();
     */
    Viewport.prototype.refresh = function () {
        this.calculateDimensions();
        this.calculateOffset();
        this.calculateOrientation();

        return this;
    };

    // Creates an instance of the Viewport into ch namespace.
    ac.viewport = new Viewport();

}(this, this.ac.$, this.ch));
(function (window, $, ch) {
    'use strict';

    /**
     * The Positioner lets you position elements on the screen and changes its positions.
     * @memberof ch
     * @constructor
     * @param {Object} options Configuration object.
     * @param {(jQuerySelector | ZeptoSelector)} options.target Reference to the element to be positioned.
     * @param {(jQuerySelector | ZeptoSelector)} [options.reference] It's a reference to position and size of element that will be considered to carry out the position. If it isn't defined through configuration, it will be the ac.viewport.
     * @param {String} [options.side] The side option where the target element will be positioned. You must use: "left", "right", "top", "bottom" or "center". Default: "center".
     * @param {String} [options.align] The align options where the target element will be positioned. You must use: "left", "right", "top", "bottom" or "center". Default: "center".
     * @param {Number} [options.offsetX] Distance to displace the target horizontally. Default: 0.
     * @param {Number} [options.offsetY] Distance to displace the target vertically. Default: 0.
     * @param {String} [options.position] Thethe type of positioning used. You must use: "absolute" or "fixed". Default: "fixed".
     * @requires ac.util
     * @requires ac.Viewport
     * @returns {positioner} Returns a new instance of Positioner.
     * @example
     * // Instance the Positioner It requires a little configuration.
     * // The default behavior place an element center into the Viewport.
     * var positioned = new ac.Positioner({
     *     'target': $(selector),
     *     'reference': $(selector),
     *     'side': 'top',
     *     'align': 'left',
     *     'offsetX': 20,
     *     'offsetY': 10
     * });
     * @example
     * // offsetX: The Positioner could be configurated with an offsetX.
     * // This example show an element displaced horizontally by 10px of defined position.
     * var positioned = new ac.Positioner({
     *     'target': $(selector),
     *     'reference': $(selector),
     *     'side': 'top',
     *     'align': 'left',
     *     'offsetX': 10
     * });
     * @example
     * // offsetY: The Positioner could be configurated with an offsetY.
     * // This example show an element displaced vertically by 10px of defined position.
     * var positioned = new ac.Positioner({
     *     'target': $(selector),
     *     'reference': $(selector),
     *     'side': 'top',
     *     'align': 'left',
     *     'offsetY': 10
     * });
     * @example
     * // positioned: The positioner could be configured to work with fixed or absolute position value.
     * var positioned = new ac.Positioner({
     *     'target': $(selector),
     *     'reference': $(selector),
     *     'position': 'fixed'
     * });
     */
    function Positioner(options) {

        if (options === undefined) {
            throw new window.Error('ac.Positioner: Expected options defined.');
        }

        // Creates its private options
        this._options = ac.util.clone(this._defaults);

        // Init
        this._configure(options);
    }

    /**
     * The name of the component.
     * @memberof! ac.Positioner.prototype
     * @type {String}
     */
    Positioner.prototype.name = 'positioner';

    /**
     * Returns a reference to the Constructor function that created the instance's prototype.
     * @memberof! ac.Positioner.prototype
     * @function
     * @private
     */
    Positioner.prototype._constructor = Positioner;

    /**
     * Configuration by default.
     * @type {Object}
     * @private
     */
    Positioner.prototype._defaults = {
        'offsetX': 0,
        'offsetY': 0,
        'side': 'center',
        'align': 'center',
        'reference': ac.viewport,
        'position': 'fixed'
    };

    /**
     * Configures the positioner instance with a given options.
     * @memberof! ac.Positioner.prototype
     * @function
     * @private
     * @returns {positioner}
     * @params {Object} options A configuration object.
     */
    Positioner.prototype._configure = function (options) {

        // Merge user options with its options
        $.extend(this._options, options);

        this._options.offsetX = parseInt(this._options.offsetX, 10);
        this._options.offsetY = parseInt(this._options.offsetY, 10);

        /**
         * Reference to the element to be positioned.
         * @type {(jQuerySelector | ZeptoSelector)}
         */
        this.$target = options.target || this.$target;


        /**
         * It's a reference to position and size of element that will be considered to carry out the position.
         * @type {(jQuerySelector | ZeptoSelector)}
         */
        this.$reference = options.reference || this.$reference;
        this._reference = this._options.reference;

        this.$target.css('position', this._options.position);

        return this;
    };

    /**
     * Updates the current position with a given options
     * @memberof! ac.Positioner.prototype
     * @function
     * @returns {positioner}
     * @params {Object} options A configuration object.
     * @example
     * // Updates the current position.
     * positioned.refresh();
     * @example
     * // Updates the current position with new offsetX and offsetY.
     * positioned.refresh({
     *     'offestX': 100,
     *     'offestY': 10
     * });
     */
    Positioner.prototype.refresh = function (options) {

        if (options !== undefined) {
            this._configure(options);
        }

        if (this._reference !== ac.viewport) {
            this._calculateReference();
        }

        this._calculateTarget();

        // the object that stores the top, left reference to set to the target
        this._setPoint();

        return this;
    };

    /**
     * Calculates the reference (element or ac.viewport) of the position.
     * @memberof! ac.Positioner.prototype
     * @function
     * @private
     * @returns {positioner}
     */
    Positioner.prototype._calculateReference = function () {

        var reference = this.$reference[0],
            offset;

        reference.setAttribute('data-side', this._options.side);
        reference.setAttribute('data-align', this._options.align);

        this._reference = ac.util.getOuterDimensions(reference);

        if (reference.offsetParent === this.$target[0].offsetParent) {
            this._reference.left = reference.offsetLeft;
            this._reference.top = reference.offsetTop;

        } else {
            offset = ac.util.getOffset(reference);
            this._reference.left = offset.left;
            this._reference.top = offset.top;
        }

        return this;
    };

    /**
     * Calculates the positioned element.
     * @memberof! ac.Positioner.prototype
     * @function
     * @private
     * @returns {positioner}
     */
    Positioner.prototype._calculateTarget = function () {

        var target = this.$target[0];
        target.setAttribute('data-side', this._options.side);
        target.setAttribute('data-align', this._options.align);

        this._target = ac.util.getOuterDimensions(target);

        return this;
    };

    /**
     * Calculates the points.
     * @memberof! ac.Positioner.prototype
     * @function
     * @private
     * @returns {positioner}
     */
    Positioner.prototype._setPoint = function () {
        var side = this._options.side,
            oritentation = (side === 'top' || side === 'bottom') ? 'horizontal' : ((side === 'right' || side === 'left') ? 'vertical' : 'center'),
            coors,
            oritentationMap;

        // take the side and calculate the alignment and make the CSSpoint
        if (oritentation === 'center') {
            // calculates the coordinates related to the center side to locate the target
            coors = {
                'top': (this._reference.top + (this._reference.height / 2 - this._target.height / 2)),
                'left': (this._reference.left + (this._reference.width / 2 - this._target.width / 2))
            };

        } else if (oritentation === 'horizontal') {
            // calculates the coordinates related to the top or bottom side to locate the target
            oritentationMap = {
                'left': this._reference.left,
                'center': (this._reference.left + (this._reference.width / 2 - this._target.width / 2)),
                'right': (this._reference.left + this._reference.width - this._target.width),
                'top': this._reference.top - this._target.height,
                'bottom': (this._reference.top + this._reference.height)
            };

            coors = {
                'top': oritentationMap[side],
                'left': oritentationMap[this._options.align]
            };

        } else {
            // calculates the coordinates related to the right or left side to locate the target
            oritentationMap = {
                'top': this._reference.top,
                'center': (this._reference.top + (this._reference.height / 2 - this._target.height / 2)),
                'bottom': (this._reference.top + this._reference.height - this._target.height),
                'right': (this._reference.left + this._reference.width),
                'left': (this._reference.left - this._target.width)
            };

            coors = {
                'top': oritentationMap[this._options.align],
                'left': oritentationMap[side]
            };
        }

        coors.top += this._options.offsetY;
        coors.left += this._options.offsetX;

        this.$target.css(coors);

        return this;
    };

    ac.Positioner = Positioner;

}(this, this.ac.$, this.ch));
(function (window, ch) {
    'use strict';

    /**
     * Executes a callback function when the images of a query selection loads.
     * @memberof! ch
     * @param $el An image or a collection of images.
     * @param callback The handler the component will fire after the images loads.
     * @example
     * $('selector').onImagesLoads(function () {
     *     console.log('The size of the loaded image is ' + this.width);
     * });
     */
    function onImagesLoads($el, callback) {

        $el
            .one('load', function () {
                var len = $el.length;

                window.setTimeout(function () {
                    if (--len <= 0) { callback.call($el); }
                }, 200);
            })
            .each(function () {
                // Cached images don't fire load sometimes, so we reset src.
                if (this.complete || this.complete === undefined) {
                    var src = this.src;
                    // Data uri fix bug in web-kit browsers
                    this.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
                    this.src = src;
                }
            });
    }

    ac.onImagesLoads = onImagesLoads;

}(this, this.ch));
(function (window, $, ch) {
    'use strict';

    var util = ac.util,
        uid = 0;

    /**
     * Base class for all components.
     * @memberof ch
     * @constructor
     * @augments ac.EventEmitter
     * @param {(jQuerySelector | ZeptoSelector)} $el jQuery or Zepto Selector.
     * @param {Object} [options] Configuration options.
     * @returns {component} Returns a new instance of Component.
     */
    function Component($el, options) {

        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var that = this;

        this._init($el, options);

        if (this.initialize !== undefined) {
            /**
             * If you define an initialize method, it will be executed when a new Expandable is created.
             * @memberof! ac.Expandable.prototype
             * @function
             */
            this.initialize();
        }

        /**
         * Event emitted when the component is ready to use.
         * @event ac.Component#ready
         * @example
         * // Subscribe to "ready" event.
         * component.on('ready', function () {
         *     // Some code here!
         * });
         */
        window.setTimeout(function () { that.emit('ready'); }, 50);
    }

    ac.util.inherits(Component, ac.EventEmitter);

    /**
     * The name of a component.
     * @memberof! ac.Component.prototype
     * @type {String}
     * @example
     * // You can reach the associated instance.
     * var component = $(selector).data(name);
     */
    Component.prototype.name = 'component';

    /**
     * Returns a reference to the constructor function.
     * @memberof! ac.Component.prototype
     * @function
     */
    Component.prototype.constructor = Component;

    /**
     * Initialize a new instance of Component and merge custom options with defaults options.
     * @memberof! ac.Component.prototype
     * @function
     * @private
     * @returns {component}
     */
    Component.prototype._init = function ($el, options) {

        // Clones defaults or creates a defaults object
        var defaults = (this._defaults) ? util.clone(this._defaults) : {};

        // Clones the defaults options or creates a new object
        if (options === undefined) {
            if ($el === undefined) {
                this._options = defaults;

            } else if (util.is$($el)) {
                this._$el = $el;
                this._el = $el[0];
                this._options = defaults;

            } else if (typeof $el === 'object') {
                options = $el;
                $el = undefined;
                this._options = $.extend(defaults, options);
            }

        } else if (typeof options === 'object') {
            if ($el === undefined) {
                this._options = $.extend(defaults, options);

            } else if (util.is$($el)) {
                this._$el = $el;
                this._el = $el[0];
                this._options = $.extend(defaults, options);
            }

        } else {
            throw new window.Error('Unexpected parameters were found in the \'' + this.name + '\' instantiation.');
        }

        /**
         * A unique id to identify the instance of a component.
         * @type {Number}
         */
        this.uid = (uid += 1);

        /**
         * Indicates if a component is enabled.
         * @type {Boolean}
         * @private
         */
        this._enabled = true;
    };


    /**
     * Adds functionality or abilities from other classes.
     * @memberof! ac.Component.prototype
     * @function
     * @returns {component}
     * @params {...String} var_args The name of the abilities to will be used.
     * @example
     * // You can require some abilitiest to use in your component.
     * // For example you should require the collpasible abitliy.
     * var component = new Component(element, options);
     * component.require('Collapsible');
     */
    Component.prototype.require = function () {

        var arg,
            i = 0,
            len = arguments.length;

        for (i; i < len; i += 1) {
            arg = arguments[i];

            if (this[arg.toLowerCase()] === undefined) {
                ac[arg].call(this);
            }
        }

        return this;
    };

    /**
     * Enables an instance of Component.
     * @memberof! ac.Component.prototype
     * @function
     * @returns {component}
     * @example
     * // Enabling an instance of Component.
     * component.enable();
     */
    Component.prototype.enable = function () {
        this._enabled = true;

        /**
         * Emits when a component is enabled.
         * @event ac.Component#enable
         * @example
         * // Subscribe to "enable" event.
         * component.on('enable', function () {
         *     // Some code here!
         * });
         */
        this.emit('enable');

        return this;
    };

    /**
     * Disables an instance of Component.
     * @memberof! ac.Component.prototype
     * @function
     * @returns {component}
     * @example
     * // Disabling an instance of Component.
     * component.disable();
     */
    Component.prototype.disable = function () {
        this._enabled = false;

        /**
         * Emits when a component is disable.
         * @event ac.Component#disable
         * @example
         * // Subscribe to "disable" event.
         * component.on('disable', function () {
         *     // Some code here!
         * });
         */
        this.emit('disable');

        return this;
    };

    /**
     * Destroys an instance of Component and remove its data from asociated element.
     * @memberof! ac.Component.prototype
     * @function
     * @example
     * // Destroy a component
     * component.destroy();
     * // Empty the component reference
     * component = undefined;
     */
    Component.prototype.destroy = function () {

        this.disable();

        if (this._el !== undefined) {
            this._$el.removeData(this.name);
        }

        /**
         * Emits when a component is destroyed.
         * @event ac.Component#destroy
         * @exampleDescription
         * @example
         * // Subscribe to "destroy" event.
         * component.on('destroy', function () {
         *     // Some code here!
         * });
         */
        this.emit('destroy');

        return;
    };

    ac.Component = Component;

}(this, this.ac.$, this.ch));
(function (window, $, ch) {
    'use strict';

    /**
     * Popover is the basic unit of a dialog window.
     * @memberof ch
     * @constructor
     * @augments ac.Component
     * @mixes ac.Collapsible
     * @mixes ac.Content
     * @requires ac.Positioner
     * @param {(jQuerySelector | ZeptoSelector)} $el A jQuery or Zepto Selector to create an instance of ac.Popover.
     * @param {Object} [options] Options to customize an instance.
     * @param {String} [options.addClass] CSS class names that will be added to the container on the component initialization.
     * @param {String} [options.fx] Enable or disable UI effects. You must use: "slideDown", "fadeIn" or "none". Default: "fadeIn".
     * @param {String} [options.width] Set a width for the container. Default: "auto".
     * @param {String} [options.height] Set a height for the container. Default: "auto".
     * @param {String} [options.shownby] Determines how to interact with the trigger to show the container. You must use: "pointertap", "pointerenter" or "none". Default: "pointertap".
     * @param {String} [options.hiddenby] Determines how to hide the component. You must use: "button", "pointers", "pointerleave", "all" or "none". Default: "button".
     * @param {(jQuerySelector | ZeptoSelector)} [options.reference] It's a reference to position and size of element that will be considered to carry out the position. Default: the trigger element.
     * @param {String} [options.side] The side option where the target element will be positioned. Its value can be: "left", "right", "top", "bottom" or "center". Default: "center".
     * @param {String} [options.align] The align options where the target element will be positioned. Its value can be: "left", "right", "top", "bottom" or "center". Default: "center".
     * @param {Number} [options.offsetX] Distance to displace the target horizontally. Default: 0.
     * @param {Number} [options.offsetY] Distance to displace the target vertically. Default: 0.
     * @param {String} [options.position] The type of positioning used. Its value must be "absolute" or "fixed". Default: "absolute".
     * @param {String} [options.method] The type of request ("POST" or "GET") to load content by ajax. Default: "GET".
     * @param {String} [options.params] Params like query string to be sent to the server.
     * @param {Boolean} [options.cache] Force to cache the request by the browser. Default: true.
     * @param {Boolean} [options.async] Force to sent request asynchronously. Default: true.
     * @param {(String | jQuerySelector | ZeptoSelector)} [options.waiting] Temporary content to use while the ajax request is loading. Default: '&lt;div class="ac-loading ac-loading-centered"&gt;&lt;/div&gt;'.
     * @param {(jQuerySelector | ZeptoSelector | HTMLElement | String)} [options.content] The content to be shown into the Popover container.
     * @returns {popover} Returns a new instance of Popover.
     * @example
     * // Create a new Popover.
     * var popover = new ac.Popover($el, [options]);
     * @example
     * // Create a new Popover with jQuery or Zepto.
     * var popover = $(selector).popover([options]);
     * @example
     * // Create a new Popover with disabled effects.
     * var popover = $(selector).popover({
     *     'fx': 'none'
     * });
     * @example
     * // Create a new Popover using the shorthand way (content as parameter).
     * var popover = $(selector).popover('http://ui.ml.com:3040/ajax');
     */
    function Popover($el, options) {
        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var that = this;

        this._init($el, options);

        if (this.initialize !== undefined) {
            /**
             * If you define an initialize method, it will be executed when a new Popover is created.
             * @memberof! ac.Popover.prototype
             * @function
             */
            this.initialize();
        }

        /**
         * Event emitted when the component is ready to use.
         * @event ac.Popover#ready
         * @example
         * // Subscribe to "ready" event.
         * popover.on('ready', function () {
         *     // Some code here!
         * });
         */
        window.setTimeout(function () { that.emit('ready'); }, 50);
    }

    var $document = $(window.document),
        $body = $('body'),
        // Inheritance
        parent = ac.util.inherits(Popover, ac.Component),
        shownbyEvent = {
            'pointertap': ac.onpointertap,
            'pointerenter': ac.onpointerenter
        };

    /**
     * The name of the component.
     * @memberof! ac.Popover.prototype
     * @type {String}
     * @example
     * // You can reach the associated instance.
     * var popover = $(selector).data('popover');
     */
    Popover.prototype.name = 'popover';

    /**
     * Returns a reference to the constructor function.
     * @memberof! ac.Popover.prototype
     * @function
     */
    Popover.prototype.constructor = Popover;

    /**
     * Configuration by default.
     * @memberof! ac.Popover.prototype
     * @type {Object}
     * @private
     */
    Popover.prototype._defaults = {
        '_ariaRole': 'dialog',
        '_className': '',
        '_hideDelay': 400,
        'addClass': '',
        'fx': 'fadeIn',
        'width': 'auto',
        'height': 'auto',
        'shownby': 'pointertap',
        'hiddenby': 'button',
        'waiting': '<div class="ac-loading ac-loading-centered"></div>',
        'position': 'absolute'
    };

    /**
     * Initialize a new instance of Popover and merge custom options with defaults options.
     * @memberof! ac.Popover.prototype
     * @function
     * @private
     * @returns {popover}
     */
    Popover.prototype._init = function ($el, options) {
        // Call to its parent init method
        parent._init.call(this, $el, options);

        // Require abilities
        this.require('Collapsible', 'Content');

        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var that = this;

        /**
         * The popover container. It's the element that will be shown and hidden.
         * @type {(jQuerySelector | ZeptoSelector)}
         */
        this.$container = $([
            '<div',
            ' class="ac-popover ac-hide ' + this._options._className + ' ' + this._options.addClass + '"',
            ' role="' + this._options._ariaRole + '"',
            ' id="ac-' + this.name + '-' + this.uid + '"',
            ' style="z-index:' + (ac.util.zIndex += 1) + ';width:' + this._options.width + ';height:' + this._options.height + '"',
            '>'
        ].join('')).on(ac.onpointertap + '.' + this.name, function (event) {
            event.stopPropagation();
        });

        /**
         * Element where the content will be added.
         * @private
         * @type {(jQuerySelector | ZeptoSelector)}
         */
        this._$content = $('<div class="ac-popover-content">').appendTo(this.$container);

        // Add functionality to the trigger if it exists
        this._configureTrigger();
        // Configure the way it hides
        this._configureHiding();

        this._positioner = new ac.Positioner({
            'target': this.$container,
            'reference': this._options.reference,
            'side': this._options.side,
            'align': this._options.align,
            'offsetX': this._options.offsetX,
            'offsetY': this._options.offsetY,
            'position': this._options.position
        });

        /**
         * Handler to execute the positioner refresh() method on layout changes.
         * @private
         * @function
         * @todo Define this function on prototype and use bind(): $document.on(ac.onlayoutchange, this.refreshPosition.bind(this));
         */
        this._refreshPositionListener = function () {
            if (that._shown) {
                that._positioner.refresh(options);
            }

            return that;
        };

        // Refresh position:
        // on layout change
        $document.on(ac.onlayoutchange, this._refreshPositionListener);
        // on resize
        ac.viewport.on(ac.onresize, this._refreshPositionListener);

        this
            .once('_show', this._refreshPositionListener)
            // on content change
            .on('_contentchange', this._refreshPositionListener)
            // Remove from DOM the component container after hide
            .on('hide', function () {
                that.$container.remove(null, true);
            });

        return this;
    };

    /**
     * Adds functionality to the trigger. When a non-trigger popover is initialized, this method isn't executed.
     * @memberof! ac.Popover.prototype
     * @private
     * @function
     */
    Popover.prototype._configureTrigger = function () {

        if (this._el === undefined) {
            return;
        }

        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var that = this,
            // It will be triggered on pointertap/pointerenter of the $trigger
            // It can toggle, show, or do nothing (in specific cases)
            showHandler = (function () {
                // Toggle as default
                var fn = that._toggle;
                // When a Popover is shown on pointerenter, it will set a timeout to manage when
                // to close the component. Avoid to toggle and let choise when to close to the timer
                if (that._options.shownby === 'pointerenter' || that._options.hiddenby === 'none' || that._options.hiddenby === 'button') {
                    fn = function () {
                        if (!that._shown) {
                            that.show();
                        }
                    };
                }

                return fn;
            }());

        /**
         * The original and entire element and its state, before initialization.
         * @private
         * @type {HTMLDivElement}
         */
        // cloneNode(true) > parameters is required. Opera & IE throws and internal error. Opera mobile breaks.
        this._snippet = this._el.cloneNode(true);

        // Use the trigger as the positioning reference
        this._options.reference = this._options.reference || this._$el;

        // Open event when configured as able to shown anyway
        if (this._options.shownby !== 'none') {
            this._$el
                .addClass('ac-shownby-' + this._options.shownby)
                .on(shownbyEvent[this._options.shownby] + '.' + this.name, function (event) {
                    ac.util.prevent(event);
                    showHandler();
                });
        }

        // Get a content if it's not defined
        if (this._options.content === undefined) {
            // Content from anchor href
            // IE defines the href attribute equal to src attribute on images.
            if (this._el.nodeName === 'A' && this._el.href !== '') {
                this._options.content = this._el.href;

            // Content from title or alt
            } else if (this._el.title !== '' || this._el.alt !== '') {
                // Set the configuration parameter
                this._options.content = this._el.title || this._el.alt;
                // Keep the attributes content into the element for possible usage
                this._el.setAttribute('data-title', this._options.content);
                // Avoid to trigger the native tooltip
                this._el.title = this._el.alt = '';
            }
        }

        // Set WAI-ARIA
        this._el.setAttribute('aria-owns', 'ac-' + this.name + '-' + this.uid);
        this._el.setAttribute('aria-haspopup', 'true');

        /**
         * The popover trigger. It's the element that will show and hide the container.
         * @type {(jQuerySelector | ZeptoSelector)}
         */
        this.$trigger = this._$el;
    };

    /**
     * Determines how to hide the component.
     * @memberof! ac.Popover.prototype
     * @private
     * @function
     */
    Popover.prototype._configureHiding = function () {
        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var that = this,
            hiddenby = this._options.hiddenby,
            pointertap = ac.onpointertap + '.' + this.name,
            timeout,
            events = {};

        function hideTimer() {
            timeout = window.setTimeout(function () {
                that.hide();
            }, that._options._hideDelay);
        }

        // Don't hide anytime
        if (hiddenby === 'none') { return; }

        // Hide by leaving the component
        if (hiddenby === 'pointerleave' && this.$trigger !== undefined) {

            events[ac.onpointerenter + '.' + this.name] = function () {
                window.clearTimeout(timeout);
            };

            events[ac.onpointerleave + '.' + this.name] = hideTimer;

            this.$trigger.on(events);
            this.$container.on(events);
        }

        // Hide with the button Close
        if (hiddenby === 'button' || hiddenby === 'all') {
            $('<i class="ac-close" role="button" aria-label="Close"></i>').on(pointertap, function () {
                that.hide();
            }).prependTo(this.$container);
        }

        if ((hiddenby === 'pointers' || hiddenby === 'all') && this._hidingShortcuts !== undefined) {
            this._hidingShortcuts();
        }

    };

    /**
     * Creates an options object from the parameters arriving to the constructor method.
     * @memberof! ac.Popover.prototype
     * @private
     * @function
     */
    Popover.prototype._normalizeOptions = function (options) {
        if (typeof options === 'string' || ac.util.is$(options)) {
            options = {
                'content': options
            };
        }
        return options;
    };

    /**
     * Shows the popover container and appends it to the body.
     * @memberof! ac.Popover.prototype
     * @function
     * @param {(String | jQuerySelector | ZeptoSelector)} [content] The content that will be used by popover.
     * @param {Object} [options] A custom options to be used with content loaded by ajax.
     * @param {String} [options.method] The type of request ("POST" or "GET") to load content by ajax. Default: "GET".
     * @param {String} [options.params] Params like query string to be sent to the server.
     * @param {Boolean} [options.cache] Force to cache the request by the browser. Default: true.
     * @param {Boolean} [options.async] Force to sent request asynchronously. Default: true.
     * @param {(String | jQuerySelector | ZeptoSelector)} [options.waiting] Temporary content to use while the ajax request is loading.
     * @returns {popover}
     * @example
     * // Shows a basic popover.
     * popover.show();
     * @example
     * // Shows a popover with new content
     * popover.show('Some new content here!');
     * @example
     * // Shows a popover with a new content that will be loaded by ajax with some custom options
     * popover.show('http://domain.com/ajax/url', {
     *     'cache': false,
     *     'params': 'x-request=true'
     * });
     */
    Popover.prototype.show = function (content, options) {
        // Don't execute when it's disabled
        if (!this._enabled || this._shown) {
            return this;
        }

        // Increase z-index and append to body
        // Do it before set content because when content sets, it triggers the position refresh
        this.$container.css('z-index', (ac.util.zIndex += 1)).appendTo($body);

        // Open the collapsible
        this._show();

        // Request the content
        if (content !== undefined) {
            this.content(content, options);
        }

        return this;
    };

    /**
     * Hides the popover container and deletes it from the body.
     * @memberof! ac.Popover.prototype
     * @function
     * @returns {popover}
     * @example
     * // Close a popover
     * popover.hide();
     */
    Popover.prototype.hide = function () {
        // Don't execute when it's disabled
        if (!this._enabled || !this._shown) {
            return this;
        }

        // Close the collapsible
        this._hide();

        return this;
    };

    /**
     * Returns a Boolean specifying if the container is shown or not.
     * @memberof! ac.Popover.prototype
     * @function
     * @returns {Boolean}
     * @example
     * // Check the popover status
     * popover.isShown();
     * @example
     * // Check the popover status after an user action
     * $(window).on(ac.onpointertap, function () {
     *     if (popover.isShown()) {
     *         alert('Popover: visible');
     *     } else {
     *         alert('Popover: not visible');
     *     }
     * });
     */
    Popover.prototype.isShown = function () {
        return this._shown;
    };

    /**
     * Sets or gets the width of the container.
     * @memberof! ac.Popover.prototype
     * @function
     * @param {String} [data] Set a width for the container.
     * @returns {(Number | popover)}
     * @example
     * // Set a new popover width
     * component.width('300px');
     * @example
     * // Get the current popover width
     * component.width(); // '300px'
     */
    Popover.prototype.width = function (data) {

        if (data === undefined) {
            return this._options.width;
        }

        this.$container.css('width', data);

        this._options.width = data;

        this.refreshPosition();

        return this;
    };

    /**
     * Sets or gets the height of the container.
     * @memberof! ac.Popover.prototype
     * @function
     * @param {String} [data] Set a height for the container.
     * @returns {(Number | popover)}
     * @example
     * // Set a new popover height
     * component.height('300px');
     * @example
     * // Get the current popover height
     * component.height(); // '300px'
     */
    Popover.prototype.height = function (data) {

        if (data === undefined) {
            return this._options.height;
        }

        this.$container.css('height', data);

        this._options.height = data;

        this.refreshPosition();

        return this;
    };

    /**
     * Updates the current position of the container with given options or defaults.
     * @memberof! ac.Popover.prototype
     * @function
     * @params {Object} [options] A configuration object.
     * @returns {popover}
     * @example
     * // Update the current position
     * popover.refreshPosition();
     * @example
     * // Update the current position with a new offsetX and offsetY
     * popover.refreshPosition({
     *     'offestX': 100,
     *     'offestY': 10
     * });
     */
    Popover.prototype.refreshPosition = function (options) {

        if (this._shown) {
            // Refresh its position.
            this._positioner.refresh(options);

        } else {
            // Update its options. It will update position the next time to be shown.
            this._positioner._configure(options);
        }

        return this;
    };

    /**
     * Enables a Popover instance.
     * @memberof! ac.Popover.prototype
     * @function
     * @returns {popover}
     * @example
     * // Enable a popover
     * popover.enable();
     */
    Popover.prototype.enable = function () {

        if (this._el !== undefined) {
            this._el.setAttribute('aria-disabled', false);
        }

        parent.enable.call(this);

        return this;
    };

    /**
     * Disables a Popover instance.
     * @memberof! ac.Popover.prototype
     * @function
     * @returns {popover}
     * @example
     * // Disable a popover
     * popover.disable();
     */
    Popover.prototype.disable = function () {

        if (this._el !== undefined) {
            this._el.setAttribute('aria-disabled', true);
        }

        if (this._shown) {
            this.hide();
        }

        parent.disable.call(this);

        return this;
    };

    /**
     * Destroys a Popover instance.
     * @memberof! ac.Popover.prototype
     * @function
     * @returns {popover}
     * @example
     * // Destroy a popover
     * popover.destroy();
     * // Empty the popover reference
     * popover = undefined;
     */
    Popover.prototype.destroy = function () {

        if (this.$trigger !== undefined) {
            this.$trigger
                .off('.' + this.name)
                .removeClass('ac-' + this.name + '-trigger')
                .removeAttr('data-title aria-owns aria-haspopup data-side data-align role')
                .attr({
                    'alt': this._snippet.alt,
                    'title': this._snippet.title
                });
        }

        $document.off(ac.onlayoutchange, this._refreshPositionListener);

        ac.viewport.off(ac.onresize, this._refreshPositionListener);

        parent.destroy.call(this);

        return;
    };

    ac.factory(Popover, Popover.prototype._normalizeOptions);

}(this, this.ac.$, this.ch));

(function (window, $, ch) {
    'use strict';

    var $document = $(window.document);

    ac.Popover.prototype._hidingShortcuts = function () {

        var that = this,
            pointertap = ac.onpointertap + '.' + this.name;

        function hide(event) {
            // event.button === 0: Fix issue #933 Right click closes it on Firefox.
            if (event.target !== that._el && event.target !== that.$container[0] && event.button === 0) {
                that.hide();
            }
        }

        ac.shortcuts.add(ac.onkeyesc, this.uid, function () {
            that.hide();
        });

        this
            .on('show', function () {
                ac.shortcuts.on(that.uid);
                $document.on(pointertap, hide);
            })
            .on('hide', function () {
                ac.shortcuts.off(that.uid);
                $document.off(pointertap, hide);
            })
            .once('destroy', function () {
                ac.shortcuts.remove(that.uid, ac.onkeyesc);
            });
    };

}(this, this.ac.$, this.ch));
(function (window, $, ch) {
    'use strict';

    /**
     * Layer is a dialog window that can be shown one at a time.
     * @memberof ch
     * @constructor
     * @augments ac.Popover
     * @param {(jQuerySelector | ZeptoSelector)} $el A jQuery or Zepto Selector to create an instance of ac.Layer.
     * @param {Object} [options] Options to customize an instance.
     * @param {String} [options.addClass] CSS class names that will be added to the container on the component initialization.
     * @param {String} [options.fx] Enable or disable UI effects. You must use: "slideDown", "fadeIn" or "none". Default: "fadeIn".
     * @param {String} [options.width] Set a width for the container. Default: "auto".
     * @param {String} [options.height] Set a height for the container. Default: "auto".
     * @param {String} [options.shownby] Determines how to interact with the trigger to show the container. You must use: "pointertap", "pointerenter" or "none". Default: "pointerenter".
     * @param {String} [options.hiddenby] Determines how to hide the component. You must use: "button", "pointers", "pointerleave", "all" or "none". Default: "pointerleave".
     * @param {(jQuerySelector | ZeptoSelector)} [options.reference] It's a reference to position and size of element that will be considered to carry out the position. Default: the trigger element.
     * @param {String} [options.side] The side option where the target element will be positioned. Its value can be: "left", "right", "top", "bottom" or "center". Default: "bottom".
     * @param {String} [options.align] The align options where the target element will be positioned. Its value can be: "left", "right", "top", "bottom" or "center". Default: "left".
     * @param {Number} [options.offsetX] Distance to displace the target horizontally. Default: 0.
     * @param {Number} [options.offsetY] Distance to displace the target vertically. Default: 10.
     * @param {String} [options.position] The type of positioning used. Its value must be "absolute" or "fixed". Default: "absolute".
     * @param {String} [options.method] The type of request ("POST" or "GET") to load content by ajax. Default: "GET".
     * @param {String} [options.params] Params like query string to be sent to the server.
     * @param {Boolean} [options.cache] Force to cache the request by the browser. Default: true.
     * @param {Boolean} [options.async] Force to sent request asynchronously. Default: true.
     * @param {(String | jQuerySelector | ZeptoSelector)} [options.waiting] Temporary content to use while the ajax request is loading. Default: '&lt;div class="ac-loading ac-loading-centered"&gt;&lt;/div&gt;'.
     * @param {(jQuerySelector | ZeptoSelector | HTMLElement | String)} [options.content] The content to be shown into the Layer container.
     * @returns {layer} Returns a new instance of Layer.
     * @example
     * // Create a new Layer.
     * var layer = new ac.Layer($el, [options]);
     * @example
     * // Create a new Layer with jQuery or Zepto.
     * var layer = $(selector).layer([options]);
     * @example
     * // Create a new Layer with disabled effects.
     * var layer = $(selector).layer({
     *     'fx': 'none'
     * });
     * @example
     * // Create a new Layer using the shorthand way (content as parameter).
     * var layer = $(selector).layer('http://ui.ml.com:3040/ajax');
     */
    function Layer($el, options) {
        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var that = this;

        this._init($el, options);

        if (this.initialize !== undefined) {
            /**
             * If you define an initialize method, it will be executed when a new Layer is created.
             * @memberof! ac.Layer.prototype
             * @function
             */
            this.initialize();
        }

        /**
         * Event emitted when the component is ready to use.
         * @event ac.Layer#ready
         * @example
         * // Subscribe to "ready" event.
         * layer.on('ready', function () {
         *     // Some code here!
         * });
         */
        window.setTimeout(function () { that.emit('ready'); }, 50);
    }

    // Reference to the last component open. Allows to close and to deny to
    // have 2 components open at the same time
    var lastShown,
        // Inheritance
        parent = ac.util.inherits(Layer, ac.Popover);

    /**
     * The name of the component.
     * @memberof! ac.Layer.prototype
     * @type {String}
     * @example
     * // You can reach the associated instance.
     * var layer = $(selector).data('layer');
     */
    Layer.prototype.name = 'layer';

    /**
     * Returns a reference to the constructor function.
     * @memberof! ac.Layer.prototype
     * @function
     */
    Layer.prototype.constructor = Layer;

    /**
     * Configuration by default.
     * @memberof! ac.Layer.prototype
     * @type {Object}
     * @private
     */
    Layer.prototype._defaults = $.extend(ac.util.clone(parent._defaults), {
        '_className': 'ac-layer ac-box-lite ac-cone',
        '_ariaRole': 'tooltip',
        'shownby': 'pointerenter',
        'hiddenby': 'pointerleave',
        'side': 'bottom',
        'align': 'left',
        'offsetX': 0,
        'offsetY': 10,
        'waiting': '<div class="ac-loading-small"></div>'
    });

    /**
     * Shows the layer container and hides other layers.
     * @memberof! ac.Layer.prototype
     * @function
     * @param {(String | jQuerySelector | ZeptoSelector)} [content] The content that will be used by layer.
     * @param {Object} [options] A custom options to be used with content loaded by ajax.
     * @param {String} [options.method] The type of request ("POST" or "GET") to load content by ajax. Default: "GET".
     * @param {String} [options.params] Params like query string to be sent to the server.
     * @param {Boolean} [options.cache] Force to cache the request by the browser. Default: true.
     * @param {Boolean} [options.async] Force to sent request asynchronously. Default: true.
     * @param {(String | jQuerySelector | ZeptoSelector)} [options.waiting] Temporary content to use while the ajax request is loading.
     * @returns {layer}
     * @example
     * // Shows a basic layer.
     * layer.show();
     * @example
     * // Shows a layer with new content
     * layer.show('Some new content here!');
     * @example
     * // Shows a layer with a new content that will be loaded by ajax with some custom options
     * layer.show('http://domain.com/ajax/url', {
     *     'cache': false,
     *     'params': 'x-request=true'
     * });
     */
    Layer.prototype.show = function (content, options) {
        // Don't execute when it's disabled
        if (!this._enabled || this._shown) {
            return this;
        }

        // Only hide if there was a component opened before
        if (lastShown !== undefined && lastShown.name === this.name && lastShown !== this) {
            lastShown.hide();
        }

        // Only save to future close if this component is closable
        if (this._options.hiddenby !== 'none' && this._options.hiddenby !== 'button') {
            lastShown = this;
        }

        // Execute the original show()
        parent.show.call(this, content, options);

        return this;
    };

    ac.factory(Layer, parent._normalizeOptions);

}(this, this.ac.$, this.ch));

(function (window, $, ch) {
    'use strict';

    /**
     * Autocomplete Component shows a list of suggestions for a HTMLInputElement.
     * @memberof ch
     * @constructor
     * @augments ac.Component
     * @requires ac.Popover
     * @param {(jQuerySelector | ZeptoSelector)} $el A jQuery or Zepto Selector to create an instance of ac.Autocomplete.
     * @param {Object} [options] Options to customize an instance.
     * @param {String} [options.loadingClass] Default: "ac-autocomplete-loading".
     * @param {String} [options.highlightedClass] Default: "ac-autocomplete-highlighted".
     * @param {String} [options.itemClass] Default: "ac-autocomplete-item".
     * @param {String} [options.addClass] CSS class names that will be added to the container on the component initialization. Default: "ac-box-lite ac-autocomplete".
     * @param {Number} [options.keystrokesTime] Default: 150.
     * @param {Boolean} [options.html] Default: false.
     * @param {String} [options.side] The side option where the target element will be positioned. You must use: "left", "right", "top", "bottom" or "center". Default: "bottom".
     * @param {String} [options.align] The align options where the target element will be positioned. You must use: "left", "right", "top", "bottom" or "center". Default: "left".
     * @param {Number} [options.offsetX] The offsetX option specifies a distance to displace the target horitontally.
     * @param {Number} [options.offsetY] The offsetY option specifies a distance to displace the target vertically.
     * @param {String} [options.positioned] The positioned option specifies the type of positioning used. You must use: "absolute" or "fixed". Default: "absolute".
     * @returns {autocomplete}
     * @example
     * // Create a new AutoComplete.
     * var autocomplete = new AutoComplete($el, [options]);
     * @example
     * // Create a new AutoComplete with configuration.
     * var autocomplete = new AutoComplete($el, {
     *  'loadingClass': 'custom-loading',
     *  'highlightedClass': 'custom-highlighted',
     *  'itemClass': 'custom-item',
     *  'addClass': 'carousel-cities',
     *  'keystrokesTime': 600,
     *  'html': true,
     *  'side': 'center',
     *  'align': 'center',
     *  'offsetX': 0,
     *  'offsetY': 0,
     *  'positioned': 'fixed'
     * });
     */
    function Autocomplete($el, options) {

        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var that = this;

        this._init($el, options);

        if (this.initialize !== undefined) {
            /**
             * If you define an initialize method, it will be executed when a new Autocomplete is created.
             * @memberof! ac.Autocomplete.prototype
             * @function
             */
            this.initialize();
        }

        /**
         * Event emitted when the component is ready to use.
         * @event ac.Autocomplete#ready
         * @example
         * // Subscribe to "ready" event.
         * autocomplete.on('ready',function () {
         *     // Some code here!
         * });
         */
        window.setTimeout(function () { that.emit('ready'); }, 50);

        return this;

    }

    // Inheritance
    var parent = ac.util.inherits(Autocomplete, ac.Component);

    /**
     * The name of the component.
     * @type {String}
     */
    Autocomplete.prototype.name = 'autocomplete';

    /**
     * Returns a reference to the constructor function.
     * @memberof! ac.Autocomplete.prototype
     * @function
     */
    Autocomplete.prototype.constructor = Autocomplete;

    /**
     * Configuration by default.
     * @type {Object}
     * @private
     */
    Autocomplete.prototype._defaults = {
        'loadingClass': 'ac-autocomplete-loading',
        'highlightedClass': 'ac-autocomplete-highlighted',
        'itemClass': 'ac-autocomplete-item',
        'addClass': 'ac-box-lite ac-autocomplete',
        'side': 'bottom',
        'align': 'left',
        'html': false,
        '_hiddenby': 'none',
        'keystrokesTime': 150,
        '_itemTemplate': '<li class="{{itemClass}}"{{suggestedData}}>{{term}}<i class="ac-icon-arrow-up" data-js="ac-autocomplete-complete-query"></i></li>'
    };

    /**
     * Initialize a new instance of Autocomplete and merge custom options with defaults options.
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @private
     * @returns {autocomplete}
     */
    Autocomplete.prototype._init = function ($el, options) {

        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var that = this,
            POINTERDOWN = 'mousedown' + '.' + this.name,
            MOUSEENTER = 'mouseover' + '.' + this.name,
            // there is no mouseenter to highlight the item, so it happens when the user do mousedown
            highlightEvent = (ac.support.touch) ? POINTERDOWN : MOUSEENTER;

        // Call to its parent init method
        parent._init.call(this, $el, options);

        // creates the basic item template for this instance
        this._options._itemTemplate = this._options._itemTemplate.replace('{{itemClass}}', this._options.itemClass);

        if (this._options.html) {
            // remove the suggested data space when html is configured
            this._options._itemTemplate = this._options._itemTemplate.replace('{{suggestedData}}', '');
        }

        /**
         * The autocomplete suggestion list.
         * @type {(jQuerySelector | ZeptoSelector)}
         * @private
         */
        this._$suggestionsList = $('<ul class="ac-autocomplete-list"></ul>');

        // The component who shows and manage the suggestions.
        this._popover = new ac.Popover({
            'reference': this._$el,
            'content': this._$suggestionsList,
            'side': this._options.side,
            'align': this._options.align,
            'addClass': this._options.addClass,
            'hiddenby': this._options._hiddenby,
            'width': this._el.getBoundingClientRect().width + 'px',
            'fx': this._options.fx
        });
        /**
         * The autocomplete container.
         * @type {(jQuerySelector | ZeptoSelector)}
         * @example
         * // Gets the autocomplete container to append or prepend content.
         * autocomplete.$container.append('&lt;button&gt;Hide Suggestions&lt;/button&gt;');
         */
        this.$container = this._popover.$container.attr('aria-hidden', 'true')
            .on(highlightEvent, function (event) {
                that._highlightSuggestion($(event.target));
            })
            .on(POINTERDOWN, function (event) {

                // completes the value, it is a shortcut to avoid write the complete word
                if (event.target.nodeName === 'I' && !that._options.html) {
                    ac.util.prevent(event);
                    that._el.value = that._suggestions[that._highlighted];
                    that.emit('type', that._el.value);
                    return;
                }

                if ((event.target.nodeName === 'LI' && event.target.className.indexOf(that._options.itemClass) !== -1) || (event.target.parentElement.nodeName === 'LI' && event.target.parentElement.className.indexOf(that._options.itemClass) !== -1)) {
                    that._selectSuggestion();
                }
            });

        /**
         * The autocomplete trigger.
         * @type {(jQuerySelector | ZeptoSelector)}
         */
        this.$trigger = this._$el
            .attr({
                'aria-autocomplete': 'list',
                'aria-haspopup': 'true',
                'aria-owns': this.$container[0].id,
                'autocomplete': 'off'
            })
            .on('focus.' + this.name, function () {
                that._turnOn();
            })
            .on('blur.' + this.name, function () {
                that._turnOff();
            });

        // The number of the selected item or null when no selected item is.
        this._highlighted = null;

        // Collection of suggestions to be shown.
        this._suggestions = [];

        // Used to show when the user cancel the suggestions
        this._originalQuery = this._currentQuery = this._el.value;

        if (this._configureShortcuts !== undefined) {
            this._configureShortcuts();
        }

        return this;
    };

    /**
     * Turns on the ability off listen the keystrokes
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @private
     * @returns {autocomplete}
     */
    Autocomplete.prototype._turnOn = function () {

        if (!this._enabled) {
            return this;
        }

        var that = this;

        this._originalQuery = this._el.value;

        this.$trigger.on(ac.onkeyinput, function () {

            // .trim()
            that._currentQuery = that._el.value.replace(/^\s+|\s+$/g, '');

            if (that._currentQuery === '') {
                return that.hide();
            }

            // when the user writes
            window.clearTimeout(that._stopTyping);

            that._stopTyping = window.setTimeout(function () {
                that.$trigger.addClass(that._options.loadingClass);
                /**
                 * Event emitted when the user is typing.
                 * @event ac.Autocomplete#type
                 * @example
                 * // Subscribe to "type" event with ajax call
                 * autocomplete.on('type', function (userInput) {
                 *      $.ajax({
                 *          'url': '/countries?q=' + userInput,
                 *          'dataType': 'json',
                 *          'success': function (response) {
                 *              autocomplete.suggest(response);
                 *          }
                 *      });
                 * });
                 * @example
                 * // Subscribe to "type" event with jsonp
                 * autocomplete.on('type', function (userInput) {
                 *       $.ajax({
                 *           'url': '/countries?q='+ userInput +'&callback=parseResults',
                 *           'dataType': 'jsonp',
                 *           'cache': false,
                 *           'global': true,
                 *           'context': window,
                 *           'jsonp': 'parseResults',
                 *           'crossDomain': true
                 *       });
                 * });
                 */
                that.emit('type', that._currentQuery);
            }, that._options.keystrokesTime);

        });

        return this;

    };

    /**
     * Turns off the ability off listen the keystrokes
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @private
     * @returns {autocomplete}
     */
    Autocomplete.prototype._turnOff = function () {

        if (!this._enabled) {
            return this;
        }

        this.hide();

        this.$trigger.off(ac.onkeyinput);

        return this;
    };

    /**
     * It sets to the HTMLInputElement the selected query and it emits a 'select' event.
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @private
     * @returns {autocomplete}
     */
    Autocomplete.prototype._selectSuggestion = function () {

        window.clearTimeout(this._stopTyping);

        if (this._highlighted === null) {
            return this;
        }

        if (!this._options.html) {
            this._el.value = this._suggestions[this._highlighted];
        }

        this._el.blur();

        /**
         * Event emitted when a suggestion is selected.
         * @event ac.Autocomplete#select
         * @example
         * // Subscribe to "select" event.
         * autocomplete.on('select', function () {
         *     // Some code here!
         * });
         */
        this.emit('select');

        return this;
    };

    /**
     * Selects the items
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @private
     * @returns {autocomplete}
     */
    Autocomplete.prototype._highlightSuggestion = function ($target) {
        var $suggestion = $target.attr('aria-posinset') ? $target : $target.parents('li[aria-posinset]');

        // TODO: Documentation - Number or null
        this._highlighted = ($suggestion[0] !== undefined) ? (parseInt($suggestion.attr('aria-posinset'), 10) - 1) : null;

        this._toogleHighlighted();

        return this;
    };

    /**
     * It highlights the item adding the "ac-autocomplete-highlighted" class name or the class name that you configured as "highlightedClass" option.
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @private
     * @returns {autocomplete}
     */
    Autocomplete.prototype._toogleHighlighted = function () {

        var id = '#' + this.$container[0].id,
            // null is when is not a selected item but,
            // increments 1 _highlighted because aria-posinset starts in 1 instead 0 as the collection that stores the data
            current = (this._highlighted === null) ? null : (this._highlighted + 1);

        // background the highlighted item
        $(id + ' [aria-posinset].' + this._options.highlightedClass).removeClass(this._options.highlightedClass);
        // highlight the selected item
        $(id + ' [aria-posinset="' + current + '"]').addClass(this._options.highlightedClass);

        return this;
    };

    /**
     * Add suggestions to be shown.
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @returns {autocomplete}
     * @example
     * // The suggest method needs an Array of strings to work with default configuration
     * autocomplete.suggest(['Aruba','Armenia','Argentina']);
     * @example
     * // To work with html configuration, it needs an Array of strings. Each string must to be as you wish you watch it
     * autocomplete.suggest([
     *  '<strong>Ar</strong>uba <i class="flag-aruba"></i>',
     *  '<strong>Ar</strong>menia <i class="flag-armenia"></i>',
     *  '<strong>Ar</strong>gentina <i class="flag-argentina"></i>'
     * ]);
     */
    Autocomplete.prototype.suggest = function (suggestions) {

        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var that = this,
            items = [],
            matchedRegExp = new RegExp('(' + this._currentQuery.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1") + ')', 'ig'),
            totalItems = 0,
            $items,
            itemTemplate = this._options._itemTemplate,
            suggestedItem,
            term,
            suggestionsLength = suggestions.length,
            el;

        // hide the loading feedback
        this.$trigger.removeClass(that._options.loadingClass);

        // hides the suggestions list
        if (suggestionsLength === 0) {
            this._popover.hide();

            return this;
        }

        // shows the suggestions list when the is closed and the element is withs focus
        if (!this._popover.isShown() && window.document.activeElement === this._el) {
            this._popover.show();
        }

        // remove the class from the extra added items
        $('.' + this._options.highlightedClass, this.$container).removeClass(this._options.highlightedClass);

        // add each suggested item to the suggestion list
        for (suggestedItem = 0; suggestedItem < suggestionsLength; suggestedItem += 1) {
            // get the term to be replaced
            term = suggestions[suggestedItem];

            // for the html configured component doesn't highlight the term matched it must be done by the user
            if (!that._options.html) {
                term = term.replace(matchedRegExp, '<strong>$1</strong>');
                itemTemplate = this._options._itemTemplate.replace('{{suggestedData}}', ' data-suggested="' + suggestions[suggestedItem] + '"');
            }

            items.push(itemTemplate.replace('{{term}}', term));
        }

        this._$suggestionsList[0].innerHTML = items.join('');

        $items = $('.' + this._options.itemClass, this.$container);

        // with this we set the aria-setsize value that counts the total
        totalItems = $items.length;

        // Reset suggestions collection.
        this._suggestions.length = 0;

        for (suggestedItem = 0; suggestedItem < totalItems; suggestedItem += 1) {
            el = $items[suggestedItem];

            // add the data to the suggestions collection
            that._suggestions.push(el.getAttribute('data-suggested'));

            el.setAttribute('aria-posinset', that._suggestions.length);
            el.setAttribute('aria-setsize', totalItems);
        }

        this._highlighted = null;

        this._suggestionsQuantity = this._suggestions.length;

        return this;
    };

    /**
     * Hides component's container.
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @returns {autocomplete}
     * @example
     * // Hides the autocomplete.
     * autocomplete.hide();
     */
    Autocomplete.prototype.hide = function () {

        if (!this._enabled) {
            return this;
        }

        this._popover.hide();

        /**
         * Event emitted when the Autocomplete container is hidden.
         * @event ac.Autocomplete#hide
         * @example
         * // Subscribe to "hide" event.
         * autocomplete.on('hide', function () {
         *  // Some code here!
         * });
         */
        this.emit('hide');

        return this;
    };

    /**
     * Returns a Boolean if the component's core behavior is shown. That means it will return 'true' if the component is on and it will return false otherwise.
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @returns {Boolean}
     * @example
     * // Execute a function if the component is shown.
     * if (autocomplete.isShown()) {
     *     fn();
     * }
     */
    Autocomplete.prototype.isShown = function () {
        return this._popover.isShown();
    };

    Autocomplete.prototype.disable = function () {
        if (this.isShown()) {
            this.hide();
            this._el.blur();
        }

        parent.disable.call(this);

        return this;
    };

    /**
     * Destroys an Autocomplete instance.
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @example
     * // Destroying an instance of Autocomplete.
     * autocomplete.destroy();
     */
    Autocomplete.prototype.destroy = function () {

        this.$trigger
            .off('.' + this.name)
            .removeAttr('autocomplete aria-autocomplete aria-haspopup aria-owns');

        this._popover.destroy();

        parent.destroy.call(this);

        return;
    };

    ac.factory(Autocomplete);

}(this, this.ac.$, this.ch));

(function (Autocomplete, ch) {
    'use strict';
    /**
     * Congfigure shortcuts to navigate and set values, or cancel the typed text
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @private
     * @returns {autocomplete}
     */
    Autocomplete.prototype._configureShortcuts = function () {

        /**
         * Reference to context of an instance.
         * @type {Object}
         * @private
         */
        var that = this;

        // Shortcuts
        ac.shortcuts.add(ac.onkeyenter, this.uid, function (event) {
            ac.util.prevent(event);
            that._selectSuggestion();
        });

        ac.shortcuts.add(ac.onkeyesc, this.uid, function () {
            that.hide();
            that._el.value = that._originalQuery;
        });

        ac.shortcuts.add(ac.onkeyuparrow, this.uid, function (event) {
            ac.util.prevent(event);

            var value;

            // change the selected value & stores the future HTMLInputElement value
            if (that._highlighted === null) {

                that._highlighted = that._suggestionsQuantity - 1;
                value = that._suggestions[that._highlighted];

            } else if (that._highlighted <= 0) {

                this._prevHighlighted = this._currentHighlighted = null;
                value = that._currentQuery;

            } else {

                that._highlighted -= 1;
                value = that._suggestions[that._highlighted];

            }

            that._toogleHighlighted();

            if (!that._options.html) {
                that._el.value = value;
            }

        });

        ac.shortcuts.add(ac.onkeydownarrow, this.uid, function () {
            var value;

            // change the selected value & stores the future HTMLInputElement value
            if (that._highlighted === null) {

                that._highlighted = 0;

                value = that._suggestions[that._highlighted];

            } else if (that._highlighted >= that._suggestionsQuantity - 1) {

                that._highlighted = null;
                value = that._currentQuery;

            } else {

                that._highlighted += 1;
                value = that._suggestions[that._highlighted];

            }

            that._toogleHighlighted();

            if (!that._options.html) {
                that._el.value = value;
            }

        });

        // Activate the shortcuts for this instance
        this._popover.on('show', function () { ac.shortcuts.on(that.uid); });

        // Deactivate the shortcuts for this instance
        this._popover.on('hide', function () { ac.shortcuts.off(that.uid); });

        this.on('destroy', function () {
            ac.shortcuts.remove(this.uid);
        });

        return this;
    };

}(this.ac.Autocomplete, this.ch));
(function (window, Autocomplete) {
    'use strict';

    var $searchForm,
        $searchInput,
        $checkbox,
        $checkboxLabel,
        maxQueryLength,
        lastSearchesText,
        meliDomain,
        siteId,
        genericAditionalInfo;


    /**
     * Init the component
     * @memberof! ac.Autocomplete.prototype
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
        meliDomain = this._options.meliDomain || 'meli.domain';
        siteId = this._options.siteId || 'MLA';
        genericAditionalInfo = this._options.genericAditionalInfo || 'en todas las Tiendas Oficiales';


        // REDIFINE the Autocomplete _configureShortcuts to fix this issue: https://github.com/mercadolibre/chico/issues/1220
        ac.shortcuts.remove(ac.onkeyenter);
        ac.shortcuts.add(ac.onkeyenter, this.uid, function (event) {
            that._selectSuggestion();
        });


        // Add the last searches queries from the cookies
        this.addLastSearches();


        this.on('type', function (userInput) {

             $.ajax({
                 'url': 'http://suggestgz.mlapps.com/sites/'+siteId+'/autosuggest?q='+userInput,
                 'dataType': 'jsonp',
                 'cache': false,
                 'global': true,
                 'context': this,
                 'crossDomain': true
             })
             .done(this.parseResults);

             this.adecuateCategoryLabel();
        });


        // doQuery when the select event is fire and a suggest y selected
        this.on('select', function (e) {
           this.doQuery({
               element: this._highlighted
           });
        });


        ac.shortcuts.add(ac.onkeydownarrow, this.uid, this.adecuateCategoryLabel);
        ac.shortcuts.add(ac.onkeyuparrow, this.uid, this.adecuateCategoryLabel);

        ac.shortcuts.add(ac.onkeydownarrow, this.uid, this.scrollInToView);
        ac.shortcuts.add(ac.onkeyuparrow, this.uid, this.scrollInToView);

        $searchForm.submit(function (event) {
            event.preventDefault();
            that.doQuery();
        });
    }


    /**
     * Parse the json and add the results to data array
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @example
     * this.parseResults();
     */
    Autocomplete.prototype.scrollInToView = function () {
        var highlightedElement = document.querySelector('.ac-autocomplete-highlighted');

        if (highlightedElement !== null) {
            highlightedElement.scrollIntoView(false)
        }

    }


    /**
     * Parse the json and add the results to data array
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @example
     * this.parseResults();
     */
    Autocomplete.prototype.parseResults = function (results) {

        var resultsTemp = {
           "q":"ipod",
           "suggested_queries":[
              {
                 "q":"ipod",
                 "match_start":0,
                 "match_end":4,
                 "filters": {
                    "id": "official_store_id",
                    "name": "Tienda Oficial",
                    "values": [
                        {
                            "id": "177",
                            "name": "en Tienda Oficial Apple"
                        },
                        {
                            "id": "188",
                            "name": "en Tienda Oficial Megatone"
                        }
                    ]
                 }
              },
              {
                 "q":"ipod touch",
                 "match_start":0,
                 "match_end":4
              },
              {
                 "q":"ipod 5",
                 "match_start":0,
                 "match_end":4
              },
              {
                 "q":"ipod nano",
                 "match_start":0,
                 "match_end":4
              },
              {
                 "q":"dock ipod",
                 "match_start":5,
                 "match_end":9
              },
              {
                 "q":"auriculares ipod",
                 "match_start":12,
                 "match_end":16
              },
                            {
                 "q":"auriculares ipod",
                 "match_start":12,
                 "match_end":16
              },
                            {
                 "q":"auriculares ipod",
                 "match_start":12,
                 "match_end":16
              },
                            {
                 "q":"auriculares ipod",
                 "match_start":12,
                 "match_end":16
              },
                            {
                 "q":"auriculares ipod",
                 "match_start":12,
                 "match_end":16
              },
                            {
                 "q":"auriculares ipod",
                 "match_start":12,
                 "match_end":16
              },
                            {
                 "q":"auriculares ipod",
                 "match_start":12,
                 "match_end":16
              },
                            {
                 "q":"auriculares ipod",
                 "match_start":12,
                 "match_end":16
              },
                            {
                 "q":"auriculares ipod",
                 "match_start":12,
                 "match_end":16
              },
                            {
                 "q":"auriculares ipod",
                 "match_start":12,
                 "match_end":16
              },
                            {
                 "q":"auriculares ipod",
                 "match_start":12,
                 "match_end":16
              }
           ]
        }

        // if (results[2].suggested_queries !== undefined) {
        //     results[2].suggested_queries.forEach(function (e, i) {
        //         console.log(e.filters.name);
        //         data.push(e.q);
        //     });

        //     this.suggest(data);
        // }

        var i,
            queries = resultsTemp.suggested_queries,
            suggestedResults = [],
            suggestedResultsTO = [],
            suggestedQueriesLength = queries.length;

        if (queries === undefined) {
            return;
        }

        var firstQuery = queries[0],
            firstQueryFilters = firstQuery.filters;

        if (firstQueryFilters !== undefined) {

            var filtersLength = firstQueryFilters.values.length;

            for (i = 0; i < filtersLength; i++) {
                suggestedResultsTO.push('<strong>' + firstQuery.q + '</strong> ' + '<span>'+firstQueryFilters.values[i].name+'</span>');

            };

            // Add the last <li>. It's the generic option tha always appear.
            suggestedResultsTO.push('<strong>' + firstQuery.q + '</strong> ' + '<span>'+genericAditionalInfo+'</span>');
        }

        for (i = 0; i < suggestedQueriesLength; i++) {
            suggestedResults.push(queries[i].q);
        };

        // Add the official store queries suggested
        this.addOfficialStoreQueries(suggestedResultsTO);

        this.suggest(suggestedResults);
    }


    /**
     * Adds 'last searches' to Autocomplete.
     * @memberof! ac.Autocomplete.prototype
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
     * @memberof! ac.Autocomplete.prototype
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
     * @memberof! ac.Autocomplete.prototype
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
     * @memberof! ac.Autocomplete.prototype
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
            this._$lastListOficialStore = $(this.makeTemplate(officialStoreQueries)).insertAfter($('.ac-popover-content'));
        }

        return this;
    };


    /**
     * Make html template to the list
     * @memberof! ac.Autocomplete.prototype
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

            list += '<li class="ac-autocomplete-item" data-suggested="'+suggestedInInput+'"><a num="'+i+'" href="/'+uri+'" class="aditional-info-item">'+searches[i]+'</a></li>';

        }

        list += '</ul></div>';

        return list;
    };


    /**
     * Do query
     * @memberof! ac.Autocomplete.prototype
     * @function
     * @returns {list}
     * @example
     * Autocomplete.doQuery();
     */
    Autocomplete.prototype.doQuery = function (tracking) {
        // Saving querys
        // Use trim to remove white spaces
        var query = $searchInput.val(), //trim($searchInput.val()),
            searchQuery = 'http://listado.localhost.com.ar:8080/$query_DisplayType_G';//settings.uri;
            // searac = 'http://ipod.localhost.com.ar:8080/reproductores/';

        // Naturalization
        if (query && query.length > 0){
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
            if (window.location.href.indexOf('_DisplayType_LF') != -1) {
                searchQuery =  "http://listado.localhost.com.ar:8080/$query_DisplayType_G#D[C:'']" + '_DisplayType_LF';
            } else {
                searchQuery = "http://listado.localhost.com.ar:8080/$query_DisplayType_G#D[C:'']";
            }
        }

        // Adults setting
        if (this.getCookieValue('pr_categ') === 'AD' && searchQuery.indexOf('_PrCategId_AD') === -1) {
            searchQuery = searchQuery + '_PrCategId_AD';
        }

        // Add query to the URL string
        searchQuery = searchQuery.replace('$query', encodeURIComponent(query));

        // Tracking
        if (typeof tracking != 'undefined'){
            searchQuery = searchQuery + '#D[A:' + query + ',B:' + tracking.element + ']';
        }

        // Cookies
        console.info('revisar seteo de cookie');
        this.setSearchCookies(query);

        // Redirect
        // location.href = searchQuery;
        console.info(searchQuery);

        return this;
    };


    /**
     * Naturalize query
     * @memberof! ac.Autocomplete.prototype
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
     * @memberof! ac.Autocomplete.prototype
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
     * @memberof! ac.Autocomplete.prototype
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
     * @memberof! ac.Autocomplete.prototype
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
     * @memberof! ac.Autocomplete.prototype
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

}(this, this.ac.Autocomplete));


// TODO: migrate to a vanilla javascript scroll
/*! perfect-scrollbar - v0.5.8
* http://noraesae.github.com/perfect-scrollbar/
* Copyright (c) 2014 Hyunje Alex Jun; Licensed MIT */
(function(e){"use strict";"function"==typeof define&&define.amd?define(["jquery"],e):"object"==typeof exports?e(require("jquery")):e(jQuery)})(function(e){"use strict";function t(e){return"string"==typeof e?parseInt(e,10):~~e}var o={wheelSpeed:1,wheelPropagation:!1,swipePropagation:!0,minScrollbarLength:null,maxScrollbarLength:null,useBothWheelAxes:!1,useKeyboard:!0,suppressScrollX:!1,suppressScrollY:!1,scrollXMarginOffset:0,scrollYMarginOffset:0,includePadding:!1},n=0,r=function(){var e=n++;return function(t){var o=".perfect-scrollbar-"+e;return t===void 0?o:t+o}},l="WebkitAppearance"in document.documentElement.style;e.fn.perfectScrollbar=function(n,i){return this.each(function(){function a(e,o){var n=e+o,r=D-R;j=0>n?0:n>r?r:n;var l=t(j*(Y-D)/(D-R));M.scrollTop(l)}function s(e,o){var n=e+o,r=E-k;W=0>n?0:n>r?r:n;var l=t(W*(C-E)/(E-k));M.scrollLeft(l)}function c(e){return P.minScrollbarLength&&(e=Math.max(e,P.minScrollbarLength)),P.maxScrollbarLength&&(e=Math.min(e,P.maxScrollbarLength)),e}function u(){var e={width:I};e.left=B?M.scrollLeft()+E-C:M.scrollLeft(),N?e.bottom=_-M.scrollTop():e.top=Q+M.scrollTop(),H.css(e);var t={top:M.scrollTop(),height:A};Z?t.right=B?C-M.scrollLeft()-V-J.outerWidth():V-M.scrollLeft():t.left=B?M.scrollLeft()+2*E-C-$-J.outerWidth():$+M.scrollLeft(),G.css(t),U.css({left:W,width:k-z}),J.css({top:j,height:R-et})}function d(){M.removeClass("ps-active-x"),M.removeClass("ps-active-y"),E=P.includePadding?M.innerWidth():M.width(),D=P.includePadding?M.innerHeight():M.height(),C=M.prop("scrollWidth"),Y=M.prop("scrollHeight"),!P.suppressScrollX&&C>E+P.scrollXMarginOffset?(X=!0,I=E-F,k=c(t(I*E/C)),W=t(M.scrollLeft()*(I-k)/(C-E))):(X=!1,k=0,W=0,M.scrollLeft(0)),!P.suppressScrollY&&Y>D+P.scrollYMarginOffset?(O=!0,A=D-tt,R=c(t(A*D/Y)),j=t(M.scrollTop()*(A-R)/(Y-D))):(O=!1,R=0,j=0,M.scrollTop(0)),W>=I-k&&(W=I-k),j>=A-R&&(j=A-R),u(),X&&M.addClass("ps-active-x"),O&&M.addClass("ps-active-y")}function p(){var t,o,n=function(e){s(t,e.pageX-o),d(),e.stopPropagation(),e.preventDefault()},r=function(){H.removeClass("in-scrolling"),e(q).unbind(K("mousemove"),n)};U.bind(K("mousedown"),function(l){o=l.pageX,t=U.position().left,H.addClass("in-scrolling"),e(q).bind(K("mousemove"),n),e(q).one(K("mouseup"),r),l.stopPropagation(),l.preventDefault()}),t=o=null}function f(){var t,o,n=function(e){a(t,e.pageY-o),d(),e.stopPropagation(),e.preventDefault()},r=function(){G.removeClass("in-scrolling"),e(q).unbind(K("mousemove"),n)};J.bind(K("mousedown"),function(l){o=l.pageY,t=J.position().top,G.addClass("in-scrolling"),e(q).bind(K("mousemove"),n),e(q).one(K("mouseup"),r),l.stopPropagation(),l.preventDefault()}),t=o=null}function v(e,t){var o=M.scrollTop();if(0===e){if(!O)return!1;if(0===o&&t>0||o>=Y-D&&0>t)return!P.wheelPropagation}var n=M.scrollLeft();if(0===t){if(!X)return!1;if(0===n&&0>e||n>=C-E&&e>0)return!P.wheelPropagation}return!0}function g(e,t){var o=M.scrollTop(),n=M.scrollLeft(),r=Math.abs(e),l=Math.abs(t);if(l>r){if(0>t&&o===Y-D||t>0&&0===o)return!P.swipePropagation}else if(r>l&&(0>e&&n===C-E||e>0&&0===n))return!P.swipePropagation;return!0}function b(){function e(e){var t=e.originalEvent.deltaX,o=-1*e.originalEvent.deltaY;return(t===void 0||o===void 0)&&(t=-1*e.originalEvent.wheelDeltaX/6,o=e.originalEvent.wheelDeltaY/6),e.originalEvent.deltaMode&&1===e.originalEvent.deltaMode&&(t*=10,o*=10),t!==t&&o!==o&&(t=0,o=e.originalEvent.wheelDelta),[t,o]}function t(t){if(l||!(M.find("select:focus").length>0)){var n=e(t),r=n[0],i=n[1];o=!1,P.useBothWheelAxes?O&&!X?(i?M.scrollTop(M.scrollTop()-i*P.wheelSpeed):M.scrollTop(M.scrollTop()+r*P.wheelSpeed),o=!0):X&&!O&&(r?M.scrollLeft(M.scrollLeft()+r*P.wheelSpeed):M.scrollLeft(M.scrollLeft()-i*P.wheelSpeed),o=!0):(M.scrollTop(M.scrollTop()-i*P.wheelSpeed),M.scrollLeft(M.scrollLeft()+r*P.wheelSpeed)),d(),o=o||v(r,i),o&&(t.stopPropagation(),t.preventDefault())}}var o=!1;window.onwheel!==void 0?M.bind(K("wheel"),t):window.onmousewheel!==void 0&&M.bind(K("mousewheel"),t)}function h(){var t=!1;M.bind(K("mouseenter"),function(){t=!0}),M.bind(K("mouseleave"),function(){t=!1});var o=!1;e(q).bind(K("keydown"),function(n){if((!n.isDefaultPrevented||!n.isDefaultPrevented())&&t){for(var r=document.activeElement?document.activeElement:q.activeElement;r.shadowRoot;)r=r.shadowRoot.activeElement;if(!e(r).is(":input,[contenteditable]")){var l=0,i=0;switch(n.which){case 37:l=-30;break;case 38:i=30;break;case 39:l=30;break;case 40:i=-30;break;case 33:i=90;break;case 32:case 34:i=-90;break;case 35:i=n.ctrlKey?-Y:-D;break;case 36:i=n.ctrlKey?M.scrollTop():D;break;default:return}M.scrollTop(M.scrollTop()-i),M.scrollLeft(M.scrollLeft()+l),o=v(l,i),o&&n.preventDefault()}}})}function w(){function e(e){e.stopPropagation()}J.bind(K("click"),e),G.bind(K("click"),function(e){var o=t(R/2),n=e.pageY-G.offset().top-o,r=D-R,l=n/r;0>l?l=0:l>1&&(l=1),M.scrollTop((Y-D)*l)}),U.bind(K("click"),e),H.bind(K("click"),function(e){var o=t(k/2),n=e.pageX-H.offset().left-o,r=E-k,l=n/r;0>l?l=0:l>1&&(l=1),M.scrollLeft((C-E)*l)})}function m(){function t(){var e=window.getSelection?window.getSelection():document.getSlection?document.getSlection():{rangeCount:0};return 0===e.rangeCount?null:e.getRangeAt(0).commonAncestorContainer}function o(){r||(r=setInterval(function(){return x()?(M.scrollTop(M.scrollTop()+l.top),M.scrollLeft(M.scrollLeft()+l.left),d(),void 0):(clearInterval(r),void 0)},50))}function n(){r&&(clearInterval(r),r=null),H.removeClass("in-scrolling"),G.removeClass("in-scrolling")}var r=null,l={top:0,left:0},i=!1;e(q).bind(K("selectionchange"),function(){e.contains(M[0],t())?i=!0:(i=!1,n())}),e(window).bind(K("mouseup"),function(){i&&(i=!1,n())}),e(window).bind(K("mousemove"),function(e){if(i){var t={x:e.pageX,y:e.pageY},r=M.offset(),a={left:r.left,right:r.left+M.outerWidth(),top:r.top,bottom:r.top+M.outerHeight()};t.x<a.left+3?(l.left=-5,H.addClass("in-scrolling")):t.x>a.right-3?(l.left=5,H.addClass("in-scrolling")):l.left=0,t.y<a.top+3?(l.top=5>a.top+3-t.y?-5:-20,G.addClass("in-scrolling")):t.y>a.bottom-3?(l.top=5>t.y-a.bottom+3?5:20,G.addClass("in-scrolling")):l.top=0,0===l.top&&0===l.left?n():o()}})}function T(t,o){function n(e,t){M.scrollTop(M.scrollTop()-t),M.scrollLeft(M.scrollLeft()-e),d()}function r(){h=!0}function l(){h=!1}function i(e){return e.originalEvent.targetTouches?e.originalEvent.targetTouches[0]:e.originalEvent}function a(e){var t=e.originalEvent;return t.targetTouches&&1===t.targetTouches.length?!0:t.pointerType&&"mouse"!==t.pointerType&&t.pointerType!==t.MSPOINTER_TYPE_MOUSE?!0:!1}function s(e){if(a(e)){w=!0;var t=i(e);p.pageX=t.pageX,p.pageY=t.pageY,f=(new Date).getTime(),null!==b&&clearInterval(b),e.stopPropagation()}}function c(e){if(!h&&w&&a(e)){var t=i(e),o={pageX:t.pageX,pageY:t.pageY},r=o.pageX-p.pageX,l=o.pageY-p.pageY;n(r,l),p=o;var s=(new Date).getTime(),c=s-f;c>0&&(v.x=r/c,v.y=l/c,f=s),g(r,l)&&(e.stopPropagation(),e.preventDefault())}}function u(){!h&&w&&(w=!1,clearInterval(b),b=setInterval(function(){return x()?.01>Math.abs(v.x)&&.01>Math.abs(v.y)?(clearInterval(b),void 0):(n(30*v.x,30*v.y),v.x*=.8,v.y*=.8,void 0):(clearInterval(b),void 0)},10))}var p={},f=0,v={},b=null,h=!1,w=!1;t&&(e(window).bind(K("touchstart"),r),e(window).bind(K("touchend"),l),M.bind(K("touchstart"),s),M.bind(K("touchmove"),c),M.bind(K("touchend"),u)),o&&(window.PointerEvent?(e(window).bind(K("pointerdown"),r),e(window).bind(K("pointerup"),l),M.bind(K("pointerdown"),s),M.bind(K("pointermove"),c),M.bind(K("pointerup"),u)):window.MSPointerEvent&&(e(window).bind(K("MSPointerDown"),r),e(window).bind(K("MSPointerUp"),l),M.bind(K("MSPointerDown"),s),M.bind(K("MSPointerMove"),c),M.bind(K("MSPointerUp"),u)))}function y(){M.bind(K("scroll"),function(){d()})}function L(){M.unbind(K()),e(window).unbind(K()),e(q).unbind(K()),M.data("perfect-scrollbar",null),M.data("perfect-scrollbar-update",null),M.data("perfect-scrollbar-destroy",null),U.remove(),J.remove(),H.remove(),G.remove(),M=H=G=U=J=X=O=E=D=C=Y=k=W=_=N=Q=R=j=V=Z=$=B=K=null}function S(){d(),y(),p(),f(),w(),m(),b(),(ot||nt)&&T(ot,nt),P.useKeyboard&&h(),M.data("perfect-scrollbar",M),M.data("perfect-scrollbar-update",d),M.data("perfect-scrollbar-destroy",L)}var P=e.extend(!0,{},o),M=e(this),x=function(){return!!M};if("object"==typeof n?e.extend(!0,P,n):i=n,"update"===i)return M.data("perfect-scrollbar-update")&&M.data("perfect-scrollbar-update")(),M;if("destroy"===i)return M.data("perfect-scrollbar-destroy")&&M.data("perfect-scrollbar-destroy")(),M;if(M.data("perfect-scrollbar"))return M.data("perfect-scrollbar");M.addClass("ps-container");var E,D,C,Y,X,k,W,I,O,R,j,A,B="rtl"===M.css("direction"),K=r(),q=this.ownerDocument||document,H=e("<div class='ps-scrollbar-x-rail'>").appendTo(M),U=e("<div class='ps-scrollbar-x'>").appendTo(H),_=t(H.css("bottom")),N=_===_,Q=N?null:t(H.css("top")),z=t(H.css("borderLeftWidth"))+t(H.css("borderRightWidth")),F=t(H.css("marginLeft"))+t(H.css("marginRight")),G=e("<div class='ps-scrollbar-y-rail'>").appendTo(M),J=e("<div class='ps-scrollbar-y'>").appendTo(G),V=t(G.css("right")),Z=V===V,$=Z?null:t(G.css("left")),et=t(G.css("borderTopWidth"))+t(G.css("borderBottomWidth")),tt=t(G.css("marginTop"))+t(G.css("marginBottom")),ot="ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch,nt=null!==window.navigator.msMaxTouchPoints;return S(),M})}});