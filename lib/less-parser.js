var logger = require('raptor-logging').logger(module);

var LessParser = null;
var lessPath = null;
try {
    lessPath = require.resolve('less');
} catch(e) {}

if (lessPath) {
    LessParser = require(lessPath).Parser;
}

module.exports = {
    exists: function() {
        return !!LessParser;
    },

    parse: function(themeFilePath, lessCode, options, callback) {
        var paths = [];

        if (require.main && require.main.paths) {
            paths = paths.concat(require.main.paths);
        }
        var parser = new LessParser({
            //filename: themeFilePath,
            paths: paths
        });

        logger.info('Parsing LESS file generated for theme ' + themeFilePath);

        parser.parse(lessCode, function(err, tree) {
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
            callback(null, tree.toCSS(options));
        });
    }
};