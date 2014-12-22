/*
 * Files routes objects
 */
var JS = {},
    CSS = {};

/*
 * JS: Core
 */
JS.core = [
    "src/shared/js/helpers.js",
    "src/shared/js/util.js",
    "src/shared/js/support.js",
    "src/shared/js/events.js",
    "src/ui/js/events.js",
    "extensions/search-box/factory-standalone.js",
    "extensions/search-box/init.js"
];

/*
 * JS: Abilities
 */
JS.abilities = [
    "src/shared/js/EventEmitter.js",
    "src/shared/js/Content.js",
    "src/shared/js/Collapsible.js",
    "src/shared/js/Viewport.js",
    "src/shared/js/Positioner.js",
    "src/ui/js/shortcuts.js"
];

/*
 * JS: Components
 */
JS.components = [
    "src/shared/js/onImagesLoads.js",
    "src/shared/js/Component.js",
    "src/shared/js/Popover.js",
    "src/ui/js/Popover.js",
    "src/shared/js/Layer.js",
    "src/shared/js/Autocomplete.js",
    "src/ui/js/Autocomplete.js",
    "extensions/search-box/ui/autocomplete.searchBox.js"
];

/*
 * CSS routes
 */

/*
 * CSS: Reset
 */
CSS.resetML = [
    "src/shared/css/reset.css",
    "src/ui/css/reset.css",
    "src/shared/css/typography.css"
];

/*
 * CSS: Core
 */
CSS.core = [
    "src/shared/css/base.css",
    "src/ui/css/base.css",
    "src/shared/css/icons.css",
    "src/ui/css/badges.css",
    "src/shared/css/boxes.css",
    "src/ui/css/boxes.css",
    "src/shared/css/loading.css"
];

/*
 * CSS: Components
 */
CSS.components = [
    // "src/shared/css/buttons.css",
    // "src/ui/css/buttons.css",
    // "src/shared/css/datagrid.css",
    // "src/shared/css/lists.css",
    // "src/shared/css/pagination.css",
    // "src/ui/css/pagination.css",
    // "src/shared/css/Form.css",
    // "src/ui/css/Form.css",
    // "src/shared/css/Popover.css",
    // "src/shared/css/Tooltip.css",
    // "src/shared/css/Bubble.css",
    // "src/shared/css/Modal.css",
    // "src/shared/css/Transition.css",
    // "src/ui/css/Zoom.css",
    // "src/ui/css/wizard.css",
    // "src/shared/css/Calendar.css",
    // "src/shared/css/Carousel.css",
    // "src/shared/css/Dropdown.css",
    // "src/ui/css/Expandable.css",
    // "src/ui/css/Menu.css",
    // "src/ui/css/Tabs.css",
    // "src/ui/css/Datepicker.css",
    "src/shared/css/Autocomplete.css",
    "src/ui/css/Autocomplete.css",
    "src/shared/css/Popover.css",
    "src/shared/css/Autocomplete.css",
    "extensions/search-box/ui/autocomplete.searchBox.css"
];

/*
 * Expose both objects
 */
exports.JS = JS;
exports.CSS = CSS;