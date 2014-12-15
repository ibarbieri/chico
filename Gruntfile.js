module.exports = function (grunt) {
    'use strict';

    var environment = grunt.option('env') || 'ui',
        destination = grunt.option('dest') || 'build',
        vendor = {
            'mobile': 'Zepto',
            'ui': 'jQuery'
        },
        files = require('./libs/files/' + environment);

    // Project configuration.
    grunt.initConfig({
        'pkg': grunt.file.readJSON('package.json'),

        'banner': {
            'full': [
                '/*!',
                ' * Chico UI v<%= pkg.version %>',
                ' * http://chico-ui.com.ar/',
                ' *',
                ' * Copyright (c) <%= grunt.template.today("yyyy") %>, MercadoLibre.com',
                ' * Released under the MIT license.',
                ' * http://chico-ui.com.ar/license',
                ' */\n'
            ].join('\n'),
            'min': '/*! Chico UI v<%= pkg.version %> chico-ui.com.ar | chico-ui.com.ar/license */'
        },

        'concat': {
            'options': {
                'stripBanners': {
                    'options': {
                        'block': true,
                        'line': true
                    }
                }
            },

            'core': {
                'options': {
                    'banner': '<%= banner.full %>' + "\n\n(function (window, $) {\n\t'use strict';\n\n",
                    'footer': '\n\tch.version = \'<%= pkg.version %>\';\n\twindow.ch = ch;\n}(this, this.$));'
                },
                'src': files.JS.core,
                'dest': 'temp/' + environment + '/core.tmp.js'
            },

            'js': {
                'src': ['temp/' + environment + '/core.tmp.js'].concat(files.JS.abilities).concat(files.JS.components),
                'dest': destination + '/' + environment + '/<%= pkg.name %>.js'
            },

            'css': {
                'options': {
                    'banner': '<%= banner.full %>'
                },
                'src': files.CSS.resetML.concat(files.CSS.core).concat(files.CSS.components),
                'dest': destination + '/' + environment + '/<%= pkg.name %>.css'
            },
            'autocompleteJs': {
                'src': ['temp/' + environment + '/core.tmp.js'].concat(files.JS.abilities).concat(files.JS.autocomplete),
                'dest': 'extensions/search-box/'+environment+'/autocomplete-1.1.1-standalone.js'
            },
            'autocompleteCss': {
                'options': {
                    'banner': '<%= banner.full %>'
                },
                'src': files.CSS.core.concat(files.CSS.autocomplete),
                'dest': 'extensions/search-box/'+environment+'/autocomplete-1.1.1-standalone.css'
            }
        },

        'uglify': {
            'options': {
                'mangle': true,
                'banner': '<%= banner.min %>'
            },

            'js': {
                'src': ['<%= concat.js.dest %>'],
                'dest': destination + '/' + environment + '/<%= pkg.name %>.min.js'
            }

        },

        'cssmin': {
            'options': {
                'banner': '<%= banner.min %>',
                'keepSpecialComments': 0
            },

            'chico': {
                'src': ['<%= concat.css.dest %>'],
                'dest': destination + '/' + environment + '/<%= pkg.name %>.min.css'
            }
        },

        'clean': ['temp'],

        'jslint': { // configure the task
            'files': files.JS.abilities.concat(files.JS.components),
            'directives': {
                'browser': true,
                'nomen': true,
                'todo': true
            },
            'options': {
                'errorsOnly': true, // only display errors
                'failOnError': false, // defaults to true
                'shebang': true, // ignore shebang lines
            }
        },

        'jsdoc': {
            'dist': {
                'src': files.JS.core.concat(files.JS.abilities).concat(files.JS.components),
                'options': {
                    'template': './libs/doc-template',
                    'destination': './doc/' + environment,
                    'private': false
                }
            }
        },

        'replace': {
            'example': {
                'src': ['<%= concat.css.dest %>'],
                'dest': destination + '/' + environment + '/<%= pkg.name %>.css',
                'replacements': [{
                    'from': '../assets/',
                    'to': '../../assets/0.3/'
                }]
            },
            'nameSpaceJs': {
                'src': ['extensions/search-box/'+environment+'/autocomplete-1.1.1-standalone.js'],
                'dest': 'extensions/search-box/'+environment+'/autocomplete-1.1.1-standalone.js',
                'replacements': [{
                        'from': 'ch =',
                        'to': 'ac ='
                    },
                    {
                        'from': 'ch.',
                        'to': 'ac.'
                    },
                    {
                        'from': 'ch[',
                        'to': 'ac['
                    },
                    {
                        'from': ' = ch',
                        'to': ' = ac'
                    },
                    {
                        'from': 'ch-',
                        'to': 'ac-'
                    },
                ]
            },
            'nameSpaceCss': {
                'src': ['extensions/search-box/'+environment+'/autocomplete-1.1.1-standalone.css'],
                'dest': 'extensions/search-box/'+environment+'/autocomplete-1.1.1-standalone.css',
                'replacements': [{
                        'from': 'ch-',
                        'to': 'ac-'
                    }
                ]
            },
            'assetsPath': {
                'src': ['extensions/search-box/'+environment+'/autocomplete-1.1.1-standalone.css'],
                'dest': 'extensions/search-box/'+environment+'/autocomplete-1.1.1-standalone.css',
                'replacements': [{
                        'from': '../assets/',
                        'to': 'http://static.mlstatic.com/org-img/ch/assets/0.3/'
                    }
                ]
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-jsdoc');

    // Resgister task(s).
    grunt.registerTask('default', []);
    grunt.registerTask('lint', ['jslint']);
    grunt.registerTask('doc', ['jsdoc']);
    grunt.registerTask('dev', ['concat', 'clean']);
    grunt.registerTask('dist', ['concat', 'replace:example', 'uglify', 'cssmin', 'clean']);
    grunt.registerTask('buildExtensions', ['concat', 'clean', 'replace']);
    grunt.registerTask('distExtensions', ['concat', 'replace:nameSpace', 'uglify', 'cssmin', 'clean']);
};