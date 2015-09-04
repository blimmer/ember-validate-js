/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-validate-js',

  afterInstall: function() {
    this.addPackageToProject("ember-browserify", "^1.0.5");
    this.addPackageToProject("validate.js", "^0.8.0");
  }
};
