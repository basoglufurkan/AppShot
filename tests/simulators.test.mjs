// Simulator choice for automatic capture: the plan's device when this Mac has it, else the newest simulator with the
// same screen, else the newest with the store's canvas — never a model name that a newer Xcode no longer ships.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pickSimulator, canvas } from '../engine/lib/simulators.mjs';
import { workspace, run } from './_helpers.mjs';

const sim = (name, screen, { state = 'Shutdown', runtime = 'iOS-27-2', model = 27 } = {}) =>
  ({ name, udid: `${name}@${runtime}`, state, runtime: `com.apple.CoreSimulator.SimRuntime.${runtime}`, family: name.startsWith('iPad') ? 'iPad' : 'iPhone', model, screen });

// What Xcode 27 ships: the iPhone 18 line, no iPhone 17 Pro Max; the 6.3" iPhone 18 Pro happens to be booted.
const xcode27 = () => ({
  devices: [
    sim('iPhone 18 Pro', [1206, 2622], { state: 'Booted' }),
    sim('iPhone 18 Pro Max', [1320, 2868]),
    sim('iPhone Air', [1260, 2736], { model: 26 }),
    sim('iPhone 17', [1206, 2622], { model: 26 }),
    sim('iPhone Duo', [1398, 2034], { model: 27.1 }),
    sim('iPad Air 13-inch (M4)', [2048, 2732], { model: 26.3 }),
    sim('iPad Pro 13-inch (M5)', [2064, 2752], { model: 26 }),
    sim('iPad Pro 11-inch (M5)', [1668, 2420], { model: 26 }),
  ],
  modelScreen: (name) => ({ 'iPhone 17 Pro Max': [1320, 2868], 'iPad Pro 13-inch (M4)': [2064, 2752] })[name] || null,
});

test('the capture canvases come from engine/sizes.json', () => {
  assert.deepEqual([canvas('phone').width, canvas('phone').height], [1320, 2868]);
  assert.deepEqual([canvas('tablet').width, canvas('tablet').height], [2064, 2752]);
});

test('without a named device the newest 6.9" iPhone is used, not the booted 6.3" one', () => {
  const r = pickSimulator(xcode27(), 'phone');
  assert.equal(r.device.name, 'iPhone 18 Pro Max');
  assert.equal(r.note, undefined);
});

test('a plan written on an older Xcode gets the simulator with the same screen, and says so', () => {
  const r = pickSimulator(xcode27(), 'phone', 'iPhone 17 Pro Max');
  assert.equal(r.device.name, 'iPhone 18 Pro Max');
  assert.match(r.note, /No "iPhone 17 Pro Max" simulator on this Mac — using iPhone 18 Pro Max \(1320×2868, the same screen\)/);
  assert.match(r.note, /plan\.capture\.ios\.device/);
});

test('a named device this Mac has is used as it is, the booted copy first', () => {
  const s = xcode27();
  s.devices.push(sim('iPhone 17', [1206, 2622], { runtime: 'iOS-26-4', model: 26, state: 'Booted' }));
  assert.equal(pickSimulator(s, 'phone', 'iPhone 18 Pro').device.name, 'iPhone 18 Pro');
  assert.equal(pickSimulator(s, 'phone', 'iPhone 17').device.runtime, 'com.apple.CoreSimulator.SimRuntime.iOS-26-4');
  assert.equal(pickSimulator(s, 'phone', 'iPhone 18 Pro Max@iOS-27-2').device.name, 'iPhone 18 Pro Max'); // a udid works too
});

test('among simulators with the canvas screen a booted one wins, else the newest model', () => {
  const both = { devices: [sim('iPhone 16 Pro Max', [1320, 2868], { runtime: 'iOS-18-6', model: 18 }), sim('iPhone 18 Pro Max', [1320, 2868])] };
  assert.equal(pickSimulator(both, 'phone').device.name, 'iPhone 18 Pro Max');
  both.devices[0].state = 'Booted';
  assert.equal(pickSimulator(both, 'phone').device.name, 'iPhone 16 Pro Max');
});

test('iPads: the 13-inch iPad Pro, also when the plan names last year\'s model', () => {
  assert.equal(pickSimulator(xcode27(), 'tablet').device.name, 'iPad Pro 13-inch (M5)');
  const r = pickSimulator(xcode27(), 'tablet', 'iPad Pro 13-inch (M4)');
  assert.equal(r.device.name, 'iPad Pro 13-inch (M5)');
  assert.match(r.note, /plan\.capture\.ios\.tablet/);
});

test('an unknown name falls back to the store canvas; an older Xcode falls back to an accepted size', () => {
  const typo = pickSimulator(xcode27(), 'phone', 'iPhone 18 Pro Maxx');
  assert.equal(typo.device.name, 'iPhone 18 Pro Max');
  assert.match(typo.note, /No "iPhone 18 Pro Maxx" simulator/);
  // Xcode 15: no 1320×2868 iPhone yet, but the store also takes the 15 Pro Max's 1290×2796.
  const old = { devices: [sim('iPhone 15 Pro', [1179, 2556], { state: 'Booted', model: 17 }), sim('iPhone 15 Pro Max', [1290, 2796], { model: 17 })] };
  assert.equal(pickSimulator(old, 'phone').device.name, 'iPhone 15 Pro Max');
});

test('unreadable screens fall back to the model name; no simulator of the class is an error, not a crash', () => {
  const blind = { devices: [sim('iPhone 17', null, { state: 'Booted' }), sim('iPhone 17 Pro Max', null), sim('iPad Pro 13-inch (M5)', null), sim('iPad Pro 11-inch (M5)', null, { state: 'Booted' })] };
  assert.equal(pickSimulator(blind, 'phone').device.name, 'iPhone 17 Pro Max');
  assert.equal(pickSimulator(blind, 'tablet').device.name, 'iPad Pro 13-inch (M5)');
  assert.match(pickSimulator({ devices: [sim('iPhone 17', [1206, 2622])] }, 'tablet').error, /No iPad simulator on this Mac/);
  assert.match(pickSimulator({}, 'phone', 'iPhone 17 Pro Max').error, /plan\.capture\.ios\.device is "iPhone 17 Pro Max"/);
});

test('a dry run still prints every step when the plan names a simulator this Mac does not have', () => {
  const ws = workspace({ shots: [{ id: 'a', layout: 'hero-device', screen: 'raw/{locale}/home.png' }],
    capture: { ios: { bundleId: 'com.example.app', device: 'iPhone 0 Pro Max' }, screens: { home: { url: 'x://home' } } } });
  const r = run('capture/auto.mjs', ['run', '--workspace', ws]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /home: launch com\.example\.app .*→ raw\/en-US\/home\.png/);
  assert.match(r.stdout, /Dry run: \d+ step\(s\), nothing changed/);
  assert.match(r.stderr, /No "iPhone 0 Pro Max" simulator on this Mac|xcrun simctl not available/);
});
