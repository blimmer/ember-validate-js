module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addPackagesToProject([
      { name: 'ember-browserify', target: '^1.0.5' },
      { name: 'validate.js', target: '^0.8.0' }
    ]);
  }
};
