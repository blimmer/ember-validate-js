import Ember from 'ember';
import DS from 'ember-data';
import ValidationMixin from 'ember-validate-js/mixins/validation';

const attr = DS.attr;

export default DS.Model.extend(ValidationMixin, {
  name:                 attr('string'),
  password:             attr('string'),
  passwordConfirmation: attr('string'),

  constraints: Ember.computed(function() {
    return {
      name: {
        presence: true
      },
      password: {
        presence: true,
        length: {minimum: 5}
      },
      passwordConfirmation: {
        presence: true,
        equality: 'password'
      }
    };
  })
});
