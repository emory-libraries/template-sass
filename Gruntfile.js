module.exports = (grunt) => { 

  // Configure tasks.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'dart-sass': {
      options: {
        sourceMap: false
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
          dest: 'test/tmp',
          ext: '.css'
        }]
      }
    },
    clean: {
      test: ['test/tmp']
    },
    sassdoc: {
      docs: {
        src: grunt.file.expand([
          'scss/*.scss',
          'scss/emory-libraries/**/*.scss',
          '!scss/emory-libraries/vends/**'
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
    },
    environments: {
      options: {
        release_root: 'versions',
        current_symlink: 'current',
        local_path: 'docs',
        tag: '<%= pkg.version %>',
        deploy_path: '<%= secret.production.path %>',
        host: '<%= secret.production.host %>',
        username: '<%= secret.production.username %>',
        password: '<%= secret.production.password %>',
        port: '<%= secret.production.port %>'
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
    'clean',
    'dart-sass',
    'status:export',
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
  grunt.registerTask('deploy', [
    'dist',
    'ssh_deploy:production'
  ]);
  grunt.registerTask('status', 'Update the status of a pattern', require('./scripts/status.js'));
  
};