'use strict';

module.exports = {
    client: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/angular-ui-bootstrap-datetimepicker/datetimepicker.css',
                'public/lib/angular-ui-grid/ui-grid.min.css',
                'public/lib/angular-ui-select/dist/select.min.css'
            ],
            js: [
                'public/lib/angular/angular.min.js',
                'public/lib/angular-resource/angular-resource.min.js',
                'public/lib/angular-animate/angular-animate.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-sanitize/angular-sanitize.min.js',
                'public/lib/angular-ui-utils/ui-utils.min.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'public/lib/angular-file-upload/angular-file-upload.min.js',
                'public/lib/angular-ui-bootstrap-datetimepicker/datetimepicker.js',
                'public/lib/lodash/lodash.min.js',
                'public/lib/angular-google-maps/dist/angular-google-maps.min.js',
                'public/lib/angular-ui-grid/ui-grid.min.js',
                'public/lib/angular-ui-select/dist/select.min.js',
                'public/lib/papaparse/papaparse.min.js'
            ]
        },
        css: 'public/dist/application.min.css',
        js: 'public/dist/application.min.js'
    }
};
