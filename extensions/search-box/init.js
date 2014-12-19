    // Remove the no-js classname from html tag
    $html.removeClass('no-js');

    // Exposse private $ (jQuery) into ch.$
    ch.$ = window.$;
    ac.version = '1.1.1';
    window.ac = ac;
