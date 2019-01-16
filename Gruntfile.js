module.exports = (grunt) => { 
  
  // Configure tasks.
  grunt.initConfig({
    'dart-sass': {
      options: {
        sourceMap: false,
        outputStyle: 'compressed'
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
      docs: {
        src: grunt.file.expand([
          'scss/*.scss',
          'scss/**/*.scss',
          '!scss/vends/**'
        ])
      }
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
          'Gruntfile.js',
          'Plopfile.js'
        ],
        tasks: ['build']
      }
    },
    'gh-pages': {
      options: {
        base: 'docs'
      },
      src: ['**']
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
  grunt.registerTask('dist', [
    'build',
    'gh-pages'
  ]);
  
};