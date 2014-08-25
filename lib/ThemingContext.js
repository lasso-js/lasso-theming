var CONTEXT_ATTRIBUTE_KEY = 'raptor-theming';



function ThemingContext() {
    this.themedDependencies = [];
    this.imports = [];
}

var proto = ThemingContext.prototype;

proto.addThemeImport = function(dependency) {
    this.imports.push(dependency);
};

proto.addThemedDependency = function(dependency) {
    this.themedDependencies.push(dependency);
};

proto.getThemedDependencies = function() {
    return this.themedDependencies;
};

proto.getThemeImports = function() {
    return this.imports;
};

ThemingContext.getThemingContext = function(optimizerContext) {
    var themingContext = optimizerContext.data[CONTEXT_ATTRIBUTE_KEY] || (optimizerContext.data[CONTEXT_ATTRIBUTE_KEY] = new ThemingContext());
    return themingContext;
};

module.exports = ThemingContext;