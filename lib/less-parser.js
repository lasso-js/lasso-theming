var logger = require('raptor-logging').logger(module);

var lessPath = null;
try {
    lessPath = require.resolve('less');
} catch(e) {}

var less;

if (lessPath) {
    less = require(lessPath);
}

module.exports = {
    exists: function() {
        return !!less;
    },

    parse: function(themeFilePath, lessCode, options, callback) {
        var paths = [];

        if (require.main && require.main.paths) {
            paths = paths.concat(require.main.paths);
        }

        logger.info('Parsing LESS file generated for theme ' + themeFilePath);

        function render(callback) {

            if (typeof less.render === 'function') {
                return less.render(lessCode, options, function(err, output) {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, output.css);
                });
            } else {
                var LessParser = require(lessPath).Parser;
                var parser = new LessParser({
                    //filename: themeFilePath,
                    paths: paths
                });
                return parser.parse(lessCode, function(err, tree) {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, tree.toCSS(options));
                });
            }
        }

        render(function(err, css) {

            if (err) {
                logger.error('Error parsing LESS file for theme ' + themeFilePath, lessCode, err);

                if (err.hasOwnProperty('line')) {
                    callback(
                        new Error('Error compiling LESS file for theme "' + themeFilePath + '" (' +
                            err.filename + ':' + err.line + ':' + err.column + ') - ' +
                            err.message));
                } else {
                    callback(err);
                }
                return;
            }

            logger.info('Finished parsing LESS file for theme "' + themeFilePath + '"');
            callback(null, css);
        });
    }
};