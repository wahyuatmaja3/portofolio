import * as THREE from 'three';
import { MeshTransmissionMaterial } from 'three/addons/materials/MeshTransmissionMaterial.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// reactbits FluidGlass (mode "lens"), ported to vanilla three.js.
// Settings ported from the component usage: scale 0.25 (see sizing below),
// ior 1.15, thickness 2, transmission 1, roughness 0,
// chromaticAberration 0.05, anisotropy 0.01.
//
// The lens refracts a captured snapshot of the hero DOM through a
// MeshTransmissionMaterial whose buffer is rendered each pass from a
// scene.background copy of that snapshot, so the glass reads as a real
// refractive window over the page. Pointer-follow, containment and the
// reduced-motion / coarse-pointer gates carry over from the earlier lens.

(function () {
    var host = document.querySelector('[data-fluid-glass]');
    if (!host) return;

    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduced) {
        window.__fluidGlass = { state: 'bailed', why: reduced ? 'reduced' : 'coarse-pointer', finePointer: finePointer, reduced: reduced };
        host.style.display = 'none';
        return;
    }

    var renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
    } catch (e) { /* fall through */ }
    if (!renderer) {
        window.__fluidGlass = { state: 'bailed', why: 'webgl' };
        host.style.display = 'none';
        return;
    }
    if (!window.html2canvas) {
        window.__fluidGlass = { state: 'bailed', why: 'no-html2canvas' };
        host.style.display = 'none';
        return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var canvas = renderer.domElement;
    canvas.className = 'fluid-glass__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
    camera.position.z = 10;

    // captured hero snapshot, refreshed while the lens is active
    var hero = document.getElementById('hero');
    var heroTexture = new THREE.CanvasTexture(document.createElement('canvas'));
    heroTexture.colorSpace = THREE.SRGBColorSpace;

    var fbo = new THREE.WebGLRenderTarget(1, 1);
    var bufferDirty = false;
    // re-render the backdrop into the transmission buffer only when the source
    // texture changes (the snapshot refill / theme / resize), not every frame:
    // the lens is removed for that pass, so the buffer holds just the hero.
    function renderBuffer() {
        var oldTone = renderer.toneMapping;
        var oldBg = scene.background;
        var oldEnv = material.envMapIntensity;

        renderer.toneMapping = THREE.NoToneMapping;
        scene.background = heroTexture;
        lens.material = discardMaterial;
        renderer.setRenderTarget(fbo);
        renderer.render(scene, camera);
        lens.material = material;
        material.uniforms.thickness.value = material.thickness;
        material.uniforms.buffer.value = fbo.texture;
        material.envMapIntensity = oldEnv;
        scene.background = oldBg;
        renderer.setRenderTarget(null);
        renderer.toneMapping = oldTone;
}

    var discardMaterial = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        vertexShader:
            'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        // WebGL2 demands an output declaration even when the fragment is
        // discarded, otherwise the draw is dropped with INVALID_OPERATION
        fragmentShader:
            'void main(){gl_FragColor=vec4(0.0);discard;}'
    });
    var material = new MeshTransmissionMaterial(6, false);
    // reactbits lens settings
    material.ior = 1.15;
    material.thickness = 2;
    material.uniforms.chromaticAberration.value = 0.05;
    material.uniforms.anisotropicBlur.value = 0.01;
    material.uniforms._transmission.value = 1;
    material.uniforms.transmission.value = 0;

    var lens = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 48), material);
    lens.rotation.x = Math.PI / 2;
    scene.add(lens);

    // ---- sizing / containment ----
    var rect = { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 };
    var w = 0, h = 0, dpr = 1;
    var lensScale = 1;

    function measure() {
        var r = host.getBoundingClientRect();
        rect.left = r.left;
        rect.top = r.top;
        rect.right = r.right;
        rect.bottom = r.bottom;
        rect.width = r.width;
        rect.height = r.height;
        w = Math.max(1, Math.round(r.width));
        h = Math.max(1, Math.round(r.height));
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        camera.left = -w / 2;
        camera.right = w / 2;
        camera.top = h / 2;
        camera.bottom = -h / 2;
        camera.updateProjectionMatrix();

        renderer.setSize(w, h, false);
        renderer.setPixelRatio(dpr);
        // half-resolution buffer: the glass blurs/refracts it anyway, so the
        // fbo pass costs a fraction of a full-res one per refresh
        var px = Math.max(1, Math.round(w * dpr / 2));
        var py = Math.max(1, Math.round(h * dpr / 2));
        if (fbo.width !== px || fbo.height !== py) {
            fbo.setSize(px, py);
        }
        // a big refractive window: ~38% of the shorter hero side
        var target = Math.min(w, h) * 0.38;
        lensScale = target / geometrySize;
        lens.scale.setScalar(lensScale);
    }

    // ---- geometry reference size (after autorotation) ----
    var geometrySize = 1;

    // ---- hero snapshot (layered composite -> canvas texture) ----
    // foreignObject-backed SVGs taint any canvas they touch and Chromium then
    // refuses to upload them to WebGL, so the DOM is rasterised with the
    // vendored html2canvas instead. A full-body raster is too slow to run per
    // frame, so the scene is split into three layers:
    //   1. paper + static copy  -> html2canvas once per theme / resize
    //   2. the rotating role reel -> html2canvas only on a reel step
    //   3. the live particles canvas -> copied in with drawImage (cheap,
    //      and a 2D canvas is always origin-clean, unlike the SVG paths)
    var capCanvas = document.createElement('canvas');
    var capCtx = capCanvas.getContext('2d');
    var baseCanvas = null;
    var reelCanvas = null;
    var reelLeft = 0, reelTop = 0;
    var underlying = null;
    var baseLoading = false, reelLoading = false;
    var compositeScheduled = 0;
    var lastCaption = 0;

    function toHeroRect(r) {
        var hr = hero.getBoundingClientRect();
        return { left: r.left - hr.left, top: r.top - hr.top, width: r.width, height: r.height };
    }

    function sizeCap() {
        var ho = hero.offsetWidth, hoH = hero.offsetHeight;
        if (!ho || !hoH) return false;
        if (capCanvas.width !== ho) capCanvas.width = ho;
        if (capCanvas.height !== hoH) capCanvas.height = hoH;
        return true;
    }

    function scheduleComposite(delay) {
        if (compositeScheduled) return;
        compositeScheduled = 1;
        setTimeout(function () {
            compositeScheduled = 0;
            if (!sizeCap()) return;
            var p = hero.querySelector('[data-particles]');
            if (!baseCanvas && !reelCanvas && !p) return;
            var pr = p ? toHeroRect(p.getBoundingClientRect()) : null;
            capCtx.clearRect(0, 0, capCanvas.width, capCanvas.height);
            if (baseCanvas) capCtx.drawImage(baseCanvas, 0, 0);
            if (pr) capCtx.drawImage(p, pr.left, pr.top, pr.width, pr.height);
            if (reelCanvas) capCtx.drawImage(reelCanvas, reelLeft, reelTop);
            underlying = capCanvas;
            heroTexture.image = underlying;
            heroTexture.needsUpdate = true;
            bufferDirty = true;
        }, delay || 0);
    }

    function rasterBase() {
        if (!window.html2canvas || baseLoading) return;
        var ho = hero.offsetWidth, hoH = hero.offsetHeight;
        if (!ho || !hoH) return;
        if (capCanvas.width !== ho) capCanvas.width = ho;
        if (capCanvas.height !== hoH) capCanvas.height = hoH;
        baseLoading = true;
        var reel = document.querySelector('[data-reel]');
        var particles = hero.querySelector('[data-particles]');
        var rv = reel && reel.style.visibility;
        var pv = particles && particles.style.visibility;
        if (reel) reel.style.visibility = 'hidden';
        if (particles) particles.style.visibility = 'hidden';
        html2canvas(document.body, {
            width: ho, height: hoH,
            windowWidth: innerWidth, windowHeight: innerHeight,
            scrollX: 0, scrollY: 0,
            scale: 1, logging: false, backgroundColor: null
        }).then(function (cv) {
            try {
                var _c = cv.getContext('2d'); var _s = 0, _n = 0, _m = 0, _M = 0;
                for (var _y = 0; _y < cv.height; _y += 20) for (var _x = 0; _x < cv.width; _x += 20) {
                    var _d = _c.getImageData(_x, _y, 1, 1).data; var _l = (_d[0] + _d[1] + _d[2]) / 3; _s += _l; _n++; _m = Math.min(_m, _l); _M = Math.max(_M, _l);
                }
                window.__fgStat = { mean: +(_s / _n).toFixed(1), min: Math.round(_m), max: Math.round(_M) };
            } catch (e) { window.__fgStat = { err: e.message }; }
            if (reel) reel.style.visibility = rv;
            if (particles) particles.style.visibility = pv;
            baseCanvas = cv;
            baseLoading = false;
            scheduleComposite(0);
        }).catch(function (e) {
            if (reel) reel.style.visibility = rv;
            if (particles) particles.style.visibility = pv;
            baseLoading = false;
            window.__fgWarn = String(e && e.message || e);
        });
    }

    function rasterReel() {
        if (!window.html2canvas || reelLoading) return;
        window.__fgReel = window.__fgReel || { calls: 0, ok: 0, err: null };
        window.__fgReel.calls++;
        var reel = document.querySelector('[data-reel]');
        if (!reel) { window.__fgReel.err = 'no reel'; return; }
        var r = reel.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var hr = toHeroRect(r);
        reelLoading = true;
        html2canvas(reel, { scale: 1, logging: false, backgroundColor: null })
            .then(function (cv) {
                reelLoading = false;
                window.__fgReel.ok++;
                reelCanvas = cv;
                reelLeft = hr.left;
                reelTop = hr.top;
                scheduleComposite(0);
            })
            .catch(function (e) { reelLoading = false; window.__fgReel.err = String(e && e.message || e); });
    }

    // track the reel's translating position so we only re-raster when it moves
    var reelTrack = document.querySelector('[data-reel-track]');
    var reelPrevT = null, reuReelSeen = 0, lastRaster = 0, lastReelRaster = 0;
    function reelMoved() {
        if (!reelTrack) return false;
        var t = getComputedStyle(reelTrack).transform;
        if (t === reelPrevT) return false;
        reelPrevT = t;
        reuReelSeen = performance.now(); return true;
    }

    function refreshLayers() {
        if (!baseCanvas) { rasterBase(); return; }
        // debounce: the reel is re-rastered at most every 150ms
        if (reelMoved() && performance.now() - lastReelRaster > 150) { lastReelRaster = performance.now(); rasterReel(); }
        scheduleComposite(0);
    }

    // ---- pointer follow ----
    var tx = 0, ty = 0, x = 0, y = 0;
    var lastClientX = -1, lastClientY = -1;
    var active = false;

    function inside(clientX, clientY) {
        return clientX >= rect.left && clientX <= rect.right &&
               clientY >= rect.top && clientY <= rect.bottom;
    }

    function retest() {
        measure();
        bufferDirty = true;
        if (lastClientX < 0) return; setActive(inside(lastClientX, lastClientY));
    }
    window.addEventListener('scroll', retest, { passive: true });
    window.addEventListener('resize', retest);

    function setActive(on) {
        if (on === active) return;
        active = on;
        host.classList.toggle('is-on', on);
        if (on) {
            // the idle warm capture can beat the webfonts; refresh once more now
            if (performance.now() - (lastRaster || 0) > 4000) { lastRaster = performance.now(); rasterBase(); }
            refreshLayers();
            requestAnimationFrame(tick);
        }
    }

    window.addEventListener('pointermove', function (ev) {
        if (ev.pointerType && ev.pointerType !== 'mouse') return;
        lastClientX = ev.clientX;
        lastClientY = ev.clientY;
        if (!inside(ev.clientX, ev.clientY)) {
            setActive(false);
            return;
        }
        tx = ev.clientX - rect.left - rect.width / 2;
        ty = rect.height / 2 - (ev.clientY - rect.top);
        setActive(true);
    });

    window.addEventListener('blur', function () { setActive(false); });

    // ---- render loop ----
    var clock = new THREE.Clock();
    var lastK = 0;

    function tick(now) {
        if (!active) return;
        requestAnimationFrame(tick);

        var dt = Math.min((now - lastK) / 1000, 0.05) || 0.016;
        lastK = now;
        var k = 1 - Math.exp(-3 * dt);
        x += (tx - x) * k;
        y += (ty - y) * k;
        lens.position.set(x, y, 0);

        material.uniforms.time.value = clock.getElapsedTime();

        // refresh the snapshot a few times a second while active so the reel
        // and particles keep living inside the glass without starving frames
        if (performance.now() - lastCaption > 600) {
            lastCaption = performance.now();
            refreshLayers();
        }

        // re-render the transmission buffer only when it went stale
        if (bufferDirty) { renderBuffer(); bufferDirty = false; }

        renderer.render(scene, camera);
    }

    // ---- boot: load the GLB, then size and go ----
    // the lens model ships Draco-compressed, so wire up the decoder first
    var draco = new DRACOLoader();
    draco.setDecoderPath('vendor/three/addons/libs/draco/gltf/');
    var loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    loader.load('vendor/assets/lens.glb', function (gltf) {
        var root = gltf.scene;
        var mesh = null;
        root.traverse(function (o) {
            if (!mesh && o.isMesh) mesh = o;
        });
        if (!mesh) {
            window.__fluidGlass = { state: 'bailed', why: 'no-mesh' };
            host.style.display = 'none';
            return;
        }
        lens.geometry = mesh.geometry;
        lens.updateMatrixWorld(true);
        var box = new THREE.Box3().setFromObject(lens);
        var size = box.getSize(new THREE.Vector3());
        geometrySize = Math.max(size.x, size.y, 0.001);
        lens.material = material;
        measure();
        // expose a small debug handle for the test harness
        window.__fluidGlass = {
            state: 'ready',
            canvas: canvas,
            lens: lens,
            material: material,
            capCanvas: capCanvas,
            baseCanvas: baseCanvas,
            baseLoading: function () { return baseLoading; },
            warn: function () { return window.__fgWarn || null; },
            lensScale: function () { return lens.scale.x; },
            isActive: function () { return active; },
            hasReelCap: function () { return !!reelCanvas; },
            pixel: function (x, y) {
                var got = function (cv) {
                    if (!cv || !cv.width) return null;
                    var c = cv.getContext('2d');
                    try { var d = c.getImageData(Math.min(x, cv.width - 1), Math.min(y, cv.height - 1), 1, 1).data; return [d[0], d[1], d[2]]; } catch (e) { return ['tainted']; }
                };
                return { base: got(baseCanvas), cap: got(capCanvas), hasBase: !!baseCanvas, hasReel: !!reelCanvas, baseLoading: baseLoading };
            }
        };
        // warm the base snapshot while the user is still reading, so the first
        // hover is instant; re-run whenever the theme flips (or fonts arrive)
        setTimeout(function () { lastRaster = performance.now(); rasterBase(); }, 700);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(rasterBase);
        if (window.MutationObserver) {
            new MutationObserver(function (m) {
                for (var i = 0; i < m.length; i++) {
                    if (m[i].attributeName === 'data-theme' || m[i].attributeName === 'data-theme-mode') {
                        rasterBase(); break;
                    }
                }
            }).observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'data-theme-mode'] });
        }
    }, undefined, function (err) {
        window.__fluidGlass = { state: 'bailed', why: 'gltf-error', detail: String(err && err.message) };
        host.style.display = 'none';
    });
}());