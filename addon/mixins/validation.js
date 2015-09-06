import Ember from 'ember';
import validate from 'npm:validate.js';

export default Ember.Mixin.create({
  _validationPropsCreated: null,

  _defineAndTrackProperty: function(propName, func) {
    Ember.defineProperty(this, propName, func);
    this.get('_validationPropsCreated').pushObject(propName);
  },

  _checkValidityWithDependency: function(property, dependentProp, propConstraints) {
    const values = {
      [property]: this.get(property),
      [dependentProp]: this.get(dependentProp)
    };

    const constraints = {
      [property]: propConstraints
    };

    let errs = validate(values, constraints, {fullMessages: false});
    if (errs && errs[property]) {
      errs = errs[property];
    }

    return Ember.A(errs);
  },

  _createValidationsForProperty: function(property, propConstraints) {
    const invalidations = [property];

    let checkValidityFunc;
    if (propConstraints.hasOwnProperty('equality')) {
      const dependentProp = propConstraints['equality'];
      invalidations.push(dependentProp);
      checkValidityFunc = function() {
        return this._checkValidityWithDependency(property, dependentProp, propConstraints);
      };
    } else {
      checkValidityFunc = function() {
        return Ember.A(validate.single(this.get(property), propConstraints));
      };
    }

    this._defineAndTrackProperty(`${property}Errors`, Ember.computed(...invalidations, checkValidityFunc));
    this._defineAndTrackProperty(`${property}Error`, Ember.computed.reads(`${property}Errors.firstObject`));
    this._defineAndTrackProperty(`${property}IsValid`, Ember.computed.empty(`${property}Errors`));
  },

  forceValidation: function() {
    this.get('constraintsMet');
  },

  _initValidations: Ember.on('init', function() {
    this.set('_validationPropsCreated', Ember.A([]));

    const constraints = this.get('constraints');
    if (!constraints) { return; }

    const validityProps = Object.keys(constraints).map((property) => {
      this._createValidationsForProperty(property, constraints[property]);
      return `${property}IsValid`;
    });

    this._defineAndTrackProperty('constraintsMet', Ember.computed.and(...validityProps));

    this._defineAndTrackProperty('constraintsNotMet', Ember.computed.not('constraintsMet'));
  }),
});
