module.exports = function (grunt) {
  grunt.initConfig({
    eslint: {
      target: [
        '**/*.js',
        '!node_modules/**',
        '!**/*.css'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-eslint');
  grunt.registerTask('default', ['eslint']);
};
