module.exports = function(grunt) {
  
  // Configure tasks.
  grunt.initConfig({
    'dart-sass': {
      options: {
        sourceMap: false,
        style: 'compressed'
      },
      scss: {
        files: {
          'scss/_emory-libraries.scss': 'css/emory-libraries.css'
        }
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test',
          src: ['*.scss'],
          dest: 'test',
          ext: '.css'
        }]
      }
    },
    sassdoc: {
      src: 'scss/_emory-libraries.scss'
    },
    watch: {
      scss: {
        files: ['scss/**/*.scss', 'test/*.scss'],
        tasks: ['build']
      },
      config: {
        options: {
          reload: true
        },
        files: [
          '.sassdocrc',
          'package.json',
          'Gruntfile.js'
        ],
        tasks: ['build']
      }
    }
  });
  
  // Load tasks.
  require('load-grunt-tasks')(grunt);
  
  // Register tasks.
  grunt.registerTask('default', ['dev']);
  grunt.registerTask('test', ['dart-sass:test']);
  grunt.registerTask('docs', ['sassdoc']);
  grunt.registerTask('build', [
    'dart-sass',
    'docs'
  ]);
  grunt.registerTask('dev', [
    'build',
    'watch'
  ]);
  
};