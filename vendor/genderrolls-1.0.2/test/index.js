import expect from 'unexpected';
import _ from 'lodash';
import {applyModifiers, determineRolls, removeCode, genderRoll, ALL_ROLLS, ENABLED_ROLLS} from '../lib';

const coreTriggers = _.flatten(
  ENABLED_ROLLS.filter((r) => r.core).map((r) => r.trigger));

describe('removeCode', function () {
  it('should remove code segments', function () {
    expect(removeCode('Type `a + b` at the prompt.'), 'to be', 'Type  at the prompt.');
  });
  it('should not be greedy when multiple segments are present', function () {
    expect(
      removeCode('Type `a + b` followed by `c * d` please.'), 'to be',
      'Type  followed by  please.');
  });
});

describe('ENABLED_ROLLS', function () {
  it('should not have multiple core rolls with the same trigger', function () {
    ENABLED_ROLLS.filter((r) => r.core).forEach(function (roll) {
      const otherTriggers = _.flatten(ENABLED_ROLLS.filter((r) => r !== roll).map((r) => r.trigger));
      roll.trigger.forEach(function (trigger) {
        expect(otherTriggers, 'not to contain', trigger);
      });
    });
  });
});

describe('determineRolls', function () {
  it('should produce the base set', function () {
    expect(determineRolls('gender roll'), 'to equal', [[ALL_ROLLS.BASE], []]);
  });
  it('should produce a nested set', function () {
    expect(
      determineRolls('transfemme roll'), 'to equal',
      [[ALL_ROLLS.BASE, ALL_ROLLS.GQ, ALL_ROLLS.TF], []]);
  });
  it('should return null when multiple sets requested', function () {
    expect(determineRolls('transfemme roll and transmasc roll'), 'to be null');
  });
  it('should produce a modified set', function () {
    expect(
      determineRolls('transmasc roll -cake'), 'to equal',
      [[ALL_ROLLS.BASE, ALL_ROLLS.GQ, ALL_ROLLS.TM], [ALL_ROLLS.NO_CAKE]]);
  });
  it('should ignore modifiers that do not exist', function () {
    expect(
      determineRolls('transmasc roll -cake +fnord'), 'to equal',
      [[ALL_ROLLS.BASE, ALL_ROLLS.GQ, ALL_ROLLS.TM], [ALL_ROLLS.NO_CAKE]]);
  });
  it('should handle requirements', function () {
    expect(
      determineRolls('transmasc roll +robot'), 'to equal',
      [[ALL_ROLLS.BASE, ALL_ROLLS.GQ, ALL_ROLLS.TM], [ALL_ROLLS.YES_ROBOTS]]);
    expect(
      determineRolls('transfemme roll +robot'), 'to equal',
      [[ALL_ROLLS.BASE, ALL_ROLLS.GQ, ALL_ROLLS.TF], [ALL_ROLLS.YES_ROBOTS, ALL_ROLLS.YES_ROBOTS_TF]]);
  });
  it('should only match at word boundaries', function () {
    // We've had a few issues with this.
    // 1. 'agender roll' is not yet implemented, but 'gender roll' is.
    // A user types 'agender roll' and 'gender roll' matches, when it shouldn't.
    // 2. 'fenby roll' and 'enby roll' are both implemented. 'fenby roll' matches
    // both core roll types, and is thus ignored.
    // 3. 'gender roll, please' needs to notice that ',' is not part of
    // the 'roll' word. 'gender roll -cake' needs to notice that
    // '-' is part of the 'cake' word. 'super-cake' is not '-cake'.
    // check assumptions
    expect(coreTriggers, 'not to contain', 'agender roll');
    expect(coreTriggers, 'to contain', 'gender roll');
    expect(coreTriggers, 'to contain', 'enby roll');
    expect(coreTriggers, 'to contain', 'fenby roll');

    expect(determineRolls('agender roll'), 'to be null');
    expect(determineRolls('fenby roll'), 'not to be null');
    expect(determineRolls('gender roll!'), 'not to be null');
    expect(determineRolls('+gender roll'), 'to be null');
    expect(determineRolls('gender roll -cake +robot'), 'not to be null');
    expect(determineRolls('gender roll -cake +robot')[1], 'to have length', 2);
    expect(determineRolls('gender roll super-cake'), 'not to be null');
    expect(determineRolls('gender roll super-cake')[1], 'to have length', 0);
  });
});

describe('applyModifiers', function () {
  const SAMPLE_BASE = {slots: [['A', 'B'], ['M', 'N'], ['Y', 'Z']]};
  const MOD_1 = {mods: [[['C'], ['B']], [['O'], []], [['X'], []]]};
  const MOD_2 = {mods: [[['A'], ['C']], [[], ['M']], [[], ['Z']]]};
  const MOD_3 = {mods: [[['D'], ['A', 'B']], [[], []], [[], ['Y', 'X']]]};
  it('should return a single item as-is', function () {
    expect(applyModifiers([SAMPLE_BASE]), 'to equal', [['A', 'B'], ['M', 'N'], ['Y', 'Z']]);
  });
  it('should apply a single mod', function () {
    expect(
      applyModifiers([SAMPLE_BASE, MOD_1]), 'to equal',
      [['A', 'C'], ['M', 'N', 'O'], ['Y', 'Z', 'X']]);
    expect(
      applyModifiers([SAMPLE_BASE, MOD_2]), 'to equal',
      [['A', 'B'], ['N'], ['Y']]);
    expect(
      applyModifiers([SAMPLE_BASE, MOD_3]), 'to equal',
      [['D'], ['M', 'N'], ['Z']]);
  });
  it('should apply multiple mods', function () {
    expect(
      applyModifiers([SAMPLE_BASE, MOD_1, MOD_3]), 'to equal',
      [['C', 'D'], ['M', 'N', 'O'], ['Z']]);
  });
});

describe('genderRoll', function () {
  it('should return a string, unless we ask it not to', function () {
    expect(genderRoll('transfemme roll'), 'to be a', 'string');
    expect(genderRoll('transfemme roll', false), 'to be a', 'array');
  });
  it('should return a value with three components', function () {
    coreTriggers.forEach((trigger) => {
      [trigger, `prefix ${trigger}`, `${trigger} postfix`].forEach((text) => {
        const result = genderRoll(text, false);
        expect(result, 'to be a', 'array');
        expect(result, 'to have length', 3);
      });
    });
  });
  it('should gracefully handle bad roll names', function () {
    expect(genderRoll('nonexistent roll'), 'to be null');
  });
  it('should gracefully handle bad modifiers', function () {
    const result = genderRoll('transfemme roll +fnord', false);
    expect(result, 'to be a', 'array');
    expect(result, 'to have length', 3);
  });
});
