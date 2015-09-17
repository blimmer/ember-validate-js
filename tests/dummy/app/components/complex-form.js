import Ember from 'ember';
import layout from '../templates/components/complex-form';
import ValidationMixin from 'ember-validate-js/mixins/validation';

export default Ember.Component.extend({
  layout: layout,

  obj: null,
  _defaultConstraints: null,

  _setup: Ember.on('init', function() {
    const defaultConstraints = {
      field1: {
        presence: true
      },
      field2: {
        presence: true
      },
      field3: {
        presence: true
      }
    };
    this.set('_defaultConstraints', defaultConstraints);

    const obj = Ember.Object.extend(ValidationMixin, {
      field1: null,
      field2: null,
      field3: null,

      constraints: Ember.Object.create(defaultConstraints)
    });
    this.set('obj', obj.create());
  }),

  isField3Email: false,

  actions: {
    toggleField3Email() {
      this.toggleProperty('isField3Email');

      const newConstraints = this.get('_defaultConstraints');
      newConstraints.field3.email = this.get('isField3Email');

      this.set('obj.constraints', Ember.Object.create(newConstraints));
    }
  }
});
