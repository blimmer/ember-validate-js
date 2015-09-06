/* jshint expr:true */
import { expect } from 'chai';
import {
  describe,
  beforeEach
} from 'mocha';
import {
  it,
  describeModule
} from 'ember-mocha';
import Ember from 'ember';
import ValidationMixin from 'ember-validate-js/mixins/validation';

describeModule(
  'mixin:validation',
  'ValidationMixin',
  {
    unit: true
  },
  function() {
    describe('validation setup', function() {
      let subject, constraints;
      beforeEach(function() {
        constraints = {
          name: {
            presence: true
          },
          email: {
            email: true
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

        const UserObject = Ember.Object.extend(ValidationMixin, {
          name: null,
          email: null,
          password: null,
          passwordConfirmation: null,
          unvalidatedField: null,

          constraints: Ember.computed(function() {
            return constraints;
          })
        });
        subject = UserObject.create();
      });

      it('adds *Errors *IsValid and *Error properties', function() {
        Object.keys(constraints).forEach(function(constraint) {
          expect(subject.hasOwnProperty(`${constraint}Errors`)).to.be.true;
          expect(subject.hasOwnProperty(`${constraint}Error`)).to.be.true;
          expect(subject.hasOwnProperty(`${constraint}IsValid`)).to.be.true;
        });
      });

      it('adds object level validation properties', function() {
        expect(subject.hasOwnProperty('constraintsMet')).to.be.true;
        expect(subject.hasOwnProperty('constraintsNotMet')).to.be.true;
      });

      it('tracks created properties', function() {
        const expectedProperties = Ember.A([]);
        Object.keys(constraints).forEach(function(constraint) {
          expectedProperties.push(`${constraint}Errors`, `${constraint}Error`, `${constraint}IsValid`);
        });
        expectedProperties.push('constraintsMet', 'constraintsNotMet');
        expect(subject.get('_validationPropsCreated').length).to.equal(14);
        expect(Ember.compare(subject.get('_validationPropsCreated'), expectedProperties)).to.equal(0);
      });

      describe('*Errors properties', function() {
        it('is invalidated by the model property only when no dependencies', function() {
          expect(subject.passwordErrors._dependentKeys.length).to.equal(1);
          expect(subject.passwordErrors._dependentKeys[0]).to.equal('password');
        });

        it('is invalidated by the model property and dependent value (specififed by equality key)', function() {
          expect(subject.passwordConfirmationErrors._dependentKeys.length).to.equal(2);
          expect(subject.passwordConfirmationErrors._dependentKeys[0]).to.equal('passwordConfirmation');
          expect(subject.passwordConfirmationErrors._dependentKeys[1]).to.equal('password');
        });
      });
    });

    describe('validations', function() {
      describe('simple presence check', function() {
        let subject;
        beforeEach(function() {
          const UserObject = Ember.Object.extend(ValidationMixin, {
            name: null,

            constraints: Ember.computed(function() {
              return {
                name: {
                  presence: true
                }
              };
            })
          });
          subject = UserObject.create();
        });

        it('the whole object is invalid initally', function() {
          expect(subject.get('constraintsNotMet')).to.be.true;
        });
        it('is invalid initially', function() {
          expect(subject.get('nameIsValid')).to.be.false;
        });
        it('explains why the field is invalid in propError', function() {
          expect(subject.get('nameError')).to.equal('can\'t be blank');
        });
        it('propErrors is empty when prop is set', function() {
          subject.set('name', 'blimmer');
          expect(Ember.isEmpty(subject.get('nameErrors'))).to.be.true;
        });
        it('propError is undefined when prop is set', function() {
          subject.set('name', 'blimmer');
          expect(subject.get('nameError')).to.be.undefined;
        });
        it('propIsValid is true when prop is set', function() {
          subject.set('name', 'blimmer');
          expect(subject.get('nameIsValid')).to.be.true;
        });
        it('object meets constraints', function() {
          subject.set('name', 'blimmer');
          expect(subject.get('constraintsMet')).to.be.true;
          expect(subject.get('constraintsNotMet')).to.be.false;
        });
      });

      describe('multi validation (1 field)', function() {
        let subject;
        beforeEach(function() {
          const UserObject = Ember.Object.extend(ValidationMixin, {
            name: null,

            constraints: Ember.computed(function() {
              return {
                name: {
                  presence: true,
                  format: {
                    pattern: /^([^0-9]*)$/,
                    message: 'no digits!'
                  },
                  length: {minimum: 2}
                }
              };
            })
          });
          subject = UserObject.create();
        });

        it('the whole object is invalid initally', function() {
          expect(subject.get('constraintsNotMet')).to.be.true;
        });
        it('is invalid initially', function() {
          expect(subject.get('nameIsValid')).to.be.false;
        });
        it('explains why the field is invalid in propError', function() {
          expect(subject.get('nameError')).to.equal('can\'t be blank');
        });
        it('propError picks the first error message when multiple validations fail', function() {
          subject.set('name', '1');
          expect(subject.get('nameError')).to.equal('no digits!');
        });
        it('propErrors is an array of error messages when multiple validations fail', function() {
          subject.set('name', '1');
          const errs = subject.get('nameErrors');
          expect(errs.get('length')).to.equal(2);
          expect(Ember.compare(errs, ['no digits!', 'is too short (minimum is 2 characters)'])).to.equal(0);
        });
        it('propErrors is empty when prop is set', function() {
          subject.set('name', 'blimmer');
          expect(Ember.isEmpty(subject.get('nameErrors'))).to.be.true;
        });
        it('propError is undefined when prop is set', function() {
          subject.set('name', 'blimmer');
          expect(subject.get('nameError')).to.be.undefined;
        });
        it('propIsValid is true when prop is set', function() {
          subject.set('name', 'blimmer');
          expect(subject.get('nameIsValid')).to.be.true;
        });
        it('object meets constraints', function() {
          subject.set('name', 'blimmer');
          expect(subject.get('constraintsMet')).to.be.true;
          expect(subject.get('constraintsNotMet')).to.be.false;
        });
      });

      describe('dependent fields', function() {
        let subject;
        beforeEach(function() {
          const UserObject = Ember.Object.extend(ValidationMixin, {
            name: null,

            constraints: Ember.computed(function() {
              return {
                password: {
                  presence: true,
                  length: {minimum: 10, maximum: 32}
                },
                passwordConfirmation: {
                  presence: true,
                  equality: 'password'
                }
              };
            })
          });
          subject = UserObject.create();
        });

        it('the whole object is invalid initally', function() {
          expect(subject.get('constraintsNotMet')).to.be.true;
        });
        it('is invalid initially', function() {
          expect(subject.get('passwordIsValid')).to.be.false;
          expect(subject.get('passwordConfirmationIsValid')).to.be.false;
        });
        it('explains why the fields are invalid in propError', function() {
          expect(subject.get('passwordError')).to.equal('can\'t be blank');
          expect(subject.get('passwordConfirmationError')).to.equal('can\'t be blank');
        });
        it('does not validate when fields aren\'t equal', function() {
          subject.set('password', 'password1234!');
          subject.set('passwordConfirmation', 'password!');
          expect(subject.get('passwordIsValid')).to.be.true;
          expect(subject.get('passwordConfirmationIsValid')).to.be.false;
        });
        it('validates when the fields are equal', function() {
          subject.set('password', 'password1234!');
          subject.set('passwordConfirmation', 'password1234!');
          expect(subject.get('passwordIsValid')).to.be.true;
          expect(subject.get('passwordConfirmationIsValid')).to.be.true;
        });
        it('object meets constraints', function() {
          subject.set('password', 'password1234!');
          subject.set('passwordConfirmation', 'password1234!');
          expect(subject.get('constraintsMet')).to.be.true;
          expect(subject.get('constraintsNotMet')).to.be.false;
        });
      });
    });
});
