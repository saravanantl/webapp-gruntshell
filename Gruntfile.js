

module.exports = function (grunt) {
    // Project configuration.
    grunt.loadNpmTasks('grunt-shell');

    grunt.initConfig({
        shell: {
            pushdocs: {
                command: 'couchapp push app.js http://localhost:5984/estante_sample '
            }
        }
    });

    grunt.registerTask('test', ['shell:pushdocs']);

};