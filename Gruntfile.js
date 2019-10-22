// Initialize grunt.
module.exports = (grunt) => {

  // Configure tasks.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    secret: grunt.file.readJSON(grunt.file.exists('secret.json') ? 'secret.json' : 'secret.example.json'),
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
    svg_sprite: {
      options: {
        shape: {
          dimension: {
            maxWidth: 24,
            maxHeight: 24
          }
        },
        mode: {
          css: false,
          view: false,
          defs: false,
          stack: false,
          symbol: {
            dest: '.',
            sprite: 'sprite.svg'
          },
        }
      },
      icons: {
        expand: true,
        cwd: 'icons/svg/',
        src: ['**/*.svg'],
        dest: 'icons/sprite/'
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
      production: {
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
    'svg_sprite',
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
