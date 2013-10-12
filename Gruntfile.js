'use strict';
var LIVERELOAD_PORT = 35730;
var lrSnippet = require('connect-livereload')({
    port: LIVERELOAD_PORT
});
var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
};


var request = require('request');

module.exports = function (grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var livestylerConfig = {
      app: 'app',
      dist: 'public'
  };

  grunt.initConfig({
    livestyler: livestylerConfig,
    express: {
        options: {
            port: 4000
        },
        dev: {
            options: {
                script: 'app.js'
            }
        },
        prod: {
            options: {
                script: 'app.js',
                node_env: 'production'
            }
        }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: 35730
      },
      // server: {
      //   files: [
      //     'app.js',
      //     '<%= livestyler.app %>/routes/*.js'
      //   ],
      //   tasks: ['develop', 'delayed-livereload']
      // },
      js: {
        files: ['<%= livestyler.dist %>/scripts/*.js']
      },
      css: {
        files: ['<%= livestyler.dist %>/styles/{,*/}*.css']
      },
      jade: {
        files: ['<%= livestyler.dist %>/views/*.jade'],
        options: {
          data: {
            pretty: true,
            debug: true,
            timestamp: "<%= grunt.template.today() %>"
          }
        }
      },
      livereload: {
          options: {
              livereload: LIVERELOAD_PORT
          },
          files: [
              '<%= livestyler.app %>/views/{,*/}*.jade',
              '<%= livestyler.dist %>/styles/theme/{,*/}.css',
              '<%= livestyler.dist %>/scripts/{,*/}.js',
              '<%= livestyler.dist %>/images/{,*/}.{png,jpg,jpeg,gif,webp,svg}'
          ]
      }
    },
    open: {
        server: {
            path: 'http://localhost:<%= express.options.port %>/'
            //path: 'http://localhost:<%= connect.options.port %>'
        }
    },
    develop: {
      server: {
        file: 'app.js'
      }
    }
  });

    grunt.registerTask('server', function(target) {

        if (target === 'dist') {
            return grunt.task.run(['open', 'express:dev', 'express-keepalive']);
        }

        grunt.task.run([
            // 'concurrent:server',
            // 'connect:livereload',
            'express:dev',
            'open:server',
            'watch'
        ]);
    });




  // grunt.config.requires('watch.server.files');
  // files = grunt.config('watch.server.files');
  // files = grunt.file.expand(files);

  // grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
  //   var done = this.async();
  //   setTimeout(function () {
  //     request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function (err, res) {
  //         var reloaded = !err && res.statusCode === 200;
  //         if (reloaded) {
  //           grunt.log.ok('Delayed live reload successful.');
  //         } else {
  //           grunt.log.error('Unable to make a delayed live reload.');
  //         }
  //         done(reloaded);
  //       });
  //   }, 500);
  // });

  // grunt.loadNpmTasks('grunt-develop');
  // grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['develop', 'watch']);
};
