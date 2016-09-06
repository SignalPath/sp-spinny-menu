var jsPaths = {
    app: ['src/*.js', 'src/**/*.js']
};

var karma = [
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    {pattern: 'src/sp-spinny.module.js', included: true, served: true},
    {pattern: 'src/*.js', included: true, served: true},
    {pattern: 'test/**/*.spec.js', included: true, served: true}
];

module.exports = {
    karma: karma,
    js: jsPaths
};