/* Philosophy From A Stone: glass-like turning solids in plain CSS 3D (no outside library).
   Solids.make('octa' | 'tetra' | 'merkaba', color) returns an element to place inside a 3D scene.
   The solid's up-axis is the scene's Z axis, so on a tilted board it stands on the board and turns like a turntable.
   Sizing: put it in a box and set --k on an ancestor to the square size in pixels (unitless). */
(function () {
  'use strict';
  var R = 50;                                   // solid radius in px before scaling
  function v(x, y, z) { return [x * R, y * R, z * R]; }
  var OCTA_V = [v(1, 0, 0), v(-1, 0, 0), v(0, 1, 0), v(0, -1, 0), v(0, 0, 1), v(0, 0, -1)];
  function octaFaces() {
    var f = [], sx = [0, 1], sy = [2, 3], sz = [4, 5];
    sx.forEach(function (a) { sy.forEach(function (b) { sz.forEach(function (c) { f.push([OCTA_V[a], OCTA_V[b], OCTA_V[c]]); }); }); });
    return f;
  }
  function tetraFaces(sign) {
    var k = 0.577;                              // vertices on a sphere of radius R
    var p = [v(k, k, k), v(k, -k, -k), v(-k, k, -k), v(-k, -k, k)].map(function (a) { return [a[0] * sign, a[1] * sign, a[2] * sign]; });
    return [[p[0], p[1], p[2]], [p[0], p[1], p[3]], [p[0], p[2], p[3]], [p[1], p[2], p[3]]];
  }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function unit(a) { var l = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  var NS = 'http://www.w3.org/2000/svg';

  function face(tri, color) {
    var A = tri[0], B = tri[1], C = tri[2], ex = sub(B, A), ey = sub(C, A), ez = unit(cross(ex, ey));
    var el = document.createElement('div'); el.className = 'sol-f';
    // a 100x100 box with a right-triangle shape, mapped by an affine matrix onto triangle ABC
    var m = [ex[0] / 100, ex[1] / 100, ex[2] / 100, 0, ey[0] / 100, ey[1] / 100, ey[2] / 100, 0, ez[0], ez[1], ez[2], 0, A[0], A[1], A[2], 1];
    el.style.transform = 'matrix3d(' + m.map(function (n) { return +n.toFixed(5); }).join(',') + ')';
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('width', '100'); svg.setAttribute('height', '100');
    var poly = document.createElementNS(NS, 'polygon'); poly.setAttribute('points', '1,1 99,1 1,99');
    poly.setAttribute('fill', color.fill); poly.setAttribute('stroke', color.edge); poly.setAttribute('stroke-width', '2.4'); poly.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(poly); el.appendChild(svg); return el;
  }
  var COL = {
    cyan: { edge: '#46e3f0', fill: 'rgba(70,227,240,.20)' },
    gold: { edge: '#e8c375', fill: 'rgba(232,195,117,.20)' },
    ice: { edge: '#f4f9ff', fill: 'rgba(235,245,255,.28)' }
  };
  var injected = false;
  function css() {
    if (injected) return; injected = true;
    var s = document.createElement('style');
    s.textContent = '.sol{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d;transform:translateZ(calc(var(--k,60)*.44px)) scale(calc(var(--k,60)*.0078));pointer-events:none}' +
      '.sol-spin{position:absolute;left:0;top:0;width:0;height:0;transform-style:preserve-3d;animation:solspin var(--dur,18s) linear infinite}' +
      '.sol-f{position:absolute;left:0;top:0;width:100px;height:100px;transform-origin:0 0;backface-visibility:visible}' +
      '.sol-f svg{display:block;overflow:visible}' +
      '@keyframes solspin{from{transform:rotateZ(0)}to{transform:rotateZ(360deg)}}' +
      '@media (prefers-reduced-motion:reduce){.sol-spin{animation:none}}';
    document.head.appendChild(s);
  }
  var T0 = performance.now();
  /* kind: 'octa' | 'tetra' | 'merkaba'; color: 'cyan' | 'gold' | 'ice'; seed varies the starting angle; dur in seconds */
  function make(kind, color, seed, dur) {
    css();
    var c = COL[color] || COL.cyan, root = document.createElement('div'); root.className = 'sol';
    var spin = document.createElement('div'); spin.className = 'sol-spin';
    dur = dur || 18;
    // continue the turn smoothly even when the piece is redrawn: derive the delay from a shared clock
    var t = ((performance.now() - T0) / 1000 + (seed || 0) * 2.7) % dur;
    spin.style.setProperty('--dur', dur + 's'); spin.style.animationDelay = '-' + t.toFixed(3) + 's';
    var faces = kind === 'octa' ? octaFaces() : kind === 'tetra' ? tetraFaces(1) : tetraFaces(1).concat(tetraFaces(-1));
    faces.forEach(function (f) { spin.appendChild(face(f, c)); });
    root.appendChild(spin); return root;
  }
  window.Solids = { make: make };
})();
