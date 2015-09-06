# ember-validate-js
[![Build Status](https://travis-ci.org/blimmer/ember-validate-js.svg?branch=master)](https://travis-ci.org/blimmer/ember-validate-js)

A flexible validations library powered by Ember computed properties and  [validate.js](http://validatejs.org/).

## Features
* **Driven by computed properties**

  No more observers or calling `.validate()` to validate your object.

* **Flexible**

  Use it on a plain ol' Ember Object or with an ember-data model.

* **Change constraints on the fly (coming soon)**

  Change constraints on the fly and everything updates as you'd expect. Track the progress [here](https://github.com/blimmer/ember-validate-js/issues/3), help is welcome.

* **Works with 1.12.x and 1.13.x (and likely earlier)**

  We all want to be on the latest and greatest version of Ember, but sometimes
  it's just not possible right away. This library is definitely compatible with
  Ember 1.13, and unofficially compatible with 1.12.x and below (I'll do my best
  to support it for a while).

## Usage
1. Mix the `ValidationMixin` into the Object you want to apply validations.

  ```js
  import Ember from 'ember';
  import ValidationMixin from 'ember-validate-js/mixins/validation';

  export default Ember.Object.extend(ValidationMixin, {
    ...
  });
  ```

  or an Ember Data Model

  ```js
  import DS from 'ember-data';
  import ValidationMixin from 'ember-validate-js/mixins/validation';

  export default DS.Model.extend(ValidationMixin, {
    ...
  });
  ```

2. Provide a `constraints` property on the object you've mixed the `ValidationMixin` into.
These constraints are passed to the ValidateJS library and used to validate the properties on your object. See the [ValidateJS documentation](http://validatejs.org/#constraints) for more a list of [available validators](http://validatejs.org/#validators).

  ```js
    constraints: Ember.computed(function() {
      return {
        name: {
          presence: true
        },
        password: {
          presence: {message: 'you gotta tell us your name'},
          length: {minimum: 5}
        },
        passwordConfirmation: {
          presence: true,
          equality: 'password'
        }
      };
    })
  ```

3. Use the auto-generated computed properties to check validity.

  Each property gets three helpers (not that "property" below is replaced with the name of the property):

    * **(property)Errors**

      An array of validation errors. If there are no errors, the array will be empty.

    * **(property)Error**

      A convenience accessor for the first error in the errors array. Useful for showing a single error to the user at a time.

    * **(property)IsValid**

      A boolean to check if the property is valid.

  And the whole object gets validity properties:

    * **constraintsMet**

      A boolean to check if all properties with validations are valid on the model.

    * **constraintsNotMet**

      The inverse of `constraintsMet`.

## Example

For example, imagine you have a `User` model that you use to register a new user.

### app/models/user.js
```js
import Ember from 'ember';
import DS from 'ember-data';
import ValidationMixin from 'ember-validate-js/mixins/validation';

const attr = DS.attr;

export default DS.Model.extend(ValidationMixin, {
  name:                 attr('string'),
  email:                attr('string'),
  password:             attr('string'),
  passwordConfirmation: attr('string'),

  // See ValidateJS documentation for available
  // validators
  constraints: Ember.computed(function() {
    return {
      name: {
        presence: true
      },
      email: {
        presence: true,
        email: true
      },
      password: {
        presence: true,
        length: {minimum: 5, maximum: 128}
      },
      passwordConfirmation: {
        presence: true,
        equality: 'password'
      }
    };
  })
});
```

### app/templates/components/sign-up-form.hbs
```handlebars
<form>
  <div>
    <h3>Name</h3>
    {{input value=user.name}}
    {{user.nameError}}
  </div>
  <div>
    <h3>Email</h3>
    {{input value=user.email}}
    {{user.emailError}}
  </div>
  <div>
    <h3>Password</h3>
    {{input type='password' value=user.password}}
    {{user.passwordError}}
  </div>
  <div>
    <h3>Confirm Password</h3>
    {{input type='password' value=user.passwordConfirmation}}
    {{user.passwordConfirmationError}}
  </div>

  <button {{action 'submit'}} disabled={{user.constraintsNotMet}}>Submit</button>
</form>
```

## Browser Support
This project relies on `Object.keys`, so its use on obsolete browsers (IE8) will require a polyfill not provided by this project.

## Installation
Run `ember install ember-validate-js` in your Ember CLI application.

If you `npm install` this app, you'll need to run `ember g ember-validate-js`
to ensure the dependencies are installed and set up
([ember-browserify](https://github.com/ef4/ember-browserify) and [ValidateJS](http://validatejs.org/)).

# Development
This project works as is, but there are plenty of enhancements to make it better. My ideas are [listed here](https://github.com/blimmer/ember-validate-js/labels/enhancement) and PRs (with tests) are welcome!

## Installing
* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit the dummy app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
