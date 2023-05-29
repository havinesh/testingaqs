
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    function attribute_to_object(attributes) {
        const result = {};
        for (const attribute of attributes) {
            result[attribute.name] = attribute.value;
        }
        return result;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement === 'function') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                const { on_mount } = this.$$;
                this.$$.on_disconnect = on_mount.map(run).filter(is_function);
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            disconnectedCallback() {
                run_all(this.$$.on_disconnect);
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                if (!is_function(callback)) {
                    return noop;
                }
                const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            $set($$props) {
                if (this.$$set && !is_empty($$props)) {
                    this.$$.skip_bound = true;
                    this.$$set($$props);
                    this.$$.skip_bound = false;
                }
            }
        };
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.58.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }

    /* src/App.svelte generated by Svelte v3.58.0 */

    const file = "src/App.svelte";

    // (10:0) {#if isVisible}
    function create_if_block(ctx) {
    	let div22;
    	let div19;
    	let div18;
    	let div17;
    	let div4;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div2;
    	let a;
    	let t5;
    	let div16;
    	let div15;
    	let div14;
    	let div13;
    	let div12;
    	let div11;
    	let div10;
    	let div6;
    	let div5;
    	let img;
    	let img_src_value;
    	let t6;
    	let div9;
    	let div8;
    	let div7;
    	let t8;
    	let div21;
    	let div20;
    	let textarea;
    	let t9;
    	let button;

    	const block = {
    		c: function create() {
    			div22 = element("div");
    			div19 = element("div");
    			div18 = element("div");
    			div17 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "cleandesk.ai";
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "Conversational AI provides community service.";
    			t3 = space();
    			div2 = element("div");
    			a = element("a");
    			a.textContent = "Sign up";
    			t5 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			img = element("img");
    			t6 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			div7.textContent = "Hi there! 👋 Let me know if you have any\n                              questions!";
    			t8 = space();
    			div21 = element("div");
    			div20 = element("div");
    			textarea = element("textarea");
    			t9 = space();
    			button = element("button");
    			button.textContent = "Send";
    			attr_dev(div0, "class", "smith-header-profile-name");
    			add_location(div0, file, 16, 14, 399);
    			add_location(span, file, 18, 16, 528);
    			attr_dev(div1, "class", "smith-header-profile-intro");
    			add_location(div1, file, 17, 14, 471);
    			attr_dev(a, "href", "");
    			add_location(a, file, 21, 16, 677);
    			attr_dev(div2, "class", "smith-header-profile-cta");
    			add_location(div2, file, 20, 14, 622);
    			attr_dev(div3, "class", "smith-header-profile");
    			add_location(div3, file, 15, 12, 350);
    			attr_dev(div4, "class", "smith-chat-header");
    			add_location(div4, file, 14, 10, 306);
    			if (!src_url_equal(img.src, img_src_value = "https://prod-smith-dynamic.imgix.net/static/logos/smith-footer-logo.png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file, 38, 28, 1454);
    			attr_dev(div5, "class", "smith-avatar");
    			add_location(div5, file, 37, 26, 1399);
    			attr_dev(div6, "class", "smith-comment-container-admin-avatar");
    			add_location(div6, file, 36, 24, 1322);
    			attr_dev(div7, "class", "smith-block smith-block-paragraph");
    			add_location(div7, file, 45, 28, 1795);
    			attr_dev(div8, "class", "smith-blocks");
    			add_location(div8, file, 44, 26, 1740);
    			attr_dev(div9, "class", "smith-comment");
    			add_location(div9, file, 43, 24, 1686);
    			attr_dev(div10, "class", "smith-comment-container smith-comment-container-admin");
    			add_location(div10, file, 33, 22, 1183);
    			attr_dev(div11, "class", "smith-conversation-part smith-conversation-part-admin");
    			add_location(div11, file, 30, 20, 1050);
    			attr_dev(div12, "class", "smith-conversation-parts");
    			add_location(div12, file, 29, 18, 991);
    			attr_dev(div13, "class", "smith-conversation-parts-wrapper");
    			add_location(div13, file, 28, 16, 926);
    			attr_dev(div14, "class", "smith-conversation-body-parts");
    			add_location(div14, file, 27, 14, 866);
    			attr_dev(div15, "class", "smith-conversation-container");
    			add_location(div15, file, 26, 12, 809);
    			attr_dev(div16, "class", "smith-chat-body");
    			add_location(div16, file, 25, 10, 767);
    			attr_dev(div17, "class", "smith-chat");
    			add_location(div17, file, 13, 8, 271);
    			attr_dev(div18, "id", "smith-chat-container");
    			add_location(div18, file, 12, 6, 231);
    			attr_dev(div19, "class", "smith-chat-frame");
    			add_location(div19, file, 11, 4, 194);
    			attr_dev(textarea, "placeholder", "Type your message");
    			attr_dev(textarea, "rows", "1");
    			add_location(textarea, file, 63, 8, 2338);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn send-btn");
    			add_location(button, file, 64, 8, 2400);
    			attr_dev(div20, "class", "smith-chat-bar-message");
    			add_location(div20, file, 62, 6, 2293);
    			attr_dev(div21, "class", "smith-chat-bar");
    			add_location(div21, file, 61, 4, 2258);
    			attr_dev(div22, "id", "smith-container");
    			add_location(div22, file, 10, 2, 163);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div22, anchor);
    			append_dev(div22, div19);
    			append_dev(div19, div18);
    			append_dev(div18, div17);
    			append_dev(div17, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, span);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, a);
    			append_dev(div17, t5);
    			append_dev(div17, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div6);
    			append_dev(div6, div5);
    			append_dev(div5, img);
    			append_dev(div10, t6);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div22, t8);
    			append_dev(div22, div21);
    			append_dev(div21, div20);
    			append_dev(div20, textarea);
    			append_dev(div20, t9);
    			append_dev(div20, button);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div22);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(10:0) {#if isVisible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block = /*isVisible*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");
    			t1 = space();
    			button = element("button");
    			button.textContent = "click";
    			this.c = noop;
    			attr_dev(div, "class", "smith-launcher");
    			add_location(div, file, 71, 0, 2555);
    			attr_dev(button, "class", "smith-launcher-frame");
    			add_location(button, file, 72, 0, 2586);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*showChatWidget*/ ctx[1], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isVisible*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('chat-widget', slots, []);
    	let isVisible = false;

    	function showChatWidget() {
    		$$invalidate(0, isVisible = !isVisible);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<chat-widget> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ isVisible, showChatWidget });

    	$$self.$inject_state = $$props => {
    		if ('isVisible' in $$props) $$invalidate(0, isVisible = $$props.isVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isVisible, showChatWidget];
    }

    class App extends SvelteElement {
    	constructor(options) {
    		super();
    		const style = document.createElement('style');

    		style.textContent = `#smith-container{width:0px;height:0px;bottom:0px;right:0px;z-index:999999}#smith-chat-container{overflow:hidden}.smith-chat-frame{z-index:999999 !important;position:fixed !important;bottom:20px;right:20px;height:calc(100% - 20px - 20px);width:400px !important;min-height:250px !important;max-height:480px !important;box-shadow:0px 1px 4px rgba(13, 22, 26, 0.08),
      0px 4px 16px rgba(13, 22, 26, 0.12), 0px 2px 12px rgba(13, 22, 26, 0.08);border-radius:2px !important;overflow:hidden !important;opacity:1 !important}.smith-chat-bar{z-index:999999 !important;position:fixed !important;bottom:calc(20px + 56px + 16px);right:20px;height:60px;width:400px !important;box-shadow:0px 1px 4px rgba(13, 22, 26, 0.08),
      0px 4px 16px rgba(13, 22, 26, 0.12), 0px 2px 12px rgba(13, 22, 26, 0.08);border-radius:2px !important;overflow:hidden !important;opacity:1 !important;background:#fff}#smith-container{}#smith-container .smith-chat-frame{height:100%;width:100%;height:calc(100% - 20px - 76px - 20px);bottom:calc(20px + 56px + 16px + 60px + 8px)}#smith-container .smith-chat{display:flex;flex-direction:column;position:absolute;top:0;bottom:0;left:0;right:0;background:#fff}#smith-container .smith-chat-header{background:#fff;border-top:16px solid #1e9fd6;position:relative;top:0;left:0;right:0;transition:height 0.16s ease-out}#smith-container .smith-header-profile{padding:32px 48px 16px 48px;box-sizing:border-box;text-align:center}#smith-container .smith-header-profile-name{color:rgba(0, 18, 26, 0.93);font-size:20px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px}#smith-container .smith-header-profile-intro{color:rgba(0, 18, 26, 0.59);font-size:14px;line-height:20px;margin-bottom:4px}#smith-container .smith-header-profile-cta a{color:#1e9fd6;font-size:14px;text-decoration:none;opacity:0.9;transition:opacity 0.15s ease-in-out}#smith-container .smith-team-profile-full-cta a:hover{opacity:1}#smith-container .smith-chat-body{position:relative;flex:1;background-color:#fff}#smith-container .smith-conversation-container{position:absolute;top:0;left:0;right:0;bottom:0}#smith-container .smith-conversation-body-parts{position:absolute;top:0;left:0;right:0;bottom:0;overflow-x:hidden;overflow-y:scroll}#smith-container .smith-conversation-parts{padding:24px 20px 0;display:flex;flex-flow:row wrap}#smith-container .smith-conversation-parts-wrapper{display:flex;min-height:100%;flex-direction:column;justify-content:space-between}#smith-container .smith-comment-container{position:relative;margin-bottom:24px}#smith-container .smith-comment-container-admin{float:left;padding-left:40px;width:calc(100% - 48px)}#smith-container .smith-comment-container-admin-avatar{position:absolute;left:0;bottom:2px}#smith-container .smith-avatar{margin:0 auto;border-radius:50%;display:inline-block;vertical-align:middle}#smith-container .smith-comment-container-admin-avatar .smith-avatar{width:28px;height:28px;line-height:28px;font-size:14px}#smith-container .smith-avatar img{border-radius:50%}#smith-container .smith-comment-container-admin-avatar .smith-avatar img{width:28px;height:28px}#smith-container .smith-comment:not(.smith-comment-with-body){padding:12px 20px;border-radius:20px;position:relative;display:inline-block;width:auto;max-width:75%}#smith-container .smith-comment-container-admin .smith-comment:not(.smith-comment-with-body){color:rgba(0, 18, 26, 0.93);background-color:#edf1f2}#smith-container .smith-comment .smith-block-paragraph{font-size:14px;line-height:20px}.smith-chat-bar-message{padding:12px;display:flex;align-items:center}.smith-chat-bar-message textarea{background-color:transparent;border-radius:0;border:none;font-size:14px;flex:2;line-height:1.25rem;max-height:100px;outline:none;overflow-x:hidden;resize:none;padding:0;margin:0px 8px}.btn{font-weight:400;text-align:center;white-space:nowrap;vertical-align:middle;user-select:none;border:1px solid transparent;padding:0.375rem 0.75rem;font-size:14px;line-height:1.5;border-radius:2px;transition:color 0.15s ease-in-out, background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out}.send-btn{color:rgba(0, 18, 26, 0.59);background-color:#edf1f2;border-color:#edf1f2;min-width:72px}.send-btn:hover{cursor:pointer;color:rgba(0, 18, 26, 0.93);background-color:#d4dadd;border-color:#d4dadd}.smith-launcher-frame{box-shadow:0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 2px 16px rgba(0, 18, 26, 0.16);z-index:2147482999 !important;position:fixed !important;bottom:20px;right:20px;height:56px !important;width:56px !important;border-radius:100px !important;overflow:hidden !important;background:#1e9fd6 !important;opacity:0.9;transition:box-shadow 0.26s cubic-bezier(0.38, 0, 0.22, 1),
      opacity 0.26s ease-in-out}.smith-launcher-frame:hover{cursor:pointer;box-shadow:0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 3px 12px rgba(0, 18, 26, 0.16), 0 2px 14px 0 rgba(0, 18, 26, 0.2);opacity:1}`;

    		this.shadowRoot.appendChild(style);

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("chat-widget", App);

    const app = new App({
    	target: document.body,
    	// props: {
    	// 	name: 'world'
    	// }
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
