/**
Copyright 2016 Split Software

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
**/
'use strict';

const tape = require('tape-catch');
const matcherTypes = require('../../matchers/types').enum;
const matcherFactory = require('../../matchers');

tape('MATCHER EQUAL_TO_SET / should return true ONLY when value is equal to set ["update", "add"]', function (assert) {

  let matcher = matcherFactory({
    negate: false,
    type: matcherTypes.EQUAL_TO_SET,
    value: ['update', 'add']
  });

  assert.true(matcher(['update', 'add']),            '["update", "add"] is equal to set ["update", "add"]');
  assert.true(matcher(['add', 'update']),            '["add", "update"] is equal to set ["update", "add"]');
  assert.false(matcher(['rename', 'update', 'add']), '["rename", "update", "add"] is not equal to set ["update", "add"]');
  assert.false(matcher(['update']),                  '["update"] is not equal to set ["update", "add"]');
  assert.false(matcher(['write']),                   '["write"] does not equal to set ["update", "add"]');
  assert.end();

});

tape('MATCHER EQUAL_TO_SET / negate should return false when the expected return value is true', function (assert) {

  let matcher = matcherFactory({
    negate: true,
    type: matcherTypes.EQUAL_TO_SET,
    value: ['update', 'add']
  });

  assert.false(matcher(['update', 'add']),          'NOT ["update", "add"] is equal to set ["update", "add"]');
  assert.false(matcher(['add', 'update']),          'NOT ["add", "update"] is equal to set ["update", "add"]');
  assert.true(matcher(['rename', 'update', 'add']), 'NOT ["rename", "update", "add"] is not equal to set ["update", "add"]');
  assert.true(matcher(['update']),                  'NOT ["update"] is not equal to set ["update", "add"]');
  assert.true(matcher(['write']),                   'NOT ["write"] does not equal to set ["update", "add"]');
  assert.end();
});