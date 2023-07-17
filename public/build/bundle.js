
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$2() { }
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop$2;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop$2;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
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
    function empty$2() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
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
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
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
    function init$1(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop$2,
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
                this.$destroy = noop$2;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                if (!is_function(callback)) {
                    return noop$2;
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function getAugmentedNamespace(n) {
      if (n.__esModule) return n;
      var f = n.default;
    	if (typeof f == "function") {
    		var a = function a () {
    			if (this instanceof a) {
    				var args = [null];
    				args.push.apply(args, arguments);
    				var Ctor = Function.bind.apply(f, args);
    				return new Ctor();
    			}
    			return f.apply(this, arguments);
    		};
    		a.prototype = f.prototype;
      } else a = {};
      Object.defineProperty(a, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    var lib$1 = {exports: {}};

    /**
     * Parses an URI
     *
     * @author Steven Levithan <stevenlevithan.com> (MIT license)
     * @api private
     */

    var re$1 = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

    var parts$1 = [
        'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
    ];

    var parseuri$3 = function parseuri(str) {
        var src = str,
            b = str.indexOf('['),
            e = str.indexOf(']');

        if (b != -1 && e != -1) {
            str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
        }

        var m = re$1.exec(str || ''),
            uri = {},
            i = 14;

        while (i--) {
            uri[parts$1[i]] = m[i] || '';
        }

        if (b != -1 && e != -1) {
            uri.source = src;
            uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
            uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
            uri.ipv6uri = true;
        }

        return uri;
    };

    var browser$3 = {exports: {}};

    /**
     * Helpers.
     */

    var ms$2;
    var hasRequiredMs;

    function requireMs () {
    	if (hasRequiredMs) return ms$2;
    	hasRequiredMs = 1;
    	var s = 1000;
    	var m = s * 60;
    	var h = m * 60;
    	var d = h * 24;
    	var w = d * 7;
    	var y = d * 365.25;

    	/**
    	 * Parse or format the given `val`.
    	 *
    	 * Options:
    	 *
    	 *  - `long` verbose formatting [false]
    	 *
    	 * @param {String|Number} val
    	 * @param {Object} [options]
    	 * @throws {Error} throw an error if val is not a non-empty string or a number
    	 * @return {String|Number}
    	 * @api public
    	 */

    	ms$2 = function (val, options) {
    	  options = options || {};
    	  var type = typeof val;
    	  if (type === 'string' && val.length > 0) {
    	    return parse(val);
    	  } else if (type === 'number' && isFinite(val)) {
    	    return options.long ? fmtLong(val) : fmtShort(val);
    	  }
    	  throw new Error(
    	    'val is not a non-empty string or a valid number. val=' +
    	      JSON.stringify(val)
    	  );
    	};

    	/**
    	 * Parse the given `str` and return milliseconds.
    	 *
    	 * @param {String} str
    	 * @return {Number}
    	 * @api private
    	 */

    	function parse(str) {
    	  str = String(str);
    	  if (str.length > 100) {
    	    return;
    	  }
    	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    	    str
    	  );
    	  if (!match) {
    	    return;
    	  }
    	  var n = parseFloat(match[1]);
    	  var type = (match[2] || 'ms').toLowerCase();
    	  switch (type) {
    	    case 'years':
    	    case 'year':
    	    case 'yrs':
    	    case 'yr':
    	    case 'y':
    	      return n * y;
    	    case 'weeks':
    	    case 'week':
    	    case 'w':
    	      return n * w;
    	    case 'days':
    	    case 'day':
    	    case 'd':
    	      return n * d;
    	    case 'hours':
    	    case 'hour':
    	    case 'hrs':
    	    case 'hr':
    	    case 'h':
    	      return n * h;
    	    case 'minutes':
    	    case 'minute':
    	    case 'mins':
    	    case 'min':
    	    case 'm':
    	      return n * m;
    	    case 'seconds':
    	    case 'second':
    	    case 'secs':
    	    case 'sec':
    	    case 's':
    	      return n * s;
    	    case 'milliseconds':
    	    case 'millisecond':
    	    case 'msecs':
    	    case 'msec':
    	    case 'ms':
    	      return n;
    	    default:
    	      return undefined;
    	  }
    	}

    	/**
    	 * Short format for `ms`.
    	 *
    	 * @param {Number} ms
    	 * @return {String}
    	 * @api private
    	 */

    	function fmtShort(ms) {
    	  var msAbs = Math.abs(ms);
    	  if (msAbs >= d) {
    	    return Math.round(ms / d) + 'd';
    	  }
    	  if (msAbs >= h) {
    	    return Math.round(ms / h) + 'h';
    	  }
    	  if (msAbs >= m) {
    	    return Math.round(ms / m) + 'm';
    	  }
    	  if (msAbs >= s) {
    	    return Math.round(ms / s) + 's';
    	  }
    	  return ms + 'ms';
    	}

    	/**
    	 * Long format for `ms`.
    	 *
    	 * @param {Number} ms
    	 * @return {String}
    	 * @api private
    	 */

    	function fmtLong(ms) {
    	  var msAbs = Math.abs(ms);
    	  if (msAbs >= d) {
    	    return plural(ms, msAbs, d, 'day');
    	  }
    	  if (msAbs >= h) {
    	    return plural(ms, msAbs, h, 'hour');
    	  }
    	  if (msAbs >= m) {
    	    return plural(ms, msAbs, m, 'minute');
    	  }
    	  if (msAbs >= s) {
    	    return plural(ms, msAbs, s, 'second');
    	  }
    	  return ms + ' ms';
    	}

    	/**
    	 * Pluralization helper.
    	 */

    	function plural(ms, msAbs, n, name) {
    	  var isPlural = msAbs >= n * 1.5;
    	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
    	}
    	return ms$2;
    }

    /**
     * This is the common logic for both the Node.js and web browser
     * implementations of `debug()`.
     */

    function setup(env) {
    	createDebug.debug = createDebug;
    	createDebug.default = createDebug;
    	createDebug.coerce = coerce;
    	createDebug.disable = disable;
    	createDebug.enable = enable;
    	createDebug.enabled = enabled;
    	createDebug.humanize = requireMs();

    	Object.keys(env).forEach(key => {
    		createDebug[key] = env[key];
    	});

    	/**
    	* Active `debug` instances.
    	*/
    	createDebug.instances = [];

    	/**
    	* The currently active debug mode names, and names to skip.
    	*/

    	createDebug.names = [];
    	createDebug.skips = [];

    	/**
    	* Map of special "%n" handling functions, for the debug "format" argument.
    	*
    	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
    	*/
    	createDebug.formatters = {};

    	/**
    	* Selects a color for a debug namespace
    	* @param {String} namespace The namespace string for the for the debug instance to be colored
    	* @return {Number|String} An ANSI color code for the given namespace
    	* @api private
    	*/
    	function selectColor(namespace) {
    		let hash = 0;

    		for (let i = 0; i < namespace.length; i++) {
    			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
    			hash |= 0; // Convert to 32bit integer
    		}

    		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    	}
    	createDebug.selectColor = selectColor;

    	/**
    	* Create a debugger with the given `namespace`.
    	*
    	* @param {String} namespace
    	* @return {Function}
    	* @api public
    	*/
    	function createDebug(namespace) {
    		let prevTime;

    		function debug(...args) {
    			// Disabled?
    			if (!debug.enabled) {
    				return;
    			}

    			const self = debug;

    			// Set `diff` timestamp
    			const curr = Number(new Date());
    			const ms = curr - (prevTime || curr);
    			self.diff = ms;
    			self.prev = prevTime;
    			self.curr = curr;
    			prevTime = curr;

    			args[0] = createDebug.coerce(args[0]);

    			if (typeof args[0] !== 'string') {
    				// Anything else let's inspect with %O
    				args.unshift('%O');
    			}

    			// Apply any `formatters` transformations
    			let index = 0;
    			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
    				// If we encounter an escaped % then don't increase the array index
    				if (match === '%%') {
    					return match;
    				}
    				index++;
    				const formatter = createDebug.formatters[format];
    				if (typeof formatter === 'function') {
    					const val = args[index];
    					match = formatter.call(self, val);

    					// Now we need to remove `args[index]` since it's inlined in the `format`
    					args.splice(index, 1);
    					index--;
    				}
    				return match;
    			});

    			// Apply env-specific formatting (colors, etc.)
    			createDebug.formatArgs.call(self, args);

    			const logFn = self.log || createDebug.log;
    			logFn.apply(self, args);
    		}

    		debug.namespace = namespace;
    		debug.enabled = createDebug.enabled(namespace);
    		debug.useColors = createDebug.useColors();
    		debug.color = selectColor(namespace);
    		debug.destroy = destroy;
    		debug.extend = extend;
    		// Debug.formatArgs = formatArgs;
    		// debug.rawLog = rawLog;

    		// env-specific initialization logic for debug instances
    		if (typeof createDebug.init === 'function') {
    			createDebug.init(debug);
    		}

    		createDebug.instances.push(debug);

    		return debug;
    	}

    	function destroy() {
    		const index = createDebug.instances.indexOf(this);
    		if (index !== -1) {
    			createDebug.instances.splice(index, 1);
    			return true;
    		}
    		return false;
    	}

    	function extend(namespace, delimiter) {
    		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
    		newDebug.log = this.log;
    		return newDebug;
    	}

    	/**
    	* Enables a debug mode by namespaces. This can include modes
    	* separated by a colon and wildcards.
    	*
    	* @param {String} namespaces
    	* @api public
    	*/
    	function enable(namespaces) {
    		createDebug.save(namespaces);

    		createDebug.names = [];
    		createDebug.skips = [];

    		let i;
    		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    		const len = split.length;

    		for (i = 0; i < len; i++) {
    			if (!split[i]) {
    				// ignore empty strings
    				continue;
    			}

    			namespaces = split[i].replace(/\*/g, '.*?');

    			if (namespaces[0] === '-') {
    				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    			} else {
    				createDebug.names.push(new RegExp('^' + namespaces + '$'));
    			}
    		}

    		for (i = 0; i < createDebug.instances.length; i++) {
    			const instance = createDebug.instances[i];
    			instance.enabled = createDebug.enabled(instance.namespace);
    		}
    	}

    	/**
    	* Disable debug output.
    	*
    	* @return {String} namespaces
    	* @api public
    	*/
    	function disable() {
    		const namespaces = [
    			...createDebug.names.map(toNamespace),
    			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
    		].join(',');
    		createDebug.enable('');
    		return namespaces;
    	}

    	/**
    	* Returns true if the given mode name is enabled, false otherwise.
    	*
    	* @param {String} name
    	* @return {Boolean}
    	* @api public
    	*/
    	function enabled(name) {
    		if (name[name.length - 1] === '*') {
    			return true;
    		}

    		let i;
    		let len;

    		for (i = 0, len = createDebug.skips.length; i < len; i++) {
    			if (createDebug.skips[i].test(name)) {
    				return false;
    			}
    		}

    		for (i = 0, len = createDebug.names.length; i < len; i++) {
    			if (createDebug.names[i].test(name)) {
    				return true;
    			}
    		}

    		return false;
    	}

    	/**
    	* Convert regexp to namespace
    	*
    	* @param {RegExp} regxep
    	* @return {String} namespace
    	* @api private
    	*/
    	function toNamespace(regexp) {
    		return regexp.toString()
    			.substring(2, regexp.toString().length - 2)
    			.replace(/\.\*\?$/, '*');
    	}

    	/**
    	* Coerce `val`.
    	*
    	* @param {Mixed} val
    	* @return {Mixed}
    	* @api private
    	*/
    	function coerce(val) {
    		if (val instanceof Error) {
    			return val.stack || val.message;
    		}
    		return val;
    	}

    	createDebug.enable(createDebug.load());

    	return createDebug;
    }

    var common = setup;

    /* eslint-env browser */

    (function (module, exports) {
    	/**
    	 * This is the web browser implementation of `debug()`.
    	 */

    	exports.log = log;
    	exports.formatArgs = formatArgs;
    	exports.save = save;
    	exports.load = load;
    	exports.useColors = useColors;
    	exports.storage = localstorage();

    	/**
    	 * Colors.
    	 */

    	exports.colors = [
    		'#0000CC',
    		'#0000FF',
    		'#0033CC',
    		'#0033FF',
    		'#0066CC',
    		'#0066FF',
    		'#0099CC',
    		'#0099FF',
    		'#00CC00',
    		'#00CC33',
    		'#00CC66',
    		'#00CC99',
    		'#00CCCC',
    		'#00CCFF',
    		'#3300CC',
    		'#3300FF',
    		'#3333CC',
    		'#3333FF',
    		'#3366CC',
    		'#3366FF',
    		'#3399CC',
    		'#3399FF',
    		'#33CC00',
    		'#33CC33',
    		'#33CC66',
    		'#33CC99',
    		'#33CCCC',
    		'#33CCFF',
    		'#6600CC',
    		'#6600FF',
    		'#6633CC',
    		'#6633FF',
    		'#66CC00',
    		'#66CC33',
    		'#9900CC',
    		'#9900FF',
    		'#9933CC',
    		'#9933FF',
    		'#99CC00',
    		'#99CC33',
    		'#CC0000',
    		'#CC0033',
    		'#CC0066',
    		'#CC0099',
    		'#CC00CC',
    		'#CC00FF',
    		'#CC3300',
    		'#CC3333',
    		'#CC3366',
    		'#CC3399',
    		'#CC33CC',
    		'#CC33FF',
    		'#CC6600',
    		'#CC6633',
    		'#CC9900',
    		'#CC9933',
    		'#CCCC00',
    		'#CCCC33',
    		'#FF0000',
    		'#FF0033',
    		'#FF0066',
    		'#FF0099',
    		'#FF00CC',
    		'#FF00FF',
    		'#FF3300',
    		'#FF3333',
    		'#FF3366',
    		'#FF3399',
    		'#FF33CC',
    		'#FF33FF',
    		'#FF6600',
    		'#FF6633',
    		'#FF9900',
    		'#FF9933',
    		'#FFCC00',
    		'#FFCC33'
    	];

    	/**
    	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
    	 * and the Firebug extension (any Firefox version) are known
    	 * to support "%c" CSS customizations.
    	 *
    	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
    	 */

    	// eslint-disable-next-line complexity
    	function useColors() {
    		// NB: In an Electron preload script, document will be defined but not fully
    		// initialized. Since we know we're in Chrome, we'll just detect this case
    		// explicitly
    		if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    			return true;
    		}

    		// Internet Explorer and Edge do not support colors.
    		if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    			return false;
    		}

    		// Is webkit? http://stackoverflow.com/a/16459606/376773
    		// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    		return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    			// Is firebug? http://stackoverflow.com/a/398120/376773
    			(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    			// Is firefox >= v31?
    			// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    			// Double check webkit in userAgent just in case we are in a worker
    			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
    	}

    	/**
    	 * Colorize log arguments if enabled.
    	 *
    	 * @api public
    	 */

    	function formatArgs(args) {
    		args[0] = (this.useColors ? '%c' : '') +
    			this.namespace +
    			(this.useColors ? ' %c' : ' ') +
    			args[0] +
    			(this.useColors ? '%c ' : ' ') +
    			'+' + module.exports.humanize(this.diff);

    		if (!this.useColors) {
    			return;
    		}

    		const c = 'color: ' + this.color;
    		args.splice(1, 0, c, 'color: inherit');

    		// The final "%c" is somewhat tricky, because there could be other
    		// arguments passed either before or after the %c, so we need to
    		// figure out the correct index to insert the CSS into
    		let index = 0;
    		let lastC = 0;
    		args[0].replace(/%[a-zA-Z%]/g, match => {
    			if (match === '%%') {
    				return;
    			}
    			index++;
    			if (match === '%c') {
    				// We only are interested in the *last* %c
    				// (the user may have provided their own)
    				lastC = index;
    			}
    		});

    		args.splice(lastC, 0, c);
    	}

    	/**
    	 * Invokes `console.log()` when available.
    	 * No-op when `console.log` is not a "function".
    	 *
    	 * @api public
    	 */
    	function log(...args) {
    		// This hackery is required for IE8/9, where
    		// the `console.log` function doesn't have 'apply'
    		return typeof console === 'object' &&
    			console.log &&
    			console.log(...args);
    	}

    	/**
    	 * Save `namespaces`.
    	 *
    	 * @param {String} namespaces
    	 * @api private
    	 */
    	function save(namespaces) {
    		try {
    			if (namespaces) {
    				exports.storage.setItem('debug', namespaces);
    			} else {
    				exports.storage.removeItem('debug');
    			}
    		} catch (error) {
    			// Swallow
    			// XXX (@Qix-) should we be logging these?
    		}
    	}

    	/**
    	 * Load `namespaces`.
    	 *
    	 * @return {String} returns the previously persisted debug modes
    	 * @api private
    	 */
    	function load() {
    		let r;
    		try {
    			r = exports.storage.getItem('debug');
    		} catch (error) {
    			// Swallow
    			// XXX (@Qix-) should we be logging these?
    		}

    		// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    		if (!r && typeof process !== 'undefined' && 'env' in process) {
    			r = process.env.DEBUG;
    		}

    		return r;
    	}

    	/**
    	 * Localstorage attempts to return the localstorage.
    	 *
    	 * This is necessary because safari throws
    	 * when a user disables cookies/localstorage
    	 * and you attempt to access it.
    	 *
    	 * @return {LocalStorage}
    	 * @api private
    	 */

    	function localstorage() {
    		try {
    			// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    			// The Browser also has localStorage in the global context.
    			return localStorage;
    		} catch (error) {
    			// Swallow
    			// XXX (@Qix-) should we be logging these?
    		}
    	}

    	module.exports = common(exports);

    	const {formatters} = module.exports;

    	/**
    	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
    	 */

    	formatters.j = function (v) {
    		try {
    			return JSON.stringify(v);
    		} catch (error) {
    			return '[UnexpectedJSONParseError]: ' + error.message;
    		}
    	}; 
    } (browser$3, browser$3.exports));

    var browserExports$2 = browser$3.exports;

    /**
     * Module dependencies.
     */

    var parseuri$2 = parseuri$3;
    var debug$7 = browserExports$2('socket.io-client:url');

    /**
     * Module exports.
     */

    var url_1 = url;

    /**
     * URL parser.
     *
     * @param {String} url
     * @param {Object} An object meant to mimic window.location.
     *                 Defaults to window.location.
     * @api public
     */

    function url (uri, loc) {
      var obj = uri;

      // default to window.location
      loc = loc || (typeof location !== 'undefined' && location);
      if (null == uri) uri = loc.protocol + '//' + loc.host;

      // relative path support
      if ('string' === typeof uri) {
        if ('/' === uri.charAt(0)) {
          if ('/' === uri.charAt(1)) {
            uri = loc.protocol + uri;
          } else {
            uri = loc.host + uri;
          }
        }

        if (!/^(https?|wss?):\/\//.test(uri)) {
          debug$7('protocol-less url %s', uri);
          if ('undefined' !== typeof loc) {
            uri = loc.protocol + '//' + uri;
          } else {
            uri = 'https://' + uri;
          }
        }

        // parse
        debug$7('parse %s', uri);
        obj = parseuri$2(uri);
      }

      // make sure we treat `localhost:80` and `localhost` equally
      if (!obj.port) {
        if (/^(http|ws)$/.test(obj.protocol)) {
          obj.port = '80';
        } else if (/^(http|ws)s$/.test(obj.protocol)) {
          obj.port = '443';
        }
      }

      obj.path = obj.path || '/';

      var ipv6 = obj.host.indexOf(':') !== -1;
      var host = ipv6 ? '[' + obj.host + ']' : obj.host;

      // define unique id
      obj.id = obj.protocol + '://' + host + ':' + obj.port;
      // define href
      obj.href = obj.protocol + '://' + host + (loc && loc.port === obj.port ? '' : (':' + obj.port));

      return obj;
    }

    var socket_ioParser = {};

    var browser$2 = {exports: {}};

    var debug$6 = {exports: {}};

    /**
     * Helpers.
     */

    var s$1 = 1000;
    var m$1 = s$1 * 60;
    var h$1 = m$1 * 60;
    var d$1 = h$1 * 24;
    var y$1 = d$1 * 365.25;

    /**
     * Parse or format the given `val`.
     *
     * Options:
     *
     *  - `long` verbose formatting [false]
     *
     * @param {String|Number} val
     * @param {Object} [options]
     * @throws {Error} throw an error if val is not a non-empty string or a number
     * @return {String|Number}
     * @api public
     */

    var ms$1 = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === 'string' && val.length > 0) {
        return parse$1(val);
      } else if (type === 'number' && isNaN(val) === false) {
        return options.long ? fmtLong$1(val) : fmtShort$1(val);
      }
      throw new Error(
        'val is not a non-empty string or a valid number. val=' +
          JSON.stringify(val)
      );
    };

    /**
     * Parse the given `str` and return milliseconds.
     *
     * @param {String} str
     * @return {Number}
     * @api private
     */

    function parse$1(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || 'ms').toLowerCase();
      switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
          return n * y$1;
        case 'days':
        case 'day':
        case 'd':
          return n * d$1;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
          return n * h$1;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
          return n * m$1;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
          return n * s$1;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
          return n;
        default:
          return undefined;
      }
    }

    /**
     * Short format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtShort$1(ms) {
      if (ms >= d$1) {
        return Math.round(ms / d$1) + 'd';
      }
      if (ms >= h$1) {
        return Math.round(ms / h$1) + 'h';
      }
      if (ms >= m$1) {
        return Math.round(ms / m$1) + 'm';
      }
      if (ms >= s$1) {
        return Math.round(ms / s$1) + 's';
      }
      return ms + 'ms';
    }

    /**
     * Long format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtLong$1(ms) {
      return plural$1(ms, d$1, 'day') ||
        plural$1(ms, h$1, 'hour') ||
        plural$1(ms, m$1, 'minute') ||
        plural$1(ms, s$1, 'second') ||
        ms + ' ms';
    }

    /**
     * Pluralization helper.
     */

    function plural$1(ms, n, name) {
      if (ms < n) {
        return;
      }
      if (ms < n * 1.5) {
        return Math.floor(ms / n) + ' ' + name;
      }
      return Math.ceil(ms / n) + ' ' + name + 's';
    }

    (function (module, exports) {
    	/**
    	 * This is the common logic for both the Node.js and web browser
    	 * implementations of `debug()`.
    	 *
    	 * Expose `debug()` as the module.
    	 */

    	exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
    	exports.coerce = coerce;
    	exports.disable = disable;
    	exports.enable = enable;
    	exports.enabled = enabled;
    	exports.humanize = ms$1;

    	/**
    	 * Active `debug` instances.
    	 */
    	exports.instances = [];

    	/**
    	 * The currently active debug mode names, and names to skip.
    	 */

    	exports.names = [];
    	exports.skips = [];

    	/**
    	 * Map of special "%n" handling functions, for the debug "format" argument.
    	 *
    	 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
    	 */

    	exports.formatters = {};

    	/**
    	 * Select a color.
    	 * @param {String} namespace
    	 * @return {Number}
    	 * @api private
    	 */

    	function selectColor(namespace) {
    	  var hash = 0, i;

    	  for (i in namespace) {
    	    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    	    hash |= 0; // Convert to 32bit integer
    	  }

    	  return exports.colors[Math.abs(hash) % exports.colors.length];
    	}

    	/**
    	 * Create a debugger with the given `namespace`.
    	 *
    	 * @param {String} namespace
    	 * @return {Function}
    	 * @api public
    	 */

    	function createDebug(namespace) {

    	  var prevTime;

    	  function debug() {
    	    // disabled?
    	    if (!debug.enabled) return;

    	    var self = debug;

    	    // set `diff` timestamp
    	    var curr = +new Date();
    	    var ms = curr - (prevTime || curr);
    	    self.diff = ms;
    	    self.prev = prevTime;
    	    self.curr = curr;
    	    prevTime = curr;

    	    // turn the `arguments` into a proper Array
    	    var args = new Array(arguments.length);
    	    for (var i = 0; i < args.length; i++) {
    	      args[i] = arguments[i];
    	    }

    	    args[0] = exports.coerce(args[0]);

    	    if ('string' !== typeof args[0]) {
    	      // anything else let's inspect with %O
    	      args.unshift('%O');
    	    }

    	    // apply any `formatters` transformations
    	    var index = 0;
    	    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
    	      // if we encounter an escaped % then don't increase the array index
    	      if (match === '%%') return match;
    	      index++;
    	      var formatter = exports.formatters[format];
    	      if ('function' === typeof formatter) {
    	        var val = args[index];
    	        match = formatter.call(self, val);

    	        // now we need to remove `args[index]` since it's inlined in the `format`
    	        args.splice(index, 1);
    	        index--;
    	      }
    	      return match;
    	    });

    	    // apply env-specific formatting (colors, etc.)
    	    exports.formatArgs.call(self, args);

    	    var logFn = debug.log || exports.log || console.log.bind(console);
    	    logFn.apply(self, args);
    	  }

    	  debug.namespace = namespace;
    	  debug.enabled = exports.enabled(namespace);
    	  debug.useColors = exports.useColors();
    	  debug.color = selectColor(namespace);
    	  debug.destroy = destroy;

    	  // env-specific initialization logic for debug instances
    	  if ('function' === typeof exports.init) {
    	    exports.init(debug);
    	  }

    	  exports.instances.push(debug);

    	  return debug;
    	}

    	function destroy () {
    	  var index = exports.instances.indexOf(this);
    	  if (index !== -1) {
    	    exports.instances.splice(index, 1);
    	    return true;
    	  } else {
    	    return false;
    	  }
    	}

    	/**
    	 * Enables a debug mode by namespaces. This can include modes
    	 * separated by a colon and wildcards.
    	 *
    	 * @param {String} namespaces
    	 * @api public
    	 */

    	function enable(namespaces) {
    	  exports.save(namespaces);

    	  exports.names = [];
    	  exports.skips = [];

    	  var i;
    	  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    	  var len = split.length;

    	  for (i = 0; i < len; i++) {
    	    if (!split[i]) continue; // ignore empty strings
    	    namespaces = split[i].replace(/\*/g, '.*?');
    	    if (namespaces[0] === '-') {
    	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    	    } else {
    	      exports.names.push(new RegExp('^' + namespaces + '$'));
    	    }
    	  }

    	  for (i = 0; i < exports.instances.length; i++) {
    	    var instance = exports.instances[i];
    	    instance.enabled = exports.enabled(instance.namespace);
    	  }
    	}

    	/**
    	 * Disable debug output.
    	 *
    	 * @api public
    	 */

    	function disable() {
    	  exports.enable('');
    	}

    	/**
    	 * Returns true if the given mode name is enabled, false otherwise.
    	 *
    	 * @param {String} name
    	 * @return {Boolean}
    	 * @api public
    	 */

    	function enabled(name) {
    	  if (name[name.length - 1] === '*') {
    	    return true;
    	  }
    	  var i, len;
    	  for (i = 0, len = exports.skips.length; i < len; i++) {
    	    if (exports.skips[i].test(name)) {
    	      return false;
    	    }
    	  }
    	  for (i = 0, len = exports.names.length; i < len; i++) {
    	    if (exports.names[i].test(name)) {
    	      return true;
    	    }
    	  }
    	  return false;
    	}

    	/**
    	 * Coerce `val`.
    	 *
    	 * @param {Mixed} val
    	 * @return {Mixed}
    	 * @api private
    	 */

    	function coerce(val) {
    	  if (val instanceof Error) return val.stack || val.message;
    	  return val;
    	} 
    } (debug$6, debug$6.exports));

    var debugExports$1 = debug$6.exports;

    /**
     * This is the web browser implementation of `debug()`.
     *
     * Expose `debug()` as the module.
     */

    (function (module, exports) {
    	exports = module.exports = debugExports$1;
    	exports.log = log;
    	exports.formatArgs = formatArgs;
    	exports.save = save;
    	exports.load = load;
    	exports.useColors = useColors;
    	exports.storage = 'undefined' != typeof chrome
    	               && 'undefined' != typeof chrome.storage
    	                  ? chrome.storage.local
    	                  : localstorage();

    	/**
    	 * Colors.
    	 */

    	exports.colors = [
    	  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
    	  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
    	  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
    	  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
    	  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
    	  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
    	  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
    	  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
    	  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
    	  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
    	  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
    	];

    	/**
    	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
    	 * and the Firebug extension (any Firefox version) are known
    	 * to support "%c" CSS customizations.
    	 *
    	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
    	 */

    	function useColors() {
    	  // NB: In an Electron preload script, document will be defined but not fully
    	  // initialized. Since we know we're in Chrome, we'll just detect this case
    	  // explicitly
    	  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    	    return true;
    	  }

    	  // Internet Explorer and Edge do not support colors.
    	  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    	    return false;
    	  }

    	  // is webkit? http://stackoverflow.com/a/16459606/376773
    	  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    	  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    	    // is firebug? http://stackoverflow.com/a/398120/376773
    	    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    	    // is firefox >= v31?
    	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    	    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    	    // double check webkit in userAgent just in case we are in a worker
    	    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
    	}

    	/**
    	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
    	 */

    	exports.formatters.j = function(v) {
    	  try {
    	    return JSON.stringify(v);
    	  } catch (err) {
    	    return '[UnexpectedJSONParseError]: ' + err.message;
    	  }
    	};


    	/**
    	 * Colorize log arguments if enabled.
    	 *
    	 * @api public
    	 */

    	function formatArgs(args) {
    	  var useColors = this.useColors;

    	  args[0] = (useColors ? '%c' : '')
    	    + this.namespace
    	    + (useColors ? ' %c' : ' ')
    	    + args[0]
    	    + (useColors ? '%c ' : ' ')
    	    + '+' + exports.humanize(this.diff);

    	  if (!useColors) return;

    	  var c = 'color: ' + this.color;
    	  args.splice(1, 0, c, 'color: inherit');

    	  // the final "%c" is somewhat tricky, because there could be other
    	  // arguments passed either before or after the %c, so we need to
    	  // figure out the correct index to insert the CSS into
    	  var index = 0;
    	  var lastC = 0;
    	  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    	    if ('%%' === match) return;
    	    index++;
    	    if ('%c' === match) {
    	      // we only are interested in the *last* %c
    	      // (the user may have provided their own)
    	      lastC = index;
    	    }
    	  });

    	  args.splice(lastC, 0, c);
    	}

    	/**
    	 * Invokes `console.log()` when available.
    	 * No-op when `console.log` is not a "function".
    	 *
    	 * @api public
    	 */

    	function log() {
    	  // this hackery is required for IE8/9, where
    	  // the `console.log` function doesn't have 'apply'
    	  return 'object' === typeof console
    	    && console.log
    	    && Function.prototype.apply.call(console.log, console, arguments);
    	}

    	/**
    	 * Save `namespaces`.
    	 *
    	 * @param {String} namespaces
    	 * @api private
    	 */

    	function save(namespaces) {
    	  try {
    	    if (null == namespaces) {
    	      exports.storage.removeItem('debug');
    	    } else {
    	      exports.storage.debug = namespaces;
    	    }
    	  } catch(e) {}
    	}

    	/**
    	 * Load `namespaces`.
    	 *
    	 * @return {String} returns the previously persisted debug modes
    	 * @api private
    	 */

    	function load() {
    	  var r;
    	  try {
    	    r = exports.storage.debug;
    	  } catch(e) {}

    	  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    	  if (!r && typeof process !== 'undefined' && 'env' in process) {
    	    r = process.env.DEBUG;
    	  }

    	  return r;
    	}

    	/**
    	 * Enable namespaces listed in `localStorage.debug` initially.
    	 */

    	exports.enable(load());

    	/**
    	 * Localstorage attempts to return the localstorage.
    	 *
    	 * This is necessary because safari throws
    	 * when a user disables cookies/localstorage
    	 * and you attempt to access it.
    	 *
    	 * @return {LocalStorage}
    	 * @api private
    	 */

    	function localstorage() {
    	  try {
    	    return window.localStorage;
    	  } catch (e) {}
    	} 
    } (browser$2, browser$2.exports));

    var browserExports$1 = browser$2.exports;

    var componentEmitter$2 = {exports: {}};

    (function (module) {
    	/**
    	 * Expose `Emitter`.
    	 */

    	{
    	  module.exports = Emitter;
    	}

    	/**
    	 * Initialize a new `Emitter`.
    	 *
    	 * @api public
    	 */

    	function Emitter(obj) {
    	  if (obj) return mixin(obj);
    	}
    	/**
    	 * Mixin the emitter properties.
    	 *
    	 * @param {Object} obj
    	 * @return {Object}
    	 * @api private
    	 */

    	function mixin(obj) {
    	  for (var key in Emitter.prototype) {
    	    obj[key] = Emitter.prototype[key];
    	  }
    	  return obj;
    	}

    	/**
    	 * Listen on the given `event` with `fn`.
    	 *
    	 * @param {String} event
    	 * @param {Function} fn
    	 * @return {Emitter}
    	 * @api public
    	 */

    	Emitter.prototype.on =
    	Emitter.prototype.addEventListener = function(event, fn){
    	  this._callbacks = this._callbacks || {};
    	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    	    .push(fn);
    	  return this;
    	};

    	/**
    	 * Adds an `event` listener that will be invoked a single
    	 * time then automatically removed.
    	 *
    	 * @param {String} event
    	 * @param {Function} fn
    	 * @return {Emitter}
    	 * @api public
    	 */

    	Emitter.prototype.once = function(event, fn){
    	  function on() {
    	    this.off(event, on);
    	    fn.apply(this, arguments);
    	  }

    	  on.fn = fn;
    	  this.on(event, on);
    	  return this;
    	};

    	/**
    	 * Remove the given callback for `event` or all
    	 * registered callbacks.
    	 *
    	 * @param {String} event
    	 * @param {Function} fn
    	 * @return {Emitter}
    	 * @api public
    	 */

    	Emitter.prototype.off =
    	Emitter.prototype.removeListener =
    	Emitter.prototype.removeAllListeners =
    	Emitter.prototype.removeEventListener = function(event, fn){
    	  this._callbacks = this._callbacks || {};

    	  // all
    	  if (0 == arguments.length) {
    	    this._callbacks = {};
    	    return this;
    	  }

    	  // specific event
    	  var callbacks = this._callbacks['$' + event];
    	  if (!callbacks) return this;

    	  // remove all handlers
    	  if (1 == arguments.length) {
    	    delete this._callbacks['$' + event];
    	    return this;
    	  }

    	  // remove specific handler
    	  var cb;
    	  for (var i = 0; i < callbacks.length; i++) {
    	    cb = callbacks[i];
    	    if (cb === fn || cb.fn === fn) {
    	      callbacks.splice(i, 1);
    	      break;
    	    }
    	  }

    	  // Remove event specific arrays for event types that no
    	  // one is subscribed for to avoid memory leak.
    	  if (callbacks.length === 0) {
    	    delete this._callbacks['$' + event];
    	  }

    	  return this;
    	};

    	/**
    	 * Emit `event` with the given args.
    	 *
    	 * @param {String} event
    	 * @param {Mixed} ...
    	 * @return {Emitter}
    	 */

    	Emitter.prototype.emit = function(event){
    	  this._callbacks = this._callbacks || {};

    	  var args = new Array(arguments.length - 1)
    	    , callbacks = this._callbacks['$' + event];

    	  for (var i = 1; i < arguments.length; i++) {
    	    args[i - 1] = arguments[i];
    	  }

    	  if (callbacks) {
    	    callbacks = callbacks.slice(0);
    	    for (var i = 0, len = callbacks.length; i < len; ++i) {
    	      callbacks[i].apply(this, args);
    	    }
    	  }

    	  return this;
    	};

    	/**
    	 * Return array of callbacks for `event`.
    	 *
    	 * @param {String} event
    	 * @return {Array}
    	 * @api public
    	 */

    	Emitter.prototype.listeners = function(event){
    	  this._callbacks = this._callbacks || {};
    	  return this._callbacks['$' + event] || [];
    	};

    	/**
    	 * Check if this emitter has `event` handlers.
    	 *
    	 * @param {String} event
    	 * @return {Boolean}
    	 * @api public
    	 */

    	Emitter.prototype.hasListeners = function(event){
    	  return !! this.listeners(event).length;
    	}; 
    } (componentEmitter$2));

    var componentEmitterExports$2 = componentEmitter$2.exports;

    var binary = {};

    var toString$3 = {}.toString;

    var isarray = Array.isArray || function (arr) {
      return toString$3.call(arr) == '[object Array]';
    };

    var isBuffer$1 = isBuf$1;

    var withNativeBuffer = typeof Buffer === 'function' && typeof Buffer.isBuffer === 'function';
    var withNativeArrayBuffer = typeof ArrayBuffer === 'function';

    var isView = function (obj) {
      return typeof ArrayBuffer.isView === 'function' ? ArrayBuffer.isView(obj) : (obj.buffer instanceof ArrayBuffer);
    };

    /**
     * Returns true if obj is a buffer or an arraybuffer.
     *
     * @api private
     */

    function isBuf$1(obj) {
      return (withNativeBuffer && Buffer.isBuffer(obj)) ||
              (withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj)));
    }

    /*global Blob,File*/

    /**
     * Module requirements
     */

    var isArray$2 = isarray;
    var isBuf = isBuffer$1;
    var toString$2 = Object.prototype.toString;
    var withNativeBlob$1 = typeof Blob === 'function' || (typeof Blob !== 'undefined' && toString$2.call(Blob) === '[object BlobConstructor]');
    var withNativeFile$1 = typeof File === 'function' || (typeof File !== 'undefined' && toString$2.call(File) === '[object FileConstructor]');

    /**
     * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
     * Anything with blobs or files should be fed through removeBlobs before coming
     * here.
     *
     * @param {Object} packet - socket.io event packet
     * @return {Object} with deconstructed packet and list of buffers
     * @api public
     */

    binary.deconstructPacket = function(packet) {
      var buffers = [];
      var packetData = packet.data;
      var pack = packet;
      pack.data = _deconstructPacket(packetData, buffers);
      pack.attachments = buffers.length; // number of binary 'attachments'
      return {packet: pack, buffers: buffers};
    };

    function _deconstructPacket(data, buffers) {
      if (!data) return data;

      if (isBuf(data)) {
        var placeholder = { _placeholder: true, num: buffers.length };
        buffers.push(data);
        return placeholder;
      } else if (isArray$2(data)) {
        var newData = new Array(data.length);
        for (var i = 0; i < data.length; i++) {
          newData[i] = _deconstructPacket(data[i], buffers);
        }
        return newData;
      } else if (typeof data === 'object' && !(data instanceof Date)) {
        var newData = {};
        for (var key in data) {
          newData[key] = _deconstructPacket(data[key], buffers);
        }
        return newData;
      }
      return data;
    }

    /**
     * Reconstructs a binary packet from its placeholder packet and buffers
     *
     * @param {Object} packet - event packet with placeholders
     * @param {Array} buffers - binary buffers to put in placeholder positions
     * @return {Object} reconstructed packet
     * @api public
     */

    binary.reconstructPacket = function(packet, buffers) {
      packet.data = _reconstructPacket(packet.data, buffers);
      packet.attachments = undefined; // no longer useful
      return packet;
    };

    function _reconstructPacket(data, buffers) {
      if (!data) return data;

      if (data && data._placeholder === true) {
        var isIndexValid =
          typeof data.num === "number" &&
          data.num >= 0 &&
          data.num < buffers.length;
        if (isIndexValid) {
          return buffers[data.num]; // appropriate buffer (should be natural order anyway)
        } else {
          throw new Error("illegal attachments");
        }
      } else if (isArray$2(data)) {
        for (var i = 0; i < data.length; i++) {
          data[i] = _reconstructPacket(data[i], buffers);
        }
      } else if (typeof data === 'object') {
        for (var key in data) {
          data[key] = _reconstructPacket(data[key], buffers);
        }
      }

      return data;
    }

    /**
     * Asynchronously removes Blobs or Files from data via
     * FileReader's readAsArrayBuffer method. Used before encoding
     * data as msgpack. Calls callback with the blobless data.
     *
     * @param {Object} data
     * @param {Function} callback
     * @api private
     */

    binary.removeBlobs = function(data, callback) {
      function _removeBlobs(obj, curKey, containingObject) {
        if (!obj) return obj;

        // convert any blob
        if ((withNativeBlob$1 && obj instanceof Blob) ||
            (withNativeFile$1 && obj instanceof File)) {
          pendingBlobs++;

          // async filereader
          var fileReader = new FileReader();
          fileReader.onload = function() { // this.result == arraybuffer
            if (containingObject) {
              containingObject[curKey] = this.result;
            }
            else {
              bloblessData = this.result;
            }

            // if nothing pending its callback time
            if(! --pendingBlobs) {
              callback(bloblessData);
            }
          };

          fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
        } else if (isArray$2(obj)) { // handle array
          for (var i = 0; i < obj.length; i++) {
            _removeBlobs(obj[i], i, obj);
          }
        } else if (typeof obj === 'object' && !isBuf(obj)) { // and object
          for (var key in obj) {
            _removeBlobs(obj[key], key, obj);
          }
        }
      }

      var pendingBlobs = 0;
      var bloblessData = data;
      _removeBlobs(bloblessData);
      if (!pendingBlobs) {
        callback(bloblessData);
      }
    };

    (function (exports) {
    	/**
    	 * Module dependencies.
    	 */

    	var debug = browserExports$1('socket.io-parser');
    	var Emitter = componentEmitterExports$2;
    	var binary$1 = binary;
    	var isArray = isarray;
    	var isBuf = isBuffer$1;

    	/**
    	 * Protocol version.
    	 *
    	 * @api public
    	 */

    	exports.protocol = 4;

    	/**
    	 * Packet types.
    	 *
    	 * @api public
    	 */

    	exports.types = [
    	  'CONNECT',
    	  'DISCONNECT',
    	  'EVENT',
    	  'ACK',
    	  'ERROR',
    	  'BINARY_EVENT',
    	  'BINARY_ACK'
    	];

    	/**
    	 * Packet type `connect`.
    	 *
    	 * @api public
    	 */

    	exports.CONNECT = 0;

    	/**
    	 * Packet type `disconnect`.
    	 *
    	 * @api public
    	 */

    	exports.DISCONNECT = 1;

    	/**
    	 * Packet type `event`.
    	 *
    	 * @api public
    	 */

    	exports.EVENT = 2;

    	/**
    	 * Packet type `ack`.
    	 *
    	 * @api public
    	 */

    	exports.ACK = 3;

    	/**
    	 * Packet type `error`.
    	 *
    	 * @api public
    	 */

    	exports.ERROR = 4;

    	/**
    	 * Packet type 'binary event'
    	 *
    	 * @api public
    	 */

    	exports.BINARY_EVENT = 5;

    	/**
    	 * Packet type `binary ack`. For acks with binary arguments.
    	 *
    	 * @api public
    	 */

    	exports.BINARY_ACK = 6;

    	/**
    	 * Encoder constructor.
    	 *
    	 * @api public
    	 */

    	exports.Encoder = Encoder;

    	/**
    	 * Decoder constructor.
    	 *
    	 * @api public
    	 */

    	exports.Decoder = Decoder;

    	/**
    	 * A socket.io Encoder instance
    	 *
    	 * @api public
    	 */

    	function Encoder() {}

    	var ERROR_PACKET = exports.ERROR + '"encode error"';

    	/**
    	 * Encode a packet as a single string if non-binary, or as a
    	 * buffer sequence, depending on packet type.
    	 *
    	 * @param {Object} obj - packet object
    	 * @param {Function} callback - function to handle encodings (likely engine.write)
    	 * @return Calls callback with Array of encodings
    	 * @api public
    	 */

    	Encoder.prototype.encode = function(obj, callback){
    	  debug('encoding packet %j', obj);

    	  if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
    	    encodeAsBinary(obj, callback);
    	  } else {
    	    var encoding = encodeAsString(obj);
    	    callback([encoding]);
    	  }
    	};

    	/**
    	 * Encode packet as string.
    	 *
    	 * @param {Object} packet
    	 * @return {String} encoded
    	 * @api private
    	 */

    	function encodeAsString(obj) {

    	  // first is type
    	  var str = '' + obj.type;

    	  // attachments if we have them
    	  if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
    	    str += obj.attachments + '-';
    	  }

    	  // if we have a namespace other than `/`
    	  // we append it followed by a comma `,`
    	  if (obj.nsp && '/' !== obj.nsp) {
    	    str += obj.nsp + ',';
    	  }

    	  // immediately followed by the id
    	  if (null != obj.id) {
    	    str += obj.id;
    	  }

    	  // json data
    	  if (null != obj.data) {
    	    var payload = tryStringify(obj.data);
    	    if (payload !== false) {
    	      str += payload;
    	    } else {
    	      return ERROR_PACKET;
    	    }
    	  }

    	  debug('encoded %j as %s', obj, str);
    	  return str;
    	}

    	function tryStringify(str) {
    	  try {
    	    return JSON.stringify(str);
    	  } catch(e){
    	    return false;
    	  }
    	}

    	/**
    	 * Encode packet as 'buffer sequence' by removing blobs, and
    	 * deconstructing packet into object with placeholders and
    	 * a list of buffers.
    	 *
    	 * @param {Object} packet
    	 * @return {Buffer} encoded
    	 * @api private
    	 */

    	function encodeAsBinary(obj, callback) {

    	  function writeEncoding(bloblessData) {
    	    var deconstruction = binary$1.deconstructPacket(bloblessData);
    	    var pack = encodeAsString(deconstruction.packet);
    	    var buffers = deconstruction.buffers;

    	    buffers.unshift(pack); // add packet info to beginning of data list
    	    callback(buffers); // write all the buffers
    	  }

    	  binary$1.removeBlobs(obj, writeEncoding);
    	}

    	/**
    	 * A socket.io Decoder instance
    	 *
    	 * @return {Object} decoder
    	 * @api public
    	 */

    	function Decoder() {
    	  this.reconstructor = null;
    	}

    	/**
    	 * Mix in `Emitter` with Decoder.
    	 */

    	Emitter(Decoder.prototype);

    	/**
    	 * Decodes an encoded packet string into packet JSON.
    	 *
    	 * @param {String} obj - encoded packet
    	 * @return {Object} packet
    	 * @api public
    	 */

    	Decoder.prototype.add = function(obj) {
    	  var packet;
    	  if (typeof obj === 'string') {
    	    if (this.reconstructor) {
    	      throw new Error("got plaintext data when reconstructing a packet");
    	    }
    	    packet = decodeString(obj);
    	    if (exports.BINARY_EVENT === packet.type || exports.BINARY_ACK === packet.type) { // binary packet's json
    	      this.reconstructor = new BinaryReconstructor(packet);

    	      // no attachments, labeled binary but no binary data to follow
    	      if (this.reconstructor.reconPack.attachments === 0) {
    	        this.emit('decoded', packet);
    	      }
    	    } else { // non-binary full packet
    	      this.emit('decoded', packet);
    	    }
    	  } else if (isBuf(obj) || obj.base64) { // raw binary data
    	    if (!this.reconstructor) {
    	      throw new Error('got binary data when not reconstructing a packet');
    	    } else {
    	      packet = this.reconstructor.takeBinaryData(obj);
    	      if (packet) { // received final buffer
    	        this.reconstructor = null;
    	        this.emit('decoded', packet);
    	      }
    	    }
    	  } else {
    	    throw new Error('Unknown type: ' + obj);
    	  }
    	};

    	/**
    	 * Decode a packet String (JSON data)
    	 *
    	 * @param {String} str
    	 * @return {Object} packet
    	 * @api private
    	 */

    	function decodeString(str) {
    	  var i = 0;
    	  // look up type
    	  var p = {
    	    type: Number(str.charAt(0))
    	  };

    	  if (null == exports.types[p.type]) {
    	    return error('unknown packet type ' + p.type);
    	  }

    	  // look up attachments if type binary
    	  if (exports.BINARY_EVENT === p.type || exports.BINARY_ACK === p.type) {
    	    var start = i + 1;
    	    while (str.charAt(++i) !== '-' && i != str.length) {}
    	    var buf = str.substring(start, i);
    	    if (buf != Number(buf) || str.charAt(i) !== '-') {
    	      throw new Error('Illegal attachments');
    	    }
    	    p.attachments = Number(buf);
    	  }

    	  // look up namespace (if any)
    	  if ('/' === str.charAt(i + 1)) {
    	    var start = i + 1;
    	    while (++i) {
    	      var c = str.charAt(i);
    	      if (',' === c) break;
    	      if (i === str.length) break;
    	    }
    	    p.nsp = str.substring(start, i);
    	  } else {
    	    p.nsp = '/';
    	  }

    	  // look up id
    	  var next = str.charAt(i + 1);
    	  if ('' !== next && Number(next) == next) {
    	    var start = i + 1;
    	    while (++i) {
    	      var c = str.charAt(i);
    	      if (null == c || Number(c) != c) {
    	        --i;
    	        break;
    	      }
    	      if (i === str.length) break;
    	    }
    	    p.id = Number(str.substring(start, i + 1));
    	  }

    	  // look up json data
    	  if (str.charAt(++i)) {
    	    var payload = tryParse(str.substr(i));
    	    var isPayloadValid = payload !== false && (p.type === exports.ERROR || isArray(payload));
    	    if (isPayloadValid) {
    	      p.data = payload;
    	    } else {
    	      return error('invalid payload');
    	    }
    	  }

    	  debug('decoded %s as %j', str, p);
    	  return p;
    	}

    	function tryParse(str) {
    	  try {
    	    return JSON.parse(str);
    	  } catch(e){
    	    return false;
    	  }
    	}

    	/**
    	 * Deallocates a parser's resources
    	 *
    	 * @api public
    	 */

    	Decoder.prototype.destroy = function() {
    	  if (this.reconstructor) {
    	    this.reconstructor.finishedReconstruction();
    	  }
    	};

    	/**
    	 * A manager of a binary event's 'buffer sequence'. Should
    	 * be constructed whenever a packet of type BINARY_EVENT is
    	 * decoded.
    	 *
    	 * @param {Object} packet
    	 * @return {BinaryReconstructor} initialized reconstructor
    	 * @api private
    	 */

    	function BinaryReconstructor(packet) {
    	  this.reconPack = packet;
    	  this.buffers = [];
    	}

    	/**
    	 * Method to be called when binary data received from connection
    	 * after a BINARY_EVENT packet.
    	 *
    	 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
    	 * @return {null | Object} returns null if more binary data is expected or
    	 *   a reconstructed packet object if all buffers have been received.
    	 * @api private
    	 */

    	BinaryReconstructor.prototype.takeBinaryData = function(binData) {
    	  this.buffers.push(binData);
    	  if (this.buffers.length === this.reconPack.attachments) { // done with buffer list
    	    var packet = binary$1.reconstructPacket(this.reconPack, this.buffers);
    	    this.finishedReconstruction();
    	    return packet;
    	  }
    	  return null;
    	};

    	/**
    	 * Cleans up binary packet reconstruction variables.
    	 *
    	 * @api private
    	 */

    	BinaryReconstructor.prototype.finishedReconstruction = function() {
    	  this.reconPack = null;
    	  this.buffers = [];
    	};

    	function error(msg) {
    	  return {
    	    type: exports.ERROR,
    	    data: 'parser error: ' + msg
    	  };
    	} 
    } (socket_ioParser));

    var lib = {exports: {}};

    var transports$1 = {};

    var hasCors = {exports: {}};

    /**
     * Module exports.
     *
     * Logic borrowed from Modernizr:
     *
     *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
     */

    try {
      hasCors.exports = typeof XMLHttpRequest !== 'undefined' &&
        'withCredentials' in new XMLHttpRequest();
    } catch (err) {
      // if XMLHttp support is disabled in IE then it will throw
      // when trying to create
      hasCors.exports = false;
    }

    var hasCorsExports = hasCors.exports;

    var globalThis_browser = (function () {
      if (typeof self !== 'undefined') {
        return self;
      } else if (typeof window !== 'undefined') {
        return window;
      } else {
        return Function('return this')(); // eslint-disable-line no-new-func
      }
    })();

    // browser shim for xmlhttprequest module

    var hasCORS = hasCorsExports;
    var globalThis$3 = globalThis_browser;

    var xmlhttprequest = function (opts) {
      var xdomain = opts.xdomain;

      // scheme must be same when usign XDomainRequest
      // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
      var xscheme = opts.xscheme;

      // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
      // https://github.com/Automattic/engine.io-client/pull/217
      var enablesXDR = opts.enablesXDR;

      // XMLHttpRequest can be disabled on IE
      try {
        if ('undefined' !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
          return new XMLHttpRequest();
        }
      } catch (e) { }

      // Use XDomainRequest for IE8 if enablesXDR is true
      // because loading bar keeps flashing when using jsonp-polling
      // https://github.com/yujiosaka/socke.io-ie8-loading-example
      try {
        if ('undefined' !== typeof XDomainRequest && !xscheme && enablesXDR) {
          return new XDomainRequest();
        }
      } catch (e) { }

      if (!xdomain) {
        try {
          return new globalThis$3[['Active'].concat('Object').join('X')]('Microsoft.XMLHTTP');
        } catch (e) { }
      }
    };

    var pollingXhr = {exports: {}};

    var browser$1 = {};

    /**
     * Gets the keys for an object.
     *
     * @return {Array} keys
     * @api private
     */

    var keys = Object.keys || function keys (obj){
      var arr = [];
      var has = Object.prototype.hasOwnProperty;

      for (var i in obj) {
        if (has.call(obj, i)) {
          arr.push(i);
        }
      }
      return arr;
    };

    /* global Blob File */

    /*
     * Module requirements.
     */

    var isArray$1 = isarray;

    var toString$1 = Object.prototype.toString;
    var withNativeBlob = typeof Blob === 'function' ||
                            typeof Blob !== 'undefined' && toString$1.call(Blob) === '[object BlobConstructor]';
    var withNativeFile = typeof File === 'function' ||
                            typeof File !== 'undefined' && toString$1.call(File) === '[object FileConstructor]';

    /**
     * Module exports.
     */

    var hasBinary2 = hasBinary;

    /**
     * Checks for binary data.
     *
     * Supports Buffer, ArrayBuffer, Blob and File.
     *
     * @param {Object} anything
     * @api public
     */

    function hasBinary (obj) {
      if (!obj || typeof obj !== 'object') {
        return false;
      }

      if (isArray$1(obj)) {
        for (var i = 0, l = obj.length; i < l; i++) {
          if (hasBinary(obj[i])) {
            return true;
          }
        }
        return false;
      }

      if ((typeof Buffer === 'function' && Buffer.isBuffer && Buffer.isBuffer(obj)) ||
        (typeof ArrayBuffer === 'function' && obj instanceof ArrayBuffer) ||
        (withNativeBlob && obj instanceof Blob) ||
        (withNativeFile && obj instanceof File)
      ) {
        return true;
      }

      // see: https://github.com/Automattic/has-binary/pull/4
      if (obj.toJSON && typeof obj.toJSON === 'function' && arguments.length === 1) {
        return hasBinary(obj.toJSON(), true);
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
          return true;
        }
      }

      return false;
    }

    /**
     * An abstraction for slicing an arraybuffer even when
     * ArrayBuffer.prototype.slice is not supported
     *
     * @api public
     */

    var arraybuffer_slice = function(arraybuffer, start, end) {
      var bytes = arraybuffer.byteLength;
      start = start || 0;
      end = end || bytes;

      if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

      if (start < 0) { start += bytes; }
      if (end < 0) { end += bytes; }
      if (end > bytes) { end = bytes; }

      if (start >= bytes || start >= end || bytes === 0) {
        return new ArrayBuffer(0);
      }

      var abv = new Uint8Array(arraybuffer);
      var result = new Uint8Array(end - start);
      for (var i = start, ii = 0; i < end; i++, ii++) {
        result[ii] = abv[i];
      }
      return result.buffer;
    };

    var after_1 = after;

    function after(count, callback, err_cb) {
        var bail = false;
        err_cb = err_cb || noop$1;
        proxy.count = count;

        return (count === 0) ? callback() : proxy

        function proxy(err, result) {
            if (proxy.count <= 0) {
                throw new Error('after called too many times')
            }
            --proxy.count;

            // after first error, rest are passed to err_cb
            if (err) {
                bail = true;
                callback(err);
                // future error callbacks will go to error handler
                callback = err_cb;
            } else if (proxy.count === 0 && !bail) {
                callback(null, result);
            }
        }
    }

    function noop$1() {}

    /*! https://mths.be/utf8js v2.1.2 by @mathias */

    var stringFromCharCode = String.fromCharCode;

    // Taken from https://mths.be/punycode
    function ucs2decode(string) {
    	var output = [];
    	var counter = 0;
    	var length = string.length;
    	var value;
    	var extra;
    	while (counter < length) {
    		value = string.charCodeAt(counter++);
    		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
    			// high surrogate, and there is a next character
    			extra = string.charCodeAt(counter++);
    			if ((extra & 0xFC00) == 0xDC00) { // low surrogate
    				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
    			} else {
    				// unmatched surrogate; only append this code unit, in case the next
    				// code unit is the high surrogate of a surrogate pair
    				output.push(value);
    				counter--;
    			}
    		} else {
    			output.push(value);
    		}
    	}
    	return output;
    }

    // Taken from https://mths.be/punycode
    function ucs2encode(array) {
    	var length = array.length;
    	var index = -1;
    	var value;
    	var output = '';
    	while (++index < length) {
    		value = array[index];
    		if (value > 0xFFFF) {
    			value -= 0x10000;
    			output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
    			value = 0xDC00 | value & 0x3FF;
    		}
    		output += stringFromCharCode(value);
    	}
    	return output;
    }

    function checkScalarValue(codePoint, strict) {
    	if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
    		if (strict) {
    			throw Error(
    				'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
    				' is not a scalar value'
    			);
    		}
    		return false;
    	}
    	return true;
    }
    /*--------------------------------------------------------------------------*/

    function createByte(codePoint, shift) {
    	return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
    }

    function encodeCodePoint(codePoint, strict) {
    	if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
    		return stringFromCharCode(codePoint);
    	}
    	var symbol = '';
    	if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
    		symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
    	}
    	else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
    		if (!checkScalarValue(codePoint, strict)) {
    			codePoint = 0xFFFD;
    		}
    		symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
    		symbol += createByte(codePoint, 6);
    	}
    	else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
    		symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
    		symbol += createByte(codePoint, 12);
    		symbol += createByte(codePoint, 6);
    	}
    	symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
    	return symbol;
    }

    function utf8encode(string, opts) {
    	opts = opts || {};
    	var strict = false !== opts.strict;

    	var codePoints = ucs2decode(string);
    	var length = codePoints.length;
    	var index = -1;
    	var codePoint;
    	var byteString = '';
    	while (++index < length) {
    		codePoint = codePoints[index];
    		byteString += encodeCodePoint(codePoint, strict);
    	}
    	return byteString;
    }

    /*--------------------------------------------------------------------------*/

    function readContinuationByte() {
    	if (byteIndex >= byteCount) {
    		throw Error('Invalid byte index');
    	}

    	var continuationByte = byteArray[byteIndex] & 0xFF;
    	byteIndex++;

    	if ((continuationByte & 0xC0) == 0x80) {
    		return continuationByte & 0x3F;
    	}

    	// If we end up here, it’s not a continuation byte
    	throw Error('Invalid continuation byte');
    }

    function decodeSymbol(strict) {
    	var byte1;
    	var byte2;
    	var byte3;
    	var byte4;
    	var codePoint;

    	if (byteIndex > byteCount) {
    		throw Error('Invalid byte index');
    	}

    	if (byteIndex == byteCount) {
    		return false;
    	}

    	// Read first byte
    	byte1 = byteArray[byteIndex] & 0xFF;
    	byteIndex++;

    	// 1-byte sequence (no continuation bytes)
    	if ((byte1 & 0x80) == 0) {
    		return byte1;
    	}

    	// 2-byte sequence
    	if ((byte1 & 0xE0) == 0xC0) {
    		byte2 = readContinuationByte();
    		codePoint = ((byte1 & 0x1F) << 6) | byte2;
    		if (codePoint >= 0x80) {
    			return codePoint;
    		} else {
    			throw Error('Invalid continuation byte');
    		}
    	}

    	// 3-byte sequence (may include unpaired surrogates)
    	if ((byte1 & 0xF0) == 0xE0) {
    		byte2 = readContinuationByte();
    		byte3 = readContinuationByte();
    		codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
    		if (codePoint >= 0x0800) {
    			return checkScalarValue(codePoint, strict) ? codePoint : 0xFFFD;
    		} else {
    			throw Error('Invalid continuation byte');
    		}
    	}

    	// 4-byte sequence
    	if ((byte1 & 0xF8) == 0xF0) {
    		byte2 = readContinuationByte();
    		byte3 = readContinuationByte();
    		byte4 = readContinuationByte();
    		codePoint = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) |
    			(byte3 << 0x06) | byte4;
    		if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
    			return codePoint;
    		}
    	}

    	throw Error('Invalid UTF-8 detected');
    }

    var byteArray;
    var byteCount;
    var byteIndex;
    function utf8decode(byteString, opts) {
    	opts = opts || {};
    	var strict = false !== opts.strict;

    	byteArray = ucs2decode(byteString);
    	byteCount = byteArray.length;
    	byteIndex = 0;
    	var codePoints = [];
    	var tmp;
    	while ((tmp = decodeSymbol(strict)) !== false) {
    		codePoints.push(tmp);
    	}
    	return ucs2encode(codePoints);
    }

    var utf8 = {
    	version: '2.1.2',
    	encode: utf8encode,
    	decode: utf8decode
    };

    var base64Arraybuffer = {};

    /*
     * base64-arraybuffer
     * https://github.com/niklasvh/base64-arraybuffer
     *
     * Copyright (c) 2012 Niklas von Hertzen
     * Licensed under the MIT license.
     */

    var hasRequiredBase64Arraybuffer;

    function requireBase64Arraybuffer () {
    	if (hasRequiredBase64Arraybuffer) return base64Arraybuffer;
    	hasRequiredBase64Arraybuffer = 1;
    	(function(chars){

    	  base64Arraybuffer.encode = function(arraybuffer) {
    	    var bytes = new Uint8Array(arraybuffer),
    	    i, len = bytes.length, base64 = "";

    	    for (i = 0; i < len; i+=3) {
    	      base64 += chars[bytes[i] >> 2];
    	      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    	      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    	      base64 += chars[bytes[i + 2] & 63];
    	    }

    	    if ((len % 3) === 2) {
    	      base64 = base64.substring(0, base64.length - 1) + "=";
    	    } else if (len % 3 === 1) {
    	      base64 = base64.substring(0, base64.length - 2) + "==";
    	    }

    	    return base64;
    	  };

    	  base64Arraybuffer.decode =  function(base64) {
    	    var bufferLength = base64.length * 0.75,
    	    len = base64.length, i, p = 0,
    	    encoded1, encoded2, encoded3, encoded4;

    	    if (base64[base64.length - 1] === "=") {
    	      bufferLength--;
    	      if (base64[base64.length - 2] === "=") {
    	        bufferLength--;
    	      }
    	    }

    	    var arraybuffer = new ArrayBuffer(bufferLength),
    	    bytes = new Uint8Array(arraybuffer);

    	    for (i = 0; i < len; i+=4) {
    	      encoded1 = chars.indexOf(base64[i]);
    	      encoded2 = chars.indexOf(base64[i+1]);
    	      encoded3 = chars.indexOf(base64[i+2]);
    	      encoded4 = chars.indexOf(base64[i+3]);

    	      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    	      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    	      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    	    }

    	    return arraybuffer;
    	  };
    	})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
    	return base64Arraybuffer;
    }

    /**
     * Create a blob builder even when vendor prefixes exist
     */

    var blob;
    var hasRequiredBlob;

    function requireBlob () {
    	if (hasRequiredBlob) return blob;
    	hasRequiredBlob = 1;
    	var BlobBuilder = typeof BlobBuilder !== 'undefined' ? BlobBuilder :
    	  typeof WebKitBlobBuilder !== 'undefined' ? WebKitBlobBuilder :
    	  typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder :
    	  typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : 
    	  false;

    	/**
    	 * Check if Blob constructor is supported
    	 */

    	var blobSupported = (function() {
    	  try {
    	    var a = new Blob(['hi']);
    	    return a.size === 2;
    	  } catch(e) {
    	    return false;
    	  }
    	})();

    	/**
    	 * Check if Blob constructor supports ArrayBufferViews
    	 * Fails in Safari 6, so we need to map to ArrayBuffers there.
    	 */

    	var blobSupportsArrayBufferView = blobSupported && (function() {
    	  try {
    	    var b = new Blob([new Uint8Array([1,2])]);
    	    return b.size === 2;
    	  } catch(e) {
    	    return false;
    	  }
    	})();

    	/**
    	 * Check if BlobBuilder is supported
    	 */

    	var blobBuilderSupported = BlobBuilder
    	  && BlobBuilder.prototype.append
    	  && BlobBuilder.prototype.getBlob;

    	/**
    	 * Helper function that maps ArrayBufferViews to ArrayBuffers
    	 * Used by BlobBuilder constructor and old browsers that didn't
    	 * support it in the Blob constructor.
    	 */

    	function mapArrayBufferViews(ary) {
    	  return ary.map(function(chunk) {
    	    if (chunk.buffer instanceof ArrayBuffer) {
    	      var buf = chunk.buffer;

    	      // if this is a subarray, make a copy so we only
    	      // include the subarray region from the underlying buffer
    	      if (chunk.byteLength !== buf.byteLength) {
    	        var copy = new Uint8Array(chunk.byteLength);
    	        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
    	        buf = copy.buffer;
    	      }

    	      return buf;
    	    }

    	    return chunk;
    	  });
    	}

    	function BlobBuilderConstructor(ary, options) {
    	  options = options || {};

    	  var bb = new BlobBuilder();
    	  mapArrayBufferViews(ary).forEach(function(part) {
    	    bb.append(part);
    	  });

    	  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
    	}
    	function BlobConstructor(ary, options) {
    	  return new Blob(mapArrayBufferViews(ary), options || {});
    	}
    	if (typeof Blob !== 'undefined') {
    	  BlobBuilderConstructor.prototype = Blob.prototype;
    	  BlobConstructor.prototype = Blob.prototype;
    	}

    	blob = (function() {
    	  if (blobSupported) {
    	    return blobSupportsArrayBufferView ? Blob : BlobConstructor;
    	  } else if (blobBuilderSupported) {
    	    return BlobBuilderConstructor;
    	  } else {
    	    return undefined;
    	  }
    	})();
    	return blob;
    }

    /**
     * Module dependencies.
     */

    (function (exports) {
    	var keys$1 = keys;
    	var hasBinary = hasBinary2;
    	var sliceBuffer = arraybuffer_slice;
    	var after = after_1;
    	var utf8$1 = utf8;

    	var base64encoder;
    	if (typeof ArrayBuffer !== 'undefined') {
    	  base64encoder = requireBase64Arraybuffer();
    	}

    	/**
    	 * Check if we are running an android browser. That requires us to use
    	 * ArrayBuffer with polling transports...
    	 *
    	 * http://ghinda.net/jpeg-blob-ajax-android/
    	 */

    	var isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

    	/**
    	 * Check if we are running in PhantomJS.
    	 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
    	 * https://github.com/ariya/phantomjs/issues/11395
    	 * @type boolean
    	 */
    	var isPhantomJS = typeof navigator !== 'undefined' && /PhantomJS/i.test(navigator.userAgent);

    	/**
    	 * When true, avoids using Blobs to encode payloads.
    	 * @type boolean
    	 */
    	var dontSendBlobs = isAndroid || isPhantomJS;

    	/**
    	 * Current protocol version.
    	 */

    	exports.protocol = 3;

    	/**
    	 * Packet types.
    	 */

    	var packets = exports.packets = {
    	    open:     0    // non-ws
    	  , close:    1    // non-ws
    	  , ping:     2
    	  , pong:     3
    	  , message:  4
    	  , upgrade:  5
    	  , noop:     6
    	};

    	var packetslist = keys$1(packets);

    	/**
    	 * Premade error packet.
    	 */

    	var err = { type: 'error', data: 'parser error' };

    	/**
    	 * Create a blob api even for blob builder when vendor prefixes exist
    	 */

    	var Blob = requireBlob();

    	/**
    	 * Encodes a packet.
    	 *
    	 *     <packet type id> [ <data> ]
    	 *
    	 * Example:
    	 *
    	 *     5hello world
    	 *     3
    	 *     4
    	 *
    	 * Binary is encoded in an identical principle
    	 *
    	 * @api private
    	 */

    	exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
    	  if (typeof supportsBinary === 'function') {
    	    callback = supportsBinary;
    	    supportsBinary = false;
    	  }

    	  if (typeof utf8encode === 'function') {
    	    callback = utf8encode;
    	    utf8encode = null;
    	  }

    	  var data = (packet.data === undefined)
    	    ? undefined
    	    : packet.data.buffer || packet.data;

    	  if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
    	    return encodeArrayBuffer(packet, supportsBinary, callback);
    	  } else if (typeof Blob !== 'undefined' && data instanceof Blob) {
    	    return encodeBlob(packet, supportsBinary, callback);
    	  }

    	  // might be an object with { base64: true, data: dataAsBase64String }
    	  if (data && data.base64) {
    	    return encodeBase64Object(packet, callback);
    	  }

    	  // Sending data as a utf-8 string
    	  var encoded = packets[packet.type];

    	  // data fragment is optional
    	  if (undefined !== packet.data) {
    	    encoded += utf8encode ? utf8$1.encode(String(packet.data), { strict: false }) : String(packet.data);
    	  }

    	  return callback('' + encoded);

    	};

    	function encodeBase64Object(packet, callback) {
    	  // packet data is an object { base64: true, data: dataAsBase64String }
    	  var message = 'b' + exports.packets[packet.type] + packet.data.data;
    	  return callback(message);
    	}

    	/**
    	 * Encode packet helpers for binary types
    	 */

    	function encodeArrayBuffer(packet, supportsBinary, callback) {
    	  if (!supportsBinary) {
    	    return exports.encodeBase64Packet(packet, callback);
    	  }

    	  var data = packet.data;
    	  var contentArray = new Uint8Array(data);
    	  var resultBuffer = new Uint8Array(1 + data.byteLength);

    	  resultBuffer[0] = packets[packet.type];
    	  for (var i = 0; i < contentArray.length; i++) {
    	    resultBuffer[i+1] = contentArray[i];
    	  }

    	  return callback(resultBuffer.buffer);
    	}

    	function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
    	  if (!supportsBinary) {
    	    return exports.encodeBase64Packet(packet, callback);
    	  }

    	  var fr = new FileReader();
    	  fr.onload = function() {
    	    exports.encodePacket({ type: packet.type, data: fr.result }, supportsBinary, true, callback);
    	  };
    	  return fr.readAsArrayBuffer(packet.data);
    	}

    	function encodeBlob(packet, supportsBinary, callback) {
    	  if (!supportsBinary) {
    	    return exports.encodeBase64Packet(packet, callback);
    	  }

    	  if (dontSendBlobs) {
    	    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
    	  }

    	  var length = new Uint8Array(1);
    	  length[0] = packets[packet.type];
    	  var blob = new Blob([length.buffer, packet.data]);

    	  return callback(blob);
    	}

    	/**
    	 * Encodes a packet with binary data in a base64 string
    	 *
    	 * @param {Object} packet, has `type` and `data`
    	 * @return {String} base64 encoded message
    	 */

    	exports.encodeBase64Packet = function(packet, callback) {
    	  var message = 'b' + exports.packets[packet.type];
    	  if (typeof Blob !== 'undefined' && packet.data instanceof Blob) {
    	    var fr = new FileReader();
    	    fr.onload = function() {
    	      var b64 = fr.result.split(',')[1];
    	      callback(message + b64);
    	    };
    	    return fr.readAsDataURL(packet.data);
    	  }

    	  var b64data;
    	  try {
    	    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
    	  } catch (e) {
    	    // iPhone Safari doesn't let you apply with typed arrays
    	    var typed = new Uint8Array(packet.data);
    	    var basic = new Array(typed.length);
    	    for (var i = 0; i < typed.length; i++) {
    	      basic[i] = typed[i];
    	    }
    	    b64data = String.fromCharCode.apply(null, basic);
    	  }
    	  message += btoa(b64data);
    	  return callback(message);
    	};

    	/**
    	 * Decodes a packet. Changes format to Blob if requested.
    	 *
    	 * @return {Object} with `type` and `data` (if any)
    	 * @api private
    	 */

    	exports.decodePacket = function (data, binaryType, utf8decode) {
    	  if (data === undefined) {
    	    return err;
    	  }
    	  // String data
    	  if (typeof data === 'string') {
    	    if (data.charAt(0) === 'b') {
    	      return exports.decodeBase64Packet(data.substr(1), binaryType);
    	    }

    	    if (utf8decode) {
    	      data = tryDecode(data);
    	      if (data === false) {
    	        return err;
    	      }
    	    }
    	    var type = data.charAt(0);

    	    if (Number(type) != type || !packetslist[type]) {
    	      return err;
    	    }

    	    if (data.length > 1) {
    	      return { type: packetslist[type], data: data.substring(1) };
    	    } else {
    	      return { type: packetslist[type] };
    	    }
    	  }

    	  var asArray = new Uint8Array(data);
    	  var type = asArray[0];
    	  var rest = sliceBuffer(data, 1);
    	  if (Blob && binaryType === 'blob') {
    	    rest = new Blob([rest]);
    	  }
    	  return { type: packetslist[type], data: rest };
    	};

    	function tryDecode(data) {
    	  try {
    	    data = utf8$1.decode(data, { strict: false });
    	  } catch (e) {
    	    return false;
    	  }
    	  return data;
    	}

    	/**
    	 * Decodes a packet encoded in a base64 string
    	 *
    	 * @param {String} base64 encoded message
    	 * @return {Object} with `type` and `data` (if any)
    	 */

    	exports.decodeBase64Packet = function(msg, binaryType) {
    	  var type = packetslist[msg.charAt(0)];
    	  if (!base64encoder) {
    	    return { type: type, data: { base64: true, data: msg.substr(1) } };
    	  }

    	  var data = base64encoder.decode(msg.substr(1));

    	  if (binaryType === 'blob' && Blob) {
    	    data = new Blob([data]);
    	  }

    	  return { type: type, data: data };
    	};

    	/**
    	 * Encodes multiple messages (payload).
    	 *
    	 *     <length>:data
    	 *
    	 * Example:
    	 *
    	 *     11:hello world2:hi
    	 *
    	 * If any contents are binary, they will be encoded as base64 strings. Base64
    	 * encoded strings are marked with a b before the length specifier
    	 *
    	 * @param {Array} packets
    	 * @api private
    	 */

    	exports.encodePayload = function (packets, supportsBinary, callback) {
    	  if (typeof supportsBinary === 'function') {
    	    callback = supportsBinary;
    	    supportsBinary = null;
    	  }

    	  var isBinary = hasBinary(packets);

    	  if (supportsBinary && isBinary) {
    	    if (Blob && !dontSendBlobs) {
    	      return exports.encodePayloadAsBlob(packets, callback);
    	    }

    	    return exports.encodePayloadAsArrayBuffer(packets, callback);
    	  }

    	  if (!packets.length) {
    	    return callback('0:');
    	  }

    	  function setLengthHeader(message) {
    	    return message.length + ':' + message;
    	  }

    	  function encodeOne(packet, doneCallback) {
    	    exports.encodePacket(packet, !isBinary ? false : supportsBinary, false, function(message) {
    	      doneCallback(null, setLengthHeader(message));
    	    });
    	  }

    	  map(packets, encodeOne, function(err, results) {
    	    return callback(results.join(''));
    	  });
    	};

    	/**
    	 * Async array map using after
    	 */

    	function map(ary, each, done) {
    	  var result = new Array(ary.length);
    	  var next = after(ary.length, done);

    	  var eachWithIndex = function(i, el, cb) {
    	    each(el, function(error, msg) {
    	      result[i] = msg;
    	      cb(error, result);
    	    });
    	  };

    	  for (var i = 0; i < ary.length; i++) {
    	    eachWithIndex(i, ary[i], next);
    	  }
    	}

    	/*
    	 * Decodes data when a payload is maybe expected. Possible binary contents are
    	 * decoded from their base64 representation
    	 *
    	 * @param {String} data, callback method
    	 * @api public
    	 */

    	exports.decodePayload = function (data, binaryType, callback) {
    	  if (typeof data !== 'string') {
    	    return exports.decodePayloadAsBinary(data, binaryType, callback);
    	  }

    	  if (typeof binaryType === 'function') {
    	    callback = binaryType;
    	    binaryType = null;
    	  }

    	  var packet;
    	  if (data === '') {
    	    // parser error - ignoring payload
    	    return callback(err, 0, 1);
    	  }

    	  var length = '', n, msg;

    	  for (var i = 0, l = data.length; i < l; i++) {
    	    var chr = data.charAt(i);

    	    if (chr !== ':') {
    	      length += chr;
    	      continue;
    	    }

    	    if (length === '' || (length != (n = Number(length)))) {
    	      // parser error - ignoring payload
    	      return callback(err, 0, 1);
    	    }

    	    msg = data.substr(i + 1, n);

    	    if (length != msg.length) {
    	      // parser error - ignoring payload
    	      return callback(err, 0, 1);
    	    }

    	    if (msg.length) {
    	      packet = exports.decodePacket(msg, binaryType, false);

    	      if (err.type === packet.type && err.data === packet.data) {
    	        // parser error in individual packet - ignoring payload
    	        return callback(err, 0, 1);
    	      }

    	      var ret = callback(packet, i + n, l);
    	      if (false === ret) return;
    	    }

    	    // advance cursor
    	    i += n;
    	    length = '';
    	  }

    	  if (length !== '') {
    	    // parser error - ignoring payload
    	    return callback(err, 0, 1);
    	  }

    	};

    	/**
    	 * Encodes multiple messages (payload) as binary.
    	 *
    	 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
    	 * 255><data>
    	 *
    	 * Example:
    	 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
    	 *
    	 * @param {Array} packets
    	 * @return {ArrayBuffer} encoded payload
    	 * @api private
    	 */

    	exports.encodePayloadAsArrayBuffer = function(packets, callback) {
    	  if (!packets.length) {
    	    return callback(new ArrayBuffer(0));
    	  }

    	  function encodeOne(packet, doneCallback) {
    	    exports.encodePacket(packet, true, true, function(data) {
    	      return doneCallback(null, data);
    	    });
    	  }

    	  map(packets, encodeOne, function(err, encodedPackets) {
    	    var totalLength = encodedPackets.reduce(function(acc, p) {
    	      var len;
    	      if (typeof p === 'string'){
    	        len = p.length;
    	      } else {
    	        len = p.byteLength;
    	      }
    	      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    	    }, 0);

    	    var resultArray = new Uint8Array(totalLength);

    	    var bufferIndex = 0;
    	    encodedPackets.forEach(function(p) {
    	      var isString = typeof p === 'string';
    	      var ab = p;
    	      if (isString) {
    	        var view = new Uint8Array(p.length);
    	        for (var i = 0; i < p.length; i++) {
    	          view[i] = p.charCodeAt(i);
    	        }
    	        ab = view.buffer;
    	      }

    	      if (isString) { // not true binary
    	        resultArray[bufferIndex++] = 0;
    	      } else { // true binary
    	        resultArray[bufferIndex++] = 1;
    	      }

    	      var lenStr = ab.byteLength.toString();
    	      for (var i = 0; i < lenStr.length; i++) {
    	        resultArray[bufferIndex++] = parseInt(lenStr[i]);
    	      }
    	      resultArray[bufferIndex++] = 255;

    	      var view = new Uint8Array(ab);
    	      for (var i = 0; i < view.length; i++) {
    	        resultArray[bufferIndex++] = view[i];
    	      }
    	    });

    	    return callback(resultArray.buffer);
    	  });
    	};

    	/**
    	 * Encode as Blob
    	 */

    	exports.encodePayloadAsBlob = function(packets, callback) {
    	  function encodeOne(packet, doneCallback) {
    	    exports.encodePacket(packet, true, true, function(encoded) {
    	      var binaryIdentifier = new Uint8Array(1);
    	      binaryIdentifier[0] = 1;
    	      if (typeof encoded === 'string') {
    	        var view = new Uint8Array(encoded.length);
    	        for (var i = 0; i < encoded.length; i++) {
    	          view[i] = encoded.charCodeAt(i);
    	        }
    	        encoded = view.buffer;
    	        binaryIdentifier[0] = 0;
    	      }

    	      var len = (encoded instanceof ArrayBuffer)
    	        ? encoded.byteLength
    	        : encoded.size;

    	      var lenStr = len.toString();
    	      var lengthAry = new Uint8Array(lenStr.length + 1);
    	      for (var i = 0; i < lenStr.length; i++) {
    	        lengthAry[i] = parseInt(lenStr[i]);
    	      }
    	      lengthAry[lenStr.length] = 255;

    	      if (Blob) {
    	        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
    	        doneCallback(null, blob);
    	      }
    	    });
    	  }

    	  map(packets, encodeOne, function(err, results) {
    	    return callback(new Blob(results));
    	  });
    	};

    	/*
    	 * Decodes data when a payload is maybe expected. Strings are decoded by
    	 * interpreting each byte as a key code for entries marked to start with 0. See
    	 * description of encodePayloadAsBinary
    	 *
    	 * @param {ArrayBuffer} data, callback method
    	 * @api public
    	 */

    	exports.decodePayloadAsBinary = function (data, binaryType, callback) {
    	  if (typeof binaryType === 'function') {
    	    callback = binaryType;
    	    binaryType = null;
    	  }

    	  var bufferTail = data;
    	  var buffers = [];

    	  while (bufferTail.byteLength > 0) {
    	    var tailArray = new Uint8Array(bufferTail);
    	    var isString = tailArray[0] === 0;
    	    var msgLength = '';

    	    for (var i = 1; ; i++) {
    	      if (tailArray[i] === 255) break;

    	      // 310 = char length of Number.MAX_VALUE
    	      if (msgLength.length > 310) {
    	        return callback(err, 0, 1);
    	      }

    	      msgLength += tailArray[i];
    	    }

    	    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    	    msgLength = parseInt(msgLength);

    	    var msg = sliceBuffer(bufferTail, 0, msgLength);
    	    if (isString) {
    	      try {
    	        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
    	      } catch (e) {
    	        // iPhone Safari doesn't let you apply to typed arrays
    	        var typed = new Uint8Array(msg);
    	        msg = '';
    	        for (var i = 0; i < typed.length; i++) {
    	          msg += String.fromCharCode(typed[i]);
    	        }
    	      }
    	    }

    	    buffers.push(msg);
    	    bufferTail = sliceBuffer(bufferTail, msgLength);
    	  }

    	  var total = buffers.length;
    	  buffers.forEach(function(buffer, i) {
    	    callback(exports.decodePacket(buffer, binaryType, true), i, total);
    	  });
    	}; 
    } (browser$1));

    var componentEmitter$1 = {exports: {}};

    (function (module) {
    	/**
    	 * Expose `Emitter`.
    	 */

    	{
    	  module.exports = Emitter;
    	}

    	/**
    	 * Initialize a new `Emitter`.
    	 *
    	 * @api public
    	 */

    	function Emitter(obj) {
    	  if (obj) return mixin(obj);
    	}
    	/**
    	 * Mixin the emitter properties.
    	 *
    	 * @param {Object} obj
    	 * @return {Object}
    	 * @api private
    	 */

    	function mixin(obj) {
    	  for (var key in Emitter.prototype) {
    	    obj[key] = Emitter.prototype[key];
    	  }
    	  return obj;
    	}

    	/**
    	 * Listen on the given `event` with `fn`.
    	 *
    	 * @param {String} event
    	 * @param {Function} fn
    	 * @return {Emitter}
    	 * @api public
    	 */

    	Emitter.prototype.on =
    	Emitter.prototype.addEventListener = function(event, fn){
    	  this._callbacks = this._callbacks || {};
    	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    	    .push(fn);
    	  return this;
    	};

    	/**
    	 * Adds an `event` listener that will be invoked a single
    	 * time then automatically removed.
    	 *
    	 * @param {String} event
    	 * @param {Function} fn
    	 * @return {Emitter}
    	 * @api public
    	 */

    	Emitter.prototype.once = function(event, fn){
    	  function on() {
    	    this.off(event, on);
    	    fn.apply(this, arguments);
    	  }

    	  on.fn = fn;
    	  this.on(event, on);
    	  return this;
    	};

    	/**
    	 * Remove the given callback for `event` or all
    	 * registered callbacks.
    	 *
    	 * @param {String} event
    	 * @param {Function} fn
    	 * @return {Emitter}
    	 * @api public
    	 */

    	Emitter.prototype.off =
    	Emitter.prototype.removeListener =
    	Emitter.prototype.removeAllListeners =
    	Emitter.prototype.removeEventListener = function(event, fn){
    	  this._callbacks = this._callbacks || {};

    	  // all
    	  if (0 == arguments.length) {
    	    this._callbacks = {};
    	    return this;
    	  }

    	  // specific event
    	  var callbacks = this._callbacks['$' + event];
    	  if (!callbacks) return this;

    	  // remove all handlers
    	  if (1 == arguments.length) {
    	    delete this._callbacks['$' + event];
    	    return this;
    	  }

    	  // remove specific handler
    	  var cb;
    	  for (var i = 0; i < callbacks.length; i++) {
    	    cb = callbacks[i];
    	    if (cb === fn || cb.fn === fn) {
    	      callbacks.splice(i, 1);
    	      break;
    	    }
    	  }

    	  // Remove event specific arrays for event types that no
    	  // one is subscribed for to avoid memory leak.
    	  if (callbacks.length === 0) {
    	    delete this._callbacks['$' + event];
    	  }

    	  return this;
    	};

    	/**
    	 * Emit `event` with the given args.
    	 *
    	 * @param {String} event
    	 * @param {Mixed} ...
    	 * @return {Emitter}
    	 */

    	Emitter.prototype.emit = function(event){
    	  this._callbacks = this._callbacks || {};

    	  var args = new Array(arguments.length - 1)
    	    , callbacks = this._callbacks['$' + event];

    	  for (var i = 1; i < arguments.length; i++) {
    	    args[i - 1] = arguments[i];
    	  }

    	  if (callbacks) {
    	    callbacks = callbacks.slice(0);
    	    for (var i = 0, len = callbacks.length; i < len; ++i) {
    	      callbacks[i].apply(this, args);
    	    }
    	  }

    	  return this;
    	};

    	/**
    	 * Return array of callbacks for `event`.
    	 *
    	 * @param {String} event
    	 * @return {Array}
    	 * @api public
    	 */

    	Emitter.prototype.listeners = function(event){
    	  this._callbacks = this._callbacks || {};
    	  return this._callbacks['$' + event] || [];
    	};

    	/**
    	 * Check if this emitter has `event` handlers.
    	 *
    	 * @param {String} event
    	 * @return {Boolean}
    	 * @api public
    	 */

    	Emitter.prototype.hasListeners = function(event){
    	  return !! this.listeners(event).length;
    	}; 
    } (componentEmitter$1));

    var componentEmitterExports$1 = componentEmitter$1.exports;

    /**
     * Module dependencies.
     */

    var transport;
    var hasRequiredTransport;

    function requireTransport () {
    	if (hasRequiredTransport) return transport;
    	hasRequiredTransport = 1;
    	var parser = browser$1;
    	var Emitter = componentEmitterExports$1;

    	/**
    	 * Module exports.
    	 */

    	transport = Transport;

    	/**
    	 * Transport abstract constructor.
    	 *
    	 * @param {Object} options.
    	 * @api private
    	 */

    	function Transport (opts) {
    	  this.path = opts.path;
    	  this.hostname = opts.hostname;
    	  this.port = opts.port;
    	  this.secure = opts.secure;
    	  this.query = opts.query;
    	  this.timestampParam = opts.timestampParam;
    	  this.timestampRequests = opts.timestampRequests;
    	  this.readyState = '';
    	  this.agent = opts.agent || false;
    	  this.socket = opts.socket;
    	  this.enablesXDR = opts.enablesXDR;
    	  this.withCredentials = opts.withCredentials;

    	  // SSL options for Node.js client
    	  this.pfx = opts.pfx;
    	  this.key = opts.key;
    	  this.passphrase = opts.passphrase;
    	  this.cert = opts.cert;
    	  this.ca = opts.ca;
    	  this.ciphers = opts.ciphers;
    	  this.rejectUnauthorized = opts.rejectUnauthorized;
    	  this.forceNode = opts.forceNode;

    	  // results of ReactNative environment detection
    	  this.isReactNative = opts.isReactNative;

    	  // other options for Node.js client
    	  this.extraHeaders = opts.extraHeaders;
    	  this.localAddress = opts.localAddress;
    	}

    	/**
    	 * Mix in `Emitter`.
    	 */

    	Emitter(Transport.prototype);

    	/**
    	 * Emits an error.
    	 *
    	 * @param {String} str
    	 * @return {Transport} for chaining
    	 * @api public
    	 */

    	Transport.prototype.onError = function (msg, desc) {
    	  var err = new Error(msg);
    	  err.type = 'TransportError';
    	  err.description = desc;
    	  this.emit('error', err);
    	  return this;
    	};

    	/**
    	 * Opens the transport.
    	 *
    	 * @api public
    	 */

    	Transport.prototype.open = function () {
    	  if ('closed' === this.readyState || '' === this.readyState) {
    	    this.readyState = 'opening';
    	    this.doOpen();
    	  }

    	  return this;
    	};

    	/**
    	 * Closes the transport.
    	 *
    	 * @api private
    	 */

    	Transport.prototype.close = function () {
    	  if ('opening' === this.readyState || 'open' === this.readyState) {
    	    this.doClose();
    	    this.onClose();
    	  }

    	  return this;
    	};

    	/**
    	 * Sends multiple packets.
    	 *
    	 * @param {Array} packets
    	 * @api private
    	 */

    	Transport.prototype.send = function (packets) {
    	  if ('open' === this.readyState) {
    	    this.write(packets);
    	  } else {
    	    throw new Error('Transport not open');
    	  }
    	};

    	/**
    	 * Called upon open
    	 *
    	 * @api private
    	 */

    	Transport.prototype.onOpen = function () {
    	  this.readyState = 'open';
    	  this.writable = true;
    	  this.emit('open');
    	};

    	/**
    	 * Called with data.
    	 *
    	 * @param {String} data
    	 * @api private
    	 */

    	Transport.prototype.onData = function (data) {
    	  var packet = parser.decodePacket(data, this.socket.binaryType);
    	  this.onPacket(packet);
    	};

    	/**
    	 * Called with a decoded packet.
    	 */

    	Transport.prototype.onPacket = function (packet) {
    	  this.emit('packet', packet);
    	};

    	/**
    	 * Called upon close.
    	 *
    	 * @api private
    	 */

    	Transport.prototype.onClose = function () {
    	  this.readyState = 'closed';
    	  this.emit('close');
    	};
    	return transport;
    }

    var parseqs$4 = {};

    /**
     * Compiles a querystring
     * Returns string representation of the object
     *
     * @param {Object}
     * @api private
     */

    parseqs$4.encode = function (obj) {
      var str = '';

      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          if (str.length) str += '&';
          str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
        }
      }

      return str;
    };

    /**
     * Parses a simple querystring into an object
     *
     * @param {String} qs
     * @api private
     */

    parseqs$4.decode = function(qs){
      var qry = {};
      var pairs = qs.split('&');
      for (var i = 0, l = pairs.length; i < l; i++) {
        var pair = pairs[i].split('=');
        qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
      return qry;
    };

    var componentInherit = function(a, b){
      var fn = function(){};
      fn.prototype = b.prototype;
      a.prototype = new fn;
      a.prototype.constructor = a;
    };

    var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
      , length = 64
      , map = {}
      , seed = 0
      , i = 0
      , prev;

    /**
     * Return a string representing the specified number.
     *
     * @param {Number} num The number to convert.
     * @returns {String} The string representation of the number.
     * @api public
     */
    function encode$2(num) {
      var encoded = '';

      do {
        encoded = alphabet[num % length] + encoded;
        num = Math.floor(num / length);
      } while (num > 0);

      return encoded;
    }

    /**
     * Return the integer value specified by the given string.
     *
     * @param {String} str The string to convert.
     * @returns {Number} The integer value represented by the string.
     * @api public
     */
    function decode(str) {
      var decoded = 0;

      for (i = 0; i < str.length; i++) {
        decoded = decoded * length + map[str.charAt(i)];
      }

      return decoded;
    }

    /**
     * Yeast: A tiny growing id generator.
     *
     * @returns {String} A unique id.
     * @api public
     */
    function yeast$2() {
      var now = encode$2(+new Date());

      if (now !== prev) return seed = 0, prev = now;
      return now +'.'+ encode$2(seed++);
    }

    //
    // Map each character to its index.
    //
    for (; i < length; i++) map[alphabet[i]] = i;

    //
    // Expose the `yeast`, `encode` and `decode` functions.
    //
    yeast$2.encode = encode$2;
    yeast$2.decode = decode;
    var yeast_1 = yeast$2;

    var browser = {exports: {}};

    var debug$5 = {exports: {}};

    /**
     * Helpers.
     */

    var s = 1000;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var y = d * 365.25;

    /**
     * Parse or format the given `val`.
     *
     * Options:
     *
     *  - `long` verbose formatting [false]
     *
     * @param {String|Number} val
     * @param {Object} [options]
     * @throws {Error} throw an error if val is not a non-empty string or a number
     * @return {String|Number}
     * @api public
     */

    var ms = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === 'string' && val.length > 0) {
        return parse(val);
      } else if (type === 'number' && isNaN(val) === false) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        'val is not a non-empty string or a valid number. val=' +
          JSON.stringify(val)
      );
    };

    /**
     * Parse the given `str` and return milliseconds.
     *
     * @param {String} str
     * @return {Number}
     * @api private
     */

    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || 'ms').toLowerCase();
      switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
          return n * y;
        case 'days':
        case 'day':
        case 'd':
          return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
          return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
          return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
          return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
          return n;
        default:
          return undefined;
      }
    }

    /**
     * Short format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtShort(ms) {
      if (ms >= d) {
        return Math.round(ms / d) + 'd';
      }
      if (ms >= h) {
        return Math.round(ms / h) + 'h';
      }
      if (ms >= m) {
        return Math.round(ms / m) + 'm';
      }
      if (ms >= s) {
        return Math.round(ms / s) + 's';
      }
      return ms + 'ms';
    }

    /**
     * Long format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtLong(ms) {
      return plural(ms, d, 'day') ||
        plural(ms, h, 'hour') ||
        plural(ms, m, 'minute') ||
        plural(ms, s, 'second') ||
        ms + ' ms';
    }

    /**
     * Pluralization helper.
     */

    function plural(ms, n, name) {
      if (ms < n) {
        return;
      }
      if (ms < n * 1.5) {
        return Math.floor(ms / n) + ' ' + name;
      }
      return Math.ceil(ms / n) + ' ' + name + 's';
    }

    (function (module, exports) {
    	/**
    	 * This is the common logic for both the Node.js and web browser
    	 * implementations of `debug()`.
    	 *
    	 * Expose `debug()` as the module.
    	 */

    	exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
    	exports.coerce = coerce;
    	exports.disable = disable;
    	exports.enable = enable;
    	exports.enabled = enabled;
    	exports.humanize = ms;

    	/**
    	 * Active `debug` instances.
    	 */
    	exports.instances = [];

    	/**
    	 * The currently active debug mode names, and names to skip.
    	 */

    	exports.names = [];
    	exports.skips = [];

    	/**
    	 * Map of special "%n" handling functions, for the debug "format" argument.
    	 *
    	 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
    	 */

    	exports.formatters = {};

    	/**
    	 * Select a color.
    	 * @param {String} namespace
    	 * @return {Number}
    	 * @api private
    	 */

    	function selectColor(namespace) {
    	  var hash = 0, i;

    	  for (i in namespace) {
    	    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    	    hash |= 0; // Convert to 32bit integer
    	  }

    	  return exports.colors[Math.abs(hash) % exports.colors.length];
    	}

    	/**
    	 * Create a debugger with the given `namespace`.
    	 *
    	 * @param {String} namespace
    	 * @return {Function}
    	 * @api public
    	 */

    	function createDebug(namespace) {

    	  var prevTime;

    	  function debug() {
    	    // disabled?
    	    if (!debug.enabled) return;

    	    var self = debug;

    	    // set `diff` timestamp
    	    var curr = +new Date();
    	    var ms = curr - (prevTime || curr);
    	    self.diff = ms;
    	    self.prev = prevTime;
    	    self.curr = curr;
    	    prevTime = curr;

    	    // turn the `arguments` into a proper Array
    	    var args = new Array(arguments.length);
    	    for (var i = 0; i < args.length; i++) {
    	      args[i] = arguments[i];
    	    }

    	    args[0] = exports.coerce(args[0]);

    	    if ('string' !== typeof args[0]) {
    	      // anything else let's inspect with %O
    	      args.unshift('%O');
    	    }

    	    // apply any `formatters` transformations
    	    var index = 0;
    	    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
    	      // if we encounter an escaped % then don't increase the array index
    	      if (match === '%%') return match;
    	      index++;
    	      var formatter = exports.formatters[format];
    	      if ('function' === typeof formatter) {
    	        var val = args[index];
    	        match = formatter.call(self, val);

    	        // now we need to remove `args[index]` since it's inlined in the `format`
    	        args.splice(index, 1);
    	        index--;
    	      }
    	      return match;
    	    });

    	    // apply env-specific formatting (colors, etc.)
    	    exports.formatArgs.call(self, args);

    	    var logFn = debug.log || exports.log || console.log.bind(console);
    	    logFn.apply(self, args);
    	  }

    	  debug.namespace = namespace;
    	  debug.enabled = exports.enabled(namespace);
    	  debug.useColors = exports.useColors();
    	  debug.color = selectColor(namespace);
    	  debug.destroy = destroy;

    	  // env-specific initialization logic for debug instances
    	  if ('function' === typeof exports.init) {
    	    exports.init(debug);
    	  }

    	  exports.instances.push(debug);

    	  return debug;
    	}

    	function destroy () {
    	  var index = exports.instances.indexOf(this);
    	  if (index !== -1) {
    	    exports.instances.splice(index, 1);
    	    return true;
    	  } else {
    	    return false;
    	  }
    	}

    	/**
    	 * Enables a debug mode by namespaces. This can include modes
    	 * separated by a colon and wildcards.
    	 *
    	 * @param {String} namespaces
    	 * @api public
    	 */

    	function enable(namespaces) {
    	  exports.save(namespaces);

    	  exports.names = [];
    	  exports.skips = [];

    	  var i;
    	  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    	  var len = split.length;

    	  for (i = 0; i < len; i++) {
    	    if (!split[i]) continue; // ignore empty strings
    	    namespaces = split[i].replace(/\*/g, '.*?');
    	    if (namespaces[0] === '-') {
    	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    	    } else {
    	      exports.names.push(new RegExp('^' + namespaces + '$'));
    	    }
    	  }

    	  for (i = 0; i < exports.instances.length; i++) {
    	    var instance = exports.instances[i];
    	    instance.enabled = exports.enabled(instance.namespace);
    	  }
    	}

    	/**
    	 * Disable debug output.
    	 *
    	 * @api public
    	 */

    	function disable() {
    	  exports.enable('');
    	}

    	/**
    	 * Returns true if the given mode name is enabled, false otherwise.
    	 *
    	 * @param {String} name
    	 * @return {Boolean}
    	 * @api public
    	 */

    	function enabled(name) {
    	  if (name[name.length - 1] === '*') {
    	    return true;
    	  }
    	  var i, len;
    	  for (i = 0, len = exports.skips.length; i < len; i++) {
    	    if (exports.skips[i].test(name)) {
    	      return false;
    	    }
    	  }
    	  for (i = 0, len = exports.names.length; i < len; i++) {
    	    if (exports.names[i].test(name)) {
    	      return true;
    	    }
    	  }
    	  return false;
    	}

    	/**
    	 * Coerce `val`.
    	 *
    	 * @param {Mixed} val
    	 * @return {Mixed}
    	 * @api private
    	 */

    	function coerce(val) {
    	  if (val instanceof Error) return val.stack || val.message;
    	  return val;
    	} 
    } (debug$5, debug$5.exports));

    var debugExports = debug$5.exports;

    /**
     * This is the web browser implementation of `debug()`.
     *
     * Expose `debug()` as the module.
     */

    (function (module, exports) {
    	exports = module.exports = debugExports;
    	exports.log = log;
    	exports.formatArgs = formatArgs;
    	exports.save = save;
    	exports.load = load;
    	exports.useColors = useColors;
    	exports.storage = 'undefined' != typeof chrome
    	               && 'undefined' != typeof chrome.storage
    	                  ? chrome.storage.local
    	                  : localstorage();

    	/**
    	 * Colors.
    	 */

    	exports.colors = [
    	  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
    	  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
    	  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
    	  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
    	  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
    	  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
    	  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
    	  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
    	  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
    	  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
    	  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
    	];

    	/**
    	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
    	 * and the Firebug extension (any Firefox version) are known
    	 * to support "%c" CSS customizations.
    	 *
    	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
    	 */

    	function useColors() {
    	  // NB: In an Electron preload script, document will be defined but not fully
    	  // initialized. Since we know we're in Chrome, we'll just detect this case
    	  // explicitly
    	  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    	    return true;
    	  }

    	  // Internet Explorer and Edge do not support colors.
    	  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    	    return false;
    	  }

    	  // is webkit? http://stackoverflow.com/a/16459606/376773
    	  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    	  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    	    // is firebug? http://stackoverflow.com/a/398120/376773
    	    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    	    // is firefox >= v31?
    	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    	    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    	    // double check webkit in userAgent just in case we are in a worker
    	    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
    	}

    	/**
    	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
    	 */

    	exports.formatters.j = function(v) {
    	  try {
    	    return JSON.stringify(v);
    	  } catch (err) {
    	    return '[UnexpectedJSONParseError]: ' + err.message;
    	  }
    	};


    	/**
    	 * Colorize log arguments if enabled.
    	 *
    	 * @api public
    	 */

    	function formatArgs(args) {
    	  var useColors = this.useColors;

    	  args[0] = (useColors ? '%c' : '')
    	    + this.namespace
    	    + (useColors ? ' %c' : ' ')
    	    + args[0]
    	    + (useColors ? '%c ' : ' ')
    	    + '+' + exports.humanize(this.diff);

    	  if (!useColors) return;

    	  var c = 'color: ' + this.color;
    	  args.splice(1, 0, c, 'color: inherit');

    	  // the final "%c" is somewhat tricky, because there could be other
    	  // arguments passed either before or after the %c, so we need to
    	  // figure out the correct index to insert the CSS into
    	  var index = 0;
    	  var lastC = 0;
    	  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    	    if ('%%' === match) return;
    	    index++;
    	    if ('%c' === match) {
    	      // we only are interested in the *last* %c
    	      // (the user may have provided their own)
    	      lastC = index;
    	    }
    	  });

    	  args.splice(lastC, 0, c);
    	}

    	/**
    	 * Invokes `console.log()` when available.
    	 * No-op when `console.log` is not a "function".
    	 *
    	 * @api public
    	 */

    	function log() {
    	  // this hackery is required for IE8/9, where
    	  // the `console.log` function doesn't have 'apply'
    	  return 'object' === typeof console
    	    && console.log
    	    && Function.prototype.apply.call(console.log, console, arguments);
    	}

    	/**
    	 * Save `namespaces`.
    	 *
    	 * @param {String} namespaces
    	 * @api private
    	 */

    	function save(namespaces) {
    	  try {
    	    if (null == namespaces) {
    	      exports.storage.removeItem('debug');
    	    } else {
    	      exports.storage.debug = namespaces;
    	    }
    	  } catch(e) {}
    	}

    	/**
    	 * Load `namespaces`.
    	 *
    	 * @return {String} returns the previously persisted debug modes
    	 * @api private
    	 */

    	function load() {
    	  var r;
    	  try {
    	    r = exports.storage.debug;
    	  } catch(e) {}

    	  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    	  if (!r && typeof process !== 'undefined' && 'env' in process) {
    	    r = process.env.DEBUG;
    	  }

    	  return r;
    	}

    	/**
    	 * Enable namespaces listed in `localStorage.debug` initially.
    	 */

    	exports.enable(load());

    	/**
    	 * Localstorage attempts to return the localstorage.
    	 *
    	 * This is necessary because safari throws
    	 * when a user disables cookies/localstorage
    	 * and you attempt to access it.
    	 *
    	 * @return {LocalStorage}
    	 * @api private
    	 */

    	function localstorage() {
    	  try {
    	    return window.localStorage;
    	  } catch (e) {}
    	} 
    } (browser, browser.exports));

    var browserExports = browser.exports;

    /**
     * Module dependencies.
     */

    var Transport$1 = requireTransport();
    var parseqs$3 = parseqs$4;
    var parser$3 = browser$1;
    var inherit$3 = componentInherit;
    var yeast$1 = yeast_1;
    var debug$4 = browserExports('engine.io-client:polling');

    /**
     * Module exports.
     */

    var polling$1 = Polling$2;

    /**
     * Is XHR2 supported?
     */

    var hasXHR2 = (function () {
      var XMLHttpRequest = xmlhttprequest;
      var xhr = new XMLHttpRequest({ xdomain: false });
      return null != xhr.responseType;
    })();

    /**
     * Polling interface.
     *
     * @param {Object} opts
     * @api private
     */

    function Polling$2 (opts) {
      var forceBase64 = (opts && opts.forceBase64);
      if (!hasXHR2 || forceBase64) {
        this.supportsBinary = false;
      }
      Transport$1.call(this, opts);
    }

    /**
     * Inherits from Transport.
     */

    inherit$3(Polling$2, Transport$1);

    /**
     * Transport name.
     */

    Polling$2.prototype.name = 'polling';

    /**
     * Opens the socket (triggers polling). We write a PING message to determine
     * when the transport is open.
     *
     * @api private
     */

    Polling$2.prototype.doOpen = function () {
      this.poll();
    };

    /**
     * Pauses polling.
     *
     * @param {Function} callback upon buffers are flushed and transport is paused
     * @api private
     */

    Polling$2.prototype.pause = function (onPause) {
      var self = this;

      this.readyState = 'pausing';

      function pause () {
        debug$4('paused');
        self.readyState = 'paused';
        onPause();
      }

      if (this.polling || !this.writable) {
        var total = 0;

        if (this.polling) {
          debug$4('we are currently polling - waiting to pause');
          total++;
          this.once('pollComplete', function () {
            debug$4('pre-pause polling complete');
            --total || pause();
          });
        }

        if (!this.writable) {
          debug$4('we are currently writing - waiting to pause');
          total++;
          this.once('drain', function () {
            debug$4('pre-pause writing complete');
            --total || pause();
          });
        }
      } else {
        pause();
      }
    };

    /**
     * Starts polling cycle.
     *
     * @api public
     */

    Polling$2.prototype.poll = function () {
      debug$4('polling');
      this.polling = true;
      this.doPoll();
      this.emit('poll');
    };

    /**
     * Overloads onData to detect payloads.
     *
     * @api private
     */

    Polling$2.prototype.onData = function (data) {
      var self = this;
      debug$4('polling got data %s', data);
      var callback = function (packet, index, total) {
        // if its the first message we consider the transport open
        if ('opening' === self.readyState) {
          self.onOpen();
        }

        // if its a close packet, we close the ongoing requests
        if ('close' === packet.type) {
          self.onClose();
          return false;
        }

        // otherwise bypass onData and handle the message
        self.onPacket(packet);
      };

      // decode payload
      parser$3.decodePayload(data, this.socket.binaryType, callback);

      // if an event did not trigger closing
      if ('closed' !== this.readyState) {
        // if we got data we're not polling
        this.polling = false;
        this.emit('pollComplete');

        if ('open' === this.readyState) {
          this.poll();
        } else {
          debug$4('ignoring poll - transport state "%s"', this.readyState);
        }
      }
    };

    /**
     * For polling, send a close packet.
     *
     * @api private
     */

    Polling$2.prototype.doClose = function () {
      var self = this;

      function close () {
        debug$4('writing close packet');
        self.write([{ type: 'close' }]);
      }

      if ('open' === this.readyState) {
        debug$4('transport open - closing');
        close();
      } else {
        // in case we're trying to close while
        // handshaking is in progress (GH-164)
        debug$4('transport not open - deferring close');
        this.once('open', close);
      }
    };

    /**
     * Writes a packets payload.
     *
     * @param {Array} data packets
     * @param {Function} drain callback
     * @api private
     */

    Polling$2.prototype.write = function (packets) {
      var self = this;
      this.writable = false;
      var callbackfn = function () {
        self.writable = true;
        self.emit('drain');
      };

      parser$3.encodePayload(packets, this.supportsBinary, function (data) {
        self.doWrite(data, callbackfn);
      });
    };

    /**
     * Generates uri for connection.
     *
     * @api private
     */

    Polling$2.prototype.uri = function () {
      var query = this.query || {};
      var schema = this.secure ? 'https' : 'http';
      var port = '';

      // cache busting is forced
      if (false !== this.timestampRequests) {
        query[this.timestampParam] = yeast$1();
      }

      if (!this.supportsBinary && !query.sid) {
        query.b64 = 1;
      }

      query = parseqs$3.encode(query);

      // avoid port if default for schema
      if (this.port && (('https' === schema && Number(this.port) !== 443) ||
         ('http' === schema && Number(this.port) !== 80))) {
        port = ':' + this.port;
      }

      // prepend ? to query
      if (query.length) {
        query = '?' + query;
      }

      var ipv6 = this.hostname.indexOf(':') !== -1;
      return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
    };

    /* global attachEvent */

    /**
     * Module requirements.
     */

    var XMLHttpRequest$2 = xmlhttprequest;
    var Polling$1 = polling$1;
    var Emitter$2 = componentEmitterExports$1;
    var inherit$2 = componentInherit;
    var debug$3 = browserExports('engine.io-client:polling-xhr');
    var globalThis$2 = globalThis_browser;

    /**
     * Module exports.
     */

    pollingXhr.exports = XHR$1;
    pollingXhr.exports.Request = Request;

    /**
     * Empty function
     */

    function empty$1 () {}

    /**
     * XHR Polling constructor.
     *
     * @param {Object} opts
     * @api public
     */

    function XHR$1 (opts) {
      Polling$1.call(this, opts);
      this.requestTimeout = opts.requestTimeout;
      this.extraHeaders = opts.extraHeaders;

      if (typeof location !== 'undefined') {
        var isSSL = 'https:' === location.protocol;
        var port = location.port;

        // some user agents have empty `location.port`
        if (!port) {
          port = isSSL ? 443 : 80;
        }

        this.xd = (typeof location !== 'undefined' && opts.hostname !== location.hostname) ||
          port !== opts.port;
        this.xs = opts.secure !== isSSL;
      }
    }

    /**
     * Inherits from Polling.
     */

    inherit$2(XHR$1, Polling$1);

    /**
     * XHR supports binary
     */

    XHR$1.prototype.supportsBinary = true;

    /**
     * Creates a request.
     *
     * @param {String} method
     * @api private
     */

    XHR$1.prototype.request = function (opts) {
      opts = opts || {};
      opts.uri = this.uri();
      opts.xd = this.xd;
      opts.xs = this.xs;
      opts.agent = this.agent || false;
      opts.supportsBinary = this.supportsBinary;
      opts.enablesXDR = this.enablesXDR;
      opts.withCredentials = this.withCredentials;

      // SSL options for Node.js client
      opts.pfx = this.pfx;
      opts.key = this.key;
      opts.passphrase = this.passphrase;
      opts.cert = this.cert;
      opts.ca = this.ca;
      opts.ciphers = this.ciphers;
      opts.rejectUnauthorized = this.rejectUnauthorized;
      opts.requestTimeout = this.requestTimeout;

      // other options for Node.js client
      opts.extraHeaders = this.extraHeaders;

      return new Request(opts);
    };

    /**
     * Sends data.
     *
     * @param {String} data to send.
     * @param {Function} called upon flush.
     * @api private
     */

    XHR$1.prototype.doWrite = function (data, fn) {
      var isBinary = typeof data !== 'string' && data !== undefined;
      var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
      var self = this;
      req.on('success', fn);
      req.on('error', function (err) {
        self.onError('xhr post error', err);
      });
      this.sendXhr = req;
    };

    /**
     * Starts a poll cycle.
     *
     * @api private
     */

    XHR$1.prototype.doPoll = function () {
      debug$3('xhr poll');
      var req = this.request();
      var self = this;
      req.on('data', function (data) {
        self.onData(data);
      });
      req.on('error', function (err) {
        self.onError('xhr poll error', err);
      });
      this.pollXhr = req;
    };

    /**
     * Request constructor
     *
     * @param {Object} options
     * @api public
     */

    function Request (opts) {
      this.method = opts.method || 'GET';
      this.uri = opts.uri;
      this.xd = !!opts.xd;
      this.xs = !!opts.xs;
      this.async = false !== opts.async;
      this.data = undefined !== opts.data ? opts.data : null;
      this.agent = opts.agent;
      this.isBinary = opts.isBinary;
      this.supportsBinary = opts.supportsBinary;
      this.enablesXDR = opts.enablesXDR;
      this.withCredentials = opts.withCredentials;
      this.requestTimeout = opts.requestTimeout;

      // SSL options for Node.js client
      this.pfx = opts.pfx;
      this.key = opts.key;
      this.passphrase = opts.passphrase;
      this.cert = opts.cert;
      this.ca = opts.ca;
      this.ciphers = opts.ciphers;
      this.rejectUnauthorized = opts.rejectUnauthorized;

      // other options for Node.js client
      this.extraHeaders = opts.extraHeaders;

      this.create();
    }

    /**
     * Mix in `Emitter`.
     */

    Emitter$2(Request.prototype);

    /**
     * Creates the XHR object and sends the request.
     *
     * @api private
     */

    Request.prototype.create = function () {
      var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

      // SSL options for Node.js client
      opts.pfx = this.pfx;
      opts.key = this.key;
      opts.passphrase = this.passphrase;
      opts.cert = this.cert;
      opts.ca = this.ca;
      opts.ciphers = this.ciphers;
      opts.rejectUnauthorized = this.rejectUnauthorized;

      var xhr = this.xhr = new XMLHttpRequest$2(opts);
      var self = this;

      try {
        debug$3('xhr open %s: %s', this.method, this.uri);
        xhr.open(this.method, this.uri, this.async);
        try {
          if (this.extraHeaders) {
            xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
            for (var i in this.extraHeaders) {
              if (this.extraHeaders.hasOwnProperty(i)) {
                xhr.setRequestHeader(i, this.extraHeaders[i]);
              }
            }
          }
        } catch (e) {}

        if ('POST' === this.method) {
          try {
            if (this.isBinary) {
              xhr.setRequestHeader('Content-type', 'application/octet-stream');
            } else {
              xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
            }
          } catch (e) {}
        }

        try {
          xhr.setRequestHeader('Accept', '*/*');
        } catch (e) {}

        // ie6 check
        if ('withCredentials' in xhr) {
          xhr.withCredentials = this.withCredentials;
        }

        if (this.requestTimeout) {
          xhr.timeout = this.requestTimeout;
        }

        if (this.hasXDR()) {
          xhr.onload = function () {
            self.onLoad();
          };
          xhr.onerror = function () {
            self.onError(xhr.responseText);
          };
        } else {
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 2) {
              try {
                var contentType = xhr.getResponseHeader('Content-Type');
                if (self.supportsBinary && contentType === 'application/octet-stream' || contentType === 'application/octet-stream; charset=UTF-8') {
                  xhr.responseType = 'arraybuffer';
                }
              } catch (e) {}
            }
            if (4 !== xhr.readyState) return;
            if (200 === xhr.status || 1223 === xhr.status) {
              self.onLoad();
            } else {
              // make sure the `error` event handler that's user-set
              // does not throw in the same tick and gets caught here
              setTimeout(function () {
                self.onError(typeof xhr.status === 'number' ? xhr.status : 0);
              }, 0);
            }
          };
        }

        debug$3('xhr data %s', this.data);
        xhr.send(this.data);
      } catch (e) {
        // Need to defer since .create() is called directly fhrom the constructor
        // and thus the 'error' event can only be only bound *after* this exception
        // occurs.  Therefore, also, we cannot throw here at all.
        setTimeout(function () {
          self.onError(e);
        }, 0);
        return;
      }

      if (typeof document !== 'undefined') {
        this.index = Request.requestsCount++;
        Request.requests[this.index] = this;
      }
    };

    /**
     * Called upon successful response.
     *
     * @api private
     */

    Request.prototype.onSuccess = function () {
      this.emit('success');
      this.cleanup();
    };

    /**
     * Called if we have data.
     *
     * @api private
     */

    Request.prototype.onData = function (data) {
      this.emit('data', data);
      this.onSuccess();
    };

    /**
     * Called upon error.
     *
     * @api private
     */

    Request.prototype.onError = function (err) {
      this.emit('error', err);
      this.cleanup(true);
    };

    /**
     * Cleans up house.
     *
     * @api private
     */

    Request.prototype.cleanup = function (fromError) {
      if ('undefined' === typeof this.xhr || null === this.xhr) {
        return;
      }
      // xmlhttprequest
      if (this.hasXDR()) {
        this.xhr.onload = this.xhr.onerror = empty$1;
      } else {
        this.xhr.onreadystatechange = empty$1;
      }

      if (fromError) {
        try {
          this.xhr.abort();
        } catch (e) {}
      }

      if (typeof document !== 'undefined') {
        delete Request.requests[this.index];
      }

      this.xhr = null;
    };

    /**
     * Called upon load.
     *
     * @api private
     */

    Request.prototype.onLoad = function () {
      var data;
      try {
        var contentType;
        try {
          contentType = this.xhr.getResponseHeader('Content-Type');
        } catch (e) {}
        if (contentType === 'application/octet-stream' || contentType === 'application/octet-stream; charset=UTF-8') {
          data = this.xhr.response || this.xhr.responseText;
        } else {
          data = this.xhr.responseText;
        }
      } catch (e) {
        this.onError(e);
      }
      if (null != data) {
        this.onData(data);
      }
    };

    /**
     * Check if it has XDomainRequest.
     *
     * @api private
     */

    Request.prototype.hasXDR = function () {
      return typeof XDomainRequest !== 'undefined' && !this.xs && this.enablesXDR;
    };

    /**
     * Aborts the request.
     *
     * @api public
     */

    Request.prototype.abort = function () {
      this.cleanup();
    };

    /**
     * Aborts pending requests when unloading the window. This is needed to prevent
     * memory leaks (e.g. when using IE) and to ensure that no spurious error is
     * emitted.
     */

    Request.requestsCount = 0;
    Request.requests = {};

    if (typeof document !== 'undefined') {
      if (typeof attachEvent === 'function') {
        attachEvent('onunload', unloadHandler);
      } else if (typeof addEventListener === 'function') {
        var terminationEvent = 'onpagehide' in globalThis$2 ? 'pagehide' : 'unload';
        addEventListener(terminationEvent, unloadHandler, false);
      }
    }

    function unloadHandler () {
      for (var i in Request.requests) {
        if (Request.requests.hasOwnProperty(i)) {
          Request.requests[i].abort();
        }
      }
    }

    var pollingXhrExports = pollingXhr.exports;

    /**
     * Module requirements.
     */

    var Polling = polling$1;
    var inherit$1 = componentInherit;
    var globalThis$1 = globalThis_browser;

    /**
     * Module exports.
     */

    var pollingJsonp = JSONPPolling;

    /**
     * Cached regular expressions.
     */

    var rNewline = /\n/g;
    var rEscapedNewline = /\\n/g;

    /**
     * Global JSONP callbacks.
     */

    var callbacks;

    /**
     * Noop.
     */

    function empty () { }

    /**
     * JSONP Polling constructor.
     *
     * @param {Object} opts.
     * @api public
     */

    function JSONPPolling (opts) {
      Polling.call(this, opts);

      this.query = this.query || {};

      // define global callbacks array if not present
      // we do this here (lazily) to avoid unneeded global pollution
      if (!callbacks) {
        // we need to consider multiple engines in the same page
        callbacks = globalThis$1.___eio = (globalThis$1.___eio || []);
      }

      // callback identifier
      this.index = callbacks.length;

      // add callback to jsonp global
      var self = this;
      callbacks.push(function (msg) {
        self.onData(msg);
      });

      // append to query string
      this.query.j = this.index;

      // prevent spurious errors from being emitted when the window is unloaded
      if (typeof addEventListener === 'function') {
        addEventListener('beforeunload', function () {
          if (self.script) self.script.onerror = empty;
        }, false);
      }
    }

    /**
     * Inherits from Polling.
     */

    inherit$1(JSONPPolling, Polling);

    /*
     * JSONP only supports binary as base64 encoded strings
     */

    JSONPPolling.prototype.supportsBinary = false;

    /**
     * Closes the socket.
     *
     * @api private
     */

    JSONPPolling.prototype.doClose = function () {
      if (this.script) {
        this.script.parentNode.removeChild(this.script);
        this.script = null;
      }

      if (this.form) {
        this.form.parentNode.removeChild(this.form);
        this.form = null;
        this.iframe = null;
      }

      Polling.prototype.doClose.call(this);
    };

    /**
     * Starts a poll cycle.
     *
     * @api private
     */

    JSONPPolling.prototype.doPoll = function () {
      var self = this;
      var script = document.createElement('script');

      if (this.script) {
        this.script.parentNode.removeChild(this.script);
        this.script = null;
      }

      script.async = true;
      script.src = this.uri();
      script.onerror = function (e) {
        self.onError('jsonp poll error', e);
      };

      var insertAt = document.getElementsByTagName('script')[0];
      if (insertAt) {
        insertAt.parentNode.insertBefore(script, insertAt);
      } else {
        (document.head || document.body).appendChild(script);
      }
      this.script = script;

      var isUAgecko = 'undefined' !== typeof navigator && /gecko/i.test(navigator.userAgent);

      if (isUAgecko) {
        setTimeout(function () {
          var iframe = document.createElement('iframe');
          document.body.appendChild(iframe);
          document.body.removeChild(iframe);
        }, 100);
      }
    };

    /**
     * Writes with a hidden iframe.
     *
     * @param {String} data to send
     * @param {Function} called upon flush.
     * @api private
     */

    JSONPPolling.prototype.doWrite = function (data, fn) {
      var self = this;

      if (!this.form) {
        var form = document.createElement('form');
        var area = document.createElement('textarea');
        var id = this.iframeId = 'eio_iframe_' + this.index;
        var iframe;

        form.className = 'socketio';
        form.style.position = 'absolute';
        form.style.top = '-1000px';
        form.style.left = '-1000px';
        form.target = id;
        form.method = 'POST';
        form.setAttribute('accept-charset', 'utf-8');
        area.name = 'd';
        form.appendChild(area);
        document.body.appendChild(form);

        this.form = form;
        this.area = area;
      }

      this.form.action = this.uri();

      function complete () {
        initIframe();
        fn();
      }

      function initIframe () {
        if (self.iframe) {
          try {
            self.form.removeChild(self.iframe);
          } catch (e) {
            self.onError('jsonp polling iframe removal error', e);
          }
        }

        try {
          // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
          var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
          iframe = document.createElement(html);
        } catch (e) {
          iframe = document.createElement('iframe');
          iframe.name = self.iframeId;
          iframe.src = 'javascript:0';
        }

        iframe.id = self.iframeId;

        self.form.appendChild(iframe);
        self.iframe = iframe;
      }

      initIframe();

      // escape \n to prevent it from being converted into \r\n by some UAs
      // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
      data = data.replace(rEscapedNewline, '\\\n');
      this.area.value = data.replace(rNewline, '\\n');

      try {
        this.form.submit();
      } catch (e) {}

      if (this.iframe.attachEvent) {
        this.iframe.onreadystatechange = function () {
          if (self.iframe.readyState === 'complete') {
            complete();
          }
        };
      } else {
        this.iframe.onload = complete;
      }
    };

    var _nodeResolve_empty = {};

    var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        default: _nodeResolve_empty
    });

    var require$$6 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

    /**
     * Module dependencies.
     */

    var Transport = requireTransport();
    var parser$2 = browser$1;
    var parseqs$2 = parseqs$4;
    var inherit = componentInherit;
    var yeast = yeast_1;
    var debug$2 = browserExports('engine.io-client:websocket');

    var BrowserWebSocket, NodeWebSocket;

    if (typeof WebSocket !== 'undefined') {
      BrowserWebSocket = WebSocket;
    } else if (typeof self !== 'undefined') {
      BrowserWebSocket = self.WebSocket || self.MozWebSocket;
    }

    if (typeof window === 'undefined') {
      try {
        NodeWebSocket = require$$6;
      } catch (e) { }
    }

    /**
     * Get either the `WebSocket` or `MozWebSocket` globals
     * in the browser or try to resolve WebSocket-compatible
     * interface exposed by `ws` for Node-like environment.
     */

    var WebSocketImpl = BrowserWebSocket || NodeWebSocket;

    /**
     * Module exports.
     */

    var websocket$1 = WS;

    /**
     * WebSocket transport constructor.
     *
     * @api {Object} connection options
     * @api public
     */

    function WS (opts) {
      var forceBase64 = (opts && opts.forceBase64);
      if (forceBase64) {
        this.supportsBinary = false;
      }
      this.perMessageDeflate = opts.perMessageDeflate;
      this.usingBrowserWebSocket = BrowserWebSocket && !opts.forceNode;
      this.protocols = opts.protocols;
      if (!this.usingBrowserWebSocket) {
        WebSocketImpl = NodeWebSocket;
      }
      Transport.call(this, opts);
    }

    /**
     * Inherits from Transport.
     */

    inherit(WS, Transport);

    /**
     * Transport name.
     *
     * @api public
     */

    WS.prototype.name = 'websocket';

    /*
     * WebSockets support binary
     */

    WS.prototype.supportsBinary = true;

    /**
     * Opens socket.
     *
     * @api private
     */

    WS.prototype.doOpen = function () {
      if (!this.check()) {
        // let probe timeout
        return;
      }

      var uri = this.uri();
      var protocols = this.protocols;

      var opts = {};

      if (!this.isReactNative) {
        opts.agent = this.agent;
        opts.perMessageDeflate = this.perMessageDeflate;

        // SSL options for Node.js client
        opts.pfx = this.pfx;
        opts.key = this.key;
        opts.passphrase = this.passphrase;
        opts.cert = this.cert;
        opts.ca = this.ca;
        opts.ciphers = this.ciphers;
        opts.rejectUnauthorized = this.rejectUnauthorized;
      }

      if (this.extraHeaders) {
        opts.headers = this.extraHeaders;
      }
      if (this.localAddress) {
        opts.localAddress = this.localAddress;
      }

      try {
        this.ws =
          this.usingBrowserWebSocket && !this.isReactNative
            ? protocols
              ? new WebSocketImpl(uri, protocols)
              : new WebSocketImpl(uri)
            : new WebSocketImpl(uri, protocols, opts);
      } catch (err) {
        return this.emit('error', err);
      }

      if (this.ws.binaryType === undefined) {
        this.supportsBinary = false;
      }

      if (this.ws.supports && this.ws.supports.binary) {
        this.supportsBinary = true;
        this.ws.binaryType = 'nodebuffer';
      } else {
        this.ws.binaryType = 'arraybuffer';
      }

      this.addEventListeners();
    };

    /**
     * Adds event listeners to the socket
     *
     * @api private
     */

    WS.prototype.addEventListeners = function () {
      var self = this;

      this.ws.onopen = function () {
        self.onOpen();
      };
      this.ws.onclose = function () {
        self.onClose();
      };
      this.ws.onmessage = function (ev) {
        self.onData(ev.data);
      };
      this.ws.onerror = function (e) {
        self.onError('websocket error', e);
      };
    };

    /**
     * Writes data to socket.
     *
     * @param {Array} array of packets.
     * @api private
     */

    WS.prototype.write = function (packets) {
      var self = this;
      this.writable = false;

      // encodePacket efficient as it uses WS framing
      // no need for encodePayload
      var total = packets.length;
      for (var i = 0, l = total; i < l; i++) {
        (function (packet) {
          parser$2.encodePacket(packet, self.supportsBinary, function (data) {
            if (!self.usingBrowserWebSocket) {
              // always create a new object (GH-437)
              var opts = {};
              if (packet.options) {
                opts.compress = packet.options.compress;
              }

              if (self.perMessageDeflate) {
                var len = 'string' === typeof data ? Buffer.byteLength(data) : data.length;
                if (len < self.perMessageDeflate.threshold) {
                  opts.compress = false;
                }
              }
            }

            // Sometimes the websocket has already been closed but the browser didn't
            // have a chance of informing us about it yet, in that case send will
            // throw an error
            try {
              if (self.usingBrowserWebSocket) {
                // TypeError is thrown when passing the second argument on Safari
                self.ws.send(data);
              } else {
                self.ws.send(data, opts);
              }
            } catch (e) {
              debug$2('websocket closed before onclose event');
            }

            --total || done();
          });
        })(packets[i]);
      }

      function done () {
        self.emit('flush');

        // fake drain
        // defer to next tick to allow Socket to clear writeBuffer
        setTimeout(function () {
          self.writable = true;
          self.emit('drain');
        }, 0);
      }
    };

    /**
     * Called upon close
     *
     * @api private
     */

    WS.prototype.onClose = function () {
      Transport.prototype.onClose.call(this);
    };

    /**
     * Closes socket.
     *
     * @api private
     */

    WS.prototype.doClose = function () {
      if (typeof this.ws !== 'undefined') {
        this.ws.close();
      }
    };

    /**
     * Generates uri for connection.
     *
     * @api private
     */

    WS.prototype.uri = function () {
      var query = this.query || {};
      var schema = this.secure ? 'wss' : 'ws';
      var port = '';

      // avoid port if default for schema
      if (this.port && (('wss' === schema && Number(this.port) !== 443) ||
        ('ws' === schema && Number(this.port) !== 80))) {
        port = ':' + this.port;
      }

      // append timestamp to URI
      if (this.timestampRequests) {
        query[this.timestampParam] = yeast();
      }

      // communicate binary support capabilities
      if (!this.supportsBinary) {
        query.b64 = 1;
      }

      query = parseqs$2.encode(query);

      // prepend ? to query
      if (query.length) {
        query = '?' + query;
      }

      var ipv6 = this.hostname.indexOf(':') !== -1;
      return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
    };

    /**
     * Feature detection for WebSocket.
     *
     * @return {Boolean} whether this transport is available.
     * @api public
     */

    WS.prototype.check = function () {
      return !!WebSocketImpl && !('__initialize' in WebSocketImpl && this.name === WS.prototype.name);
    };

    /**
     * Module dependencies
     */

    var XMLHttpRequest$1 = xmlhttprequest;
    var XHR = pollingXhrExports;
    var JSONP = pollingJsonp;
    var websocket = websocket$1;

    /**
     * Export transports.
     */

    transports$1.polling = polling;
    transports$1.websocket = websocket;

    /**
     * Polling transport polymorphic constructor.
     * Decides on xhr vs jsonp based on feature detection.
     *
     * @api private
     */

    function polling (opts) {
      var xhr;
      var xd = false;
      var xs = false;
      var jsonp = false !== opts.jsonp;

      if (typeof location !== 'undefined') {
        var isSSL = 'https:' === location.protocol;
        var port = location.port;

        // some user agents have empty `location.port`
        if (!port) {
          port = isSSL ? 443 : 80;
        }

        xd = opts.hostname !== location.hostname || port !== opts.port;
        xs = opts.secure !== isSSL;
      }

      opts.xdomain = xd;
      opts.xscheme = xs;
      xhr = new XMLHttpRequest$1(opts);

      if ('open' in xhr && !opts.forceJSONP) {
        return new XHR(opts);
      } else {
        if (!jsonp) throw new Error('JSONP disabled');
        return new JSONP(opts);
      }
    }

    var indexOf$1 = [].indexOf;

    var indexof = function(arr, obj){
      if (indexOf$1) return arr.indexOf(obj);
      for (var i = 0; i < arr.length; ++i) {
        if (arr[i] === obj) return i;
      }
      return -1;
    };

    /**
     * Parses an URI
     *
     * @author Steven Levithan <stevenlevithan.com> (MIT license)
     * @api private
     */

    var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

    var parts = [
        'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
    ];

    var parseuri$1 = function parseuri(str) {
        var src = str,
            b = str.indexOf('['),
            e = str.indexOf(']');

        if (b != -1 && e != -1) {
            str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
        }

        var m = re.exec(str || ''),
            uri = {},
            i = 14;

        while (i--) {
            uri[parts[i]] = m[i] || '';
        }

        if (b != -1 && e != -1) {
            uri.source = src;
            uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
            uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
            uri.ipv6uri = true;
        }

        uri.pathNames = pathNames(uri, uri['path']);
        uri.queryKey = queryKey(uri, uri['query']);

        return uri;
    };

    function pathNames(obj, path) {
        var regx = /\/{2,9}/g,
            names = path.replace(regx, "/").split("/");

        if (path.substr(0, 1) == '/' || path.length === 0) {
            names.splice(0, 1);
        }
        if (path.substr(path.length - 1, 1) == '/') {
            names.splice(names.length - 1, 1);
        }

        return names;
    }

    function queryKey(uri, query) {
        var data = {};

        query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
            if ($1) {
                data[$1] = $2;
            }
        });

        return data;
    }

    /**
     * Module dependencies.
     */

    var transports = transports$1;
    var Emitter$1 = componentEmitterExports$1;
    var debug$1 = browserExports('engine.io-client:socket');
    var index = indexof;
    var parser$1 = browser$1;
    var parseuri = parseuri$1;
    var parseqs$1 = parseqs$4;

    /**
     * Module exports.
     */

    var socket$1 = Socket$1;

    /**
     * Socket constructor.
     *
     * @param {String|Object} uri or options
     * @param {Object} options
     * @api public
     */

    function Socket$1 (uri, opts) {
      if (!(this instanceof Socket$1)) return new Socket$1(uri, opts);

      opts = opts || {};

      if (uri && 'object' === typeof uri) {
        opts = uri;
        uri = null;
      }

      if (uri) {
        uri = parseuri(uri);
        opts.hostname = uri.host;
        opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
        opts.port = uri.port;
        if (uri.query) opts.query = uri.query;
      } else if (opts.host) {
        opts.hostname = parseuri(opts.host).host;
      }

      this.secure = null != opts.secure ? opts.secure
        : (typeof location !== 'undefined' && 'https:' === location.protocol);

      if (opts.hostname && !opts.port) {
        // if no port is specified manually, use the protocol default
        opts.port = this.secure ? '443' : '80';
      }

      this.agent = opts.agent || false;
      this.hostname = opts.hostname ||
        (typeof location !== 'undefined' ? location.hostname : 'localhost');
      this.port = opts.port || (typeof location !== 'undefined' && location.port
          ? location.port
          : (this.secure ? 443 : 80));
      this.query = opts.query || {};
      if ('string' === typeof this.query) this.query = parseqs$1.decode(this.query);
      this.upgrade = false !== opts.upgrade;
      this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
      this.forceJSONP = !!opts.forceJSONP;
      this.jsonp = false !== opts.jsonp;
      this.forceBase64 = !!opts.forceBase64;
      this.enablesXDR = !!opts.enablesXDR;
      this.withCredentials = false !== opts.withCredentials;
      this.timestampParam = opts.timestampParam || 't';
      this.timestampRequests = opts.timestampRequests;
      this.transports = opts.transports || ['polling', 'websocket'];
      this.transportOptions = opts.transportOptions || {};
      this.readyState = '';
      this.writeBuffer = [];
      this.prevBufferLen = 0;
      this.policyPort = opts.policyPort || 843;
      this.rememberUpgrade = opts.rememberUpgrade || false;
      this.binaryType = null;
      this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
      this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

      if (true === this.perMessageDeflate) this.perMessageDeflate = {};
      if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
        this.perMessageDeflate.threshold = 1024;
      }

      // SSL options for Node.js client
      this.pfx = opts.pfx || null;
      this.key = opts.key || null;
      this.passphrase = opts.passphrase || null;
      this.cert = opts.cert || null;
      this.ca = opts.ca || null;
      this.ciphers = opts.ciphers || null;
      this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? true : opts.rejectUnauthorized;
      this.forceNode = !!opts.forceNode;

      // detect ReactNative environment
      this.isReactNative = (typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative');

      // other options for Node.js or ReactNative client
      if (typeof self === 'undefined' || this.isReactNative) {
        if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
          this.extraHeaders = opts.extraHeaders;
        }

        if (opts.localAddress) {
          this.localAddress = opts.localAddress;
        }
      }

      // set on handshake
      this.id = null;
      this.upgrades = null;
      this.pingInterval = null;
      this.pingTimeout = null;

      // set on heartbeat
      this.pingIntervalTimer = null;
      this.pingTimeoutTimer = null;

      this.open();
    }

    Socket$1.priorWebsocketSuccess = false;

    /**
     * Mix in `Emitter`.
     */

    Emitter$1(Socket$1.prototype);

    /**
     * Protocol version.
     *
     * @api public
     */

    Socket$1.protocol = parser$1.protocol; // this is an int

    /**
     * Expose deps for legacy compatibility
     * and standalone browser access.
     */

    Socket$1.Socket = Socket$1;
    Socket$1.Transport = requireTransport();
    Socket$1.transports = transports$1;
    Socket$1.parser = browser$1;

    /**
     * Creates transport of the given type.
     *
     * @param {String} transport name
     * @return {Transport}
     * @api private
     */

    Socket$1.prototype.createTransport = function (name) {
      debug$1('creating transport "%s"', name);
      var query = clone(this.query);

      // append engine.io protocol identifier
      query.EIO = parser$1.protocol;

      // transport name
      query.transport = name;

      // per-transport options
      var options = this.transportOptions[name] || {};

      // session id if we already have one
      if (this.id) query.sid = this.id;

      var transport = new transports[name]({
        query: query,
        socket: this,
        agent: options.agent || this.agent,
        hostname: options.hostname || this.hostname,
        port: options.port || this.port,
        secure: options.secure || this.secure,
        path: options.path || this.path,
        forceJSONP: options.forceJSONP || this.forceJSONP,
        jsonp: options.jsonp || this.jsonp,
        forceBase64: options.forceBase64 || this.forceBase64,
        enablesXDR: options.enablesXDR || this.enablesXDR,
        withCredentials: options.withCredentials || this.withCredentials,
        timestampRequests: options.timestampRequests || this.timestampRequests,
        timestampParam: options.timestampParam || this.timestampParam,
        policyPort: options.policyPort || this.policyPort,
        pfx: options.pfx || this.pfx,
        key: options.key || this.key,
        passphrase: options.passphrase || this.passphrase,
        cert: options.cert || this.cert,
        ca: options.ca || this.ca,
        ciphers: options.ciphers || this.ciphers,
        rejectUnauthorized: options.rejectUnauthorized || this.rejectUnauthorized,
        perMessageDeflate: options.perMessageDeflate || this.perMessageDeflate,
        extraHeaders: options.extraHeaders || this.extraHeaders,
        forceNode: options.forceNode || this.forceNode,
        localAddress: options.localAddress || this.localAddress,
        requestTimeout: options.requestTimeout || this.requestTimeout,
        protocols: options.protocols || void (0),
        isReactNative: this.isReactNative
      });

      return transport;
    };

    function clone (obj) {
      var o = {};
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          o[i] = obj[i];
        }
      }
      return o;
    }

    /**
     * Initializes transport to use and starts probe.
     *
     * @api private
     */
    Socket$1.prototype.open = function () {
      var transport;
      if (this.rememberUpgrade && Socket$1.priorWebsocketSuccess && this.transports.indexOf('websocket') !== -1) {
        transport = 'websocket';
      } else if (0 === this.transports.length) {
        // Emit error on next tick so it can be listened to
        var self = this;
        setTimeout(function () {
          self.emit('error', 'No transports available');
        }, 0);
        return;
      } else {
        transport = this.transports[0];
      }
      this.readyState = 'opening';

      // Retry with the next transport if the transport is disabled (jsonp: false)
      try {
        transport = this.createTransport(transport);
      } catch (e) {
        this.transports.shift();
        this.open();
        return;
      }

      transport.open();
      this.setTransport(transport);
    };

    /**
     * Sets the current transport. Disables the existing one (if any).
     *
     * @api private
     */

    Socket$1.prototype.setTransport = function (transport) {
      debug$1('setting transport %s', transport.name);
      var self = this;

      if (this.transport) {
        debug$1('clearing existing transport %s', this.transport.name);
        this.transport.removeAllListeners();
      }

      // set up transport
      this.transport = transport;

      // set up transport listeners
      transport
      .on('drain', function () {
        self.onDrain();
      })
      .on('packet', function (packet) {
        self.onPacket(packet);
      })
      .on('error', function (e) {
        self.onError(e);
      })
      .on('close', function () {
        self.onClose('transport close');
      });
    };

    /**
     * Probes a transport.
     *
     * @param {String} transport name
     * @api private
     */

    Socket$1.prototype.probe = function (name) {
      debug$1('probing transport "%s"', name);
      var transport = this.createTransport(name, { probe: 1 });
      var failed = false;
      var self = this;

      Socket$1.priorWebsocketSuccess = false;

      function onTransportOpen () {
        if (self.onlyBinaryUpgrades) {
          var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
          failed = failed || upgradeLosesBinary;
        }
        if (failed) return;

        debug$1('probe transport "%s" opened', name);
        transport.send([{ type: 'ping', data: 'probe' }]);
        transport.once('packet', function (msg) {
          if (failed) return;
          if ('pong' === msg.type && 'probe' === msg.data) {
            debug$1('probe transport "%s" pong', name);
            self.upgrading = true;
            self.emit('upgrading', transport);
            if (!transport) return;
            Socket$1.priorWebsocketSuccess = 'websocket' === transport.name;

            debug$1('pausing current transport "%s"', self.transport.name);
            self.transport.pause(function () {
              if (failed) return;
              if ('closed' === self.readyState) return;
              debug$1('changing transport and sending upgrade packet');

              cleanup();

              self.setTransport(transport);
              transport.send([{ type: 'upgrade' }]);
              self.emit('upgrade', transport);
              transport = null;
              self.upgrading = false;
              self.flush();
            });
          } else {
            debug$1('probe transport "%s" failed', name);
            var err = new Error('probe error');
            err.transport = transport.name;
            self.emit('upgradeError', err);
          }
        });
      }

      function freezeTransport () {
        if (failed) return;

        // Any callback called by transport should be ignored since now
        failed = true;

        cleanup();

        transport.close();
        transport = null;
      }

      // Handle any error that happens while probing
      function onerror (err) {
        var error = new Error('probe error: ' + err);
        error.transport = transport.name;

        freezeTransport();

        debug$1('probe transport "%s" failed because of error: %s', name, err);

        self.emit('upgradeError', error);
      }

      function onTransportClose () {
        onerror('transport closed');
      }

      // When the socket is closed while we're probing
      function onclose () {
        onerror('socket closed');
      }

      // When the socket is upgraded while we're probing
      function onupgrade (to) {
        if (transport && to.name !== transport.name) {
          debug$1('"%s" works - aborting "%s"', to.name, transport.name);
          freezeTransport();
        }
      }

      // Remove all listeners on the transport and on self
      function cleanup () {
        transport.removeListener('open', onTransportOpen);
        transport.removeListener('error', onerror);
        transport.removeListener('close', onTransportClose);
        self.removeListener('close', onclose);
        self.removeListener('upgrading', onupgrade);
      }

      transport.once('open', onTransportOpen);
      transport.once('error', onerror);
      transport.once('close', onTransportClose);

      this.once('close', onclose);
      this.once('upgrading', onupgrade);

      transport.open();
    };

    /**
     * Called when connection is deemed open.
     *
     * @api public
     */

    Socket$1.prototype.onOpen = function () {
      debug$1('socket open');
      this.readyState = 'open';
      Socket$1.priorWebsocketSuccess = 'websocket' === this.transport.name;
      this.emit('open');
      this.flush();

      // we check for `readyState` in case an `open`
      // listener already closed the socket
      if ('open' === this.readyState && this.upgrade && this.transport.pause) {
        debug$1('starting upgrade probes');
        for (var i = 0, l = this.upgrades.length; i < l; i++) {
          this.probe(this.upgrades[i]);
        }
      }
    };

    /**
     * Handles a packet.
     *
     * @api private
     */

    Socket$1.prototype.onPacket = function (packet) {
      if ('opening' === this.readyState || 'open' === this.readyState ||
          'closing' === this.readyState) {
        debug$1('socket receive: type "%s", data "%s"', packet.type, packet.data);

        this.emit('packet', packet);

        // Socket is live - any packet counts
        this.emit('heartbeat');

        switch (packet.type) {
          case 'open':
            this.onHandshake(JSON.parse(packet.data));
            break;

          case 'pong':
            this.setPing();
            this.emit('pong');
            break;

          case 'error':
            var err = new Error('server error');
            err.code = packet.data;
            this.onError(err);
            break;

          case 'message':
            this.emit('data', packet.data);
            this.emit('message', packet.data);
            break;
        }
      } else {
        debug$1('packet received with socket readyState "%s"', this.readyState);
      }
    };

    /**
     * Called upon handshake completion.
     *
     * @param {Object} handshake obj
     * @api private
     */

    Socket$1.prototype.onHandshake = function (data) {
      this.emit('handshake', data);
      this.id = data.sid;
      this.transport.query.sid = data.sid;
      this.upgrades = this.filterUpgrades(data.upgrades);
      this.pingInterval = data.pingInterval;
      this.pingTimeout = data.pingTimeout;
      this.onOpen();
      // In case open handler closes socket
      if ('closed' === this.readyState) return;
      this.setPing();

      // Prolong liveness of socket on heartbeat
      this.removeListener('heartbeat', this.onHeartbeat);
      this.on('heartbeat', this.onHeartbeat);
    };

    /**
     * Resets ping timeout.
     *
     * @api private
     */

    Socket$1.prototype.onHeartbeat = function (timeout) {
      clearTimeout(this.pingTimeoutTimer);
      var self = this;
      self.pingTimeoutTimer = setTimeout(function () {
        if ('closed' === self.readyState) return;
        self.onClose('ping timeout');
      }, timeout || (self.pingInterval + self.pingTimeout));
    };

    /**
     * Pings server every `this.pingInterval` and expects response
     * within `this.pingTimeout` or closes connection.
     *
     * @api private
     */

    Socket$1.prototype.setPing = function () {
      var self = this;
      clearTimeout(self.pingIntervalTimer);
      self.pingIntervalTimer = setTimeout(function () {
        debug$1('writing ping packet - expecting pong within %sms', self.pingTimeout);
        self.ping();
        self.onHeartbeat(self.pingTimeout);
      }, self.pingInterval);
    };

    /**
    * Sends a ping packet.
    *
    * @api private
    */

    Socket$1.prototype.ping = function () {
      var self = this;
      this.sendPacket('ping', function () {
        self.emit('ping');
      });
    };

    /**
     * Called on `drain` event
     *
     * @api private
     */

    Socket$1.prototype.onDrain = function () {
      this.writeBuffer.splice(0, this.prevBufferLen);

      // setting prevBufferLen = 0 is very important
      // for example, when upgrading, upgrade packet is sent over,
      // and a nonzero prevBufferLen could cause problems on `drain`
      this.prevBufferLen = 0;

      if (0 === this.writeBuffer.length) {
        this.emit('drain');
      } else {
        this.flush();
      }
    };

    /**
     * Flush write buffers.
     *
     * @api private
     */

    Socket$1.prototype.flush = function () {
      if ('closed' !== this.readyState && this.transport.writable &&
        !this.upgrading && this.writeBuffer.length) {
        debug$1('flushing %d packets in socket', this.writeBuffer.length);
        this.transport.send(this.writeBuffer);
        // keep track of current length of writeBuffer
        // splice writeBuffer and callbackBuffer on `drain`
        this.prevBufferLen = this.writeBuffer.length;
        this.emit('flush');
      }
    };

    /**
     * Sends a message.
     *
     * @param {String} message.
     * @param {Function} callback function.
     * @param {Object} options.
     * @return {Socket} for chaining.
     * @api public
     */

    Socket$1.prototype.write =
    Socket$1.prototype.send = function (msg, options, fn) {
      this.sendPacket('message', msg, options, fn);
      return this;
    };

    /**
     * Sends a packet.
     *
     * @param {String} packet type.
     * @param {String} data.
     * @param {Object} options.
     * @param {Function} callback function.
     * @api private
     */

    Socket$1.prototype.sendPacket = function (type, data, options, fn) {
      if ('function' === typeof data) {
        fn = data;
        data = undefined;
      }

      if ('function' === typeof options) {
        fn = options;
        options = null;
      }

      if ('closing' === this.readyState || 'closed' === this.readyState) {
        return;
      }

      options = options || {};
      options.compress = false !== options.compress;

      var packet = {
        type: type,
        data: data,
        options: options
      };
      this.emit('packetCreate', packet);
      this.writeBuffer.push(packet);
      if (fn) this.once('flush', fn);
      this.flush();
    };

    /**
     * Closes the connection.
     *
     * @api private
     */

    Socket$1.prototype.close = function () {
      if ('opening' === this.readyState || 'open' === this.readyState) {
        this.readyState = 'closing';

        var self = this;

        if (this.writeBuffer.length) {
          this.once('drain', function () {
            if (this.upgrading) {
              waitForUpgrade();
            } else {
              close();
            }
          });
        } else if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      }

      function close () {
        self.onClose('forced close');
        debug$1('socket closing - telling transport to close');
        self.transport.close();
      }

      function cleanupAndClose () {
        self.removeListener('upgrade', cleanupAndClose);
        self.removeListener('upgradeError', cleanupAndClose);
        close();
      }

      function waitForUpgrade () {
        // wait for upgrade to finish since we can't send packets while pausing a transport
        self.once('upgrade', cleanupAndClose);
        self.once('upgradeError', cleanupAndClose);
      }

      return this;
    };

    /**
     * Called upon transport error
     *
     * @api private
     */

    Socket$1.prototype.onError = function (err) {
      debug$1('socket error %j', err);
      Socket$1.priorWebsocketSuccess = false;
      this.emit('error', err);
      this.onClose('transport error', err);
    };

    /**
     * Called upon transport close.
     *
     * @api private
     */

    Socket$1.prototype.onClose = function (reason, desc) {
      if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
        debug$1('socket close with reason: "%s"', reason);
        var self = this;

        // clear timers
        clearTimeout(this.pingIntervalTimer);
        clearTimeout(this.pingTimeoutTimer);

        // stop event from firing again for transport
        this.transport.removeAllListeners('close');

        // ensure transport won't stay open
        this.transport.close();

        // ignore further transport communication
        this.transport.removeAllListeners();

        // set ready state
        this.readyState = 'closed';

        // clear session id
        this.id = null;

        // emit close event
        this.emit('close', reason, desc);

        // clean buffers after, so users can still
        // grab the buffers on `close` event
        self.writeBuffer = [];
        self.prevBufferLen = 0;
      }
    };

    /**
     * Filters upgrades, returning only those matching client transports.
     *
     * @param {Array} server upgrades
     * @api private
     *
     */

    Socket$1.prototype.filterUpgrades = function (upgrades) {
      var filteredUpgrades = [];
      for (var i = 0, j = upgrades.length; i < j; i++) {
        if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
      }
      return filteredUpgrades;
    };

    lib.exports = socket$1;

    /**
     * Exports parser
     *
     * @api public
     *
     */
    lib.exports.parser = browser$1;

    var libExports$1 = lib.exports;

    var socket = {exports: {}};

    var componentEmitter = {exports: {}};

    (function (module) {
    	/**
    	 * Expose `Emitter`.
    	 */

    	{
    	  module.exports = Emitter;
    	}

    	/**
    	 * Initialize a new `Emitter`.
    	 *
    	 * @api public
    	 */

    	function Emitter(obj) {
    	  if (obj) return mixin(obj);
    	}
    	/**
    	 * Mixin the emitter properties.
    	 *
    	 * @param {Object} obj
    	 * @return {Object}
    	 * @api private
    	 */

    	function mixin(obj) {
    	  for (var key in Emitter.prototype) {
    	    obj[key] = Emitter.prototype[key];
    	  }
    	  return obj;
    	}

    	/**
    	 * Listen on the given `event` with `fn`.
    	 *
    	 * @param {String} event
    	 * @param {Function} fn
    	 * @return {Emitter}
    	 * @api public
    	 */

    	Emitter.prototype.on =
    	Emitter.prototype.addEventListener = function(event, fn){
    	  this._callbacks = this._callbacks || {};
    	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    	    .push(fn);
    	  return this;
    	};

    	/**
    	 * Adds an `event` listener that will be invoked a single
    	 * time then automatically removed.
    	 *
    	 * @param {String} event
    	 * @param {Function} fn
    	 * @return {Emitter}
    	 * @api public
    	 */

    	Emitter.prototype.once = function(event, fn){
    	  function on() {
    	    this.off(event, on);
    	    fn.apply(this, arguments);
    	  }

    	  on.fn = fn;
    	  this.on(event, on);
    	  return this;
    	};

    	/**
    	 * Remove the given callback for `event` or all
    	 * registered callbacks.
    	 *
    	 * @param {String} event
    	 * @param {Function} fn
    	 * @return {Emitter}
    	 * @api public
    	 */

    	Emitter.prototype.off =
    	Emitter.prototype.removeListener =
    	Emitter.prototype.removeAllListeners =
    	Emitter.prototype.removeEventListener = function(event, fn){
    	  this._callbacks = this._callbacks || {};

    	  // all
    	  if (0 == arguments.length) {
    	    this._callbacks = {};
    	    return this;
    	  }

    	  // specific event
    	  var callbacks = this._callbacks['$' + event];
    	  if (!callbacks) return this;

    	  // remove all handlers
    	  if (1 == arguments.length) {
    	    delete this._callbacks['$' + event];
    	    return this;
    	  }

    	  // remove specific handler
    	  var cb;
    	  for (var i = 0; i < callbacks.length; i++) {
    	    cb = callbacks[i];
    	    if (cb === fn || cb.fn === fn) {
    	      callbacks.splice(i, 1);
    	      break;
    	    }
    	  }
    	  return this;
    	};

    	/**
    	 * Emit `event` with the given args.
    	 *
    	 * @param {String} event
    	 * @param {Mixed} ...
    	 * @return {Emitter}
    	 */

    	Emitter.prototype.emit = function(event){
    	  this._callbacks = this._callbacks || {};
    	  var args = [].slice.call(arguments, 1)
    	    , callbacks = this._callbacks['$' + event];

    	  if (callbacks) {
    	    callbacks = callbacks.slice(0);
    	    for (var i = 0, len = callbacks.length; i < len; ++i) {
    	      callbacks[i].apply(this, args);
    	    }
    	  }

    	  return this;
    	};

    	/**
    	 * Return array of callbacks for `event`.
    	 *
    	 * @param {String} event
    	 * @return {Array}
    	 * @api public
    	 */

    	Emitter.prototype.listeners = function(event){
    	  this._callbacks = this._callbacks || {};
    	  return this._callbacks['$' + event] || [];
    	};

    	/**
    	 * Check if this emitter has `event` handlers.
    	 *
    	 * @param {String} event
    	 * @return {Boolean}
    	 * @api public
    	 */

    	Emitter.prototype.hasListeners = function(event){
    	  return !! this.listeners(event).length;
    	}; 
    } (componentEmitter));

    var componentEmitterExports = componentEmitter.exports;

    var toArray_1 = toArray$1;

    function toArray$1(list, index) {
        var array = [];

        index = index || 0;

        for (var i = index || 0; i < list.length; i++) {
            array[i - index] = list[i];
        }

        return array
    }

    /**
     * Module exports.
     */

    var on_1 = on$1;

    /**
     * Helper for subscriptions.
     *
     * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
     * @param {String} event name
     * @param {Function} callback
     * @api public
     */

    function on$1 (obj, ev, fn) {
      obj.on(ev, fn);
      return {
        destroy: function () {
          obj.removeListener(ev, fn);
        }
      };
    }

    /**
     * Slice reference.
     */

    var slice = [].slice;

    /**
     * Bind `obj` to `fn`.
     *
     * @param {Object} obj
     * @param {Function|String} fn or string
     * @return {Function}
     * @api public
     */

    var componentBind = function(obj, fn){
      if ('string' == typeof fn) fn = obj[fn];
      if ('function' != typeof fn) throw new Error('bind() requires a function');
      var args = slice.call(arguments, 2);
      return function(){
        return fn.apply(obj, args.concat(slice.call(arguments)));
      }
    };

    var parseqs = {};

    /**
     * Compiles a querystring
     * Returns string representation of the object
     *
     * @param {Object}
     * @api private
     */

    parseqs.encode = function (obj) {
      var str = '';

      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          if (str.length) str += '&';
          str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
        }
      }

      return str;
    };

    /**
     * Parses a simple querystring into an object
     *
     * @param {String} qs
     * @api private
     */

    parseqs.decode = function(qs){
      var qry = {};
      var pairs = qs.split('&');
      for (var i = 0, l = pairs.length; i < l; i++) {
        var pair = pairs[i].split('=');
        qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
      return qry;
    };

    (function (module, exports) {
    	/**
    	 * Module dependencies.
    	 */

    	var parser = socket_ioParser;
    	var Emitter = componentEmitterExports;
    	var toArray = toArray_1;
    	var on = on_1;
    	var bind = componentBind;
    	var debug = browserExports$2('socket.io-client:socket');
    	var parseqs$1 = parseqs;
    	var hasBin = hasBinary2;

    	/**
    	 * Module exports.
    	 */

    	module.exports = Socket;

    	/**
    	 * Internal events (blacklisted).
    	 * These events can't be emitted by the user.
    	 *
    	 * @api private
    	 */

    	var events = {
    	  connect: 1,
    	  connect_error: 1,
    	  connect_timeout: 1,
    	  connecting: 1,
    	  disconnect: 1,
    	  error: 1,
    	  reconnect: 1,
    	  reconnect_attempt: 1,
    	  reconnect_failed: 1,
    	  reconnect_error: 1,
    	  reconnecting: 1,
    	  ping: 1,
    	  pong: 1
    	};

    	/**
    	 * Shortcut to `Emitter#emit`.
    	 */

    	var emit = Emitter.prototype.emit;

    	/**
    	 * `Socket` constructor.
    	 *
    	 * @api public
    	 */

    	function Socket (io, nsp, opts) {
    	  this.io = io;
    	  this.nsp = nsp;
    	  this.json = this; // compat
    	  this.ids = 0;
    	  this.acks = {};
    	  this.receiveBuffer = [];
    	  this.sendBuffer = [];
    	  this.connected = false;
    	  this.disconnected = true;
    	  this.flags = {};
    	  if (opts && opts.query) {
    	    this.query = opts.query;
    	  }
    	  if (this.io.autoConnect) this.open();
    	}

    	/**
    	 * Mix in `Emitter`.
    	 */

    	Emitter(Socket.prototype);

    	/**
    	 * Subscribe to open, close and packet events
    	 *
    	 * @api private
    	 */

    	Socket.prototype.subEvents = function () {
    	  if (this.subs) return;

    	  var io = this.io;
    	  this.subs = [
    	    on(io, 'open', bind(this, 'onopen')),
    	    on(io, 'packet', bind(this, 'onpacket')),
    	    on(io, 'close', bind(this, 'onclose'))
    	  ];
    	};

    	/**
    	 * "Opens" the socket.
    	 *
    	 * @api public
    	 */

    	Socket.prototype.open =
    	Socket.prototype.connect = function () {
    	  if (this.connected) return this;

    	  this.subEvents();
    	  this.io.open(); // ensure open
    	  if ('open' === this.io.readyState) this.onopen();
    	  this.emit('connecting');
    	  return this;
    	};

    	/**
    	 * Sends a `message` event.
    	 *
    	 * @return {Socket} self
    	 * @api public
    	 */

    	Socket.prototype.send = function () {
    	  var args = toArray(arguments);
    	  args.unshift('message');
    	  this.emit.apply(this, args);
    	  return this;
    	};

    	/**
    	 * Override `emit`.
    	 * If the event is in `events`, it's emitted normally.
    	 *
    	 * @param {String} event name
    	 * @return {Socket} self
    	 * @api public
    	 */

    	Socket.prototype.emit = function (ev) {
    	  if (events.hasOwnProperty(ev)) {
    	    emit.apply(this, arguments);
    	    return this;
    	  }

    	  var args = toArray(arguments);
    	  var packet = {
    	    type: (this.flags.binary !== undefined ? this.flags.binary : hasBin(args)) ? parser.BINARY_EVENT : parser.EVENT,
    	    data: args
    	  };

    	  packet.options = {};
    	  packet.options.compress = !this.flags || false !== this.flags.compress;

    	  // event ack callback
    	  if ('function' === typeof args[args.length - 1]) {
    	    debug('emitting packet with ack id %d', this.ids);
    	    this.acks[this.ids] = args.pop();
    	    packet.id = this.ids++;
    	  }

    	  if (this.connected) {
    	    this.packet(packet);
    	  } else {
    	    this.sendBuffer.push(packet);
    	  }

    	  this.flags = {};

    	  return this;
    	};

    	/**
    	 * Sends a packet.
    	 *
    	 * @param {Object} packet
    	 * @api private
    	 */

    	Socket.prototype.packet = function (packet) {
    	  packet.nsp = this.nsp;
    	  this.io.packet(packet);
    	};

    	/**
    	 * Called upon engine `open`.
    	 *
    	 * @api private
    	 */

    	Socket.prototype.onopen = function () {
    	  debug('transport is open - connecting');

    	  // write connect packet if necessary
    	  if ('/' !== this.nsp) {
    	    if (this.query) {
    	      var query = typeof this.query === 'object' ? parseqs$1.encode(this.query) : this.query;
    	      debug('sending connect packet with query %s', query);
    	      this.packet({type: parser.CONNECT, query: query});
    	    } else {
    	      this.packet({type: parser.CONNECT});
    	    }
    	  }
    	};

    	/**
    	 * Called upon engine `close`.
    	 *
    	 * @param {String} reason
    	 * @api private
    	 */

    	Socket.prototype.onclose = function (reason) {
    	  debug('close (%s)', reason);
    	  this.connected = false;
    	  this.disconnected = true;
    	  delete this.id;
    	  this.emit('disconnect', reason);
    	};

    	/**
    	 * Called with socket packet.
    	 *
    	 * @param {Object} packet
    	 * @api private
    	 */

    	Socket.prototype.onpacket = function (packet) {
    	  var sameNamespace = packet.nsp === this.nsp;
    	  var rootNamespaceError = packet.type === parser.ERROR && packet.nsp === '/';

    	  if (!sameNamespace && !rootNamespaceError) return;

    	  switch (packet.type) {
    	    case parser.CONNECT:
    	      this.onconnect();
    	      break;

    	    case parser.EVENT:
    	      this.onevent(packet);
    	      break;

    	    case parser.BINARY_EVENT:
    	      this.onevent(packet);
    	      break;

    	    case parser.ACK:
    	      this.onack(packet);
    	      break;

    	    case parser.BINARY_ACK:
    	      this.onack(packet);
    	      break;

    	    case parser.DISCONNECT:
    	      this.ondisconnect();
    	      break;

    	    case parser.ERROR:
    	      this.emit('error', packet.data);
    	      break;
    	  }
    	};

    	/**
    	 * Called upon a server event.
    	 *
    	 * @param {Object} packet
    	 * @api private
    	 */

    	Socket.prototype.onevent = function (packet) {
    	  var args = packet.data || [];
    	  debug('emitting event %j', args);

    	  if (null != packet.id) {
    	    debug('attaching ack callback to event');
    	    args.push(this.ack(packet.id));
    	  }

    	  if (this.connected) {
    	    emit.apply(this, args);
    	  } else {
    	    this.receiveBuffer.push(args);
    	  }
    	};

    	/**
    	 * Produces an ack callback to emit with an event.
    	 *
    	 * @api private
    	 */

    	Socket.prototype.ack = function (id) {
    	  var self = this;
    	  var sent = false;
    	  return function () {
    	    // prevent double callbacks
    	    if (sent) return;
    	    sent = true;
    	    var args = toArray(arguments);
    	    debug('sending ack %j', args);

    	    self.packet({
    	      type: hasBin(args) ? parser.BINARY_ACK : parser.ACK,
    	      id: id,
    	      data: args
    	    });
    	  };
    	};

    	/**
    	 * Called upon a server acknowlegement.
    	 *
    	 * @param {Object} packet
    	 * @api private
    	 */

    	Socket.prototype.onack = function (packet) {
    	  var ack = this.acks[packet.id];
    	  if ('function' === typeof ack) {
    	    debug('calling ack %s with %j', packet.id, packet.data);
    	    ack.apply(this, packet.data);
    	    delete this.acks[packet.id];
    	  } else {
    	    debug('bad ack %s', packet.id);
    	  }
    	};

    	/**
    	 * Called upon server connect.
    	 *
    	 * @api private
    	 */

    	Socket.prototype.onconnect = function () {
    	  this.connected = true;
    	  this.disconnected = false;
    	  this.emit('connect');
    	  this.emitBuffered();
    	};

    	/**
    	 * Emit buffered events (received and emitted).
    	 *
    	 * @api private
    	 */

    	Socket.prototype.emitBuffered = function () {
    	  var i;
    	  for (i = 0; i < this.receiveBuffer.length; i++) {
    	    emit.apply(this, this.receiveBuffer[i]);
    	  }
    	  this.receiveBuffer = [];

    	  for (i = 0; i < this.sendBuffer.length; i++) {
    	    this.packet(this.sendBuffer[i]);
    	  }
    	  this.sendBuffer = [];
    	};

    	/**
    	 * Called upon server disconnect.
    	 *
    	 * @api private
    	 */

    	Socket.prototype.ondisconnect = function () {
    	  debug('server disconnect (%s)', this.nsp);
    	  this.destroy();
    	  this.onclose('io server disconnect');
    	};

    	/**
    	 * Called upon forced client/server side disconnections,
    	 * this method ensures the manager stops tracking us and
    	 * that reconnections don't get triggered for this.
    	 *
    	 * @api private.
    	 */

    	Socket.prototype.destroy = function () {
    	  if (this.subs) {
    	    // clean subscriptions to avoid reconnections
    	    for (var i = 0; i < this.subs.length; i++) {
    	      this.subs[i].destroy();
    	    }
    	    this.subs = null;
    	  }

    	  this.io.destroy(this);
    	};

    	/**
    	 * Disconnects the socket manually.
    	 *
    	 * @return {Socket} self
    	 * @api public
    	 */

    	Socket.prototype.close =
    	Socket.prototype.disconnect = function () {
    	  if (this.connected) {
    	    debug('performing disconnect (%s)', this.nsp);
    	    this.packet({ type: parser.DISCONNECT });
    	  }

    	  // remove socket from pool
    	  this.destroy();

    	  if (this.connected) {
    	    // fire events
    	    this.onclose('io client disconnect');
    	  }
    	  return this;
    	};

    	/**
    	 * Sets the compress flag.
    	 *
    	 * @param {Boolean} if `true`, compresses the sending data
    	 * @return {Socket} self
    	 * @api public
    	 */

    	Socket.prototype.compress = function (compress) {
    	  this.flags.compress = compress;
    	  return this;
    	};

    	/**
    	 * Sets the binary flag
    	 *
    	 * @param {Boolean} whether the emitted data contains binary
    	 * @return {Socket} self
    	 * @api public
    	 */

    	Socket.prototype.binary = function (binary) {
    	  this.flags.binary = binary;
    	  return this;
    	}; 
    } (socket));

    var socketExports = socket.exports;

    /**
     * Expose `Backoff`.
     */

    var backo2 = Backoff$1;

    /**
     * Initialize backoff timer with `opts`.
     *
     * - `min` initial timeout in milliseconds [100]
     * - `max` max timeout [10000]
     * - `jitter` [0]
     * - `factor` [2]
     *
     * @param {Object} opts
     * @api public
     */

    function Backoff$1(opts) {
      opts = opts || {};
      this.ms = opts.min || 100;
      this.max = opts.max || 10000;
      this.factor = opts.factor || 2;
      this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
      this.attempts = 0;
    }

    /**
     * Return the backoff duration.
     *
     * @return {Number}
     * @api public
     */

    Backoff$1.prototype.duration = function(){
      var ms = this.ms * Math.pow(this.factor, this.attempts++);
      if (this.jitter) {
        var rand =  Math.random();
        var deviation = Math.floor(rand * this.jitter * ms);
        ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
      }
      return Math.min(ms, this.max) | 0;
    };

    /**
     * Reset the number of attempts.
     *
     * @api public
     */

    Backoff$1.prototype.reset = function(){
      this.attempts = 0;
    };

    /**
     * Set the minimum duration
     *
     * @api public
     */

    Backoff$1.prototype.setMin = function(min){
      this.ms = min;
    };

    /**
     * Set the maximum duration
     *
     * @api public
     */

    Backoff$1.prototype.setMax = function(max){
      this.max = max;
    };

    /**
     * Set the jitter
     *
     * @api public
     */

    Backoff$1.prototype.setJitter = function(jitter){
      this.jitter = jitter;
    };

    /**
     * Module dependencies.
     */

    var eio = libExports$1;
    var Socket = socketExports;
    var Emitter = componentEmitterExports;
    var parser = socket_ioParser;
    var on = on_1;
    var bind$1 = componentBind;
    var debug = browserExports$2('socket.io-client:manager');
    var indexOf = indexof;
    var Backoff = backo2;

    /**
     * IE6+ hasOwnProperty
     */

    var has = Object.prototype.hasOwnProperty;

    /**
     * Module exports
     */

    var manager = Manager;

    /**
     * `Manager` constructor.
     *
     * @param {String} engine instance or engine uri/opts
     * @param {Object} options
     * @api public
     */

    function Manager (uri, opts) {
      if (!(this instanceof Manager)) return new Manager(uri, opts);
      if (uri && ('object' === typeof uri)) {
        opts = uri;
        uri = undefined;
      }
      opts = opts || {};

      opts.path = opts.path || '/socket.io';
      this.nsps = {};
      this.subs = [];
      this.opts = opts;
      this.reconnection(opts.reconnection !== false);
      this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
      this.reconnectionDelay(opts.reconnectionDelay || 1000);
      this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
      this.randomizationFactor(opts.randomizationFactor || 0.5);
      this.backoff = new Backoff({
        min: this.reconnectionDelay(),
        max: this.reconnectionDelayMax(),
        jitter: this.randomizationFactor()
      });
      this.timeout(null == opts.timeout ? 20000 : opts.timeout);
      this.readyState = 'closed';
      this.uri = uri;
      this.connecting = [];
      this.lastPing = null;
      this.encoding = false;
      this.packetBuffer = [];
      var _parser = opts.parser || parser;
      this.encoder = new _parser.Encoder();
      this.decoder = new _parser.Decoder();
      this.autoConnect = opts.autoConnect !== false;
      if (this.autoConnect) this.open();
    }

    /**
     * Propagate given event to sockets and emit on `this`
     *
     * @api private
     */

    Manager.prototype.emitAll = function () {
      this.emit.apply(this, arguments);
      for (var nsp in this.nsps) {
        if (has.call(this.nsps, nsp)) {
          this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
        }
      }
    };

    /**
     * Update `socket.id` of all sockets
     *
     * @api private
     */

    Manager.prototype.updateSocketIds = function () {
      for (var nsp in this.nsps) {
        if (has.call(this.nsps, nsp)) {
          this.nsps[nsp].id = this.generateId(nsp);
        }
      }
    };

    /**
     * generate `socket.id` for the given `nsp`
     *
     * @param {String} nsp
     * @return {String}
     * @api private
     */

    Manager.prototype.generateId = function (nsp) {
      return (nsp === '/' ? '' : (nsp + '#')) + this.engine.id;
    };

    /**
     * Mix in `Emitter`.
     */

    Emitter(Manager.prototype);

    /**
     * Sets the `reconnection` config.
     *
     * @param {Boolean} true/false if it should automatically reconnect
     * @return {Manager} self or value
     * @api public
     */

    Manager.prototype.reconnection = function (v) {
      if (!arguments.length) return this._reconnection;
      this._reconnection = !!v;
      return this;
    };

    /**
     * Sets the reconnection attempts config.
     *
     * @param {Number} max reconnection attempts before giving up
     * @return {Manager} self or value
     * @api public
     */

    Manager.prototype.reconnectionAttempts = function (v) {
      if (!arguments.length) return this._reconnectionAttempts;
      this._reconnectionAttempts = v;
      return this;
    };

    /**
     * Sets the delay between reconnections.
     *
     * @param {Number} delay
     * @return {Manager} self or value
     * @api public
     */

    Manager.prototype.reconnectionDelay = function (v) {
      if (!arguments.length) return this._reconnectionDelay;
      this._reconnectionDelay = v;
      this.backoff && this.backoff.setMin(v);
      return this;
    };

    Manager.prototype.randomizationFactor = function (v) {
      if (!arguments.length) return this._randomizationFactor;
      this._randomizationFactor = v;
      this.backoff && this.backoff.setJitter(v);
      return this;
    };

    /**
     * Sets the maximum delay between reconnections.
     *
     * @param {Number} delay
     * @return {Manager} self or value
     * @api public
     */

    Manager.prototype.reconnectionDelayMax = function (v) {
      if (!arguments.length) return this._reconnectionDelayMax;
      this._reconnectionDelayMax = v;
      this.backoff && this.backoff.setMax(v);
      return this;
    };

    /**
     * Sets the connection timeout. `false` to disable
     *
     * @return {Manager} self or value
     * @api public
     */

    Manager.prototype.timeout = function (v) {
      if (!arguments.length) return this._timeout;
      this._timeout = v;
      return this;
    };

    /**
     * Starts trying to reconnect if reconnection is enabled and we have not
     * started reconnecting yet
     *
     * @api private
     */

    Manager.prototype.maybeReconnectOnOpen = function () {
      // Only try to reconnect if it's the first time we're connecting
      if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
        // keeps reconnection from firing twice for the same reconnection loop
        this.reconnect();
      }
    };

    /**
     * Sets the current transport `socket`.
     *
     * @param {Function} optional, callback
     * @return {Manager} self
     * @api public
     */

    Manager.prototype.open =
    Manager.prototype.connect = function (fn, opts) {
      debug('readyState %s', this.readyState);
      if (~this.readyState.indexOf('open')) return this;

      debug('opening %s', this.uri);
      this.engine = eio(this.uri, this.opts);
      var socket = this.engine;
      var self = this;
      this.readyState = 'opening';
      this.skipReconnect = false;

      // emit `open`
      var openSub = on(socket, 'open', function () {
        self.onopen();
        fn && fn();
      });

      // emit `connect_error`
      var errorSub = on(socket, 'error', function (data) {
        debug('connect_error');
        self.cleanup();
        self.readyState = 'closed';
        self.emitAll('connect_error', data);
        if (fn) {
          var err = new Error('Connection error');
          err.data = data;
          fn(err);
        } else {
          // Only do this if there is no fn to handle the error
          self.maybeReconnectOnOpen();
        }
      });

      // emit `connect_timeout`
      if (false !== this._timeout) {
        var timeout = this._timeout;
        debug('connect attempt will timeout after %d', timeout);

        // set timer
        var timer = setTimeout(function () {
          debug('connect attempt timed out after %d', timeout);
          openSub.destroy();
          socket.close();
          socket.emit('error', 'timeout');
          self.emitAll('connect_timeout', timeout);
        }, timeout);

        this.subs.push({
          destroy: function () {
            clearTimeout(timer);
          }
        });
      }

      this.subs.push(openSub);
      this.subs.push(errorSub);

      return this;
    };

    /**
     * Called upon transport open.
     *
     * @api private
     */

    Manager.prototype.onopen = function () {
      debug('open');

      // clear old subs
      this.cleanup();

      // mark as open
      this.readyState = 'open';
      this.emit('open');

      // add new subs
      var socket = this.engine;
      this.subs.push(on(socket, 'data', bind$1(this, 'ondata')));
      this.subs.push(on(socket, 'ping', bind$1(this, 'onping')));
      this.subs.push(on(socket, 'pong', bind$1(this, 'onpong')));
      this.subs.push(on(socket, 'error', bind$1(this, 'onerror')));
      this.subs.push(on(socket, 'close', bind$1(this, 'onclose')));
      this.subs.push(on(this.decoder, 'decoded', bind$1(this, 'ondecoded')));
    };

    /**
     * Called upon a ping.
     *
     * @api private
     */

    Manager.prototype.onping = function () {
      this.lastPing = new Date();
      this.emitAll('ping');
    };

    /**
     * Called upon a packet.
     *
     * @api private
     */

    Manager.prototype.onpong = function () {
      this.emitAll('pong', new Date() - this.lastPing);
    };

    /**
     * Called with data.
     *
     * @api private
     */

    Manager.prototype.ondata = function (data) {
      this.decoder.add(data);
    };

    /**
     * Called when parser fully decodes a packet.
     *
     * @api private
     */

    Manager.prototype.ondecoded = function (packet) {
      this.emit('packet', packet);
    };

    /**
     * Called upon socket error.
     *
     * @api private
     */

    Manager.prototype.onerror = function (err) {
      debug('error', err);
      this.emitAll('error', err);
    };

    /**
     * Creates a new socket for the given `nsp`.
     *
     * @return {Socket}
     * @api public
     */

    Manager.prototype.socket = function (nsp, opts) {
      var socket = this.nsps[nsp];
      if (!socket) {
        socket = new Socket(this, nsp, opts);
        this.nsps[nsp] = socket;
        var self = this;
        socket.on('connecting', onConnecting);
        socket.on('connect', function () {
          socket.id = self.generateId(nsp);
        });

        if (this.autoConnect) {
          // manually call here since connecting event is fired before listening
          onConnecting();
        }
      }

      function onConnecting () {
        if (!~indexOf(self.connecting, socket)) {
          self.connecting.push(socket);
        }
      }

      return socket;
    };

    /**
     * Called upon a socket close.
     *
     * @param {Socket} socket
     */

    Manager.prototype.destroy = function (socket) {
      var index = indexOf(this.connecting, socket);
      if (~index) this.connecting.splice(index, 1);
      if (this.connecting.length) return;

      this.close();
    };

    /**
     * Writes a packet.
     *
     * @param {Object} packet
     * @api private
     */

    Manager.prototype.packet = function (packet) {
      debug('writing packet %j', packet);
      var self = this;
      if (packet.query && packet.type === 0) packet.nsp += '?' + packet.query;

      if (!self.encoding) {
        // encode, then write to engine with result
        self.encoding = true;
        this.encoder.encode(packet, function (encodedPackets) {
          for (var i = 0; i < encodedPackets.length; i++) {
            self.engine.write(encodedPackets[i], packet.options);
          }
          self.encoding = false;
          self.processPacketQueue();
        });
      } else { // add packet to the queue
        self.packetBuffer.push(packet);
      }
    };

    /**
     * If packet buffer is non-empty, begins encoding the
     * next packet in line.
     *
     * @api private
     */

    Manager.prototype.processPacketQueue = function () {
      if (this.packetBuffer.length > 0 && !this.encoding) {
        var pack = this.packetBuffer.shift();
        this.packet(pack);
      }
    };

    /**
     * Clean up transport subscriptions and packet buffer.
     *
     * @api private
     */

    Manager.prototype.cleanup = function () {
      debug('cleanup');

      var subsLength = this.subs.length;
      for (var i = 0; i < subsLength; i++) {
        var sub = this.subs.shift();
        sub.destroy();
      }

      this.packetBuffer = [];
      this.encoding = false;
      this.lastPing = null;

      this.decoder.destroy();
    };

    /**
     * Close the current socket.
     *
     * @api private
     */

    Manager.prototype.close =
    Manager.prototype.disconnect = function () {
      debug('disconnect');
      this.skipReconnect = true;
      this.reconnecting = false;
      if ('opening' === this.readyState) {
        // `onclose` will not fire because
        // an open event never happened
        this.cleanup();
      }
      this.backoff.reset();
      this.readyState = 'closed';
      if (this.engine) this.engine.close();
    };

    /**
     * Called upon engine close.
     *
     * @api private
     */

    Manager.prototype.onclose = function (reason) {
      debug('onclose');

      this.cleanup();
      this.backoff.reset();
      this.readyState = 'closed';
      this.emit('close', reason);

      if (this._reconnection && !this.skipReconnect) {
        this.reconnect();
      }
    };

    /**
     * Attempt a reconnection.
     *
     * @api private
     */

    Manager.prototype.reconnect = function () {
      if (this.reconnecting || this.skipReconnect) return this;

      var self = this;

      if (this.backoff.attempts >= this._reconnectionAttempts) {
        debug('reconnect failed');
        this.backoff.reset();
        this.emitAll('reconnect_failed');
        this.reconnecting = false;
      } else {
        var delay = this.backoff.duration();
        debug('will wait %dms before reconnect attempt', delay);

        this.reconnecting = true;
        var timer = setTimeout(function () {
          if (self.skipReconnect) return;

          debug('attempting reconnect');
          self.emitAll('reconnect_attempt', self.backoff.attempts);
          self.emitAll('reconnecting', self.backoff.attempts);

          // check again for the case socket closed in above events
          if (self.skipReconnect) return;

          self.open(function (err) {
            if (err) {
              debug('reconnect attempt error');
              self.reconnecting = false;
              self.reconnect();
              self.emitAll('reconnect_error', err.data);
            } else {
              debug('reconnect success');
              self.onreconnect();
            }
          });
        }, delay);

        this.subs.push({
          destroy: function () {
            clearTimeout(timer);
          }
        });
      }
    };

    /**
     * Called upon successful reconnect.
     *
     * @api private
     */

    Manager.prototype.onreconnect = function () {
      var attempt = this.backoff.attempts;
      this.reconnecting = false;
      this.backoff.reset();
      this.updateSocketIds();
      this.emitAll('reconnect', attempt);
    };

    (function (module, exports) {
    	/**
    	 * Module dependencies.
    	 */

    	var url = url_1;
    	var parser = socket_ioParser;
    	var Manager = manager;
    	var debug = browserExports$2('socket.io-client');

    	/**
    	 * Module exports.
    	 */

    	module.exports = exports = lookup;

    	/**
    	 * Managers cache.
    	 */

    	var cache = exports.managers = {};

    	/**
    	 * Looks up an existing `Manager` for multiplexing.
    	 * If the user summons:
    	 *
    	 *   `io('http://localhost/a');`
    	 *   `io('http://localhost/b');`
    	 *
    	 * We reuse the existing instance based on same scheme/port/host,
    	 * and we initialize sockets for each namespace.
    	 *
    	 * @api public
    	 */

    	function lookup (uri, opts) {
    	  if (typeof uri === 'object') {
    	    opts = uri;
    	    uri = undefined;
    	  }

    	  opts = opts || {};

    	  var parsed = url(uri);
    	  var source = parsed.source;
    	  var id = parsed.id;
    	  var path = parsed.path;
    	  var sameNamespace = cache[id] && path in cache[id].nsps;
    	  var newConnection = opts.forceNew || opts['force new connection'] ||
    	                      false === opts.multiplex || sameNamespace;

    	  var io;

    	  if (newConnection) {
    	    debug('ignoring socket cache for %s', source);
    	    io = Manager(source, opts);
    	  } else {
    	    if (!cache[id]) {
    	      debug('new io instance for %s', source);
    	      cache[id] = Manager(source, opts);
    	    }
    	    io = cache[id];
    	  }
    	  if (parsed.query && !opts.query) {
    	    opts.query = parsed.query;
    	  }
    	  return io.socket(parsed.path, opts);
    	}

    	/**
    	 * Protocol version.
    	 *
    	 * @api public
    	 */

    	exports.protocol = parser.protocol;

    	/**
    	 * `connect`.
    	 *
    	 * @param {String} uri
    	 * @api public
    	 */

    	exports.connect = lookup;

    	/**
    	 * Expose constructors for standalone build.
    	 *
    	 * @api public
    	 */

    	exports.Manager = manager;
    	exports.Socket = socketExports; 
    } (lib$1, lib$1.exports));

    var libExports = lib$1.exports;
    var io = /*@__PURE__*/getDefaultExportFromCjs(libExports);

    function bind(fn, thisArg) {
      return function wrap() {
        return fn.apply(thisArg, arguments);
      };
    }

    // utils is a library of generic helper functions non-specific to axios

    const {toString} = Object.prototype;
    const {getPrototypeOf} = Object;

    const kindOf = (cache => thing => {
        const str = toString.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
    })(Object.create(null));

    const kindOfTest = (type) => {
      type = type.toLowerCase();
      return (thing) => kindOf(thing) === type
    };

    const typeOfTest = type => thing => typeof thing === type;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     *
     * @returns {boolean} True if value is an Array, otherwise false
     */
    const {isArray} = Array;

    /**
     * Determine if a value is undefined
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    const isUndefined = typeOfTest('undefined');

    /**
     * Determine if a value is a Buffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    const isArrayBuffer = kindOfTest('ArrayBuffer');


    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      let result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a String, otherwise false
     */
    const isString = typeOfTest('string');

    /**
     * Determine if a value is a Function
     *
     * @param {*} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    const isFunction = typeOfTest('function');

    /**
     * Determine if a value is a Number
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Number, otherwise false
     */
    const isNumber = typeOfTest('number');

    /**
     * Determine if a value is an Object
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an Object, otherwise false
     */
    const isObject = (thing) => thing !== null && typeof thing === 'object';

    /**
     * Determine if a value is a Boolean
     *
     * @param {*} thing The value to test
     * @returns {boolean} True if value is a Boolean, otherwise false
     */
    const isBoolean = thing => thing === true || thing === false;

    /**
     * Determine if a value is a plain Object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a plain Object, otherwise false
     */
    const isPlainObject = (val) => {
      if (kindOf(val) !== 'object') {
        return false;
      }

      const prototype = getPrototypeOf(val);
      return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
    };

    /**
     * Determine if a value is a Date
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Date, otherwise false
     */
    const isDate = kindOfTest('Date');

    /**
     * Determine if a value is a File
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFile = kindOfTest('File');

    /**
     * Determine if a value is a Blob
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    const isBlob = kindOfTest('Blob');

    /**
     * Determine if a value is a FileList
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFileList = kindOfTest('FileList');

    /**
     * Determine if a value is a Stream
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    const isStream = (val) => isObject(val) && isFunction(val.pipe);

    /**
     * Determine if a value is a FormData
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    const isFormData = (thing) => {
      let kind;
      return thing && (
        (typeof FormData === 'function' && thing instanceof FormData) || (
          isFunction(thing.append) && (
            (kind = kindOf(thing)) === 'formdata' ||
            // detect form-data instance
            (kind === 'object' && isFunction(thing.toString) && thing.toString() === '[object FormData]')
          )
        )
      )
    };

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    const isURLSearchParams = kindOfTest('URLSearchParams');

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     *
     * @returns {String} The String freed of excess whitespace
     */
    const trim = (str) => str.trim ?
      str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     *
     * @param {Boolean} [allOwnKeys = false]
     * @returns {any}
     */
    function forEach(obj, fn, {allOwnKeys = false} = {}) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      let i;
      let l;

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
        const len = keys.length;
        let key;

        for (i = 0; i < len; i++) {
          key = keys[i];
          fn.call(null, obj[key], key, obj);
        }
      }
    }

    function findKey(obj, key) {
      key = key.toLowerCase();
      const keys = Object.keys(obj);
      let i = keys.length;
      let _key;
      while (i-- > 0) {
        _key = keys[i];
        if (key === _key.toLowerCase()) {
          return _key;
        }
      }
      return null;
    }

    const _global = (() => {
      /*eslint no-undef:0*/
      if (typeof globalThis !== "undefined") return globalThis;
      return typeof self !== "undefined" ? self : (typeof window !== 'undefined' ? window : global)
    })();

    const isContextDefined = (context) => !isUndefined(context) && context !== _global;

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     *
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      const {caseless} = isContextDefined(this) && this || {};
      const result = {};
      const assignValue = (val, key) => {
        const targetKey = caseless && findKey(result, key) || key;
        if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
          result[targetKey] = merge(result[targetKey], val);
        } else if (isPlainObject(val)) {
          result[targetKey] = merge({}, val);
        } else if (isArray(val)) {
          result[targetKey] = val.slice();
        } else {
          result[targetKey] = val;
        }
      };

      for (let i = 0, l = arguments.length; i < l; i++) {
        arguments[i] && forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     *
     * @param {Boolean} [allOwnKeys]
     * @returns {Object} The resulting value of object a
     */
    const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
      forEach(b, (val, key) => {
        if (thisArg && isFunction(val)) {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      }, {allOwnKeys});
      return a;
    };

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     *
     * @returns {string} content value without BOM
     */
    const stripBOM = (content) => {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    };

    /**
     * Inherit the prototype methods from one constructor into another
     * @param {function} constructor
     * @param {function} superConstructor
     * @param {object} [props]
     * @param {object} [descriptors]
     *
     * @returns {void}
     */
    const inherits = (constructor, superConstructor, props, descriptors) => {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      Object.defineProperty(constructor, 'super', {
        value: superConstructor.prototype
      });
      props && Object.assign(constructor.prototype, props);
    };

    /**
     * Resolve object with deep prototype chain to a flat object
     * @param {Object} sourceObj source object
     * @param {Object} [destObj]
     * @param {Function|Boolean} [filter]
     * @param {Function} [propFilter]
     *
     * @returns {Object}
     */
    const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
      let props;
      let i;
      let prop;
      const merged = {};

      destObj = destObj || {};
      // eslint-disable-next-line no-eq-null,eqeqeq
      if (sourceObj == null) return destObj;

      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = filter !== false && getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

      return destObj;
    };

    /**
     * Determines whether a string ends with the characters of a specified string
     *
     * @param {String} str
     * @param {String} searchString
     * @param {Number} [position= 0]
     *
     * @returns {boolean}
     */
    const endsWith = (str, searchString, position) => {
      str = String(str);
      if (position === undefined || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      const lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };


    /**
     * Returns new array from array like object or null if failed
     *
     * @param {*} [thing]
     *
     * @returns {?Array}
     */
    const toArray = (thing) => {
      if (!thing) return null;
      if (isArray(thing)) return thing;
      let i = thing.length;
      if (!isNumber(i)) return null;
      const arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    };

    /**
     * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
     * thing passed in is an instance of Uint8Array
     *
     * @param {TypedArray}
     *
     * @returns {Array}
     */
    // eslint-disable-next-line func-names
    const isTypedArray = (TypedArray => {
      // eslint-disable-next-line func-names
      return thing => {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

    /**
     * For each entry in the object, call the function with the key and value.
     *
     * @param {Object<any, any>} obj - The object to iterate over.
     * @param {Function} fn - The function to call for each entry.
     *
     * @returns {void}
     */
    const forEachEntry = (obj, fn) => {
      const generator = obj && obj[Symbol.iterator];

      const iterator = generator.call(obj);

      let result;

      while ((result = iterator.next()) && !result.done) {
        const pair = result.value;
        fn.call(obj, pair[0], pair[1]);
      }
    };

    /**
     * It takes a regular expression and a string, and returns an array of all the matches
     *
     * @param {string} regExp - The regular expression to match against.
     * @param {string} str - The string to search.
     *
     * @returns {Array<boolean>}
     */
    const matchAll = (regExp, str) => {
      let matches;
      const arr = [];

      while ((matches = regExp.exec(str)) !== null) {
        arr.push(matches);
      }

      return arr;
    };

    /* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
    const isHTMLForm = kindOfTest('HTMLFormElement');

    const toCamelCase = str => {
      return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,
        function replacer(m, p1, p2) {
          return p1.toUpperCase() + p2;
        }
      );
    };

    /* Creating a function that will check if an object has a property. */
    const hasOwnProperty = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);

    /**
     * Determine if a value is a RegExp object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a RegExp object, otherwise false
     */
    const isRegExp = kindOfTest('RegExp');

    const reduceDescriptors = (obj, reducer) => {
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      const reducedDescriptors = {};

      forEach(descriptors, (descriptor, name) => {
        if (reducer(descriptor, name, obj) !== false) {
          reducedDescriptors[name] = descriptor;
        }
      });

      Object.defineProperties(obj, reducedDescriptors);
    };

    /**
     * Makes all methods read-only
     * @param {Object} obj
     */

    const freezeMethods = (obj) => {
      reduceDescriptors(obj, (descriptor, name) => {
        // skip restricted props in strict mode
        if (isFunction(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
          return false;
        }

        const value = obj[name];

        if (!isFunction(value)) return;

        descriptor.enumerable = false;

        if ('writable' in descriptor) {
          descriptor.writable = false;
          return;
        }

        if (!descriptor.set) {
          descriptor.set = () => {
            throw Error('Can not rewrite read-only method \'' + name + '\'');
          };
        }
      });
    };

    const toObjectSet = (arrayOrString, delimiter) => {
      const obj = {};

      const define = (arr) => {
        arr.forEach(value => {
          obj[value] = true;
        });
      };

      isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

      return obj;
    };

    const noop = () => {};

    const toFiniteNumber = (value, defaultValue) => {
      value = +value;
      return Number.isFinite(value) ? value : defaultValue;
    };

    const ALPHA = 'abcdefghijklmnopqrstuvwxyz';

    const DIGIT = '0123456789';

    const ALPHABET = {
      DIGIT,
      ALPHA,
      ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
    };

    const generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
      let str = '';
      const {length} = alphabet;
      while (size--) {
        str += alphabet[Math.random() * length|0];
      }

      return str;
    };

    /**
     * If the thing is a FormData object, return true, otherwise return false.
     *
     * @param {unknown} thing - The thing to check.
     *
     * @returns {boolean}
     */
    function isSpecCompliantForm(thing) {
      return !!(thing && isFunction(thing.append) && thing[Symbol.toStringTag] === 'FormData' && thing[Symbol.iterator]);
    }

    const toJSONObject = (obj) => {
      const stack = new Array(10);

      const visit = (source, i) => {

        if (isObject(source)) {
          if (stack.indexOf(source) >= 0) {
            return;
          }

          if(!('toJSON' in source)) {
            stack[i] = source;
            const target = isArray(source) ? [] : {};

            forEach(source, (value, key) => {
              const reducedValue = visit(value, i + 1);
              !isUndefined(reducedValue) && (target[key] = reducedValue);
            });

            stack[i] = undefined;

            return target;
          }
        }

        return source;
      };

      return visit(obj, 0);
    };

    const isAsyncFn = kindOfTest('AsyncFunction');

    const isThenable = (thing) =>
      thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);

    var utils = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString,
      isNumber,
      isBoolean,
      isObject,
      isPlainObject,
      isUndefined,
      isDate,
      isFile,
      isBlob,
      isRegExp,
      isFunction,
      isStream,
      isURLSearchParams,
      isTypedArray,
      isFileList,
      forEach,
      merge,
      extend,
      trim,
      stripBOM,
      inherits,
      toFlatObject,
      kindOf,
      kindOfTest,
      endsWith,
      toArray,
      forEachEntry,
      matchAll,
      isHTMLForm,
      hasOwnProperty,
      hasOwnProp: hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
      reduceDescriptors,
      freezeMethods,
      toObjectSet,
      toCamelCase,
      noop,
      toFiniteNumber,
      findKey,
      global: _global,
      isContextDefined,
      ALPHABET,
      generateString,
      isSpecCompliantForm,
      toJSONObject,
      isAsyncFn,
      isThenable
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [config] The config.
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     *
     * @returns {Error} The created error.
     */
    function AxiosError(message, code, config, request, response) {
      Error.call(this);

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = (new Error()).stack;
      }

      this.message = message;
      this.name = 'AxiosError';
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      response && (this.response = response);
    }

    utils.inherits(AxiosError, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: utils.toJSONObject(this.config),
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      }
    });

    const prototype$1 = AxiosError.prototype;
    const descriptors = {};

    [
      'ERR_BAD_OPTION_VALUE',
      'ERR_BAD_OPTION',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ERR_NETWORK',
      'ERR_FR_TOO_MANY_REDIRECTS',
      'ERR_DEPRECATED',
      'ERR_BAD_RESPONSE',
      'ERR_BAD_REQUEST',
      'ERR_CANCELED',
      'ERR_NOT_SUPPORT',
      'ERR_INVALID_URL'
    // eslint-disable-next-line func-names
    ].forEach(code => {
      descriptors[code] = {value: code};
    });

    Object.defineProperties(AxiosError, descriptors);
    Object.defineProperty(prototype$1, 'isAxiosError', {value: true});

    // eslint-disable-next-line func-names
    AxiosError.from = (error, code, config, request, response, customProps) => {
      const axiosError = Object.create(prototype$1);

      utils.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      }, prop => {
        return prop !== 'isAxiosError';
      });

      AxiosError.call(axiosError, error.message, code, config, request, response);

      axiosError.cause = error;

      axiosError.name = error.name;

      customProps && Object.assign(axiosError, customProps);

      return axiosError;
    };

    // eslint-disable-next-line strict
    var httpAdapter = null;

    /**
     * Determines if the given thing is a array or js object.
     *
     * @param {string} thing - The object or array to be visited.
     *
     * @returns {boolean}
     */
    function isVisitable(thing) {
      return utils.isPlainObject(thing) || utils.isArray(thing);
    }

    /**
     * It removes the brackets from the end of a string
     *
     * @param {string} key - The key of the parameter.
     *
     * @returns {string} the key without the brackets.
     */
    function removeBrackets(key) {
      return utils.endsWith(key, '[]') ? key.slice(0, -2) : key;
    }

    /**
     * It takes a path, a key, and a boolean, and returns a string
     *
     * @param {string} path - The path to the current key.
     * @param {string} key - The key of the current object being iterated over.
     * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
     *
     * @returns {string} The path to the current key.
     */
    function renderKey(path, key, dots) {
      if (!path) return key;
      return path.concat(key).map(function each(token, i) {
        // eslint-disable-next-line no-param-reassign
        token = removeBrackets(token);
        return !dots && i ? '[' + token + ']' : token;
      }).join(dots ? '.' : '');
    }

    /**
     * If the array is an array and none of its elements are visitable, then it's a flat array.
     *
     * @param {Array<any>} arr - The array to check
     *
     * @returns {boolean}
     */
    function isFlatArray(arr) {
      return utils.isArray(arr) && !arr.some(isVisitable);
    }

    const predicates = utils.toFlatObject(utils, {}, null, function filter(prop) {
      return /^is[A-Z]/.test(prop);
    });

    /**
     * Convert a data object to FormData
     *
     * @param {Object} obj
     * @param {?Object} [formData]
     * @param {?Object} [options]
     * @param {Function} [options.visitor]
     * @param {Boolean} [options.metaTokens = true]
     * @param {Boolean} [options.dots = false]
     * @param {?Boolean} [options.indexes = false]
     *
     * @returns {Object}
     **/

    /**
     * It converts an object into a FormData object
     *
     * @param {Object<any, any>} obj - The object to convert to form data.
     * @param {string} formData - The FormData object to append to.
     * @param {Object<string, any>} options
     *
     * @returns
     */
    function toFormData(obj, formData, options) {
      if (!utils.isObject(obj)) {
        throw new TypeError('target must be an object');
      }

      // eslint-disable-next-line no-param-reassign
      formData = formData || new (FormData)();

      // eslint-disable-next-line no-param-reassign
      options = utils.toFlatObject(options, {
        metaTokens: true,
        dots: false,
        indexes: false
      }, false, function defined(option, source) {
        // eslint-disable-next-line no-eq-null,eqeqeq
        return !utils.isUndefined(source[option]);
      });

      const metaTokens = options.metaTokens;
      // eslint-disable-next-line no-use-before-define
      const visitor = options.visitor || defaultVisitor;
      const dots = options.dots;
      const indexes = options.indexes;
      const _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
      const useBlob = _Blob && utils.isSpecCompliantForm(formData);

      if (!utils.isFunction(visitor)) {
        throw new TypeError('visitor must be a function');
      }

      function convertValue(value) {
        if (value === null) return '';

        if (utils.isDate(value)) {
          return value.toISOString();
        }

        if (!useBlob && utils.isBlob(value)) {
          throw new AxiosError('Blob is not supported. Use a Buffer instead.');
        }

        if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
          return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
        }

        return value;
      }

      /**
       * Default visitor.
       *
       * @param {*} value
       * @param {String|Number} key
       * @param {Array<String|Number>} path
       * @this {FormData}
       *
       * @returns {boolean} return true to visit the each prop of the value recursively
       */
      function defaultVisitor(value, key, path) {
        let arr = value;

        if (value && !path && typeof value === 'object') {
          if (utils.endsWith(key, '{}')) {
            // eslint-disable-next-line no-param-reassign
            key = metaTokens ? key : key.slice(0, -2);
            // eslint-disable-next-line no-param-reassign
            value = JSON.stringify(value);
          } else if (
            (utils.isArray(value) && isFlatArray(value)) ||
            ((utils.isFileList(value) || utils.endsWith(key, '[]')) && (arr = utils.toArray(value))
            )) {
            // eslint-disable-next-line no-param-reassign
            key = removeBrackets(key);

            arr.forEach(function each(el, index) {
              !(utils.isUndefined(el) || el === null) && formData.append(
                // eslint-disable-next-line no-nested-ternary
                indexes === true ? renderKey([key], index, dots) : (indexes === null ? key : key + '[]'),
                convertValue(el)
              );
            });
            return false;
          }
        }

        if (isVisitable(value)) {
          return true;
        }

        formData.append(renderKey(path, key, dots), convertValue(value));

        return false;
      }

      const stack = [];

      const exposedHelpers = Object.assign(predicates, {
        defaultVisitor,
        convertValue,
        isVisitable
      });

      function build(value, path) {
        if (utils.isUndefined(value)) return;

        if (stack.indexOf(value) !== -1) {
          throw Error('Circular reference detected in ' + path.join('.'));
        }

        stack.push(value);

        utils.forEach(value, function each(el, key) {
          const result = !(utils.isUndefined(el) || el === null) && visitor.call(
            formData, el, utils.isString(key) ? key.trim() : key, path, exposedHelpers
          );

          if (result === true) {
            build(el, path ? path.concat(key) : [key]);
          }
        });

        stack.pop();
      }

      if (!utils.isObject(obj)) {
        throw new TypeError('data must be an object');
      }

      build(obj);

      return formData;
    }

    /**
     * It encodes a string by replacing all characters that are not in the unreserved set with
     * their percent-encoded equivalents
     *
     * @param {string} str - The string to encode.
     *
     * @returns {string} The encoded string.
     */
    function encode$1(str) {
      const charMap = {
        '!': '%21',
        "'": '%27',
        '(': '%28',
        ')': '%29',
        '~': '%7E',
        '%20': '+',
        '%00': '\x00'
      };
      return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
        return charMap[match];
      });
    }

    /**
     * It takes a params object and converts it to a FormData object
     *
     * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
     * @param {Object<string, any>} options - The options object passed to the Axios constructor.
     *
     * @returns {void}
     */
    function AxiosURLSearchParams(params, options) {
      this._pairs = [];

      params && toFormData(params, this, options);
    }

    const prototype = AxiosURLSearchParams.prototype;

    prototype.append = function append(name, value) {
      this._pairs.push([name, value]);
    };

    prototype.toString = function toString(encoder) {
      const _encode = encoder ? function(value) {
        return encoder.call(this, value, encode$1);
      } : encode$1;

      return this._pairs.map(function each(pair) {
        return _encode(pair[0]) + '=' + _encode(pair[1]);
      }, '').join('&');
    };

    /**
     * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
     * URI encoded counterparts
     *
     * @param {string} val The value to be encoded.
     *
     * @returns {string} The encoded value.
     */
    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @param {?object} options
     *
     * @returns {string} The formatted url
     */
    function buildURL(url, params, options) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }
      
      const _encode = options && options.encode || encode;

      const serializeFn = options && options.serialize;

      let serializedParams;

      if (serializeFn) {
        serializedParams = serializeFn(params, options);
      } else {
        serializedParams = utils.isURLSearchParams(params) ?
          params.toString() :
          new AxiosURLSearchParams(params, options).toString(_encode);
      }

      if (serializedParams) {
        const hashmarkIndex = url.indexOf("#");

        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    }

    class InterceptorManager {
      constructor() {
        this.handlers = [];
      }

      /**
       * Add a new interceptor to the stack
       *
       * @param {Function} fulfilled The function to handle `then` for a `Promise`
       * @param {Function} rejected The function to handle `reject` for a `Promise`
       *
       * @return {Number} An ID used to remove interceptor later
       */
      use(fulfilled, rejected, options) {
        this.handlers.push({
          fulfilled,
          rejected,
          synchronous: options ? options.synchronous : false,
          runWhen: options ? options.runWhen : null
        });
        return this.handlers.length - 1;
      }

      /**
       * Remove an interceptor from the stack
       *
       * @param {Number} id The ID that was returned by `use`
       *
       * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
       */
      eject(id) {
        if (this.handlers[id]) {
          this.handlers[id] = null;
        }
      }

      /**
       * Clear all interceptors from the stack
       *
       * @returns {void}
       */
      clear() {
        if (this.handlers) {
          this.handlers = [];
        }
      }

      /**
       * Iterate over all the registered interceptors
       *
       * This method is particularly useful for skipping over any
       * interceptors that may have become `null` calling `eject`.
       *
       * @param {Function} fn The function to call for each interceptor
       *
       * @returns {void}
       */
      forEach(fn) {
        utils.forEach(this.handlers, function forEachHandler(h) {
          if (h !== null) {
            fn(h);
          }
        });
      }
    }

    var InterceptorManager$1 = InterceptorManager;

    var transitionalDefaults = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

    var URLSearchParams$1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams;

    var FormData$1 = typeof FormData !== 'undefined' ? FormData : null;

    var Blob$1 = typeof Blob !== 'undefined' ? Blob : null;

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     *
     * @returns {boolean}
     */
    const isStandardBrowserEnv = (() => {
      let product;
      if (typeof navigator !== 'undefined' && (
        (product = navigator.product) === 'ReactNative' ||
        product === 'NativeScript' ||
        product === 'NS')
      ) {
        return false;
      }

      return typeof window !== 'undefined' && typeof document !== 'undefined';
    })();

    /**
     * Determine if we're running in a standard browser webWorker environment
     *
     * Although the `isStandardBrowserEnv` method indicates that
     * `allows axios to run in a web worker`, the WebWorker will still be
     * filtered out due to its judgment standard
     * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
     * This leads to a problem when axios post `FormData` in webWorker
     */
     const isStandardBrowserWebWorkerEnv = (() => {
      return (
        typeof WorkerGlobalScope !== 'undefined' &&
        // eslint-disable-next-line no-undef
        self instanceof WorkerGlobalScope &&
        typeof self.importScripts === 'function'
      );
    })();


    var platform = {
      isBrowser: true,
      classes: {
        URLSearchParams: URLSearchParams$1,
        FormData: FormData$1,
        Blob: Blob$1
      },
      isStandardBrowserEnv,
      isStandardBrowserWebWorkerEnv,
      protocols: ['http', 'https', 'file', 'blob', 'url', 'data']
    };

    function toURLEncodedForm(data, options) {
      return toFormData(data, new platform.classes.URLSearchParams(), Object.assign({
        visitor: function(value, key, path, helpers) {
          if (platform.isNode && utils.isBuffer(value)) {
            this.append(key, value.toString('base64'));
            return false;
          }

          return helpers.defaultVisitor.apply(this, arguments);
        }
      }, options));
    }

    /**
     * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
     *
     * @param {string} name - The name of the property to get.
     *
     * @returns An array of strings.
     */
    function parsePropPath(name) {
      // foo[x][y][z]
      // foo.x.y.z
      // foo-x-y-z
      // foo x y z
      return utils.matchAll(/\w+|\[(\w*)]/g, name).map(match => {
        return match[0] === '[]' ? '' : match[1] || match[0];
      });
    }

    /**
     * Convert an array to an object.
     *
     * @param {Array<any>} arr - The array to convert to an object.
     *
     * @returns An object with the same keys and values as the array.
     */
    function arrayToObject(arr) {
      const obj = {};
      const keys = Object.keys(arr);
      let i;
      const len = keys.length;
      let key;
      for (i = 0; i < len; i++) {
        key = keys[i];
        obj[key] = arr[key];
      }
      return obj;
    }

    /**
     * It takes a FormData object and returns a JavaScript object
     *
     * @param {string} formData The FormData object to convert to JSON.
     *
     * @returns {Object<string, any> | null} The converted object.
     */
    function formDataToJSON(formData) {
      function buildPath(path, value, target, index) {
        let name = path[index++];
        const isNumericKey = Number.isFinite(+name);
        const isLast = index >= path.length;
        name = !name && utils.isArray(target) ? target.length : name;

        if (isLast) {
          if (utils.hasOwnProp(target, name)) {
            target[name] = [target[name], value];
          } else {
            target[name] = value;
          }

          return !isNumericKey;
        }

        if (!target[name] || !utils.isObject(target[name])) {
          target[name] = [];
        }

        const result = buildPath(path, value, target[name], index);

        if (result && utils.isArray(target[name])) {
          target[name] = arrayToObject(target[name]);
        }

        return !isNumericKey;
      }

      if (utils.isFormData(formData) && utils.isFunction(formData.entries)) {
        const obj = {};

        utils.forEachEntry(formData, (name, value) => {
          buildPath(parsePropPath(name), value, obj, 0);
        });

        return obj;
      }

      return null;
    }

    const DEFAULT_CONTENT_TYPE = {
      'Content-Type': undefined
    };

    /**
     * It takes a string, tries to parse it, and if it fails, it returns the stringified version
     * of the input
     *
     * @param {any} rawValue - The value to be stringified.
     * @param {Function} parser - A function that parses a string into a JavaScript object.
     * @param {Function} encoder - A function that takes a value and returns a string.
     *
     * @returns {string} A stringified version of the rawValue.
     */
    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    const defaults = {

      transitional: transitionalDefaults,

      adapter: ['xhr', 'http'],

      transformRequest: [function transformRequest(data, headers) {
        const contentType = headers.getContentType() || '';
        const hasJSONContentType = contentType.indexOf('application/json') > -1;
        const isObjectPayload = utils.isObject(data);

        if (isObjectPayload && utils.isHTMLForm(data)) {
          data = new FormData(data);
        }

        const isFormData = utils.isFormData(data);

        if (isFormData) {
          if (!hasJSONContentType) {
            return data;
          }
          return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
        }

        if (utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
          return data.toString();
        }

        let isFileList;

        if (isObjectPayload) {
          if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
            return toURLEncodedForm(data, this.formSerializer).toString();
          }

          if ((isFileList = utils.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
            const _FormData = this.env && this.env.FormData;

            return toFormData(
              isFileList ? {'files[]': data} : data,
              _FormData && new _FormData(),
              this.formSerializer
            );
          }
        }

        if (isObjectPayload || hasJSONContentType ) {
          headers.setContentType('application/json', false);
          return stringifySafely(data);
        }

        return data;
      }],

      transformResponse: [function transformResponse(data) {
        const transitional = this.transitional || defaults.transitional;
        const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        const JSONRequested = this.responseType === 'json';

        if (data && utils.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
          const silentJSONParsing = transitional && transitional.silentJSONParsing;
          const strictJSONParsing = !silentJSONParsing && JSONRequested;

          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      env: {
        FormData: platform.classes.FormData,
        Blob: platform.classes.Blob
      },

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults$1 = defaults;

    // RawAxiosHeaders whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    const ignoreDuplicateOf = utils.toObjectSet([
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ]);

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} rawHeaders Headers needing to be parsed
     *
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = rawHeaders => {
      const parsed = {};
      let key;
      let val;
      let i;

      rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
        i = line.indexOf(':');
        key = line.substring(0, i).trim().toLowerCase();
        val = line.substring(i + 1).trim();

        if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
          return;
        }

        if (key === 'set-cookie') {
          if (parsed[key]) {
            parsed[key].push(val);
          } else {
            parsed[key] = [val];
          }
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      });

      return parsed;
    };

    const $internals = Symbol('internals');

    function normalizeHeader(header) {
      return header && String(header).trim().toLowerCase();
    }

    function normalizeValue(value) {
      if (value === false || value == null) {
        return value;
      }

      return utils.isArray(value) ? value.map(normalizeValue) : String(value);
    }

    function parseTokens(str) {
      const tokens = Object.create(null);
      const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
      let match;

      while ((match = tokensRE.exec(str))) {
        tokens[match[1]] = match[2];
      }

      return tokens;
    }

    const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

    function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
      if (utils.isFunction(filter)) {
        return filter.call(this, value, header);
      }

      if (isHeaderNameFilter) {
        value = header;
      }

      if (!utils.isString(value)) return;

      if (utils.isString(filter)) {
        return value.indexOf(filter) !== -1;
      }

      if (utils.isRegExp(filter)) {
        return filter.test(value);
      }
    }

    function formatHeader(header) {
      return header.trim()
        .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
          return char.toUpperCase() + str;
        });
    }

    function buildAccessors(obj, header) {
      const accessorName = utils.toCamelCase(' ' + header);

      ['get', 'set', 'has'].forEach(methodName => {
        Object.defineProperty(obj, methodName + accessorName, {
          value: function(arg1, arg2, arg3) {
            return this[methodName].call(this, header, arg1, arg2, arg3);
          },
          configurable: true
        });
      });
    }

    class AxiosHeaders {
      constructor(headers) {
        headers && this.set(headers);
      }

      set(header, valueOrRewrite, rewrite) {
        const self = this;

        function setHeader(_value, _header, _rewrite) {
          const lHeader = normalizeHeader(_header);

          if (!lHeader) {
            throw new Error('header name must be a non-empty string');
          }

          const key = utils.findKey(self, lHeader);

          if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
            self[key || _header] = normalizeValue(_value);
          }
        }

        const setHeaders = (headers, _rewrite) =>
          utils.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

        if (utils.isPlainObject(header) || header instanceof this.constructor) {
          setHeaders(header, valueOrRewrite);
        } else if(utils.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
          setHeaders(parseHeaders(header), valueOrRewrite);
        } else {
          header != null && setHeader(valueOrRewrite, header, rewrite);
        }

        return this;
      }

      get(header, parser) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils.findKey(this, header);

          if (key) {
            const value = this[key];

            if (!parser) {
              return value;
            }

            if (parser === true) {
              return parseTokens(value);
            }

            if (utils.isFunction(parser)) {
              return parser.call(this, value, key);
            }

            if (utils.isRegExp(parser)) {
              return parser.exec(value);
            }

            throw new TypeError('parser must be boolean|regexp|function');
          }
        }
      }

      has(header, matcher) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils.findKey(this, header);

          return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
        }

        return false;
      }

      delete(header, matcher) {
        const self = this;
        let deleted = false;

        function deleteHeader(_header) {
          _header = normalizeHeader(_header);

          if (_header) {
            const key = utils.findKey(self, _header);

            if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
              delete self[key];

              deleted = true;
            }
          }
        }

        if (utils.isArray(header)) {
          header.forEach(deleteHeader);
        } else {
          deleteHeader(header);
        }

        return deleted;
      }

      clear(matcher) {
        const keys = Object.keys(this);
        let i = keys.length;
        let deleted = false;

        while (i--) {
          const key = keys[i];
          if(!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
            delete this[key];
            deleted = true;
          }
        }

        return deleted;
      }

      normalize(format) {
        const self = this;
        const headers = {};

        utils.forEach(this, (value, header) => {
          const key = utils.findKey(headers, header);

          if (key) {
            self[key] = normalizeValue(value);
            delete self[header];
            return;
          }

          const normalized = format ? formatHeader(header) : String(header).trim();

          if (normalized !== header) {
            delete self[header];
          }

          self[normalized] = normalizeValue(value);

          headers[normalized] = true;
        });

        return this;
      }

      concat(...targets) {
        return this.constructor.concat(this, ...targets);
      }

      toJSON(asStrings) {
        const obj = Object.create(null);

        utils.forEach(this, (value, header) => {
          value != null && value !== false && (obj[header] = asStrings && utils.isArray(value) ? value.join(', ') : value);
        });

        return obj;
      }

      [Symbol.iterator]() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }

      toString() {
        return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
      }

      get [Symbol.toStringTag]() {
        return 'AxiosHeaders';
      }

      static from(thing) {
        return thing instanceof this ? thing : new this(thing);
      }

      static concat(first, ...targets) {
        const computed = new this(first);

        targets.forEach((target) => computed.set(target));

        return computed;
      }

      static accessor(header) {
        const internals = this[$internals] = (this[$internals] = {
          accessors: {}
        });

        const accessors = internals.accessors;
        const prototype = this.prototype;

        function defineAccessor(_header) {
          const lHeader = normalizeHeader(_header);

          if (!accessors[lHeader]) {
            buildAccessors(prototype, _header);
            accessors[lHeader] = true;
          }
        }

        utils.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

        return this;
      }
    }

    AxiosHeaders.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);

    utils.freezeMethods(AxiosHeaders.prototype);
    utils.freezeMethods(AxiosHeaders);

    var AxiosHeaders$1 = AxiosHeaders;

    /**
     * Transform the data for a request or a response
     *
     * @param {Array|Function} fns A single function or Array of functions
     * @param {?Object} response The response object
     *
     * @returns {*} The resulting transformed data
     */
    function transformData(fns, response) {
      const config = this || defaults$1;
      const context = response || config;
      const headers = AxiosHeaders$1.from(context.headers);
      let data = context.data;

      utils.forEach(fns, function transform(fn) {
        data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
      });

      headers.normalize();

      return data;
    }

    function isCancel(value) {
      return !!(value && value.__CANCEL__);
    }

    /**
     * A `CanceledError` is an object that is thrown when an operation is canceled.
     *
     * @param {string=} message The message.
     * @param {Object=} config The config.
     * @param {Object=} request The request.
     *
     * @returns {CanceledError} The created error.
     */
    function CanceledError(message, config, request) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED, config, request);
      this.name = 'CanceledError';
    }

    utils.inherits(CanceledError, AxiosError, {
      __CANCEL__: true
    });

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     *
     * @returns {object} The response.
     */
    function settle(resolve, reject, response) {
      const validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError(
          'Request failed with status code ' + response.status,
          [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    }

    var cookies = platform.isStandardBrowserEnv ?

    // Standard browser envs support document.cookie
      (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            const cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));

            if (utils.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }

            if (utils.isString(path)) {
              cookie.push('path=' + path);
            }

            if (utils.isString(domain)) {
              cookie.push('domain=' + domain);
            }

            if (secure === true) {
              cookie.push('secure');
            }

            document.cookie = cookie.join('; ');
          },

          read: function read(name) {
            const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
            return (match ? decodeURIComponent(match[3]) : null);
          },

          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      })() :

    // Non standard browser env (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() { return null; },
          remove: function remove() {}
        };
      })();

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     *
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    }

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     *
     * @returns {string} The combined URL
     */
    function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    }

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     *
     * @returns {string} The combined full path
     */
    function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    }

    var isURLSameOrigin = platform.isStandardBrowserEnv ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        const msie = /(msie|trident)/i.test(navigator.userAgent);
        const urlParsingNode = document.createElement('a');
        let originURL;

        /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
        function resolveURL(url) {
          let href = url;

          if (msie) {
            // IE needs attribute set twice to normalize properties
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);

          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
              urlParsingNode.pathname :
              '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);

        /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
        return function isURLSameOrigin(requestURL) {
          const parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
        };
      })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })();

    function parseProtocol(url) {
      const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || '';
    }

    /**
     * Calculate data maxRate
     * @param {Number} [samplesCount= 10]
     * @param {Number} [min= 1000]
     * @returns {Function}
     */
    function speedometer(samplesCount, min) {
      samplesCount = samplesCount || 10;
      const bytes = new Array(samplesCount);
      const timestamps = new Array(samplesCount);
      let head = 0;
      let tail = 0;
      let firstSampleTS;

      min = min !== undefined ? min : 1000;

      return function push(chunkLength) {
        const now = Date.now();

        const startedAt = timestamps[tail];

        if (!firstSampleTS) {
          firstSampleTS = now;
        }

        bytes[head] = chunkLength;
        timestamps[head] = now;

        let i = tail;
        let bytesCount = 0;

        while (i !== head) {
          bytesCount += bytes[i++];
          i = i % samplesCount;
        }

        head = (head + 1) % samplesCount;

        if (head === tail) {
          tail = (tail + 1) % samplesCount;
        }

        if (now - firstSampleTS < min) {
          return;
        }

        const passed = startedAt && now - startedAt;

        return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
      };
    }

    function progressEventReducer(listener, isDownloadStream) {
      let bytesNotified = 0;
      const _speedometer = speedometer(50, 250);

      return e => {
        const loaded = e.loaded;
        const total = e.lengthComputable ? e.total : undefined;
        const progressBytes = loaded - bytesNotified;
        const rate = _speedometer(progressBytes);
        const inRange = loaded <= total;

        bytesNotified = loaded;

        const data = {
          loaded,
          total,
          progress: total ? (loaded / total) : undefined,
          bytes: progressBytes,
          rate: rate ? rate : undefined,
          estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
          event: e
        };

        data[isDownloadStream ? 'download' : 'upload'] = true;

        listener(data);
      };
    }

    const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

    var xhrAdapter = isXHRAdapterSupported && function (config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        let requestData = config.data;
        const requestHeaders = AxiosHeaders$1.from(config.headers).normalize();
        const responseType = config.responseType;
        let onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils.isFormData(requestData)) {
          if (platform.isStandardBrowserEnv || platform.isStandardBrowserWebWorkerEnv) {
            requestHeaders.setContentType(false); // Let the browser set it
          } else {
            requestHeaders.setContentType('multipart/form-data;', false); // mobile/desktop app frameworks
          }
        }

        let request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          const username = config.auth.username || '';
          const password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.set('Authorization', 'Basic ' + btoa(username + ':' + password));
        }

        const fullPath = buildFullPath(config.baseURL, config.url);

        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          const responseHeaders = AxiosHeaders$1.from(
            'getAllResponseHeaders' in request && request.getAllResponseHeaders()
          );
          const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
            request.responseText : request.response;
          const response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          let timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          const transitional = config.transitional || transitionalDefaults;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(new AxiosError(
            timeoutErrorMessage,
            transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
            config,
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (platform.isStandardBrowserEnv) {
          // Add xsrf header
          const xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath))
            && config.xsrfCookieName && cookies.read(config.xsrfCookieName);

          if (xsrfValue) {
            requestHeaders.set(config.xsrfHeaderName, xsrfValue);
          }
        }

        // Remove Content-Type if data is undefined
        requestData === undefined && requestHeaders.setContentType(null);

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
            request.setRequestHeader(key, val);
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', progressEventReducer(config.onDownloadProgress, true));
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', progressEventReducer(config.onUploadProgress));
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = cancel => {
            if (!request) {
              return;
            }
            reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        const protocol = parseProtocol(fullPath);

        if (protocol && platform.protocols.indexOf(protocol) === -1) {
          reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
          return;
        }


        // Send the request
        request.send(requestData || null);
      });
    };

    const knownAdapters = {
      http: httpAdapter,
      xhr: xhrAdapter
    };

    utils.forEach(knownAdapters, (fn, value) => {
      if(fn) {
        try {
          Object.defineProperty(fn, 'name', {value});
        } catch (e) {
          // eslint-disable-next-line no-empty
        }
        Object.defineProperty(fn, 'adapterName', {value});
      }
    });

    var adapters = {
      getAdapter: (adapters) => {
        adapters = utils.isArray(adapters) ? adapters : [adapters];

        const {length} = adapters;
        let nameOrAdapter;
        let adapter;

        for (let i = 0; i < length; i++) {
          nameOrAdapter = adapters[i];
          if((adapter = utils.isString(nameOrAdapter) ? knownAdapters[nameOrAdapter.toLowerCase()] : nameOrAdapter)) {
            break;
          }
        }

        if (!adapter) {
          if (adapter === false) {
            throw new AxiosError(
              `Adapter ${nameOrAdapter} is not supported by the environment`,
              'ERR_NOT_SUPPORT'
            );
          }

          throw new Error(
            utils.hasOwnProp(knownAdapters, nameOrAdapter) ?
              `Adapter '${nameOrAdapter}' is not available in the build` :
              `Unknown adapter '${nameOrAdapter}'`
          );
        }

        if (!utils.isFunction(adapter)) {
          throw new TypeError('adapter is not a function');
        }

        return adapter;
      },
      adapters: knownAdapters
    };

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     *
     * @param {Object} config The config that is to be used for the request
     *
     * @returns {void}
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new CanceledError(null, config);
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      config.headers = AxiosHeaders$1.from(config.headers);

      // Transform request data
      config.data = transformData.call(
        config,
        config.transformRequest
      );

      if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
        config.headers.setContentType('application/x-www-form-urlencoded', false);
      }

      const adapter = adapters.getAdapter(config.adapter || defaults$1.adapter);

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          config.transformResponse,
          response
        );

        response.headers = AxiosHeaders$1.from(response.headers);

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              config.transformResponse,
              reason.response
            );
            reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
          }
        }

        return Promise.reject(reason);
      });
    }

    const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? thing.toJSON() : thing;

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     *
     * @returns {Object} New object resulting from merging config2 to config1
     */
    function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      const config = {};

      function getMergedValue(target, source, caseless) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge.call({caseless}, target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(a, b, caseless) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(a, b, caseless);
        } else if (!utils.isUndefined(a)) {
          return getMergedValue(undefined, a, caseless);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(a, b) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(undefined, b);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(a, b) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(undefined, b);
        } else if (!utils.isUndefined(a)) {
          return getMergedValue(undefined, a);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(a, b, prop) {
        if (prop in config2) {
          return getMergedValue(a, b);
        } else if (prop in config1) {
          return getMergedValue(undefined, a);
        }
      }

      const mergeMap = {
        url: valueFromConfig2,
        method: valueFromConfig2,
        data: valueFromConfig2,
        baseURL: defaultToConfig2,
        transformRequest: defaultToConfig2,
        transformResponse: defaultToConfig2,
        paramsSerializer: defaultToConfig2,
        timeout: defaultToConfig2,
        timeoutMessage: defaultToConfig2,
        withCredentials: defaultToConfig2,
        adapter: defaultToConfig2,
        responseType: defaultToConfig2,
        xsrfCookieName: defaultToConfig2,
        xsrfHeaderName: defaultToConfig2,
        onUploadProgress: defaultToConfig2,
        onDownloadProgress: defaultToConfig2,
        decompress: defaultToConfig2,
        maxContentLength: defaultToConfig2,
        maxBodyLength: defaultToConfig2,
        beforeRedirect: defaultToConfig2,
        transport: defaultToConfig2,
        httpAgent: defaultToConfig2,
        httpsAgent: defaultToConfig2,
        cancelToken: defaultToConfig2,
        socketPath: defaultToConfig2,
        responseEncoding: defaultToConfig2,
        validateStatus: mergeDirectKeys,
        headers: (a, b) => mergeDeepProperties(headersToObject(a), headersToObject(b), true)
      };

      utils.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
        const merge = mergeMap[prop] || mergeDeepProperties;
        const configValue = merge(config1[prop], config2[prop], prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    }

    const VERSION = "1.4.0";

    const validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    const deprecatedWarnings = {};

    /**
     * Transitional option validator
     *
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     *
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return (value, opt, opts) => {
        if (validator === false) {
          throw new AxiosError(
            formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
            AxiosError.ERR_DEPRECATED
          );
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     *
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     *
     * @returns {object}
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
      }
      const keys = Object.keys(options);
      let i = keys.length;
      while (i-- > 0) {
        const opt = keys[i];
        const validator = schema[opt];
        if (validator) {
          const value = options[opt];
          const result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
        }
      }
    }

    var validator = {
      assertOptions,
      validators: validators$1
    };

    const validators = validator.validators;

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     *
     * @return {Axios} A new instance of Axios
     */
    class Axios {
      constructor(instanceConfig) {
        this.defaults = instanceConfig;
        this.interceptors = {
          request: new InterceptorManager$1(),
          response: new InterceptorManager$1()
        };
      }

      /**
       * Dispatch a request
       *
       * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
       * @param {?Object} config
       *
       * @returns {Promise} The Promise to be fulfilled
       */
      request(configOrUrl, config) {
        /*eslint no-param-reassign:0*/
        // Allow for axios('example/url'[, config]) a la fetch API
        if (typeof configOrUrl === 'string') {
          config = config || {};
          config.url = configOrUrl;
        } else {
          config = configOrUrl || {};
        }

        config = mergeConfig(this.defaults, config);

        const {transitional, paramsSerializer, headers} = config;

        if (transitional !== undefined) {
          validator.assertOptions(transitional, {
            silentJSONParsing: validators.transitional(validators.boolean),
            forcedJSONParsing: validators.transitional(validators.boolean),
            clarifyTimeoutError: validators.transitional(validators.boolean)
          }, false);
        }

        if (paramsSerializer != null) {
          if (utils.isFunction(paramsSerializer)) {
            config.paramsSerializer = {
              serialize: paramsSerializer
            };
          } else {
            validator.assertOptions(paramsSerializer, {
              encode: validators.function,
              serialize: validators.function
            }, true);
          }
        }

        // Set config.method
        config.method = (config.method || this.defaults.method || 'get').toLowerCase();

        let contextHeaders;

        // Flatten headers
        contextHeaders = headers && utils.merge(
          headers.common,
          headers[config.method]
        );

        contextHeaders && utils.forEach(
          ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
          (method) => {
            delete headers[method];
          }
        );

        config.headers = AxiosHeaders$1.concat(contextHeaders, headers);

        // filter out skipped interceptors
        const requestInterceptorChain = [];
        let synchronousRequestInterceptors = true;
        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
          if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
            return;
          }

          synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

          requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });

        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
          responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });

        let promise;
        let i = 0;
        let len;

        if (!synchronousRequestInterceptors) {
          const chain = [dispatchRequest.bind(this), undefined];
          chain.unshift.apply(chain, requestInterceptorChain);
          chain.push.apply(chain, responseInterceptorChain);
          len = chain.length;

          promise = Promise.resolve(config);

          while (i < len) {
            promise = promise.then(chain[i++], chain[i++]);
          }

          return promise;
        }

        len = requestInterceptorChain.length;

        let newConfig = config;

        i = 0;

        while (i < len) {
          const onFulfilled = requestInterceptorChain[i++];
          const onRejected = requestInterceptorChain[i++];
          try {
            newConfig = onFulfilled(newConfig);
          } catch (error) {
            onRejected.call(this, error);
            break;
          }
        }

        try {
          promise = dispatchRequest.call(this, newConfig);
        } catch (error) {
          return Promise.reject(error);
        }

        i = 0;
        len = responseInterceptorChain.length;

        while (i < len) {
          promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
        }

        return promise;
      }

      getUri(config) {
        config = mergeConfig(this.defaults, config);
        const fullPath = buildFullPath(config.baseURL, config.url);
        return buildURL(fullPath, config.params, config.paramsSerializer);
      }
    }

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/

      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(mergeConfig(config || {}, {
            method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url,
            data
          }));
        };
      }

      Axios.prototype[method] = generateHTTPMethod();

      Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
    });

    var Axios$1 = Axios;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @param {Function} executor The executor function.
     *
     * @returns {CancelToken}
     */
    class CancelToken {
      constructor(executor) {
        if (typeof executor !== 'function') {
          throw new TypeError('executor must be a function.');
        }

        let resolvePromise;

        this.promise = new Promise(function promiseExecutor(resolve) {
          resolvePromise = resolve;
        });

        const token = this;

        // eslint-disable-next-line func-names
        this.promise.then(cancel => {
          if (!token._listeners) return;

          let i = token._listeners.length;

          while (i-- > 0) {
            token._listeners[i](cancel);
          }
          token._listeners = null;
        });

        // eslint-disable-next-line func-names
        this.promise.then = onfulfilled => {
          let _resolve;
          // eslint-disable-next-line func-names
          const promise = new Promise(resolve => {
            token.subscribe(resolve);
            _resolve = resolve;
          }).then(onfulfilled);

          promise.cancel = function reject() {
            token.unsubscribe(_resolve);
          };

          return promise;
        };

        executor(function cancel(message, config, request) {
          if (token.reason) {
            // Cancellation has already been requested
            return;
          }

          token.reason = new CanceledError(message, config, request);
          resolvePromise(token.reason);
        });
      }

      /**
       * Throws a `CanceledError` if cancellation has been requested.
       */
      throwIfRequested() {
        if (this.reason) {
          throw this.reason;
        }
      }

      /**
       * Subscribe to the cancel signal
       */

      subscribe(listener) {
        if (this.reason) {
          listener(this.reason);
          return;
        }

        if (this._listeners) {
          this._listeners.push(listener);
        } else {
          this._listeners = [listener];
        }
      }

      /**
       * Unsubscribe from the cancel signal
       */

      unsubscribe(listener) {
        if (!this._listeners) {
          return;
        }
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
          this._listeners.splice(index, 1);
        }
      }

      /**
       * Returns an object that contains a new `CancelToken` and a function that, when called,
       * cancels the `CancelToken`.
       */
      static source() {
        let cancel;
        const token = new CancelToken(function executor(c) {
          cancel = c;
        });
        return {
          token,
          cancel
        };
      }
    }

    var CancelToken$1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     *
     * @returns {Function}
     */
    function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    }

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     *
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    function isAxiosError(payload) {
      return utils.isObject(payload) && (payload.isAxiosError === true);
    }

    const HttpStatusCode = {
      Continue: 100,
      SwitchingProtocols: 101,
      Processing: 102,
      EarlyHints: 103,
      Ok: 200,
      Created: 201,
      Accepted: 202,
      NonAuthoritativeInformation: 203,
      NoContent: 204,
      ResetContent: 205,
      PartialContent: 206,
      MultiStatus: 207,
      AlreadyReported: 208,
      ImUsed: 226,
      MultipleChoices: 300,
      MovedPermanently: 301,
      Found: 302,
      SeeOther: 303,
      NotModified: 304,
      UseProxy: 305,
      Unused: 306,
      TemporaryRedirect: 307,
      PermanentRedirect: 308,
      BadRequest: 400,
      Unauthorized: 401,
      PaymentRequired: 402,
      Forbidden: 403,
      NotFound: 404,
      MethodNotAllowed: 405,
      NotAcceptable: 406,
      ProxyAuthenticationRequired: 407,
      RequestTimeout: 408,
      Conflict: 409,
      Gone: 410,
      LengthRequired: 411,
      PreconditionFailed: 412,
      PayloadTooLarge: 413,
      UriTooLong: 414,
      UnsupportedMediaType: 415,
      RangeNotSatisfiable: 416,
      ExpectationFailed: 417,
      ImATeapot: 418,
      MisdirectedRequest: 421,
      UnprocessableEntity: 422,
      Locked: 423,
      FailedDependency: 424,
      TooEarly: 425,
      UpgradeRequired: 426,
      PreconditionRequired: 428,
      TooManyRequests: 429,
      RequestHeaderFieldsTooLarge: 431,
      UnavailableForLegalReasons: 451,
      InternalServerError: 500,
      NotImplemented: 501,
      BadGateway: 502,
      ServiceUnavailable: 503,
      GatewayTimeout: 504,
      HttpVersionNotSupported: 505,
      VariantAlsoNegotiates: 506,
      InsufficientStorage: 507,
      LoopDetected: 508,
      NotExtended: 510,
      NetworkAuthenticationRequired: 511,
    };

    Object.entries(HttpStatusCode).forEach(([key, value]) => {
      HttpStatusCode[value] = key;
    });

    var HttpStatusCode$1 = HttpStatusCode;

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     *
     * @returns {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      const context = new Axios$1(defaultConfig);
      const instance = bind(Axios$1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios$1.prototype, context, {allOwnKeys: true});

      // Copy context to instance
      utils.extend(instance, context, null, {allOwnKeys: true});

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    const axios = createInstance(defaults$1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios$1;

    // Expose Cancel & CancelToken
    axios.CanceledError = CanceledError;
    axios.CancelToken = CancelToken$1;
    axios.isCancel = isCancel;
    axios.VERSION = VERSION;
    axios.toFormData = toFormData;

    // Expose AxiosError class
    axios.AxiosError = AxiosError;

    // alias for CanceledError for backward compatibility
    axios.Cancel = axios.CanceledError;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };

    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    // Expose mergeConfig
    axios.mergeConfig = mergeConfig;

    axios.AxiosHeaders = AxiosHeaders$1;

    axios.formToJSON = thing => formDataToJSON(utils.isHTMLForm(thing) ? new FormData(thing) : thing);

    axios.HttpStatusCode = HttpStatusCode$1;

    axios.default = axios;

    // this module should only have a default export
    var axios$1 = axios;

    /* src/components/ChatHeader.svelte generated by Svelte v3.59.2 */

    const file$b = "src/components/ChatHeader.svelte";

    function create_fragment$e(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "Timbl Broadband";
    			this.c = noop$2;
    			if (!src_url_equal(img.src, img_src_value = "https://test.cleandesk.co.in/media/person/profile/1668509937389/1685011029653_1819.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "avatar");
    			set_style(img, "height", "28px");
    			set_style(img, "border-radius", "50%");
    			set_style(img, "margin-right", "8px");
    			add_location(img, file$b, 5, 6, 306);
    			attr_dev(div0, "class", "chat-header-avatar");
    			set_style(div0, "display", "flex");
    			set_style(div0, "align-items", "center");
    			add_location(div0, file$b, 4, 4, 223);
    			attr_dev(div1, "class", "smith-header-profile-name");
    			set_style(div1, "color", "white");
    			add_location(div1, file$b, 7, 4, 494);
    			attr_dev(div2, "class", "chat-header");
    			set_style(div2, "padding", "12px");
    			set_style(div2, "display", "flex");
    			set_style(div2, "align-items", "center");
    			set_style(div2, "font-family", "sans-serif");
    			add_location(div2, file$b, 3, 2, 110);
    			attr_dev(div3, "class", "chat-header-container");
    			set_style(div3, "background-color", "#0000ff");
    			add_location(div3, file$b, 2, 0, 37);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    		},
    		p: noop$2,
    		i: noop$2,
    		o: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('chat-header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<chat-header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ChatHeader extends SvelteElement {
    	constructor(options) {
    		super();

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$e,
    			create_fragment$e,
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

    customElements.define("chat-header", ChatHeader);

    /* src/components/MessageBox.svelte generated by Svelte v3.59.2 */

    const file$a = "src/components/MessageBox.svelte";

    function create_fragment$d(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let button;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "submit";
    			this.c = noop$2;
    			attr_dev(div0, "class", "message-input");
    			set_style(div0, "height", "38px");
    			set_style(div0, "box-shadow", "rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px");
    			set_style(div0, "border-radius", "20px");
    			set_style(div0, "width", "230px ");
    			add_location(div0, file$a, 8, 4, 295);
    			attr_dev(button, "type", "submit");
    			set_style(button, "background", "transparent");
    			set_style(button, "box-shadow", "none");
    			set_style(button, "border", "none");
    			set_style(button, "border-radius", "50%");
    			set_style(button, "width", "35px");
    			set_style(button, "height", "35px");
    			add_location(button, file$a, 15, 6, 636);
    			add_location(div1, file$a, 14, 4, 624);
    			attr_dev(div2, "class", "message-input-wrapper");
    			set_style(div2, "display", "flex");
    			set_style(div2, "align-items", "center");
    			set_style(div2, "padding", "6px 12px");
    			add_location(div2, file$a, 7, 2, 191);
    			attr_dev(div3, "class", "message-box-container");
    			set_style(div3, "height", "50px");
    			set_style(div3, "bottom", "20px");
    			set_style(div3, "width", "100%");
    			set_style(div3, "background-color", "#f3f2f2");
    			set_style(div3, "position", "absolute");
    			add_location(div3, file$a, 6, 0, 58);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    		},
    		p: noop$2,
    		i: noop$2,
    		o: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('message-box', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<message-box> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class MessageBox extends SvelteElement {
    	constructor(options) {
    		super();

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$d,
    			create_fragment$d,
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

    customElements.define("message-box", MessageBox);

    /* src/components/MessageItem.svelte generated by Svelte v3.59.2 */

    const { console: console_1$8 } = globals;
    const file$9 = "src/components/MessageItem.svelte";

    function create_fragment$c(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let t2;
    	let p0;
    	let t4;
    	let div3;
    	let p1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "Havinesh saran";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "time ago";
    			t4 = space();
    			div3 = element("div");
    			p1 = element("p");
    			p1.textContent = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets";
    			this.c = noop$2;
    			if (!src_url_equal(img.src, img_src_value = "https://test.cleandesk.co.in/media/person/profile/1668509937389/1685011029653_1819.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "avatar");
    			set_style(img, "height", "28px");
    			set_style(img, "border-radius", "50%");
    			set_style(img, "margin-right", "8px");
    			add_location(img, file$9, 22, 6, 814);
    			attr_dev(div0, "class", "chat-header-avatar");
    			set_style(div0, "display", "flex");
    			set_style(div0, "align-items", "center");
    			add_location(div0, file$9, 21, 4, 731);
    			attr_dev(div1, "class", "smith-header-profile-name");
    			attr_dev(div1, "style", "");
    			add_location(div1, file$9, 24, 4, 1002);
    			set_style(p0, "font-size", "8px");
    			set_style(p0, "margin-left", "8px");
    			add_location(p0, file$9, 25, 4, 1075);
    			attr_dev(div2, "class", "chat-header");
    			set_style(div2, "display", "flex");
    			set_style(div2, "align-items", "center");
    			add_location(div2, file$9, 20, 2, 657);
    			set_style(p1, "margin", "0");
    			set_style(p1, "font-size", "12px");
    			add_location(p1, file$9, 28, 4, 1202);
    			attr_dev(div3, "class", "message-item-body");
    			set_style(div3, "padding", "8px");
    			add_location(div3, file$9, 27, 2, 1144);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div2, t2);
    			append_dev(div2, p0);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, p1);
    		},
    		p: noop$2,
    		i: noop$2,
    		o: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('message-item', slots, []);
    	let { isMine = false } = $$props;
    	let { propValue } = $$props;
    	console.log(propValue);

    	function getInlineStyles() {
    		if (isMine === true) {
    			return "background-color: #f3f2f2; padding: 12px; margin: 10px; width: 280px; border-radius: 14px";
    		} else {
    			return "background-color: #e2e7fb; padding: 12px; margin: 10px 10px 10px auto; width: 280px; border-radius: 14px";
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (propValue === undefined && !('propValue' in $$props || $$self.$$.bound[$$self.$$.props['propValue']])) {
    			console_1$8.warn("<message-item> was created without expected prop 'propValue'");
    		}
    	});

    	const writable_props = ['isMine', 'propValue'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$8.warn(`<message-item> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('isMine' in $$props) $$invalidate(0, isMine = $$props.isMine);
    		if ('propValue' in $$props) $$invalidate(1, propValue = $$props.propValue);
    	};

    	$$self.$capture_state = () => ({ isMine, propValue, getInlineStyles });

    	$$self.$inject_state = $$props => {
    		if ('isMine' in $$props) $$invalidate(0, isMine = $$props.isMine);
    		if ('propValue' in $$props) $$invalidate(1, propValue = $$props.propValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isMine, propValue];
    }

    class MessageItem extends SvelteElement {
    	constructor(options) {
    		super();

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$c,
    			create_fragment$c,
    			safe_not_equal,
    			{ isMine: 0, propValue: 1 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["isMine", "propValue"];
    	}

    	get isMine() {
    		return this.$$.ctx[0];
    	}

    	set isMine(isMine) {
    		this.$$set({ isMine });
    		flush();
    	}

    	get propValue() {
    		return this.$$.ctx[1];
    	}

    	set propValue(propValue) {
    		this.$$set({ propValue });
    		flush();
    	}
    }

    customElements.define("message-item", MessageItem);

    /*! js-cookie v3.0.5 | MIT */
    /* eslint-disable no-var */
    function assign (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          target[key] = source[key];
        }
      }
      return target
    }
    /* eslint-enable no-var */

    /* eslint-disable no-var */
    var defaultConverter = {
      read: function (value) {
        if (value[0] === '"') {
          value = value.slice(1, -1);
        }
        return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
      },
      write: function (value) {
        return encodeURIComponent(value).replace(
          /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
          decodeURIComponent
        )
      }
    };
    /* eslint-enable no-var */

    /* eslint-disable no-var */

    function init (converter, defaultAttributes) {
      function set (name, value, attributes) {
        if (typeof document === 'undefined') {
          return
        }

        attributes = assign({}, defaultAttributes, attributes);

        if (typeof attributes.expires === 'number') {
          attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
        }
        if (attributes.expires) {
          attributes.expires = attributes.expires.toUTCString();
        }

        name = encodeURIComponent(name)
          .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
          .replace(/[()]/g, escape);

        var stringifiedAttributes = '';
        for (var attributeName in attributes) {
          if (!attributes[attributeName]) {
            continue
          }

          stringifiedAttributes += '; ' + attributeName;

          if (attributes[attributeName] === true) {
            continue
          }

          // Considers RFC 6265 section 5.2:
          // ...
          // 3.  If the remaining unparsed-attributes contains a %x3B (";")
          //     character:
          // Consume the characters of the unparsed-attributes up to,
          // not including, the first %x3B (";") character.
          // ...
          stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
        }

        return (document.cookie =
          name + '=' + converter.write(value, name) + stringifiedAttributes)
      }

      function get (name) {
        if (typeof document === 'undefined' || (arguments.length && !name)) {
          return
        }

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all.
        var cookies = document.cookie ? document.cookie.split('; ') : [];
        var jar = {};
        for (var i = 0; i < cookies.length; i++) {
          var parts = cookies[i].split('=');
          var value = parts.slice(1).join('=');

          try {
            var found = decodeURIComponent(parts[0]);
            jar[found] = converter.read(value, found);

            if (name === found) {
              break
            }
          } catch (e) {}
        }

        return name ? jar[name] : jar
      }

      return Object.create(
        {
          set,
          get,
          remove: function (name, attributes) {
            set(
              name,
              '',
              assign({}, attributes, {
                expires: -1
              })
            );
          },
          withAttributes: function (attributes) {
            return init(this.converter, assign({}, this.attributes, attributes))
          },
          withConverter: function (converter) {
            return init(assign({}, this.converter, converter), this.attributes)
          }
        },
        {
          attributes: { value: Object.freeze(defaultAttributes) },
          converter: { value: Object.freeze(converter) }
        }
      )
    }

    var api$1 = init(defaultConverter, { path: '/' });

    const TOKEN_KEY = "cleandesk-userToken";
    const PERSON_ID = "cleandesk-personId";
    const PERSON_ORG_OFFICE_ID = "cleandesk-personOrgOfficeId";

    // export function getCookie(name) {
    //   if (navigator.cookieEnabled) {
    //     let matches = document.cookie.match(
    //       new RegExp(
    //         "(?:^|; )" +
    //           // cookieNameGenerator(name).replace(
    //           name.replace(
    //             // eslint-disable-next-line no-useless-escape
    //             /([\.$?*|{}\(\)\[\]\\\/\+^])/g,
    //             "\\$1"
    //           ) +
    //           "=([^;]*)"
    //       )
    //     );
    //     console.log(matches);
    //     // return matches ? decodeURIComponent(matches[1]) : getLocalStorage(name);
    //   }
    //   // return getLocalStorage(name);
    // }

    const setAuthKey = (token) => setCookie(TOKEN_KEY, token);
    const getAuthKey = () => getCookie(TOKEN_KEY);

    const setPersonId = (personId) => setCookie(PERSON_ID, personId);
    const getPersonId = () => getCookie(PERSON_ID);

    const getPersonOrgOfficeId = () => getCookie(PERSON_ORG_OFFICE_ID);
    const setPersonOrgOfficeId = (personOrgOfficeId) =>
      setCookie(PERSON_ORG_OFFICE_ID, personOrgOfficeId);

    const getCookie = (name) => {
      return api$1.get(name);
    };

    const setCookie = (name, value) => {
      api$1.set(name, value);
    };
    // export default function getAuthKey(name) {
    //   // getCookie("beta_userToken");
    //   const gettest = Cookies.get(name);
    //   console.log(gettest);
    //   return gettest;
    //   // let cookieValue = "";
    //   // const cookies = document.cookie.split(";");
    //   // for (let i = 0; i < cookies.length; i++) {
    //   //   const cookie = cookies[i].trim();
    //   //   console.log(cookie, "cookie");
    //   //   if (cookie.startsWith("beta_userToken=")) {
    //   //     cookieValue = cookie.substring("beta_userToken=".length, cookie.length);
    //   //     console.log(cookieValue, " cookieValue");
    //   //     break;
    //   //   }
    //   // }
    // }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop$2) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop$2) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop$2;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const isAuthenticated = writable(false);

    const userDetails = writable(null);

    /* src/components/AuthMain.svelte generated by Svelte v3.59.2 */

    const { console: console_1$7 } = globals;

    function create_fragment$b(ctx) {
    	const block = {
    		c: function create() {
    			this.c = noop$2;
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop$2,
    		p: noop$2,
    		i: noop$2,
    		o: noop$2,
    		d: noop$2
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $isAuthenticated;
    	validate_store(isAuthenticated, 'isAuthenticated');
    	component_subscribe($$self, isAuthenticated, $$value => $$invalidate(3, $isAuthenticated = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('auth-main', slots, []);
    	let { app_id } = $$props;
    	let { app_secret } = $$props;
    	let { customer_id } = $$props;

    	// import { chatSocket } from "../utils/socket/socketConfig.js";
    	const authHeaderConfig = {
    		headers: {
    			'x-client-id': app_id,
    			'x-client-secret': app_secret
    		}
    	};

    	console.log(getAuthKey(), 'getAuthKey()');

    	// onMount(() => {
    	//   if(!!getAuthKey() === false) {
    	//     // TODO uncomment this
    	//     console.log(app_id, app_secret, customer_id, 'authmain')
    	//     axios.post('https://test.cleandesk.co.in/api/v1/rl/generate/gateway/auth/token',{ customer_id: customer_id }, authHeaderConfig)
    	//     .then(response => {
    	//       console.log('this is working from authMain')
    	//       setAuthKey(response.data.rows.token)
    	//       setPersonId(response.data.rows.person_id)
    	//       setPersonOrgOfficeId(response.data.rows.organisation_office_id)
    	//       if (response.data.statusCode === 'S10001') isAuthenticated.set(true);
    	//       console.log(response.data);
    	//     })
    	//     .catch(error => {
    	//       console.error(error);
    	//     });
    	//   }
    	// })
    	const chatSocket = io("https://support.foop.com", { query: { token: getAuthKey() } });

    	$$self.$$.on_mount.push(function () {
    		if (app_id === undefined && !('app_id' in $$props || $$self.$$.bound[$$self.$$.props['app_id']])) {
    			console_1$7.warn("<auth-main> was created without expected prop 'app_id'");
    		}

    		if (app_secret === undefined && !('app_secret' in $$props || $$self.$$.bound[$$self.$$.props['app_secret']])) {
    			console_1$7.warn("<auth-main> was created without expected prop 'app_secret'");
    		}

    		if (customer_id === undefined && !('customer_id' in $$props || $$self.$$.bound[$$self.$$.props['customer_id']])) {
    			console_1$7.warn("<auth-main> was created without expected prop 'customer_id'");
    		}
    	});

    	const writable_props = ['app_id', 'app_secret', 'customer_id'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$7.warn(`<auth-main> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('app_id' in $$props) $$invalidate(0, app_id = $$props.app_id);
    		if ('app_secret' in $$props) $$invalidate(1, app_secret = $$props.app_secret);
    		if ('customer_id' in $$props) $$invalidate(2, customer_id = $$props.customer_id);
    	};

    	$$self.$capture_state = () => ({
    		app_id,
    		app_secret,
    		customer_id,
    		axios: axios$1,
    		io,
    		onMount,
    		getAuthKey,
    		getPersonId,
    		getPersonOrgOfficeId,
    		setAuthKey,
    		setPersonId,
    		setPersonOrgOfficeId,
    		isAuthenticated,
    		userDetails,
    		authHeaderConfig,
    		chatSocket,
    		$isAuthenticated
    	});

    	$$self.$inject_state = $$props => {
    		if ('app_id' in $$props) $$invalidate(0, app_id = $$props.app_id);
    		if ('app_secret' in $$props) $$invalidate(1, app_secret = $$props.app_secret);
    		if ('customer_id' in $$props) $$invalidate(2, customer_id = $$props.customer_id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$isAuthenticated*/ 8) {
    			{
    				if ($isAuthenticated) {
    					const headers = { 'Authorization': 'Token ' + getAuthKey() };

    					axios$1.post('https://test.cleandesk.co.in/api/v1/user/profile/', { person_id: null }, { headers }).then(response => {
    						// Handle the response data
    						if (response.data.statusCode === 'S10001') {
    							userDetails.set(response?.data?.rows);

    							chatSocket.on("connect", () => {
    								
    							}); // console.log(chatSocket.connected);

    							chatSocket.emit("chat_ai_ticket_message_v2", {
    								app_type: "CITIZEN",
    								organisation_office_id: getPersonOrgOfficeId(),
    								constituency_id: 1,
    								ticket_main_id: null,
    								person_id: getPersonId(),
    								content: null,
    								is_media_available: null,
    								is_location_available: null,
    								latitude: null,
    								longitude: null,
    								locality: null,
    								address: null,
    								category_id: null,
    								required_inputs: null,
    								ticket_id: null
    							});
    						}
    					}).catch(error => {
    						// Handle the error
    						console.error(error);
    					});
    				}
    			}
    		}
    	};

    	return [app_id, app_secret, customer_id, $isAuthenticated];
    }

    class AuthMain extends SvelteElement {
    	constructor(options) {
    		super();

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$b,
    			create_fragment$b,
    			safe_not_equal,
    			{ app_id: 0, app_secret: 1, customer_id: 2 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["app_id", "app_secret", "customer_id"];
    	}

    	get app_id() {
    		return this.$$.ctx[0];
    	}

    	set app_id(app_id) {
    		this.$$set({ app_id });
    		flush();
    	}

    	get app_secret() {
    		return this.$$.ctx[1];
    	}

    	set app_secret(app_secret) {
    		this.$$set({ app_secret });
    		flush();
    	}

    	get customer_id() {
    		return this.$$.ctx[2];
    	}

    	set customer_id(customer_id) {
    		this.$$set({ customer_id });
    		flush();
    	}
    }

    customElements.define("auth-main", AuthMain);

    // APIs
    // export const DOMAIN = process.env.REACT_APP_API_DOMAIN;
    const DOMAIN = "https://test.cleandesk.co.in";
    const BASIC_URL_V2 = `${DOMAIN}/api/v2`;
    const HELPDESK_MODULE_V2 = `${BASIC_URL_V2}/hd`;

    /* src/NewApp.svelte generated by Svelte v3.59.2 */

    const { console: console_1$6 } = globals;
    const file$8 = "src/NewApp.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (580:0) {#if isVisible}
    function create_if_block_1$3(ctx) {
    	let div6;
    	let chatheader;
    	let t0;
    	let div1;
    	let div0;
    	let t1;
    	let scrollToBottom_action;
    	let t2;
    	let div5;
    	let div3;
    	let form;
    	let div2;
    	let button0;
    	let t4;
    	let input;
    	let t5;
    	let button1;
    	let t7;
    	let button2;
    	let t9;
    	let div4;
    	let a;
    	let p;
    	let t11;
    	let img;
    	let img_src_value;
    	let current;
    	let mounted;
    	let dispose;
    	chatheader = new ChatHeader({ $$inline: true });
    	let each_value = /*messages*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	let if_block = /*messageLoading*/ ctx[7] === true && create_if_block_2$3(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			create_component(chatheader.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div5 = element("div");
    			div3 = element("div");
    			form = element("form");
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "😊";
    			t4 = space();
    			input = element("input");
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "+";
    			t7 = space();
    			button2 = element("button");
    			button2.textContent = "➤";
    			t9 = space();
    			div4 = element("div");
    			a = element("a");
    			p = element("p");
    			p.textContent = "Powered by CleanDesk Ai";
    			t11 = space();
    			img = element("img");
    			attr_dev(div0, "class", "smith-conversation-container");
    			add_location(div0, file$8, 584, 6, 15070);
    			attr_dev(div1, "class", "smith-chat-body");
    			set_style(div1, "height", "424px");
    			set_style(div1, "padding-bottom", "-25px");
    			add_location(div1, file$8, 583, 4, 14958);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn send-btn");
    			set_style(button0, "border-radius", "50%");
    			add_location(button0, file$8, 657, 10, 18790);
    			attr_dev(input, "placeholder", "Type your message");
    			attr_dev(input, "rows", "1");
    			attr_dev(input, "name", "message-to-send");
    			attr_dev(input, "id", "message-to-send");
    			add_location(input, file$8, 658, 10, 18885);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn send-btn");
    			set_style(button1, "border-radius", "50%");
    			add_location(button1, file$8, 660, 12, 19161);
    			set_style(div2, "margin-right", "20px");
    			set_style(div2, "border-radius", "20px");
    			set_style(div2, "height", "35px");
    			set_style(div2, "display", "flex");
    			set_style(div2, "background-color", "#fff");
    			set_style(div2, "align-items", "center");
    			set_style(div2, "width", "100%");
    			add_location(div2, file$8, 655, 8, 18630);
    			attr_dev(button2, "type", "sumbit");
    			attr_dev(button2, "class", "btn send-btn");
    			set_style(button2, "height", "35px");
    			set_style(button2, "border-radius", "50%");
    			add_location(button2, file$8, 663, 12, 19304);
    			set_style(form, "display", "flex");
    			set_style(form, "width", "100%");
    			add_location(form, file$8, 654, 8, 18541);
    			attr_dev(div3, "class", "smith-chat-bar-message");
    			add_location(div3, file$8, 648, 6, 18261);
    			set_style(p, "padding", "6px");
    			set_style(p, "margin", "0px");
    			set_style(p, "font-size", "12px");
    			add_location(p, file$8, 668, 10, 19719);
    			if (!src_url_equal(img.src, img_src_value = "https://hsbd.test.cleandesk.co.in/logo96tranparent.png?x=10000000")) attr_dev(img, "src", img_src_value);
    			set_style(img, "height", "24px");
    			set_style(img, "margin-right", "8px");
    			attr_dev(img, "alt", "");
    			add_location(img, file$8, 669, 10, 19811);
    			attr_dev(a, "href", "https://cleandesk.co.in");
    			set_style(a, "text-decoration", "none");
    			set_style(a, "color", "#000");
    			set_style(a, "display", "flex");
    			set_style(a, "align-items", "center");
    			add_location(a, file$8, 667, 8, 19595);
    			attr_dev(div4, "class", "widget-footer");
    			set_style(div4, "background-color", "#E0DEDE");
    			set_style(div4, "height", "20px padding: 10px");
    			set_style(div4, "display", "flex");
    			set_style(div4, "align-items", "center");
    			set_style(div4, "justify-content", "end");
    			add_location(div4, file$8, 666, 6, 19438);
    			attr_dev(div5, "class", "smith-chat-bar");
    			add_location(div5, file$8, 647, 4, 18226);
    			attr_dev(div6, "class", "chat-widget-container");
    			add_location(div6, file$8, 580, 2, 14898);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			mount_component(chatheader, div6, null);
    			append_dev(div6, t0);
    			append_dev(div6, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append_dev(div0, t1);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, form);
    			append_dev(form, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t4);
    			append_dev(div2, input);
    			set_input_value(input, /*textareaValue*/ ctx[6]);
    			append_dev(div2, t5);
    			append_dev(div2, button1);
    			append_dev(form, t7);
    			append_dev(form, button2);
    			append_dev(div5, t9);
    			append_dev(div5, div4);
    			append_dev(div4, a);
    			append_dev(a, p);
    			append_dev(a, t11);
    			append_dev(a, img);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(scrollToBottom_action = /*scrollToBottom*/ ctx[13].call(null, div1, /*messages*/ ctx[5])),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[14]),
    					listen_dev(button1, "click", /*fetchTicketList*/ ctx[11], false, false, false, false),
    					listen_dev(form, "submit", prevent_default(/*sendMessage*/ ctx[12]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*DOMAIN, messages, $userDetails*/ 288) {
    				each_value = /*messages*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, t1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*messageLoading*/ ctx[7] === true) {
    				if (if_block) ; else {
    					if_block = create_if_block_2$3(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (scrollToBottom_action && is_function(scrollToBottom_action.update) && dirty & /*messages*/ 32) scrollToBottom_action.update.call(null, /*messages*/ ctx[5]);

    			if (dirty & /*textareaValue*/ 64 && input.value !== /*textareaValue*/ ctx[6]) {
    				set_input_value(input, /*textareaValue*/ ctx[6]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chatheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chatheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(chatheader);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(580:0) {#if isVisible}",
    		ctx
    	});

    	return block;
    }

    // (605:12) {:else}
    function create_else_block$2(ctx) {
    	let div4;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let t1_value = /*message*/ ctx[17]?.title + "";
    	let t1;
    	let t2;
    	let div3;
    	let p;
    	let t3_value = /*message*/ ctx[17]?.content + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div3 = element("div");
    			p = element("p");
    			t3 = text(t3_value);
    			if (!src_url_equal(img.src, img_src_value = DOMAIN + /*message*/ ctx[17]?.person_avatar)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "a");
    			set_style(img, "height", "24px");
    			set_style(img, "border-radius", "50%");
    			set_style(img, "margin-right", "8px");
    			add_location(img, file$8, 610, 18, 16652);
    			attr_dev(div0, "class", "chat-header-avatar");
    			set_style(div0, "display", "flex");
    			set_style(div0, "align-items", "center");
    			add_location(div0, file$8, 609, 16, 16557);
    			attr_dev(div1, "class", "header-profile-name");
    			attr_dev(div1, "style", "");
    			add_location(div1, file$8, 612, 16, 16804);
    			attr_dev(div2, "class", "chat-header");
    			set_style(div2, "display", "flex");
    			set_style(div2, "align-items", "center");
    			add_location(div2, file$8, 608, 14, 16471);
    			set_style(p, "margin", "0");
    			set_style(p, "font-size", "12px");
    			add_location(p, file$8, 616, 16, 17057);
    			attr_dev(div3, "class", "message-item-body");
    			set_style(div3, "padding", "8px");
    			add_location(div3, file$8, 615, 14, 16987);
    			set_style(div4, "background-color", "#e2e7fb");
    			set_style(div4, "padding", "12px");
    			set_style(div4, "margin", "10px 10px 10px auto");
    			set_style(div4, "width", "280px");
    			set_style(div4, "border-radius", "8px");
    			add_location(div4, file$8, 607, 12, 16339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 32 && !src_url_equal(img.src, img_src_value = DOMAIN + /*message*/ ctx[17]?.person_avatar)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*messages*/ 32 && t1_value !== (t1_value = /*message*/ ctx[17]?.title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*messages*/ 32 && t3_value !== (t3_value = /*message*/ ctx[17]?.content + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(605:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (588:10) {#if message.person_id !== $userDetails?.id}
    function create_if_block_4$2(ctx) {
    	let div4;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let t1_value = /*message*/ ctx[17]?.title + "";
    	let t1;
    	let t2;
    	let div3;
    	let p;
    	let t3_value = /*message*/ ctx[17]?.content + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div3 = element("div");
    			p = element("p");
    			t3 = text(t3_value);
    			if (!src_url_equal(img.src, img_src_value = DOMAIN + /*message*/ ctx[17]?.person_avatar)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "a");
    			set_style(img, "height", "24px");
    			set_style(img, "border-radius", "50%");
    			set_style(img, "margin-right", "8px");
    			add_location(img, file$8, 593, 18, 15683);
    			attr_dev(div0, "class", "chat-header-avatar");
    			set_style(div0, "display", "flex");
    			set_style(div0, "align-items", "center");
    			add_location(div0, file$8, 592, 16, 15588);
    			attr_dev(div1, "class", "header-profile-name");
    			attr_dev(div1, "style", "");
    			add_location(div1, file$8, 595, 16, 15835);
    			attr_dev(div2, "class", "chat-header");
    			set_style(div2, "display", "flex");
    			set_style(div2, "align-items", "center");
    			add_location(div2, file$8, 591, 14, 15502);
    			set_style(p, "margin", "0");
    			set_style(p, "font-size", "12px");
    			add_location(p, file$8, 599, 16, 16088);
    			attr_dev(div3, "class", "message-item-body");
    			set_style(div3, "padding", "8px");
    			add_location(div3, file$8, 598, 14, 16018);
    			set_style(div4, "background-color", "#f3f2f2");
    			set_style(div4, "padding", "12px");
    			set_style(div4, "margin", "10px");
    			set_style(div4, "width", "280px");
    			set_style(div4, "border-radius", "8px");
    			add_location(div4, file$8, 589, 12, 15346);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 32 && !src_url_equal(img.src, img_src_value = DOMAIN + /*message*/ ctx[17]?.person_avatar)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*messages*/ 32 && t1_value !== (t1_value = /*message*/ ctx[17]?.title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*messages*/ 32 && t3_value !== (t3_value = /*message*/ ctx[17]?.content + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(588:10) {#if message.person_id !== $userDetails?.id}",
    		ctx
    	});

    	return block;
    }

    // (621:10) {#if message.media_type === 'application/pdf'}
    function create_if_block_3$2(ctx) {
    	let div;
    	let a;
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t = text("Click here to open pdf");
    			attr_dev(a, "href", a_href_value = DOMAIN + /*message*/ ctx[17].media_url);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener noreferrer");
    			add_location(a, file$8, 622, 14, 17345);
    			set_style(div, "cursor", "pointer");
    			set_style(div, "font-size", "12px");
    			set_style(div, "justify-content", "center");
    			set_style(div, "display", "flex");
    			add_location(div, file$8, 621, 12, 17243);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 32 && a_href_value !== (a_href_value = DOMAIN + /*message*/ ctx[17].media_url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(621:10) {#if message.media_type === 'application/pdf'}",
    		ctx
    	});

    	return block;
    }

    // (586:8) {#each messages as message}
    function create_each_block$4(ctx) {
    	let t;
    	let if_block1_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*message*/ ctx[17].person_id !== /*$userDetails*/ ctx[8]?.id) return create_if_block_4$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*message*/ ctx[17].media_type === 'application/pdf' && create_if_block_3$2(ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty$2();
    		},
    		m: function mount(target, anchor) {
    			if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			}

    			if (/*message*/ ctx[17].media_type === 'application/pdf') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$2(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(586:8) {#each messages as message}",
    		ctx
    	});

    	return block;
    }

    // (628:10) {#if messageLoading === true}
    function create_if_block_2$3(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "bounce1");
    			add_location(div0, file$8, 630, 16, 17709);
    			attr_dev(div1, "class", "bounce2");
    			add_location(div1, file$8, 631, 16, 17753);
    			attr_dev(div2, "class", "bounce3");
    			add_location(div2, file$8, 632, 16, 17797);
    			attr_dev(div3, "class", "spinner");
    			add_location(div3, file$8, 629, 14, 17671);
    			set_style(div4, "background-color", "#f3f2f2");
    			set_style(div4, "padding", "12px");
    			set_style(div4, "margin", "10px");
    			set_style(div4, "width", "50px");
    			set_style(div4, "border-radius", "8px");
    			add_location(div4, file$8, 628, 12, 17555);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(628:10) {#if messageLoading === true}",
    		ctx
    	});

    	return block;
    }

    // (679:0) {#if $isAuthenticated && firstOpen === true}
    function create_if_block$4(ctx) {
    	let authmain;
    	let current;

    	authmain = new AuthMain({
    			props: {
    				app_id: /*app_id*/ ctx[0],
    				app_secret: /*app_secret*/ ctx[1],
    				customer_id: /*customer_id*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(authmain.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(authmain, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const authmain_changes = {};
    			if (dirty & /*app_id*/ 1) authmain_changes.app_id = /*app_id*/ ctx[0];
    			if (dirty & /*app_secret*/ 2) authmain_changes.app_secret = /*app_secret*/ ctx[1];
    			if (dirty & /*customer_id*/ 4) authmain_changes.customer_id = /*customer_id*/ ctx[2];
    			authmain.$set(authmain_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(authmain.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(authmain.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(authmain, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(679:0) {#if $isAuthenticated && firstOpen === true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let t0;
    	let t1;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*isVisible*/ ctx[4] && create_if_block_1$3(ctx);
    	let if_block1 = /*$isAuthenticated*/ ctx[9] && /*firstOpen*/ ctx[3] === true && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			button = element("button");
    			button.textContent = "Chat";
    			this.c = noop$2;
    			attr_dev(button, "class", "smith-launcher-frame");
    			add_location(button, file$8, 683, 0, 20125);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*showChatWidget*/ ctx[10], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isVisible*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*isVisible*/ 16) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$isAuthenticated*/ ctx[9] && /*firstOpen*/ ctx[3] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$isAuthenticated, firstOpen*/ 520) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $userDetails;
    	let $isAuthenticated;
    	validate_store(userDetails, 'userDetails');
    	component_subscribe($$self, userDetails, $$value => $$invalidate(8, $userDetails = $$value));
    	validate_store(isAuthenticated, 'isAuthenticated');
    	component_subscribe($$self, isAuthenticated, $$value => $$invalidate(9, $isAuthenticated = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('new-chat-widget', slots, []);
    	let { app_id } = $$props;
    	let { app_secret } = $$props;
    	let { customer_id } = $$props;

    	// TODO set to false
    	let isVisible = false;

    	let firstOpen = false;
    	let messages = [];
    	let ticketMainId = null;
    	let textareaValue = '';
    	let messageLoading = true;

    	function showChatWidget() {
    		$$invalidate(4, isVisible = !isVisible);
    		$$invalidate(3, firstOpen = true);
    	}

    	onMount(() => {
    		if (!!getAuthKey() && getPersonId() && getPersonOrgOfficeId() !== false) isAuthenticated.set(true);
    	});

    	// const socketFunction = () => {
    	const chatSocket = io("https://support.foop.com", { query: { token: getAuthKey() } });

    	// chatSocket.emit("chat_ai_ticket_message_v2", {
    	//   app_type: "CITIZEN",
    	//   organisation_office_id: getPersonOrgOfficeId(),
    	//   constituency_id: 1,
    	//   ticket_main_id: null,
    	//   person_id: getPersonId(),
    	//   content: null,
    	//   is_media_available: null,
    	//   is_location_available: null,
    	//   latitude: null,
    	//   longitude: null,
    	//   locality: null,
    	//   address: null,
    	//   category_id: null,
    	//   required_inputs: null,
    	//   ticket_id: null,
    	// });
    	// chatSocket.on('chat_ai_ticket_message_v2', data => {
    	//   if (data.person_id !== parseInt(getPersonId())) {
    	//     console.log('different id')
    	//     messages = [...messages, data]
    	//   } else console.log('same id')
    	//   if (messages.length === 1) {
    	//     ticketMainId = data.ticket_main_id;
    	//   }
    	//   console.log(messages)
    	// });
    	// };
    	if ($isAuthenticated && firstOpen === true) {
    		socketFunction();
    	}

    	// $: {
    	//   if(!!$userDetails === true) {
    	//     setTimeout(() => {
    	//       console.log('userDetails', $userDetails)
    	//       chatSocket.emit("chat_ai_ticket_message_v2", {
    	//         app_type: "CITIZEN",
    	//         organisation_office_id: getPersonOrgOfficeId(),
    	//         constituency_id: 1,
    	//         ticket_main_id: null,
    	//         person_id: getPersonId(),
    	//         content: null,
    	//         is_media_available: null,
    	//         is_location_available: null,
    	//         latitude: null,
    	//         longitude: null,
    	//         locality: null,
    	//         address: null,
    	//         category_id: null,
    	//         required_inputs: null,
    	//         ticket_id: null,
    	//       });
    	//     }, 2000);
    	//   }
    	// }
    	// $: {
    	//   if ($isAuthenticated) {
    	//     const headers = { 'Authorization': 'Token ' + getAuthKey() };
    	//     axios.post('https://test.cleandesk.co.in/api/v1/user/profile/',{ person_id: null }, { headers })
    	//     .then(response => {
    	//       // Handle the response data
    	//       if (response.data.statusCode === 'S10001') {
    	//         chatSocket.on("connect", () => {
    	//           console.log(chatSocket.connected);
    	//         });
    	//         userDetails.set(response?.data?.rows);
    	//         chatSocket.emit("chat_ai_ticket_message_v2", {
    	//           app_type: "CITIZEN",
    	//           organisation_office_id: getPersonOrgOfficeId(),
    	//           constituency_id: 1,
    	//           ticket_main_id: null,
    	//           person_id: getPersonId(),
    	//           content: null,
    	//           is_media_available: null,
    	//           is_location_available: null,
    	//           latitude: null,
    	//           longitude: null,
    	//           locality: null,
    	//           address: null,
    	//           category_id: null,
    	//           required_inputs: null,
    	//           ticket_id: null,
    	//         });
    	//       }
    	//     })
    	//     .catch(error => {
    	//       // Handle the error
    	//       console.error(error);
    	//     });
    	//   }
    	// }
    	const fetchTicketList = () => {
    		const headers = {
    			'Authorization': 'Token 190ed4a86868b2ae1b72da19d479149615be2dbfff7be0e7fc311f4acb50c5c1'
    		};

    		const payload = {
    			organisation_office_id: 1668510062923,
    			// organisation_office_id: parseInt(getPersonOrgOfficeId()),
    			app_type: "CITIZEN",
    			is_partner: false,
    			list_type: "all",
    			page_number: 1,
    			page_size: 20,
    			is_partner: false,
    			status: null
    		};

    		// axios.post( HELPDESK_MODULE_V2 + '/ticket/list',{ ...payload }, headers)
    		//   .then(response => {
    		//     console.log(response.data);
    		//   })
    		//   .catch(error => {
    		//     console.error(error);
    		//   });
    		axios$1.post(HELPDESK_MODULE_V2 + '/ticket/list', { ...payload }, { headers });
    	};

    	const sendMessage = () => {
    		console.log(textareaValue);

    		chatSocket.emit("chat_ai_ticket_message_v2", {
    			app_type: "CITIZEN",
    			organisation_office_id: getPersonOrgOfficeId(),
    			constituency_id: 1,
    			ticket_main_id: ticketMainId,
    			person_id: getPersonId(),
    			content: textareaValue,
    			is_media_available: null,
    			is_location_available: null,
    			latitude: null,
    			longitude: null,
    			locality: null,
    			address: null,
    			category_id: null,
    			required_inputs: null,
    			ticket_id: null
    		});

    		$$invalidate(5, messages = [
    			...messages,
    			{
    				content: textareaValue,
    				person_id: parseInt(getPersonId()),
    				title: $userDetails?.first_name + ' ' + $userDetails?.last_name,
    				person_avatar: $userDetails?.profile_image,
    				id: new Date().getTime(),
    				created_at: new Date().getTime()
    			}
    		]);

    		$$invalidate(6, textareaValue = '');
    		$$invalidate(7, messageLoading = true);
    		console.log(messages);
    	};

    	chatSocket.on('chat_ai_ticket_message_v2', data => {
    		if (data.person_id !== parseInt(getPersonId())) {
    			console.log('different id');
    			$$invalidate(7, messageLoading = false);
    			$$invalidate(5, messages = [...messages, data]);
    		} else console.log('same id');

    		if (messages.length === 1) {
    			ticketMainId = data.ticket_main_id;
    		}

    		console.log(messages);
    	});

    	const scrollToBottom = node => {
    		const scroll = () => node.scroll({
    			top: node.scrollHeight,
    			behavior: 'smooth'
    		});

    		scroll();
    		return { update: scroll };
    	};

    	$$self.$$.on_mount.push(function () {
    		if (app_id === undefined && !('app_id' in $$props || $$self.$$.bound[$$self.$$.props['app_id']])) {
    			console_1$6.warn("<new-chat-widget> was created without expected prop 'app_id'");
    		}

    		if (app_secret === undefined && !('app_secret' in $$props || $$self.$$.bound[$$self.$$.props['app_secret']])) {
    			console_1$6.warn("<new-chat-widget> was created without expected prop 'app_secret'");
    		}

    		if (customer_id === undefined && !('customer_id' in $$props || $$self.$$.bound[$$self.$$.props['customer_id']])) {
    			console_1$6.warn("<new-chat-widget> was created without expected prop 'customer_id'");
    		}
    	});

    	const writable_props = ['app_id', 'app_secret', 'customer_id'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$6.warn(`<new-chat-widget> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		textareaValue = this.value;
    		$$invalidate(6, textareaValue);
    	}

    	$$self.$$set = $$props => {
    		if ('app_id' in $$props) $$invalidate(0, app_id = $$props.app_id);
    		if ('app_secret' in $$props) $$invalidate(1, app_secret = $$props.app_secret);
    		if ('customer_id' in $$props) $$invalidate(2, customer_id = $$props.customer_id);
    	};

    	$$self.$capture_state = () => ({
    		app_id,
    		app_secret,
    		customer_id,
    		io,
    		axios: axios$1,
    		ChatHeader,
    		MessageBox,
    		MessageItem,
    		AuthMain,
    		getAuthKey,
    		getPersonId,
    		getPersonOrgOfficeId,
    		setAuthKey,
    		setPersonId,
    		setPersonOrgOfficeId,
    		onMount,
    		DOMAIN,
    		userDetails,
    		isAuthenticated,
    		HELPDESK_MODULE_V2,
    		isVisible,
    		firstOpen,
    		messages,
    		ticketMainId,
    		textareaValue,
    		messageLoading,
    		showChatWidget,
    		chatSocket,
    		fetchTicketList,
    		sendMessage,
    		scrollToBottom,
    		$userDetails,
    		$isAuthenticated
    	});

    	$$self.$inject_state = $$props => {
    		if ('app_id' in $$props) $$invalidate(0, app_id = $$props.app_id);
    		if ('app_secret' in $$props) $$invalidate(1, app_secret = $$props.app_secret);
    		if ('customer_id' in $$props) $$invalidate(2, customer_id = $$props.customer_id);
    		if ('isVisible' in $$props) $$invalidate(4, isVisible = $$props.isVisible);
    		if ('firstOpen' in $$props) $$invalidate(3, firstOpen = $$props.firstOpen);
    		if ('messages' in $$props) $$invalidate(5, messages = $$props.messages);
    		if ('ticketMainId' in $$props) ticketMainId = $$props.ticketMainId;
    		if ('textareaValue' in $$props) $$invalidate(6, textareaValue = $$props.textareaValue);
    		if ('messageLoading' in $$props) $$invalidate(7, messageLoading = $$props.messageLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*firstOpen, app_id, app_secret, customer_id*/ 15) {
    			{
    				if (firstOpen === true) {
    					if (!!getAuthKey() === false) {
    						const authHeaderConfig = {
    							headers: {
    								'x-client-id': app_id,
    								'x-client-secret': app_secret
    							}
    						};

    						axios$1.post('https://test.cleandesk.co.in/api/v1/rl/generate/gateway/auth/token', { customer_id }, authHeaderConfig).then(response => {
    							setAuthKey(response.data.rows.token);
    							setPersonId(response.data.rows.person_id);
    							setPersonOrgOfficeId(response.data.rows.organisation_office_id);
    							if (response.data.statusCode === 'S10001') isAuthenticated.set(true);
    							console.log(response.data);
    						}).catch(error => {
    							console.error(error);
    						});
    					}
    				}
    			}
    		}
    	};

    	return [
    		app_id,
    		app_secret,
    		customer_id,
    		firstOpen,
    		isVisible,
    		messages,
    		textareaValue,
    		messageLoading,
    		$userDetails,
    		$isAuthenticated,
    		showChatWidget,
    		fetchTicketList,
    		sendMessage,
    		scrollToBottom,
    		input_input_handler
    	];
    }

    class NewApp extends SvelteElement {
    	constructor(options) {
    		super();
    		const style = document.createElement('style');

    		style.textContent = `p{font-weight:400;font-family:sans-serif}.chat-widget-container{position:fixed !important;bottom:calc(100px);z-index:999999 !important;right:20px;width:400px !important;height:560px !important;border-radius:8px !important;box-shadow:0px 1px 4px rgba(13, 22, 26, 0.08),
      0px 4px 16px rgba(13, 22, 26, 0.12), 0px 2px 12px rgba(13, 22, 26, 0.08);overflow:hidden;opacity:1 !important}.smith-chat-bar{position:absolute;bottom:0;width:100%;background-color:#f3f2f2}.smith-chat-bar-message{padding:12px;display:flex;align-items:center}.smith-chat-bar-message input{background-color:transparent;border-radius:0;border:none;font-size:14px;flex:2;line-height:1.25rem;max-height:100px;outline:none;overflow-x:hidden;resize:none;padding:0;margin:0px 8px}.btn{font-weight:400;text-align:center;white-space:nowrap;vertical-align:middle;user-select:none;border:1px solid transparent;padding:0.375rem 0.75rem;font-size:14px;line-height:1.5;border-radius:2px;transition:color 0.15s ease-in-out, background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out}.send-btn{color:rgba(0, 18, 26, 0.59);background-color:#fff;border-color:#fff}.send-btn:hover{cursor:pointer;color:rgba(0, 18, 26, 0.93);background-color:#fff;border-color:#fff}.smith-chat-body{position:relative;flex:1;background-color:#fff;overflow:hidden auto}.smith-conversation-container{position:absolute;top:0;left:0;right:0;bottom:0}.smith-launcher-frame{box-shadow:0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 2px 16px rgba(0, 18, 26, 0.16);z-index:2147482999 !important;position:fixed !important;bottom:20px;right:20px;height:56px !important;width:56px !important;border-radius:100px !important;overflow:hidden !important;background:#0000ff !important;color:#fff !important;opacity:0.9;transition:box-shadow 0.26s cubic-bezier(0.38, 0, 0.22, 1),
      opacity 0.26s ease-in-out}.smith-launcher-frame:hover{cursor:pointer;box-shadow:0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 3px 12px rgba(0, 18, 26, 0.16), 0 2px 14px 0 rgba(0, 18, 26, 0.2);opacity:1}.header-profile-name{font-size:14px;font-weight:200;font-family:sans-serif}@keyframes bouncedelay{0%,80%,100%{transform:scale(0);-webkit-transform:scale(0)}40%{transform:scale(1);-webkit-transform:scale(1)}}@keyframes message-bounce{0%{transform:scale(0.9);-webkit-transform:scale(0.9)}50%{transform:scale(1.1);-webkit-transform:scale(1.1)}100%{transform:scale(0.9);-webkit-transform:scale(0.9)}}.spinner{position:absolute;top:50%;left:50%;width:45px;height:9px;margin-left:-22px;margin-top:-13px;text-align:center}.spinner>div{width:9px;height:9px;background-color:red;border-radius:100%;display:inline-block;animation:bouncedelay 1400ms ease-in-out infinite;animation-fill-mode:both}.spinner .bounce1{animation-delay:-0.32s}.spinner .bounce2{animation-delay:-0.16s}.spinner{position:static !important;margin-top:-11px;margin-left:0px}.spinner div{background-color:#E0DEDE}@-webkit-keyframes message-bounce{0%{transform:scale(0.9);-webkit-transform:scale(0.9)}50%{transform:scale(1.1);-webkit-transform:scale(1.1)}100%{transform:scale(0.9);-webkit-transform:scale(0.9)}}@keyframes message-bounce{0%{transform:scale(0.9);-webkit-transform:scale(0.9)}50%{transform:scale(1.1);-webkit-transform:scale(1.1)}100%{transform:scale(0.9);-webkit-transform:scale(0.9)}}`;

    		this.shadowRoot.appendChild(style);

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$a,
    			create_fragment$a,
    			safe_not_equal,
    			{ app_id: 0, app_secret: 1, customer_id: 2 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["app_id", "app_secret", "customer_id"];
    	}

    	get app_id() {
    		return this.$$.ctx[0];
    	}

    	set app_id(app_id) {
    		this.$$set({ app_id });
    		flush();
    	}

    	get app_secret() {
    		return this.$$.ctx[1];
    	}

    	set app_secret(app_secret) {
    		this.$$set({ app_secret });
    		flush();
    	}

    	get customer_id() {
    		return this.$$.ctx[2];
    	}

    	set customer_id(customer_id) {
    		this.$$set({ customer_id });
    		flush();
    	}
    }

    customElements.define("new-chat-widget", NewApp);

    /* src/App.svelte generated by Svelte v3.59.2 */

    const { console: console_1$5 } = globals;
    const file$7 = "src/App.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (233:0) {#if isVisible}
    function create_if_block_3$1(ctx) {
    	let div16;
    	let div13;
    	let div12;
    	let div11;
    	let div6;
    	let div5;
    	let div1;
    	let div0;
    	let t0;
    	let div2;
    	let t2;
    	let div3;
    	let span;
    	let t3;
    	let t4;
    	let t5;
    	let div4;
    	let t6;
    	let div10;
    	let div9;
    	let div8;
    	let div7;
    	let t7;
    	let div15;
    	let div14;
    	let textarea;
    	let t8;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*messages*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div16 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div2.textContent = "Timbl Broadband";
    			t2 = space();
    			div3 = element("div");
    			span = element("span");
    			t3 = text("Conversational AI provides community service. APP ID ");
    			t4 = text(/*app_id*/ ctx[0]);
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			div15 = element("div");
    			div14 = element("div");
    			textarea = element("textarea");
    			t8 = space();
    			button = element("button");
    			button.textContent = "Send";
    			attr_dev(div0, "class", "smith-avatar");
    			add_location(div0, file$7, 240, 16, 6934);
    			attr_dev(div1, "class", "smith-avatar");
    			add_location(div1, file$7, 239, 14, 6891);
    			attr_dev(div2, "class", "smith-header-profile-name");
    			add_location(div2, file$7, 244, 14, 7158);
    			add_location(span, file$7, 246, 16, 7290);
    			attr_dev(div3, "class", "smith-header-profile-intro");
    			add_location(div3, file$7, 245, 14, 7233);
    			attr_dev(div4, "class", "smith-header-profile-cta");
    			add_location(div4, file$7, 248, 14, 7400);
    			attr_dev(div5, "class", "smith-header-profile");
    			add_location(div5, file$7, 238, 12, 6842);
    			attr_dev(div6, "class", "smith-chat-header");
    			add_location(div6, file$7, 237, 10, 6798);
    			attr_dev(div7, "class", "smith-conversation-parts-wrapper");
    			add_location(div7, file$7, 266, 16, 8253);
    			attr_dev(div8, "class", "smith-conversation-body-parts");
    			add_location(div8, file$7, 265, 14, 8193);
    			attr_dev(div9, "class", "smith-conversation-container");
    			add_location(div9, file$7, 264, 12, 8136);
    			attr_dev(div10, "class", "smith-chat-body");
    			add_location(div10, file$7, 263, 10, 8094);
    			attr_dev(div11, "class", "smith-chat");
    			add_location(div11, file$7, 236, 8, 6763);
    			attr_dev(div12, "id", "smith-chat-container");
    			add_location(div12, file$7, 235, 6, 6723);
    			attr_dev(div13, "class", "smith-chat-frame");
    			add_location(div13, file$7, 234, 4, 6686);
    			attr_dev(textarea, "placeholder", "Type your message");
    			attr_dev(textarea, "rows", "1");
    			attr_dev(textarea, "name", "message-to-send");
    			attr_dev(textarea, "id", "message-to-send");
    			add_location(textarea, file$7, 318, 8, 10646);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn send-btn");
    			add_location(button, file$7, 319, 8, 10779);
    			attr_dev(div14, "class", "smith-chat-bar-message");
    			add_location(div14, file$7, 317, 6, 10601);
    			attr_dev(div15, "class", "smith-chat-bar");
    			add_location(div15, file$7, 316, 4, 10566);
    			attr_dev(div16, "id", "smith-container");
    			add_location(div16, file$7, 233, 2, 6655);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div16, anchor);
    			append_dev(div16, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div5, t0);
    			append_dev(div5, div2);
    			append_dev(div5, t2);
    			append_dev(div5, div3);
    			append_dev(div3, span);
    			append_dev(span, t3);
    			append_dev(span, t4);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div11, t6);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div7, null);
    				}
    			}

    			append_dev(div16, t7);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div14, textarea);
    			set_input_value(textarea, /*textareaValue*/ ctx[4]);
    			append_dev(div14, t8);
    			append_dev(div14, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[12]),
    					listen_dev(button, "click", /*sendMessage*/ ctx[7], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*app_id*/ 1) set_data_dev(t4, /*app_id*/ ctx[0]);

    			if (dirty & /*window, messages*/ 8) {
    				each_value = /*messages*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div7, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*textareaValue*/ 16) {
    				set_input_value(textarea, /*textareaValue*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div16);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(233:0) {#if isVisible}",
    		ctx
    	});

    	return block;
    }

    // (287:28) {:else}
    function create_else_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "https://test.cleandesk.co.in/media/person/profile/1668511823013/1685110291504_7316.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$7, 287, 28, 9334);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(287:28) {:else}",
    		ctx
    	});

    	return block;
    }

    // (279:28) {#if message.person_id !== '1668509937389'}
    function create_if_block_5(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = 'https://test.cleandesk.co.in' + /*message*/ ctx[21].person_avatar)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "avatar");
    			add_location(img, file$7, 279, 28, 8900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 8 && !src_url_equal(img.src, img_src_value = 'https://test.cleandesk.co.in' + /*message*/ ctx[21].person_avatar)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(279:28) {#if message.person_id !== '1668509937389'}",
    		ctx
    	});

    	return block;
    }

    // (301:26) {#if message.media_type === 'application/pdf'}
    function create_if_block_4$1(ctx) {
    	let div;
    	let a;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[11](/*message*/ ctx[21]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			a.textContent = "Click here to open pdf";
    			attr_dev(a, "class", "smith-block smith-block-paragraph");
    			add_location(a, file$7, 302, 28, 10108);
    			set_style(div, "cursor", "pointer");
    			set_style(div, "font-size", "12px");
    			add_location(div, file$7, 301, 26, 10032);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(301:26) {#if message.media_type === 'application/pdf'}",
    		ctx
    	});

    	return block;
    }

    // (268:18) {#each messages as message}
    function create_each_block$3(ctx) {
    	let div7;
    	let div6;
    	let div5;
    	let div1;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div2;
    	let t1_value = /*message*/ ctx[21].content + "";
    	let t1;
    	let t2;
    	let t3;

    	function select_block_type(ctx, dirty) {
    		if (/*message*/ ctx[21].person_id !== '1668509937389') return create_if_block_5;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*message*/ ctx[21].media_type === 'application/pdf' && create_if_block_4$1(ctx);

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			attr_dev(div0, "class", "smith-avatar");
    			add_location(div0, file$7, 277, 26, 8773);
    			attr_dev(div1, "class", "smith-comment-container-admin-avatar");
    			add_location(div1, file$7, 276, 24, 8696);
    			attr_dev(div2, "class", "smith-block smith-block-paragraph");
    			add_location(div2, file$7, 295, 30, 9730);
    			attr_dev(div3, "class", "smith-blocks");
    			add_location(div3, file$7, 294, 28, 9673);
    			attr_dev(div4, "class", "smith-comment");
    			add_location(div4, file$7, 293, 26, 9617);
    			attr_dev(div5, "class", "smith-comment-container smith-comment-container-admin");
    			add_location(div5, file$7, 273, 22, 8557);
    			attr_dev(div6, "class", "smith-conversation-part smith-conversation-part-admin");
    			add_location(div6, file$7, 270, 20, 8424);
    			attr_dev(div7, "class", "smith-conversation-parts");
    			add_location(div7, file$7, 269, 18, 8365);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			if_block0.m(div0, null);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, t1);
    			append_dev(div5, t2);
    			if (if_block1) if_block1.m(div5, null);
    			append_dev(div7, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (dirty & /*messages*/ 8 && t1_value !== (t1_value = /*message*/ ctx[21].content + "")) set_data_dev(t1, t1_value);

    			if (/*message*/ ctx[21].media_type === 'application/pdf') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4$1(ctx);
    					if_block1.c();
    					if_block1.m(div5, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(268:18) {#each messages as message}",
    		ctx
    	});

    	return block;
    }

    // (333:0) {#if firstOpen === true}
    function create_if_block_2$2(ctx) {
    	let authmain;
    	let current;
    	authmain = new AuthMain({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(authmain.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(authmain, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(authmain.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(authmain.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(authmain, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(333:0) {#if firstOpen === true}",
    		ctx
    	});

    	return block;
    }

    // (337:0) {#if getAuthKey() && getPersonId() && getPersonOrgOfficeId() !== null}
    function create_if_block_1$2(ctx) {
    	let div0;
    	let t2;
    	let div1;
    	let t5;
    	let div2;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = `authKey = ${getAuthKey()}`;
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = `personId = ${getPersonId()}`;
    			t5 = space();
    			div2 = element("div");
    			div2.textContent = `personOrgOfficeId = ${getPersonOrgOfficeId()}`;
    			add_location(div0, file$7, 337, 2, 11280);
    			add_location(div1, file$7, 338, 2, 11318);
    			add_location(div2, file$7, 339, 2, 11358);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    		},
    		p: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(337:0) {#if getAuthKey() && getPersonId() && getPersonOrgOfficeId() !== null}",
    		ctx
    	});

    	return block;
    }

    // (345:0) {:else}
    function create_else_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "User is not authenticated.";
    			add_location(p, file$7, 345, 2, 11486);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(345:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (343:0) {#if $isAuthenticated}
    function create_if_block$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "User is authenticated.";
    			add_location(p, file$7, 343, 2, 11446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(343:0) {#if $isAuthenticated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let t0;
    	let div0;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let t6;
    	let show_if = getAuthKey() && getPersonId() && getPersonOrgOfficeId() !== null;
    	let t7;
    	let t8;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*isVisible*/ ctx[1] && create_if_block_3$1(ctx);
    	let if_block1 = /*firstOpen*/ ctx[2] === true && create_if_block_2$2(ctx);
    	let if_block2 = show_if && create_if_block_1$2(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*$isAuthenticated*/ ctx[5]) return create_if_block$3;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block3 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "click";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "set isauth false";
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			if_block3.c();
    			t8 = space();
    			div1 = element("div");
    			div1.textContent = "hi";
    			this.c = noop$2;
    			attr_dev(div0, "class", "smith-launcher");
    			add_location(div0, file$7, 326, 0, 10957);
    			attr_dev(button0, "class", "smith-launcher-frame");
    			add_location(button0, file$7, 327, 0, 10988);
    			add_location(button1, file$7, 329, 0, 11067);
    			attr_dev(div1, "class", "havinesh");
    			add_location(div1, file$7, 349, 2, 11530);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if_block3.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div1, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*showChatWidget*/ ctx[6], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[13], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isVisible*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*firstOpen*/ ctx[2] === true) {
    				if (if_block1) {
    					if (dirty & /*firstOpen*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t6.parentNode, t6);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (show_if) if_block2.p(ctx, dirty);

    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block3.d(1);
    				if_block3 = current_block_type(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(t8.parentNode, t8);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t5);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t7);
    			if_block3.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $userDetails;
    	let $isAuthenticated;
    	validate_store(userDetails, 'userDetails');
    	component_subscribe($$self, userDetails, $$value => $$invalidate(10, $userDetails = $$value));
    	validate_store(isAuthenticated, 'isAuthenticated');
    	component_subscribe($$self, isAuthenticated, $$value => $$invalidate(5, $isAuthenticated = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('chat-widget', slots, []);
    	let { app_id } = $$props;
    	let { app_secret } = $$props;
    	let { customer_id } = $$props;

    	const headers = {
    		'Authorization': 'Token 828a55aed395aeb1b9092d0a82f7aea31b3241ee713587f22648d025559e7fc3'
    	};

    	const CustomAuthHeader = { 'CLIENT_ID': '1', 'CLIENT_SECRET': '1' };

    	const config = {
    		headers: {
    			'x-client-id': app_id,
    			'x-client-secret': app_secret
    		}
    	};

    	// axios.post('https://test.cleandesk.co.in/api/v1/rl/send-otp/',{ app_type: 'CITIZEN', otp_reason: 'LOGIN', mobile: '7555629124', mobile_country_code: '91' })
    	// .then(response => {
    	//   // Handle the response data
    	//   console.log(response.data);
    	// })
    	// .catch(error => {
    	//   // Handle the error
    	//   console.error(error);
    	// });
    	//   const loginCred = () => {
    	//     axios.post('https://test.cleandesk.co.in/api/v1/rl/login/',{
    	//     mobile: "7555629124",
    	//     mobile_country_code: "91",
    	//     app_type: "CITIZEN",
    	//     mobile_otp: "755562"
    	// })
    	//   .then(response => {
    	//     // Handle the response data
    	//     console.log(response.data);
    	//   })
    	//   .catch(error => {
    	//     // Handle the error
    	//     console.error(error);
    	//   });
    	//   }
    	// axios.post('https://test.cleandesk.co.in/api/v1/user/profile/',{ person_id: null }, { headers })
    	// .then(response => {
    	//   // Handle the response data
    	//   console.log(response.data);
    	// })
    	// .catch(error => {
    	//   // Handle the error
    	//   console.error(error);
    	// });
    	// axios.post('https://test.cleandesk.co.in/api/v1/rl/generate/gateway/auth/token',{ customer_id: customer_id }, config)
    	// .then(response => {
    	//   // Handle the response data
    	//   console.log(response.data);
    	// })
    	// .catch(error => {
    	//   // Handle the error
    	//   console.error(error);
    	// });
    	let isVisible = false;

    	let authFormVisible = false;
    	let firstOpen = false;

    	// const message = writable();
    	let messages = [];

    	let ticketMainId = null;
    	let textareaValue = '';

    	function signInForm() {
    		authFormVisible = true;
    		console.log('signInForm');
    	}

    	function showChatWidget() {
    		$$invalidate(1, isVisible = !isVisible);
    		$$invalidate(2, firstOpen = true);
    	}

    	if (!!getAuthKey() === false) console.log('null');
    	console.log(getPersonId(), 'personId');
    	let havinesh;

    	// $: {
    	//   console.log($isAuthenticated, 'isAuthenticated')
    	//   if ($isAuthenticated && firstOpen) {
    	//     chatSocket.emit("chat_ai_ticket_message_v2", {
    	//     app_type: "CITIZEN",
    	//     organisation_office_id: "1673436078069",
    	//     constituency_id: 1,
    	//     ticket_main_id: null,
    	//     person_id: getPersonId(),
    	//     content: null,
    	//     is_media_available: null,
    	//     is_location_available: null,
    	//     latitude: null,
    	//     longitude: null,
    	//     locality: null,
    	//     address: null,
    	//     category_id: null,
    	//     required_inputs: null,
    	//     ticket_id: null,
    	//   });
    	//     console.log('should run this')
    	//   } else console.log('should not run this')
    	// }
    	// const cookieData = document.cookie;
    	// console.log(cookieData)
    	//  let decodedCookie = decodeURIComponent(document.cookie);
    	//   let ca = decodedCookie.split(';');
    	//   for(let i = 0; i < ca.length; i++) {
    	//       let c = ca[i];
    	//       while (c.charAt(0) == ' ') {
    	//           c = c.substring(1);
    	//           console.log(c, ' c')
    	//       }
    	//       // if (c.indexOf(cookieName) == 0) {
    	//       //     return c.substring(cookieName.length, c.length);
    	//       // }
    	//   }
    	// let cookieValue = '';
    	// onMount(() => {
    	//   // Retrieve the cookie on component mount
    	//   const cookies = document.cookie.split(';');
    	//   for (let i = 0; i < cookies.length; i++) {
    	//     const cookie = cookies[i].trim();
    	//     console.log(cookie, 'cookie')
    	//     if (cookie.startsWith('beta_userToken=')) {
    	//       cookieValue = cookie.substring('beta_userToken='.length, cookie.length);
    	//       console.log(cookieValue, ' cookieValue')
    	//       break;
    	//     }
    	//   }
    	// });
    	onMount(() => {
    		// cookieData = cookies.get('yourCookieName')
    		// const session = cookies.get('session');
    		// if(getAuthKey !== null) {
    		//   isAuthenticated.set(true);
    		// }
    		if (!!getAuthKey() && getPersonId() && getPersonOrgOfficeId() !== false) isAuthenticated.set(true);
    	}); // chatSocket.on("connect", () => {
    	//   // console.log(chatSocket.connected);
    	// });
    	// chatSocket.emit("chat_ai_ticket_message_v2", {

    	//   app_type: "CITIZEN",
    	//   organisation_office_id: "1673436078069",
    	//   constituency_id: 1,
    	//   ticket_main_id: null,
    	//   person_id: getPersonId(),
    	//   content: null,
    	//   is_media_available: null,
    	//   is_location_available: null,
    	//   latitude: null,
    	//   longitude: null,
    	//   locality: null,
    	//   address: null,
    	//   category_id: null,
    	//   required_inputs: null,
    	//   ticket_id: null,
    	// });
    	// chatSocket.on('chat_ai_ticket_message_v2', data => {
    	//   if (data.person_id !== parseInt(getPersonId())) {
    	//     console.log('different id')
    	//     messages = [...messages, data]
    	//   } else console.log('same id')
    	//   if (messages.length === 1) {
    	//     ticketMainId = data.ticket_main_id;
    	//   }
    	//   console.log(messages)
    	// });
    	const sendMessage = () => {
    		// chatSocket.emit("chat_ai_ticket_message_v2", {
    		//   app_type: "CITIZEN",
    		//   organisation_office_id: "1668510062923",
    		//   constituency_id: 1,
    		//   ticket_main_id: ticketMainId,
    		//   person_id: getPersonId(),
    		//   content: textareaValue,
    		//   is_media_available: null,
    		//   is_location_available: null,
    		//   latitude: null,
    		//   longitude: null,
    		//   locality: null,
    		//   address: null,
    		//   category_id: null,
    		//   required_inputs: null,
    		//   ticket_id: null,
    		// });
    		$$invalidate(3, messages = [
    			...messages,
    			{
    				content: textareaValue,
    				person_id: parseInt(getPersonId())
    			}
    		]);

    		$$invalidate(4, textareaValue = '');
    	};

    	console.log(messages);

    	$$self.$$.on_mount.push(function () {
    		if (app_id === undefined && !('app_id' in $$props || $$self.$$.bound[$$self.$$.props['app_id']])) {
    			console_1$5.warn("<chat-widget> was created without expected prop 'app_id'");
    		}

    		if (app_secret === undefined && !('app_secret' in $$props || $$self.$$.bound[$$self.$$.props['app_secret']])) {
    			console_1$5.warn("<chat-widget> was created without expected prop 'app_secret'");
    		}

    		if (customer_id === undefined && !('customer_id' in $$props || $$self.$$.bound[$$self.$$.props['customer_id']])) {
    			console_1$5.warn("<chat-widget> was created without expected prop 'customer_id'");
    		}
    	});

    	const writable_props = ['app_id', 'app_secret', 'customer_id'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<chat-widget> was created with unknown prop '${key}'`);
    	});

    	const click_handler = message => window.open('https://test.cleandesk.co.in' + message.media_url, '_blank');

    	function textarea_input_handler() {
    		textareaValue = this.value;
    		$$invalidate(4, textareaValue);
    	}

    	const click_handler_1 = () => isAuthenticated.set(false);

    	$$self.$$set = $$props => {
    		if ('app_id' in $$props) $$invalidate(0, app_id = $$props.app_id);
    		if ('app_secret' in $$props) $$invalidate(8, app_secret = $$props.app_secret);
    		if ('customer_id' in $$props) $$invalidate(9, customer_id = $$props.customer_id);
    	};

    	$$self.$capture_state = () => ({
    		app_id,
    		app_secret,
    		customer_id,
    		ChatHeader,
    		onMount,
    		writable,
    		DOMAIN,
    		axios: axios$1,
    		AuthMain,
    		getAuthKey,
    		getPersonId,
    		getPersonOrgOfficeId,
    		isAuthenticated,
    		userDetails,
    		headers,
    		CustomAuthHeader,
    		config,
    		isVisible,
    		authFormVisible,
    		firstOpen,
    		messages,
    		ticketMainId,
    		textareaValue,
    		signInForm,
    		showChatWidget,
    		havinesh,
    		sendMessage,
    		$userDetails,
    		$isAuthenticated
    	});

    	$$self.$inject_state = $$props => {
    		if ('app_id' in $$props) $$invalidate(0, app_id = $$props.app_id);
    		if ('app_secret' in $$props) $$invalidate(8, app_secret = $$props.app_secret);
    		if ('customer_id' in $$props) $$invalidate(9, customer_id = $$props.customer_id);
    		if ('isVisible' in $$props) $$invalidate(1, isVisible = $$props.isVisible);
    		if ('authFormVisible' in $$props) authFormVisible = $$props.authFormVisible;
    		if ('firstOpen' in $$props) $$invalidate(2, firstOpen = $$props.firstOpen);
    		if ('messages' in $$props) $$invalidate(3, messages = $$props.messages);
    		if ('ticketMainId' in $$props) ticketMainId = $$props.ticketMainId;
    		if ('textareaValue' in $$props) $$invalidate(4, textareaValue = $$props.textareaValue);
    		if ('havinesh' in $$props) havinesh = $$props.havinesh;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$userDetails*/ 1024) {
    			console.log($userDetails, 'userDetails');
    		}
    	};

    	return [
    		app_id,
    		isVisible,
    		firstOpen,
    		messages,
    		textareaValue,
    		$isAuthenticated,
    		showChatWidget,
    		sendMessage,
    		app_secret,
    		customer_id,
    		$userDetails,
    		click_handler,
    		textarea_input_handler,
    		click_handler_1
    	];
    }

    class App extends SvelteElement {
    	constructor(options) {
    		super();
    		const style = document.createElement('style');

    		style.textContent = `#smith-container{width:0px;height:0px;bottom:0px;right:0px;z-index:999999}#smith-chat-container{overflow:hidden}.smith-chat-frame{z-index:999999 !important;position:fixed !important;bottom:20px;right:20px;height:calc(100% - 20px - 20px);width:400px !important;min-height:250px !important;max-height:480px !important;box-shadow:0px 1px 4px rgba(13, 22, 26, 0.08),
      0px 4px 16px rgba(13, 22, 26, 0.12), 0px 2px 12px rgba(13, 22, 26, 0.08);border-radius:2px !important;overflow:hidden !important;opacity:1 !important}.smith-chat-bar{z-index:999999 !important;position:fixed !important;bottom:calc(20px + 56px + 16px);right:20px;height:60px;width:400px !important;box-shadow:0px 1px 4px rgba(13, 22, 26, 0.08),
      0px 4px 16px rgba(13, 22, 26, 0.12), 0px 2px 12px rgba(13, 22, 26, 0.08);border-radius:2px !important;overflow:hidden !important;opacity:1 !important;background:#fff}#smith-container{}#smith-container .smith-chat-frame{height:100%;width:100%;height:calc(100% - 20px - 76px - 20px);bottom:calc(20px + 56px + 16px + 60px + 8px)}#smith-container .smith-chat{display:flex;flex-direction:column;position:absolute;top:0;bottom:0;left:0;right:0;background:#fff}#smith-container .smith-chat-header{background:#fff;border-top:16px solid #1e9fd6;position:relative;top:0;left:0;right:0;transition:height 0.16s ease-out}#smith-container .smith-header-profile{box-sizing:border-box;text-align:center}#smith-container .smith-header-profile-name{color:rgba(0, 18, 26, 0.93);font-size:20px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:14px}#smith-container .smith-header-profile-intro{color:rgba(0, 18, 26, 0.59);font-size:14px;line-height:20px;margin-bottom:4px}#smith-container .smith-header-profile-cta a{color:#1e9fd6;font-size:14px;text-decoration:none;opacity:0.9;transition:opacity 0.15s ease-in-out}#smith-container .smith-team-profile-full-cta a:hover{opacity:1}#smith-container .smith-chat-body{position:relative;flex:1;background-color:#fff}#smith-container .smith-conversation-container{position:absolute;top:0;left:0;right:0;bottom:0}#smith-container .smith-conversation-body-parts{position:absolute;top:0;left:0;right:0;bottom:0;overflow-x:hidden;overflow-y:scroll}#smith-container .smith-conversation-parts{padding:0px 20px;display:flex;flex-flow:row wrap}#smith-container .smith-conversation-parts-wrapper{display:flex;min-height:100%;flex-direction:column;justify-content:space-between}#smith-container .smith-comment-container{position:relative;margin-bottom:24px}#smith-container .smith-comment-container-admin{float:left;padding-left:40px;width:calc(100% - 48px)}#smith-container .smith-comment-container-admin-avatar{position:absolute;left:0;bottom:2px}#smith-container .smith-avatar{margin:0 auto;border-radius:50%;display:inline-block;vertical-align:middle}#smith-container .smith-comment-container-admin-avatar .smith-avatar{width:28px;height:28px;line-height:28px;font-size:14px}#smith-container .smith-avatar img{border-radius:50%}#smith-container .smith-comment-container-admin-avatar .smith-avatar img{width:28px;height:28px}#smith-container .smith-comment:not(.smith-comment-with-body){padding:12px 20px;border-radius:20px;position:relative;display:inline-block;width:auto;max-width:75%}#smith-container .smith-comment-container-admin .smith-comment:not(.smith-comment-with-body){color:rgba(0, 18, 26, 0.93);background-color:#edf1f2}#smith-container .smith-comment .smith-block-paragraph{font-size:14px;line-height:20px}.smith-chat-bar-message{padding:12px;display:flex;align-items:center}.smith-chat-bar-message textarea{background-color:transparent;border-radius:0;border:none;font-size:14px;flex:2;line-height:1.25rem;max-height:100px;outline:none;overflow-x:hidden;resize:none;padding:0;margin:0px 8px}.btn{font-weight:400;text-align:center;white-space:nowrap;vertical-align:middle;user-select:none;border:1px solid transparent;padding:0.375rem 0.75rem;font-size:14px;line-height:1.5;border-radius:2px;transition:color 0.15s ease-in-out, background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out}.send-btn{color:rgba(0, 18, 26, 0.59);background-color:#edf1f2;border-color:#edf1f2;min-width:72px}.send-btn:hover{cursor:pointer;color:rgba(0, 18, 26, 0.93);background-color:#d4dadd;border-color:#d4dadd}.smith-launcher-frame{box-shadow:0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 2px 16px rgba(0, 18, 26, 0.16);z-index:2147482999 !important;position:fixed !important;bottom:20px;right:20px;height:56px !important;width:56px !important;border-radius:100px !important;overflow:hidden !important;background:#1e9fd6 !important;opacity:0.9;transition:box-shadow 0.26s cubic-bezier(0.38, 0, 0.22, 1),
      opacity 0.26s ease-in-out}.smith-launcher-frame:hover{cursor:pointer;box-shadow:0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 3px 12px rgba(0, 18, 26, 0.16), 0 2px 14px 0 rgba(0, 18, 26, 0.2);opacity:1}`;

    		this.shadowRoot.appendChild(style);

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$9,
    			create_fragment$9,
    			safe_not_equal,
    			{ app_id: 0, app_secret: 8, customer_id: 9 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["app_id", "app_secret", "customer_id"];
    	}

    	get app_id() {
    		return this.$$.ctx[0];
    	}

    	set app_id(app_id) {
    		this.$$set({ app_id });
    		flush();
    	}

    	get app_secret() {
    		return this.$$.ctx[8];
    	}

    	set app_secret(app_secret) {
    		this.$$set({ app_secret });
    		flush();
    	}

    	get customer_id() {
    		return this.$$.ctx[9];
    	}

    	set customer_id(customer_id) {
    		this.$$set({ customer_id });
    		flush();
    	}
    }

    customElements.define("chat-widget", App);

    /* src/components/AuthMainFinal.svelte generated by Svelte v3.59.2 */

    const { console: console_1$4 } = globals;

    function create_fragment$8(ctx) {
    	const block = {
    		c: function create() {
    			this.c = noop$2;
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop$2,
    		p: noop$2,
    		i: noop$2,
    		o: noop$2,
    		d: noop$2
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $isAuthenticated;
    	validate_store(isAuthenticated, 'isAuthenticated');
    	component_subscribe($$self, isAuthenticated, $$value => $$invalidate(3, $isAuthenticated = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('auth-main-final', slots, []);
    	let { app_id } = $$props;
    	let { app_secret } = $$props;
    	let { customer_id } = $$props;

    	onMount(() => {
    		console.log(app_id, app_secret, customer_id, 'authmainfinal');

    		if (!!getAuthKey() === false) {
    			const authHeaderConfig = {
    				headers: {
    					'x-client-id': app_id,
    					'x-client-secret': app_secret
    				}
    			};

    			axios$1.post('https://test.cleandesk.co.in/api/v1/rl/generate/gateway/auth/token', { customer_id }, authHeaderConfig).then(response => {
    				setAuthKey(response.data.rows.token);
    				setPersonId(response.data.rows.person_id);
    				setPersonOrgOfficeId(response.data.rows.organisation_office_id);
    				if (response.data.statusCode === 'S10001') isAuthenticated.set(true);
    				console.log(response.data);
    			}).catch(error => {
    				console.error(error);
    			});
    		}
    	});

    	console.log('hi from authmainfinal');

    	$$self.$$.on_mount.push(function () {
    		if (app_id === undefined && !('app_id' in $$props || $$self.$$.bound[$$self.$$.props['app_id']])) {
    			console_1$4.warn("<auth-main-final> was created without expected prop 'app_id'");
    		}

    		if (app_secret === undefined && !('app_secret' in $$props || $$self.$$.bound[$$self.$$.props['app_secret']])) {
    			console_1$4.warn("<auth-main-final> was created without expected prop 'app_secret'");
    		}

    		if (customer_id === undefined && !('customer_id' in $$props || $$self.$$.bound[$$self.$$.props['customer_id']])) {
    			console_1$4.warn("<auth-main-final> was created without expected prop 'customer_id'");
    		}
    	});

    	const writable_props = ['app_id', 'app_secret', 'customer_id'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<auth-main-final> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('app_id' in $$props) $$invalidate(0, app_id = $$props.app_id);
    		if ('app_secret' in $$props) $$invalidate(1, app_secret = $$props.app_secret);
    		if ('customer_id' in $$props) $$invalidate(2, customer_id = $$props.customer_id);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		getAuthKey,
    		getPersonId,
    		getPersonOrgOfficeId,
    		setAuthKey,
    		setPersonId,
    		setPersonOrgOfficeId,
    		axios: axios$1,
    		isAuthenticated,
    		userDetails,
    		app_id,
    		app_secret,
    		customer_id,
    		$isAuthenticated
    	});

    	$$self.$inject_state = $$props => {
    		if ('app_id' in $$props) $$invalidate(0, app_id = $$props.app_id);
    		if ('app_secret' in $$props) $$invalidate(1, app_secret = $$props.app_secret);
    		if ('customer_id' in $$props) $$invalidate(2, customer_id = $$props.customer_id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$isAuthenticated*/ 8) {
    			{
    				if ($isAuthenticated) {
    					const headers = { 'Authorization': 'Token ' + getAuthKey() };

    					axios$1.post('https://test.cleandesk.co.in/api/v1/user/profile/', { person_id: null }, { headers }).then(response => {
    						// Handle the response data
    						if (response.data.statusCode === 'S10001') {
    							userDetails.set(response?.data?.rows);
    						} // chatSocket.on("connect", () => {
    						//   // console.log(chatSocket.connected);
    					}).//   organisation_office_id: getPersonOrgOfficeId(),
    					//   constituency_id: 1,
    					//   ticket_main_id: null,
    					//   person_id: getPersonId(),
    					//   content: null,
    					//   is_media_available: null,
    					//   is_location_available: null,
    					//   latitude: null,
    					//   longitude: null,
    					//   locality: null,
    					//   address: null,
    					//   category_id: null,
    					//   required_inputs: null,
    					//   ticket_id: null,
    					// });
    					catch(error => {
    						// Handle the error
    						console.error(error); // });
    						// chatSocket.emit("chat_ai_ticket_message_v2", {
    						//   app_type: "CITIZEN",
    					});
    				}
    			}
    		}
    	};

    	return [app_id, app_secret, customer_id, $isAuthenticated];
    }

    class AuthMainFinal extends SvelteElement {
    	constructor(options) {
    		super();
    		

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{ app_id: 0, app_secret: 1, customer_id: 2 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["app_id", "app_secret", "customer_id"];
    	}

    	get app_id() {
    		return this.$$.ctx[0];
    	}

    	set app_id(app_id) {
    		this.$$set({ app_id });
    		flush();
    	}

    	get app_secret() {
    		return this.$$.ctx[1];
    	}

    	set app_secret(app_secret) {
    		this.$$set({ app_secret });
    		flush();
    	}

    	get customer_id() {
    		return this.$$.ctx[2];
    	}

    	set customer_id(customer_id) {
    		this.$$set({ customer_id });
    		flush();
    	}
    }

    customElements.define("auth-main-final", AuthMainFinal);

    /* node_modules/svelte-infinite-scroll/dist/InfiniteScroll.svelte generated by Svelte v3.59.2 */
    const file$6 = "node_modules/svelte-infinite-scroll/dist/InfiniteScroll.svelte";

    // (73:0) {#if !window && !elementScroll}
    function create_if_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "svelte-infinite-scroll");
    			set_style(div, "width", "0");
    			add_location(div, file$6, 73, 2, 1974);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[11](div);
    		},
    		p: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[11](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(73:0) {#if !window && !elementScroll}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let if_block = !/*window*/ ctx[1] && !/*elementScroll*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$2();
    			this.c = noop$2;
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*window*/ ctx[1] && !/*elementScroll*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop$2,
    		o: noop$2,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('undefined', slots, []);
    	let { threshold = 0 } = $$props;
    	let { horizontal = false } = $$props;
    	let { elementScroll = null } = $$props;
    	let { hasMore = true } = $$props;
    	let { reverse = false } = $$props;
    	let { window = false } = $$props;
    	const dispatch = createEventDispatcher();
    	let isLoadMore = false;
    	let component;
    	let beforeScrollHeight;
    	let beforeScrollTop;
    	let element;

    	const onScroll = e => {
    		if (!hasMore) return;
    		const target = e.target;
    		const offset = calcOffset(target, reverse, horizontal);

    		if (offset <= threshold) {
    			if (!isLoadMore && hasMore) {
    				dispatch("loadMore");
    				$$invalidate(8, beforeScrollHeight = target.scrollHeight);
    				$$invalidate(9, beforeScrollTop = target.scrollTop);
    			}

    			$$invalidate(7, isLoadMore = true);
    		} else {
    			$$invalidate(7, isLoadMore = false);
    		}
    	};

    	const calcOffset = (target, reverse, horizontal) => {
    		const element = target.documentElement ? target.documentElement : target;

    		if (reverse) {
    			return horizontal ? element.scrollLeft : element.scrollTop;
    		}

    		return horizontal
    		? element.scrollWidth - element.clientWidth - element.scrollLeft
    		: element.scrollHeight - element.clientHeight - element.scrollTop;
    	};

    	onMount(() => {
    		if (window) {
    			$$invalidate(10, element = document);
    		} else if (elementScroll) {
    			$$invalidate(10, element = elementScroll);
    		} else {
    			$$invalidate(10, element = component.parentNode);
    		}
    	});

    	onDestroy(() => {
    		if (element) {
    			element.removeEventListener("scroll", onScroll);
    			element.removeEventListener("resize", onScroll);
    		}
    	});

    	const writable_props = ['threshold', 'horizontal', 'elementScroll', 'hasMore', 'reverse', 'window'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<undefined> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			component = $$value;
    			$$invalidate(2, component);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('threshold' in $$props) $$invalidate(3, threshold = $$props.threshold);
    		if ('horizontal' in $$props) $$invalidate(4, horizontal = $$props.horizontal);
    		if ('elementScroll' in $$props) $$invalidate(0, elementScroll = $$props.elementScroll);
    		if ('hasMore' in $$props) $$invalidate(5, hasMore = $$props.hasMore);
    		if ('reverse' in $$props) $$invalidate(6, reverse = $$props.reverse);
    		if ('window' in $$props) $$invalidate(1, window = $$props.window);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		createEventDispatcher,
    		threshold,
    		horizontal,
    		elementScroll,
    		hasMore,
    		reverse,
    		window,
    		dispatch,
    		isLoadMore,
    		component,
    		beforeScrollHeight,
    		beforeScrollTop,
    		element,
    		onScroll,
    		calcOffset
    	});

    	$$self.$inject_state = $$props => {
    		if ('threshold' in $$props) $$invalidate(3, threshold = $$props.threshold);
    		if ('horizontal' in $$props) $$invalidate(4, horizontal = $$props.horizontal);
    		if ('elementScroll' in $$props) $$invalidate(0, elementScroll = $$props.elementScroll);
    		if ('hasMore' in $$props) $$invalidate(5, hasMore = $$props.hasMore);
    		if ('reverse' in $$props) $$invalidate(6, reverse = $$props.reverse);
    		if ('window' in $$props) $$invalidate(1, window = $$props.window);
    		if ('isLoadMore' in $$props) $$invalidate(7, isLoadMore = $$props.isLoadMore);
    		if ('component' in $$props) $$invalidate(2, component = $$props.component);
    		if ('beforeScrollHeight' in $$props) $$invalidate(8, beforeScrollHeight = $$props.beforeScrollHeight);
    		if ('beforeScrollTop' in $$props) $$invalidate(9, beforeScrollTop = $$props.beforeScrollTop);
    		if ('element' in $$props) $$invalidate(10, element = $$props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*element, reverse*/ 1088) {
    			if (element) {
    				if (reverse) {
    					$$invalidate(10, element.scrollTop = element.scrollHeight, element);
    				}

    				element.addEventListener("scroll", onScroll);
    				element.addEventListener("resize", onScroll);
    			}
    		}

    		if ($$self.$$.dirty & /*isLoadMore, reverse, element, beforeScrollHeight, beforeScrollTop*/ 1984) {
    			if (isLoadMore && reverse) {
    				$$invalidate(10, element.scrollTop = element.scrollHeight - beforeScrollHeight + beforeScrollTop, element);
    			}
    		}
    	};

    	return [
    		elementScroll,
    		window,
    		component,
    		threshold,
    		horizontal,
    		hasMore,
    		reverse,
    		isLoadMore,
    		beforeScrollHeight,
    		beforeScrollTop,
    		element,
    		div_binding
    	];
    }

    let InfiniteScroll$1 = class InfiniteScroll extends SvelteElement {
    	constructor(options) {
    		super();

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$7,
    			create_fragment$7,
    			safe_not_equal,
    			{
    				threshold: 3,
    				horizontal: 4,
    				elementScroll: 0,
    				hasMore: 5,
    				reverse: 6,
    				window: 1
    			},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["threshold", "horizontal", "elementScroll", "hasMore", "reverse", "window"];
    	}

    	get threshold() {
    		return this.$$.ctx[3];
    	}

    	set threshold(threshold) {
    		this.$$set({ threshold });
    		flush();
    	}

    	get horizontal() {
    		return this.$$.ctx[4];
    	}

    	set horizontal(horizontal) {
    		this.$$set({ horizontal });
    		flush();
    	}

    	get elementScroll() {
    		return this.$$.ctx[0];
    	}

    	set elementScroll(elementScroll) {
    		this.$$set({ elementScroll });
    		flush();
    	}

    	get hasMore() {
    		return this.$$.ctx[5];
    	}

    	set hasMore(hasMore) {
    		this.$$set({ hasMore });
    		flush();
    	}

    	get reverse() {
    		return this.$$.ctx[6];
    	}

    	set reverse(reverse) {
    		this.$$set({ reverse });
    		flush();
    	}

    	get window() {
    		return this.$$.ctx[1];
    	}

    	set window(window) {
    		this.$$set({ window });
    		flush();
    	}
    };

    /* src/common/ReverseInfiniteScroll.svelte generated by Svelte v3.59.2 */
    const file$5 = "src/common/ReverseInfiniteScroll.svelte";

    function create_fragment$6(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			this.c = noop$2;
    			set_style(div, "width", "0px");
    			add_location(div, file$5, 71, 0, 1824);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[9](div);
    		},
    		p: noop$2,
    		i: noop$2,
    		o: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[9](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('reverse-infinite-scroll', slots, []);
    	let { threshold = 0 } = $$props;
    	let { horizontal = false } = $$props;
    	let { elementScroll = null } = $$props;
    	let { hasMore = true } = $$props;
    	let { reverse = false } = $$props;
    	const dispatch = createEventDispatcher();
    	let isLoadMore = false;
    	let component;
    	let beforeScrollHeight;
    	let beforeScrollTop;

    	const onScroll = e => {
    		if (!hasMore) return;
    		let offset = 0;

    		if (reverse) {
    			offset = horizontal ? e.target.scrollLeft : e.target.scrollTop;
    		} else {
    			offset = horizontal
    			? e.target.scrollWidth - e.target.clientWidth - e.target.scrollLeft
    			: e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop;
    		}

    		if (offset <= threshold) {
    			if (!isLoadMore && hasMore) {
    				dispatch("loadMore");
    				$$invalidate(7, beforeScrollHeight = e.target.scrollHeight);
    				$$invalidate(8, beforeScrollTop = e.target.scrollTop);
    			}

    			$$invalidate(6, isLoadMore = true);
    		} else {
    			$$invalidate(6, isLoadMore = false);
    		}
    	};

    	onDestroy(() => {
    		if (component || elementScroll) {
    			const element = elementScroll ? elementScroll : component.parentNode;
    			element.removeEventListener("scroll", null);
    			element.removeEventListener("resize", null);
    		}
    	});

    	const writable_props = ['threshold', 'horizontal', 'elementScroll', 'hasMore', 'reverse'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<reverse-infinite-scroll> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			component = $$value;
    			$$invalidate(0, component);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('threshold' in $$props) $$invalidate(1, threshold = $$props.threshold);
    		if ('horizontal' in $$props) $$invalidate(2, horizontal = $$props.horizontal);
    		if ('elementScroll' in $$props) $$invalidate(3, elementScroll = $$props.elementScroll);
    		if ('hasMore' in $$props) $$invalidate(4, hasMore = $$props.hasMore);
    		if ('reverse' in $$props) $$invalidate(5, reverse = $$props.reverse);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		createEventDispatcher,
    		threshold,
    		horizontal,
    		elementScroll,
    		hasMore,
    		reverse,
    		dispatch,
    		isLoadMore,
    		component,
    		beforeScrollHeight,
    		beforeScrollTop,
    		onScroll
    	});

    	$$self.$inject_state = $$props => {
    		if ('threshold' in $$props) $$invalidate(1, threshold = $$props.threshold);
    		if ('horizontal' in $$props) $$invalidate(2, horizontal = $$props.horizontal);
    		if ('elementScroll' in $$props) $$invalidate(3, elementScroll = $$props.elementScroll);
    		if ('hasMore' in $$props) $$invalidate(4, hasMore = $$props.hasMore);
    		if ('reverse' in $$props) $$invalidate(5, reverse = $$props.reverse);
    		if ('isLoadMore' in $$props) $$invalidate(6, isLoadMore = $$props.isLoadMore);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('beforeScrollHeight' in $$props) $$invalidate(7, beforeScrollHeight = $$props.beforeScrollHeight);
    		if ('beforeScrollTop' in $$props) $$invalidate(8, beforeScrollTop = $$props.beforeScrollTop);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*component, elementScroll, reverse*/ 41) {
    			if (component || elementScroll) {
    				const element = elementScroll ? elementScroll : component.parentNode;

    				if (reverse) {
    					element.scrollTop = element.scrollHeight;
    				}

    				element.addEventListener("scroll", onScroll);
    				element.addEventListener("resize", onScroll);
    			}
    		}

    		if ($$self.$$.dirty & /*isLoadMore, reverse, elementScroll, component, beforeScrollHeight, beforeScrollTop*/ 489) {
    			if (isLoadMore && reverse) {
    				const element = elementScroll ? elementScroll : component.parentNode;
    				element.scrollTop = element.scrollHeight - beforeScrollHeight + beforeScrollTop;
    			}
    		}
    	};

    	return [
    		component,
    		threshold,
    		horizontal,
    		elementScroll,
    		hasMore,
    		reverse,
    		isLoadMore,
    		beforeScrollHeight,
    		beforeScrollTop,
    		div_binding
    	];
    }

    class ReverseInfiniteScroll extends SvelteElement {
    	constructor(options) {
    		super();

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				threshold: 1,
    				horizontal: 2,
    				elementScroll: 3,
    				hasMore: 4,
    				reverse: 5
    			},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["threshold", "horizontal", "elementScroll", "hasMore", "reverse"];
    	}

    	get threshold() {
    		return this.$$.ctx[1];
    	}

    	set threshold(threshold) {
    		this.$$set({ threshold });
    		flush();
    	}

    	get horizontal() {
    		return this.$$.ctx[2];
    	}

    	set horizontal(horizontal) {
    		this.$$set({ horizontal });
    		flush();
    	}

    	get elementScroll() {
    		return this.$$.ctx[3];
    	}

    	set elementScroll(elementScroll) {
    		this.$$set({ elementScroll });
    		flush();
    	}

    	get hasMore() {
    		return this.$$.ctx[4];
    	}

    	set hasMore(hasMore) {
    		this.$$set({ hasMore });
    		flush();
    	}

    	get reverse() {
    		return this.$$.ctx[5];
    	}

    	set reverse(reverse) {
    		this.$$set({ reverse });
    		flush();
    	}
    }

    customElements.define("reverse-infinite-scroll", ReverseInfiniteScroll);

    /* src/Test.svelte generated by Svelte v3.59.2 */

    const { console: console_1$3 } = globals;
    const file$4 = "src/Test.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (340:2) {#each items as item}
    function create_each_block$2(ctx) {
    	let div;
    	let t_value = /*item*/ ctx[11].content + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			set_style(div, "padding", "12px");
    			add_location(div, file$4, 341, 4, 11895);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 1 && t_value !== (t_value = /*item*/ ctx[11].content + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(340:2) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let p0;
    	let t2;
    	let t3;
    	let t4;
    	let p1;
    	let t5;
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let t9;
    	let mounted;
    	let dispose;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text("hi form test\n");
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			p0 = element("p");
    			t2 = text("scrollTop: ");
    			t3 = text(/*scrollTop*/ ctx[2]);
    			t4 = space();
    			p1 = element("p");
    			t5 = text("scrollHeight: ");
    			t6 = text(/*scrollHeight*/ ctx[3]);
    			t7 = space();
    			p2 = element("p");
    			t8 = text("clientHeight: ");
    			t9 = text(/*clientHeight*/ ctx[4]);
    			this.c = noop$2;
    			attr_dev(div, "class", "chatContainer");
    			set_style(div, "height", "200px");
    			set_style(div, "display", "flex");
    			set_style(div, "overflow-y", "scroll");
    			set_style(div, "flex-direction", "column-reverse");
    			add_location(div, file$4, 338, 0, 11658);
    			add_location(p0, file$4, 352, 0, 12177);
    			add_location(p1, file$4, 353, 0, 12207);
    			add_location(p2, file$4, 354, 0, 12243);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			/*div_binding*/ ctx[6](div);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t8);
    			append_dev(p2, t9);

    			if (!mounted) {
    				dispose = listen_dev(div, "scroll", /*handleScroll*/ ctx[5], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items*/ 1) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*scrollTop*/ 4) set_data_dev(t3, /*scrollTop*/ ctx[2]);
    			if (dirty & /*scrollHeight*/ 8) set_data_dev(t6, /*scrollHeight*/ ctx[3]);
    			if (dirty & /*clientHeight*/ 16) set_data_dev(t9, /*clientHeight*/ ctx[4]);
    		},
    		i: noop$2,
    		o: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			/*div_binding*/ ctx[6](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('hi-test', slots, []);
    	let items = []; // Your initial data

    	//   let items = [
    	//     {
    	//         "id": 1689543974214,
    	//         "ticket_main_id": 1689543928886,
    	//         "content": "ascvn askvc",
    	//         "content_type": "text",
    	//         "media_type": null,
    	//         "media_url": null,
    	//         "created_at": 1689543974213,
    	//         "media_mime_type": null,
    	//         "is_reply": 0,
    	//         "original_comment_id": null,
    	//         "original_comment_content": null,
    	//         "original_comment_content_type": null,
    	//         "original_comment_media_type": null,
    	//         "original_comment_media_url": null,
    	//         "original_comment_media_mime_type": null,
    	//         "person_id": 1689153829978,
    	//         "title": "DEVKI NANDAN",
    	//         "person_avatar": "/media/default/profile/person/default.png",
    	//         "comment_status": null,
    	//         "applicable_to": null
    	//     },
    	//     {
    	//         "id": 1689543973156,
    	//         "ticket_main_id": 1689543928886,
    	//         "content": "cajbsvclkajbscv",
    	//         "content_type": "text",
    	//         "media_type": null,
    	//         "media_url": null,
    	//         "created_at": 1689543973156,
    	//         "media_mime_type": null,
    	//         "is_reply": 0,
    	//         "original_comment_id": null,
    	//         "original_comment_content": null,
    	//         "original_comment_content_type": null,
    	//         "original_comment_media_type": null,
    	//         "original_comment_media_url": null,
    	//         "original_comment_media_mime_type": null,
    	//         "person_id": 1689153829978,
    	//         "title": "DEVKI NANDAN",
    	//         "person_avatar": "/media/default/profile/person/default.png",
    	//         "comment_status": null,
    	//         "applicable_to": null
    	//     },
    	//     {
    	//         "id": 1689543972128,
    	//         "ticket_main_id": 1689543928886,
    	//         "content": "asbckajbsca",
    	//         "content_type": "text",
    	//         "media_type": null,
    	//         "media_url": null,
    	//         "created_at": 1689543972127,
    	//         "media_mime_type": null,
    	//         "is_reply": 0,
    	//         "original_comment_id": null,
    	//         "original_comment_content": null,
    	//         "original_comment_content_type": null,
    	//         "original_comment_media_type": null,
    	//         "original_comment_media_url": null,
    	//         "original_comment_media_mime_type": null,
    	//         "person_id": 1689153829978,
    	//         "title": "DEVKI NANDAN",
    	//         "person_avatar": "/media/default/profile/person/default.png",
    	//         "comment_status": null,
    	//         "applicable_to": null
    	//     },
    	//     {
    	//         "id": 1689543971147,
    	//         "ticket_main_id": 1689543928886,
    	//         "content": "ascbaksjbvc",
    	//         "content_type": "text",
    	//         "media_type": null,
    	//         "media_url": null,
    	//         "created_at": 1689543971146,
    	//         "media_mime_type": null,
    	//         "is_reply": 0,
    	//         "original_comment_id": null,
    	//         "original_comment_content": null,
    	//         "original_comment_content_type": null,
    	//         "original_comment_media_type": null,
    	//         "original_comment_media_url": null,
    	//         "original_comment_media_mime_type": null,
    	//         "person_id": 1689153829978,
    	//         "title": "DEVKI NANDAN",
    	//         "person_avatar": "/media/default/profile/person/default.png",
    	//         "comment_status": null,
    	//         "applicable_to": null
    	//     },
    	//     {
    	//         "id": 1689543970151,
    	//         "ticket_main_id": 1689543928886,
    	//         "content": "asvhckasbvc",
    	//         "content_type": "text",
    	//         "media_type": null,
    	//         "media_url": null,
    	//         "created_at": 1689543970151,
    	//         "media_mime_type": null,
    	//         "is_reply": 0,
    	//         "original_comment_id": null,
    	//         "original_comment_content": null,
    	//         "original_comment_content_type": null,
    	//         "original_comment_media_type": null,
    	//         "original_comment_media_url": null,
    	//         "original_comment_media_mime_type": null,
    	//         "person_id": 1689153829978,
    	//         "title": "DEVKI NANDAN",
    	//         "person_avatar": "/media/default/profile/person/default.png",
    	//         "comment_status": null,
    	//         "applicable_to": null
    	//     },
    	//     {
    	//         "id": 1689543969276,
    	//         "ticket_main_id": 1689543928886,
    	//         "content": "ajbsclkajhbscv",
    	//         "content_type": "text",
    	//         "media_type": null,
    	//         "media_url": null,
    	//         "created_at": 1689543969276,
    	//         "media_mime_type": null,
    	//         "is_reply": 0,
    	//         "original_comment_id": null,
    	//         "original_comment_content": null,
    	//         "original_comment_content_type": null,
    	//         "original_comment_media_type": null,
    	//         "original_comment_media_url": null,
    	//         "original_comment_media_mime_type": null,
    	//         "person_id": 1689153829978,
    	//         "title": "DEVKI NANDAN",
    	//         "person_avatar": "/media/default/profile/person/default.png",
    	//         "comment_status": null,
    	//         "applicable_to": null
    	//     },
    	//     {
    	//         "id": 1689543965964,
    	//         "ticket_main_id": 1689543928886,
    	//         "content": "ajsvcbakjsbva",
    	//         "content_type": "text",
    	//         "media_type": null,
    	//         "media_url": null,
    	//         "created_at": 1689543965963,
    	//         "media_mime_type": null,
    	//         "is_reply": 0,
    	//         "original_comment_id": null,
    	//         "original_comment_content": null,
    	//         "original_comment_content_type": null,
    	//         "original_comment_media_type": null,
    	//         "original_comment_media_url": null,
    	//         "original_comment_media_mime_type": null,
    	//         "person_id": 1689153829978,
    	//         "title": "DEVKI NANDAN",
    	//         "person_avatar": "/media/default/profile/person/default.png",
    	//         "comment_status": null,
    	//         "applicable_to": null
    	//     },
    	//     {
    	//         "id": 1689543964912,
    	//         "ticket_main_id": 1689543928886,
    	//         "content": "casjb vckjabscv",
    	//         "content_type": "text",
    	//         "media_type": null,
    	//         "media_url": null,
    	//         "created_at": 1689543964911,
    	//         "media_mime_type": null,
    	//         "is_reply": 0,
    	//         "original_comment_id": null,
    	//         "original_comment_content": null,
    	//         "original_comment_content_type": null,
    	//         "original_comment_media_type": null,
    	//         "original_comment_media_url": null,
    	//         "original_comment_media_mime_type": null,
    	//         "person_id": 1689153829978,
    	//         "title": "DEVKI NANDAN",
    	//         "person_avatar": "/media/default/profile/person/default.png",
    	//         "comment_status": null,
    	//         "applicable_to": null
    	//     },
    	//     {
    	//         "id": 1689543963844,
    	//         "ticket_main_id": 1689543928886,
    	//         "content": "asjcbalsjbca",
    	//         "content_type": "text",
    	//         "media_type": null,
    	//         "media_url": null,
    	//         "created_at": 1689543963844,
    	//         "media_mime_type": null,
    	//         "is_reply": 0,
    	//         "original_comment_id": null,
    	//         "original_comment_content": null,
    	//         "original_comment_content_type": null,
    	//         "original_comment_media_type": null,
    	//         "original_comment_media_url": null,
    	//         "original_comment_media_mime_type": null,
    	//         "person_id": 1689153829978,
    	//         "title": "DEVKI NANDAN",
    	//         "person_avatar": "/media/default/profile/person/default.png",
    	//         "comment_status": null,
    	//         "applicable_to": null
    	//     },
    	//     {
    	//         "id": 1689543962859,
    	//         "ticket_main_id": 1689543928886,
    	//         "content": "asjcbaljsbc",
    	//         "content_type": "text",
    	//         "media_type": null,
    	//         "media_url": null,
    	//         "created_at": 1689543962858,
    	//         "media_mime_type": null,
    	//         "is_reply": 0,
    	//         "original_comment_id": null,
    	//         "original_comment_content": null,
    	//         "original_comment_content_type": null,
    	//         "original_comment_media_type": null,
    	//         "original_comment_media_url": null,
    	//         "original_comment_media_mime_type": null,
    	//         "person_id": 1689153829978,
    	//         "title": "DEVKI NANDAN",
    	//         "person_avatar": "/media/default/profile/person/default.png",
    	//         "comment_status": null,
    	//         "applicable_to": null
    	//     }
    	// ]
    	let container;

    	let page = 1; // The current page
    	let newBatch = [];

    	onMount(() => {
    		container.addEventListener('scroll', handleScroll);
    	});

    	const headers = {
    		'Authorization': 'Token 8379abbf7b54c8c7fff828719c8df3deb909cb7029ee5545b3bc8586fef6a245'
    	};

    	onMount(() => {
    		loadMoreItems();
    	});

    	// Function to load more data
    	async function loadMoreItems() {
    		const payload = {
    			search_val: null,
    			page_size: 10,
    			page_number: page,
    			ticket_main_id: 1689543928886,
    			// ticket_main_id: item.id,
    			applicable_to: "citizen"
    		};

    		axios$1.post('https://test.cleandesk.co.in/api/v1/hd/ticket/comments/list', { ...payload }, { headers }).then(response => {
    			// console.log(response.data);
    			newBatch = response.data.rows;

    			$$invalidate(0, items = [...items, ...newBatch]);
    		}).catch(error => {
    			console.error(error); // $messages = [...$messages, response.data.rows];
    		});
    	} // const payload = {
    	//   search_val: null,

    	//   page_size: 10,
    	//   page_number: page,
    	//   ticket_main_id: 1689543928886,
    	//   // ticket_main_id: item.id,
    	//   applicable_to: "citizen"
    	// }
    	// axios.post('https://test.cleandesk.co.in/api/v1/hd/ticket/comments/list',{ ...payload }, { headers })
    	//     .then(response => {
    	//       console.log(response.data);
    	//       newBatch = response.data.rows;
    	//       items = [...items, ...newBatch];
    	//       // $messages = [...$messages, response.data.rows];
    	//     })
    	//     .catch(error => {
    	//       console.error(error);
    	//     });
    	// Append the new data to the existing items
    	// items = [...items, ...newBatch];
    	let scrollTop = 0;

    	let scrollHeight = 0;
    	let clientHeight = 0;

    	function handleScroll(event) {
    		$$invalidate(2, scrollTop = container.scrollTop);
    		$$invalidate(2, scrollTop = Math.abs(scrollTop));
    		$$invalidate(3, scrollHeight = container.scrollHeight);
    		$$invalidate(4, clientHeight = container.clientHeight);
    		let havinesh = scrollHeight - clientHeight;

    		if (scrollTop === havinesh && newBatch.length > 0) {
    			console.log('load more');
    			page++;
    			loadMoreItems();
    		}
    	}

    	// function handleScroll(event) {
    	//   if (container.scrollTop === 0) {
    	//     console.log('load more');
    	//   }
    	// }
    	window.addEventListener('scroll', () => {
    		const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    		console.log(document.documentElement, 'document.documentElement');
    		console.log(scrollTop, 'scrollTop');
    		console.log(scrollHeight, 'scrollHeight');
    		console.log(clientHeight, 'clientHeight');

    		if (scrollTop + clientHeight >= scrollHeight - 20) {
    			console.log(scrollTop, 'scrollTop');
    			console.log(scrollHeight, 'scrollHeight');
    			console.log(clientHeight, 'clientHeight');

    			// Load more items when the user is near the bottom of the page (with a 20px buffer)
    			// loadMoreItems();
    			console.log('load more');
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<hi-test> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$capture_state = () => ({
    		axios: axios$1,
    		InfiniteScroll: InfiniteScroll$1,
    		ReverseInfiniteScroll,
    		onMount,
    		items,
    		container,
    		page,
    		newBatch,
    		headers,
    		loadMoreItems,
    		scrollTop,
    		scrollHeight,
    		clientHeight,
    		handleScroll
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('container' in $$props) $$invalidate(1, container = $$props.container);
    		if ('page' in $$props) page = $$props.page;
    		if ('newBatch' in $$props) newBatch = $$props.newBatch;
    		if ('scrollTop' in $$props) $$invalidate(2, scrollTop = $$props.scrollTop);
    		if ('scrollHeight' in $$props) $$invalidate(3, scrollHeight = $$props.scrollHeight);
    		if ('clientHeight' in $$props) $$invalidate(4, clientHeight = $$props.clientHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items*/ 1) {
    			console.log(items, 'items');
    		}
    	};

    	return [
    		items,
    		container,
    		scrollTop,
    		scrollHeight,
    		clientHeight,
    		handleScroll,
    		div_binding
    	];
    }

    class Test extends SvelteElement {
    	constructor(options) {
    		super();

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$5,
    			create_fragment$5,
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

    customElements.define("hi-test", Test);

    /* src/common/InfiniteScroll.svelte generated by Svelte v3.59.2 */
    const file$3 = "src/common/InfiniteScroll.svelte";

    function create_fragment$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			this.c = noop$2;
    			attr_dev(div, "class", "testClass");
    			add_location(div, file$3, 50, 0, 1255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[5](div);
    		},
    		p: noop$2,
    		i: noop$2,
    		o: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('infinite-scroll-component', slots, []);
    	let { threshold = 0 } = $$props;
    	let { horizontal = false } = $$props;
    	let { elementScroll } = $$props;
    	let { hasMore = true } = $$props;
    	const dispatch = createEventDispatcher();
    	let isLoadMore = false;
    	let component;

    	const onScroll = e => {
    		e.target;

    		const offset = horizontal
    		? e.target.scrollWidth - e.target.clientWidth - e.target.scrollLeft
    		: e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop;

    		if (offset <= threshold) {
    			if (!isLoadMore && hasMore) {
    				dispatch("loadMore");
    			}

    			isLoadMore = true;
    		} else {
    			isLoadMore = false;
    		}
    	};

    	onDestroy(() => {
    		if (component || elementScroll) {
    			const element = elementScroll ? elementScroll : component.parentNode;
    			element.removeEventListener("scroll", null);
    			element.removeEventListener("resize", null);
    		}
    	});

    	$$self.$$.on_mount.push(function () {
    		if (elementScroll === undefined && !('elementScroll' in $$props || $$self.$$.bound[$$self.$$.props['elementScroll']])) {
    			console.warn("<infinite-scroll-component> was created without expected prop 'elementScroll'");
    		}
    	});

    	const writable_props = ['threshold', 'horizontal', 'elementScroll', 'hasMore'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<infinite-scroll-component> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			component = $$value;
    			$$invalidate(0, component);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('threshold' in $$props) $$invalidate(1, threshold = $$props.threshold);
    		if ('horizontal' in $$props) $$invalidate(2, horizontal = $$props.horizontal);
    		if ('elementScroll' in $$props) $$invalidate(3, elementScroll = $$props.elementScroll);
    		if ('hasMore' in $$props) $$invalidate(4, hasMore = $$props.hasMore);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		createEventDispatcher,
    		threshold,
    		horizontal,
    		elementScroll,
    		hasMore,
    		dispatch,
    		isLoadMore,
    		component,
    		onScroll
    	});

    	$$self.$inject_state = $$props => {
    		if ('threshold' in $$props) $$invalidate(1, threshold = $$props.threshold);
    		if ('horizontal' in $$props) $$invalidate(2, horizontal = $$props.horizontal);
    		if ('elementScroll' in $$props) $$invalidate(3, elementScroll = $$props.elementScroll);
    		if ('hasMore' in $$props) $$invalidate(4, hasMore = $$props.hasMore);
    		if ('isLoadMore' in $$props) isLoadMore = $$props.isLoadMore;
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*component, elementScroll*/ 9) {
    			{
    				if (component || elementScroll) {
    					const element = elementScroll ? elementScroll : component.parentNode;
    					element.addEventListener("scroll", onScroll);
    					element.addEventListener("resize", onScroll);
    				}
    			}
    		}
    	};

    	return [component, threshold, horizontal, elementScroll, hasMore, div_binding];
    }

    class InfiniteScroll extends SvelteElement {
    	constructor(options) {
    		super();
    		const style = document.createElement('style');
    		style.textContent = `.testClass{width:0;overflow:auto}`;
    		this.shadowRoot.appendChild(style);

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{
    				threshold: 1,
    				horizontal: 2,
    				elementScroll: 3,
    				hasMore: 4
    			},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["threshold", "horizontal", "elementScroll", "hasMore"];
    	}

    	get threshold() {
    		return this.$$.ctx[1];
    	}

    	set threshold(threshold) {
    		this.$$set({ threshold });
    		flush();
    	}

    	get horizontal() {
    		return this.$$.ctx[2];
    	}

    	set horizontal(horizontal) {
    		this.$$set({ horizontal });
    		flush();
    	}

    	get elementScroll() {
    		return this.$$.ctx[3];
    	}

    	set elementScroll(elementScroll) {
    		this.$$set({ elementScroll });
    		flush();
    	}

    	get hasMore() {
    		return this.$$.ctx[4];
    	}

    	set hasMore(hasMore) {
    		this.$$set({ hasMore });
    		flush();
    	}
    }

    customElements.define("infinite-scroll-component", InfiniteScroll);

    /* src/components/ChatWidget/components/MessageListing.svelte generated by Svelte v3.59.2 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: function create() {
    			this.c = noop$2;
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop$2,
    		p: noop$2,
    		i: noop$2,
    		o: noop$2,
    		d: noop$2
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('undefined', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<undefined> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class MessageListing extends SvelteElement {
    	constructor(options) {
    		super();

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$3,
    			create_fragment$3,
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

    /* src/components/ChatWidget/components/ChatListing/ChatListing.svelte generated by Svelte v3.59.2 */

    const { console: console_1$2 } = globals;
    const file$2 = "src/components/ChatWidget/components/ChatListing/ChatListing.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (177:6) {#each data as item}
    function create_each_block$1(ctx) {
    	let li;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h5;
    	let t1_value = /*item*/ ctx[14]?.title + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*item*/ ctx[14]?.last_comment.content + "";
    	let t3;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[9](/*item*/ ctx[14]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h5 = element("h5");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			attr_dev(img, "class", "list-img");
    			if (!src_url_equal(img.src, img_src_value = 'https://test.cleandesk.co.in' + /*item*/ ctx[14].person_avatar)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "A");
    			set_style(img, "width", "42px");
    			set_style(img, "border-radius", "50%");
    			add_location(img, file$2, 181, 12, 5899);
    			add_location(h5, file$2, 183, 14, 6062);
    			add_location(p, file$2, 184, 14, 6099);
    			add_location(div0, file$2, 182, 12, 6042);
    			set_style(div1, "display", "flex");
    			set_style(div1, "align-items", "center");
    			set_style(div1, "border-bottom", "1px solid #d6c7c7");
    			add_location(div1, file$2, 180, 10, 5799);
    			add_location(li, file$2, 178, 8, 5679);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(h5, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler_1, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*data*/ 1 && !src_url_equal(img.src, img_src_value = 'https://test.cleandesk.co.in' + /*item*/ ctx[14].person_avatar)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*data*/ 1 && t1_value !== (t1_value = /*item*/ ctx[14]?.title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*data*/ 1 && t3_value !== (t3_value = /*item*/ ctx[14]?.last_comment.content + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(177:6) {#each data as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let div0;
    	let h20;
    	let t1;
    	let button;
    	let img;
    	let img_src_value;
    	let t2;
    	let h21;
    	let t4;
    	let div1;
    	let input;
    	let t5;
    	let div2;
    	let ul;
    	let t6;
    	let infinitescroll;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	infinitescroll = new InfiniteScroll({
    			props: {
    				hasMore: /*newBatch*/ ctx[1].length,
    				threshold: 100
    			},
    			$$inline: true
    		});

    	infinitescroll.$on("loadMore", /*loadMore_handler*/ ctx[10]);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Timbl broadband";
    			t1 = space();
    			button = element("button");
    			img = element("img");
    			t2 = space();
    			h21 = element("h2");
    			h21.textContent = "X";
    			t4 = space();
    			div1 = element("div");
    			input = element("input");
    			t5 = space();
    			div2 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			create_component(infinitescroll.$$.fragment);
    			this.c = noop$2;
    			set_style(h20, "margin", "0");
    			set_style(h20, "padding", "12px");
    			add_location(h20, file$2, 161, 4, 4706);
    			if (!src_url_equal(img.src, img_src_value = "./images/plus.png")) attr_dev(img, "src", img_src_value);
    			set_style(img, "height", "18px");
    			add_location(img, file$2, 163, 6, 4995);
    			set_style(button, "background-color", "#0000ff");
    			set_style(button, "border-radius", "50%");
    			set_style(button, "height", "32px");
    			set_style(button, "width", "32px");
    			set_style(button, "align-items", "center", 1);
    			set_style(button, "display", "inline-flex", 1);
    			set_style(button, "justify-content", "center");
    			add_location(button, file$2, 162, 4, 4768);
    			set_style(h21, "margin", "0 1px 0 0");
    			set_style(h21, "padding", "12px");
    			add_location(h21, file$2, 165, 4, 5066);
    			attr_dev(div0, "class", "chat-listing-header");
    			set_style(div0, "display", "flex");
    			add_location(div0, file$2, 160, 2, 4645);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "myInput");
    			attr_dev(input, "onkeyup", "myFunction()");
    			attr_dev(input, "placeholder", "Search...");
    			attr_dev(input, "title", "searchBar");
    			add_location(input, file$2, 168, 4, 5164);
    			set_style(div1, "padding", "0 12px");
    			add_location(div1, file$2, 167, 2, 5129);
    			attr_dev(ul, "style", "");
    			add_location(ul, file$2, 175, 4, 5565);
    			attr_dev(div2, "class", "chat-list");
    			set_style(div2, "height", "calc(100vh-130px)");
    			add_location(div2, file$2, 170, 2, 5320);
    			set_style(div3, "height", "100vh");
    			set_style(div3, "width", "300px");
    			set_style(div3, "background-color", "#fff");
    			set_style(div3, "position", "relative");
    			set_style(div3, "float", "right");
    			set_style(div3, "box-shadow", "0px 1px 4px rgba(13, 22, 26, 0.08), 0px 4px 16px rgba(13, 22, 26, 0.12), 0px 2px 12px rgba(13, 22, 26, 0.08)");
    			add_location(div3, file$2, 158, 0, 4414);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, button);
    			append_dev(button, img);
    			append_dev(div0, t2);
    			append_dev(div0, h21);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*searchQuery*/ ctx[2]);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append_dev(ul, t6);
    			mount_component(infinitescroll, ul, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[7], false, false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[8]),
    					listen_dev(input, "input", /*searchList*/ ctx[6], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*searchQuery*/ 4 && input.value !== /*searchQuery*/ ctx[2]) {
    				set_input_value(input, /*searchQuery*/ ctx[2]);
    			}

    			if (dirty & /*dispatch, data*/ 17) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t6);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const infinitescroll_changes = {};
    			if (dirty & /*newBatch*/ 2) infinitescroll_changes.hasMore = /*newBatch*/ ctx[1].length;
    			infinitescroll.$set(infinitescroll_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(infinitescroll.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(infinitescroll.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			destroy_component(infinitescroll);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('chat-listing', slots, []);
    	const dispatch = createEventDispatcher();
    	let searchQuery = '';
    	let page = 1;

    	// but most likely, you'll have to store a token to fetch the next page
    	let nextUrl = '';

    	// store all the data here.
    	let data = []; // {
    	//   id: 1689256846764,
    	//   organisation_office_id: 1668510062923,

    	// store the new batch of data here.
    	let newBatch = [];

    	const headers = {
    		'Authorization': 'Token 8379abbf7b54c8c7fff828719c8df3deb909cb7029ee5545b3bc8586fef6a245'
    	};

    	const fetchData = () => {
    		const payload = {
    			organisation_office_id: parseInt(getPersonOrgOfficeId()),
    			app_type: "CITIZEN",
    			is_partner: false,
    			list_type: "all",
    			page_number: page,
    			page_size: 20,
    			is_partner: false,
    			status: null,
    			search_val: searchQuery
    		};

    		axios$1.post('https://test.cleandesk.co.in/api/v2/hd/ticket/list', { ...payload }, { headers }).then(response => {
    			$$invalidate(1, newBatch = response.data.rows);
    		}).catch(error => {
    			console.error(error);
    		});
    	};

    	// $: if(searchQuery) {
    	//   data=[];
    	//   setTimeout(() => {
    	//     fetchData(searchQuery);
    	//   }, 1000);
    	// }
    	const searchList = () => {
    		console.log('seatch list');
    		$$invalidate(0, data = []);

    		setTimeout(
    			() => {
    				fetchData();
    			},
    			1000
    		);
    	};

    	onMount(() => {
    		// load first batch onMount
    		// TODO uncomment this and all fetchData() calls
    		fetchData();
    	}); // fetchMessageList();

    	const selectMessageItem = item => {
    		selectedMessage.set(item);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<chat-listing> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch('startNewChat');

    	function input_input_handler() {
    		searchQuery = this.value;
    		$$invalidate(2, searchQuery);
    	}

    	const click_handler_1 = item => dispatch('selectedItem', item);

    	const loadMore_handler = () => {
    		$$invalidate(3, page++, page);
    		fetchData();
    	};

    	$$self.$capture_state = () => ({
    		axios: axios$1,
    		onMount,
    		InfiniteScroll,
    		MessageListing,
    		createEventDispatcher,
    		getPersonOrgOfficeId,
    		dispatch,
    		searchQuery,
    		page,
    		nextUrl,
    		data,
    		newBatch,
    		headers,
    		fetchData,
    		searchList,
    		selectMessageItem
    	});

    	$$self.$inject_state = $$props => {
    		if ('searchQuery' in $$props) $$invalidate(2, searchQuery = $$props.searchQuery);
    		if ('page' in $$props) $$invalidate(3, page = $$props.page);
    		if ('nextUrl' in $$props) nextUrl = $$props.nextUrl;
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('newBatch' in $$props) $$invalidate(1, newBatch = $$props.newBatch);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, newBatch*/ 3) {
    			$$invalidate(0, data = [...data, ...newBatch]);
    		}

    		if ($$self.$$.dirty & /*data*/ 1) {
    			//   person_id: 1673244394359,
    			//   title: "Havinesh  Saravanann",
    			//   person_avatar: '/media/person/profile/1668509937389/1685011029653_1819.jpg',
    			//   citizen_designation: null,
    			//   citizen_department: null,
    			//   subject: null,
    			//   content: null,
    			//   current_status_id: null,
    			//   category_id: null,
    			//   priority_id: null,
    			//   priority_name: null,
    			//   tier_id: null,
    			//   current_status_name: null,
    			//   category_name: null,
    			//   ticket_id: null,
    			//   tier_color: null,
    			//   priority_color: null,
    			//   created_at: 1689256846763,
    			//   mobile: "971771037723",
    			//   agent_name: " ",
    			//   agent_avatar: null,
    			//   agent_responsible_id: null,
    			//   tier_name: null,
    			//   timespan: null,
    			//   unread_count: 1,
    			//   is_picked: false,
    			//   last_comment: {
    			//     id: 1689256913911,
    			//     content: "hi",
    			//     is_reply: 0,
    			//     media_url: null,
    			//     person_id: 1673244394359,
    			//     created_at: 1689256913910,
    			//     media_type: null,
    			//     content_type: "text",
    			//     ticket_main_id: 1689256846764,
    			//     media_mime_type: null,
    			//     original_comment_id: null,
    			//     original_comment_content: null,
    			//     original_comment_media_url: null,
    			//     original_comment_media_type: null,
    			//     original_comment_content_type: null,
    			//     original_comment_media_mime_type: null,
    			//   },
    			//   rating_given_by_customer: "0",
    			//   rating_given_by_agent: "0",
    			//   app_type: "CITIZEN",
    			//   last_comment_created_at: 1689256913910,
    			// },
    			console.log(data, 'data of chat listing');
    		}
    	};

    	return [
    		data,
    		newBatch,
    		searchQuery,
    		page,
    		dispatch,
    		fetchData,
    		searchList,
    		click_handler,
    		input_input_handler,
    		click_handler_1,
    		loadMore_handler
    	];
    }

    class ChatListing extends SvelteElement {
    	constructor(options) {
    		super();

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$2,
    			create_fragment$2,
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

    customElements.define("chat-listing", ChatListing);

    /* src/components/ChatWidget/ChatWidget.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/components/ChatWidget/ChatWidget.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    // (305:8) {#if messageLoading === true}
    function create_if_block_4(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "bounce1");
    			add_location(div0, file$1, 307, 16, 9808);
    			attr_dev(div1, "class", "bounce2");
    			add_location(div1, file$1, 308, 16, 9852);
    			attr_dev(div2, "class", "bounce3");
    			add_location(div2, file$1, 309, 16, 9896);
    			attr_dev(div3, "class", "spinner");
    			add_location(div3, file$1, 306, 14, 9770);
    			set_style(div4, "background-color", "#f3f2f2");
    			set_style(div4, "padding", "12px");
    			set_style(div4, "margin", "10px");
    			set_style(div4, "width", "50px");
    			set_style(div4, "border-radius", "8px");
    			add_location(div4, file$1, 305, 12, 9654);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(305:8) {#if messageLoading === true}",
    		ctx
    	});

    	return block;
    }

    // (315:10) {#if message.media_type === 'application/pdf'}
    function create_if_block_3(ctx) {
    	let div;
    	let a;
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t = text("Click here to open pdf");
    			attr_dev(a, "href", a_href_value = DOMAIN + /*message*/ ctx[28].media_url);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener noreferrer");
    			add_location(a, file$1, 316, 14, 10208);
    			set_style(div, "cursor", "pointer");
    			set_style(div, "font-size", "12px");
    			set_style(div, "justify-content", "center");
    			set_style(div, "display", "flex");
    			set_style(div, "margin-bottom", "10px");
    			add_location(div, file$1, 315, 12, 10085);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 4 && a_href_value !== (a_href_value = DOMAIN + /*message*/ ctx[28].media_url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(315:10) {#if message.media_type === 'application/pdf'}",
    		ctx
    	});

    	return block;
    }

    // (338:12) {:else}
    function create_else_block(ctx) {
    	let div4;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let t1_value = /*message*/ ctx[28]?.title + "";
    	let t1;
    	let t2;
    	let div3;
    	let p;
    	let t3_value = /*message*/ ctx[28]?.content + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div3 = element("div");
    			p = element("p");
    			t3 = text(t3_value);
    			if (!src_url_equal(img.src, img_src_value = DOMAIN + /*message*/ ctx[28]?.person_avatar)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "a");
    			set_style(img, "height", "24px");
    			set_style(img, "border-radius", "50%");
    			set_style(img, "margin-right", "8px");
    			add_location(img, file$1, 343, 18, 11852);
    			attr_dev(div0, "class", "chat-header-avatar");
    			set_style(div0, "display", "flex");
    			set_style(div0, "align-items", "center");
    			add_location(div0, file$1, 342, 16, 11757);
    			attr_dev(div1, "class", "header-profile-name");
    			attr_dev(div1, "style", "");
    			add_location(div1, file$1, 345, 16, 12004);
    			attr_dev(div2, "class", "chat-header");
    			set_style(div2, "display", "flex");
    			set_style(div2, "align-items", "center");
    			add_location(div2, file$1, 341, 14, 11671);
    			set_style(p, "margin", "0");
    			set_style(p, "font-size", "12px");
    			add_location(p, file$1, 349, 16, 12257);
    			attr_dev(div3, "class", "message-item-body");
    			set_style(div3, "padding", "8px");
    			add_location(div3, file$1, 348, 14, 12187);
    			set_style(div4, "background-color", "#e2e7fb");
    			set_style(div4, "padding", "12px");
    			set_style(div4, "margin", "10px 10px 10px auto");
    			set_style(div4, "width", "280px");
    			set_style(div4, "border-radius", "8px");
    			add_location(div4, file$1, 340, 12, 11539);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 4 && !src_url_equal(img.src, img_src_value = DOMAIN + /*message*/ ctx[28]?.person_avatar)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*messages*/ 4 && t1_value !== (t1_value = /*message*/ ctx[28]?.title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*messages*/ 4 && t3_value !== (t3_value = /*message*/ ctx[28]?.content + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(338:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (321:10) {#if message.person_id !== $userDetails?.id}
    function create_if_block_2$1(ctx) {
    	let div4;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let t1_value = /*message*/ ctx[28]?.title + "";
    	let t1;
    	let t2;
    	let div3;
    	let p;
    	let t3_value = /*message*/ ctx[28]?.content + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div3 = element("div");
    			p = element("p");
    			t3 = text(t3_value);
    			if (!src_url_equal(img.src, img_src_value = DOMAIN + /*message*/ ctx[28]?.person_avatar)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "a");
    			set_style(img, "height", "24px");
    			set_style(img, "border-radius", "50%");
    			set_style(img, "margin-right", "8px");
    			add_location(img, file$1, 326, 18, 10883);
    			attr_dev(div0, "class", "chat-header-avatar");
    			set_style(div0, "display", "flex");
    			set_style(div0, "align-items", "center");
    			add_location(div0, file$1, 325, 16, 10788);
    			attr_dev(div1, "class", "header-profile-name");
    			attr_dev(div1, "style", "");
    			add_location(div1, file$1, 328, 16, 11035);
    			attr_dev(div2, "class", "chat-header");
    			set_style(div2, "display", "flex");
    			set_style(div2, "align-items", "center");
    			add_location(div2, file$1, 324, 14, 10702);
    			set_style(p, "margin", "0");
    			set_style(p, "font-size", "12px");
    			add_location(p, file$1, 332, 16, 11288);
    			attr_dev(div3, "class", "message-item-body");
    			set_style(div3, "padding", "8px");
    			add_location(div3, file$1, 331, 14, 11218);
    			set_style(div4, "background-color", "#f3f2f2");
    			set_style(div4, "padding", "12px");
    			set_style(div4, "margin", "10px");
    			set_style(div4, "width", "280px");
    			set_style(div4, "border-radius", "8px");
    			add_location(div4, file$1, 322, 12, 10546);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 4 && !src_url_equal(img.src, img_src_value = DOMAIN + /*message*/ ctx[28]?.person_avatar)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*messages*/ 4 && t1_value !== (t1_value = /*message*/ ctx[28]?.title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*messages*/ 4 && t3_value !== (t3_value = /*message*/ ctx[28]?.content + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(321:10) {#if message.person_id !== $userDetails?.id}",
    		ctx
    	});

    	return block;
    }

    // (314:8) {#each messages as message}
    function create_each_block(ctx) {
    	let t0;
    	let t1;
    	let if_block0 = /*message*/ ctx[28].media_type === 'application/pdf' && create_if_block_3(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*message*/ ctx[28].person_id !== /*$userDetails*/ ctx[7]?.id) return create_if_block_2$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if_block1.c();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*message*/ ctx[28].media_type === 'application/pdf') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(314:8) {#each messages as message}",
    		ctx
    	});

    	return block;
    }

    // (393:2) {#if isChatListVisible}
    function create_if_block_1$1(ctx) {
    	let chatlisting;
    	let current;
    	chatlisting = new ChatListing({ $$inline: true });
    	chatlisting.$on("selectedItem", /*selectedItem_handler*/ ctx[17]);
    	chatlisting.$on("startNewChat", /*startNewConversation*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(chatlisting.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(chatlisting, target, anchor);
    			current = true;
    		},
    		p: noop$2,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chatlisting.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chatlisting.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chatlisting, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(393:2) {#if isChatListVisible}",
    		ctx
    	});

    	return block;
    }

    // (401:0) {#if isVisible}
    function create_if_block$1(ctx) {
    	let button;
    	let t;
    	let button_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("x");
    			attr_dev(button, "class", "close-widget-button");

    			attr_dev(button, "style", button_style_value = /*isChatListVisible*/ ctx[5]
    			? 'right: 320px'
    			: 'right: 20px');

    			add_location(button, file$1, 402, 2, 14645);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[18], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*isChatListVisible*/ 32 && button_style_value !== (button_style_value = /*isChatListVisible*/ ctx[5]
    			? 'right: 320px'
    			: 'right: 20px')) {
    				attr_dev(button, "style", button_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(401:0) {#if isVisible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div6;
    	let chatheader;
    	let t0;
    	let div1;
    	let div0;
    	let t1;
    	let t2;
    	let div5;
    	let div3;
    	let form;
    	let div2;
    	let button0;
    	let t4;
    	let input;
    	let t5;
    	let button1;
    	let t7;
    	let button2;
    	let t9;
    	let div4;
    	let a;
    	let p;
    	let t11;
    	let img;
    	let img_src_value;
    	let div6_style_value;
    	let t12;
    	let t13;
    	let if_block2_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	chatheader = new ChatHeader({ $$inline: true });
    	let if_block0 = /*messageLoading*/ ctx[3] === true && create_if_block_4(ctx);
    	let each_value = /*messages*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block1 = /*isChatListVisible*/ ctx[5] && create_if_block_1$1(ctx);
    	let if_block2 = /*isVisible*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			create_component(chatheader.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div5 = element("div");
    			div3 = element("div");
    			form = element("form");
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "😊";
    			t4 = space();
    			input = element("input");
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "+";
    			t7 = space();
    			button2 = element("button");
    			button2.textContent = "➤";
    			t9 = space();
    			div4 = element("div");
    			a = element("a");
    			p = element("p");
    			p.textContent = "Powered by CleanDesk Ai";
    			t11 = space();
    			img = element("img");
    			t12 = space();
    			if (if_block1) if_block1.c();
    			t13 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty$2();
    			this.c = noop$2;
    			attr_dev(div0, "class", "smith-conversation-container");
    			set_style(div0, "display", "flex");
    			set_style(div0, "overflow-y", "scroll");
    			set_style(div0, "flex-direction", "column-reverse");
    			add_location(div0, file$1, 303, 6, 9436);
    			attr_dev(div1, "class", "smith-chat-body");
    			set_style(div1, "height", "424px");
    			add_location(div1, file$1, 300, 4, 9121);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn send-btn");
    			set_style(button0, "border-radius", "50%");
    			add_location(button0, file$1, 373, 10, 13183);
    			attr_dev(input, "placeholder", "Type your message");
    			attr_dev(input, "rows", "1");
    			attr_dev(input, "name", "message-to-send");
    			attr_dev(input, "id", "message-to-send");
    			set_style(input, "width", "100%");
    			set_style(input, "border", "none");
    			set_style(input, "outline", "none");
    			add_location(input, file$1, 374, 10, 13278);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn send-btn");
    			set_style(button1, "border-radius", "50%");
    			add_location(button1, file$1, 376, 12, 13603);
    			set_style(div2, "margin-right", "20px");
    			set_style(div2, "border-radius", "20px");
    			set_style(div2, "height", "35px");
    			set_style(div2, "display", "flex");
    			set_style(div2, "background-color", "#fff");
    			set_style(div2, "align-items", "center");
    			set_style(div2, "width", "100%");
    			add_location(div2, file$1, 371, 8, 13023);
    			attr_dev(button2, "type", "sumbit");
    			attr_dev(button2, "class", "btn send-btn");
    			set_style(button2, "height", "35px");
    			set_style(button2, "border-radius", "50%");
    			add_location(button2, file$1, 379, 12, 13775);
    			set_style(form, "display", "flex");
    			set_style(form, "width", "100%");
    			add_location(form, file$1, 370, 8, 12934);
    			attr_dev(div3, "class", "smith-chat-bar-message");
    			add_location(div3, file$1, 364, 6, 12654);
    			set_style(p, "padding", "6px");
    			set_style(p, "margin", "0px");
    			set_style(p, "font-size", "12px");
    			add_location(p, file$1, 384, 10, 14190);
    			if (!src_url_equal(img.src, img_src_value = "https://hsbd.test.cleandesk.co.in/logo96tranparent.png?x=10000000")) attr_dev(img, "src", img_src_value);
    			set_style(img, "height", "24px");
    			set_style(img, "margin-right", "8px");
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 385, 10, 14282);
    			attr_dev(a, "href", "https://cleandesk.co.in");
    			set_style(a, "text-decoration", "none");
    			set_style(a, "color", "#000");
    			set_style(a, "display", "flex");
    			set_style(a, "align-items", "center");
    			add_location(a, file$1, 383, 8, 14066);
    			attr_dev(div4, "class", "widget-footer");
    			set_style(div4, "background-color", "#E0DEDE");
    			set_style(div4, "height", "20px padding: 10px");
    			set_style(div4, "display", "flex");
    			set_style(div4, "align-items", "center");
    			set_style(div4, "justify-content", "end");
    			add_location(div4, file$1, 382, 6, 13909);
    			attr_dev(div5, "class", "smith-chat-bar");
    			add_location(div5, file$1, 363, 4, 12619);
    			attr_dev(div6, "class", "chat-widget-container");

    			attr_dev(div6, "style", div6_style_value = /*isChatListVisible*/ ctx[5]
    			? 'right: 320px'
    			: 'right: 20px');

    			add_location(div6, file$1, 297, 0, 9000);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			mount_component(chatheader, div6, null);
    			append_dev(div6, t0);
    			append_dev(div6, div1);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			/*div0_binding*/ ctx[14](div0);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, form);
    			append_dev(form, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t4);
    			append_dev(div2, input);
    			set_input_value(input, /*textareaValue*/ ctx[4]);
    			append_dev(div2, t5);
    			append_dev(div2, button1);
    			append_dev(form, t7);
    			append_dev(form, button2);
    			append_dev(div5, t9);
    			append_dev(div5, div4);
    			append_dev(div4, a);
    			append_dev(a, p);
    			append_dev(a, t11);
    			append_dev(a, img);
    			insert_dev(target, t12, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t13, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "scroll", /*handleScroll*/ ctx[11], false, false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[15]),
    					listen_dev(button1, "click", /*click_handler*/ ctx[16], false, false, false, false),
    					listen_dev(form, "submit", prevent_default(/*sendMessage*/ ctx[10]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*messageLoading*/ ctx[3] === true) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div0, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*messages, DOMAIN, $userDetails*/ 132) {
    				each_value = /*messages*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*textareaValue*/ 16 && input.value !== /*textareaValue*/ ctx[4]) {
    				set_input_value(input, /*textareaValue*/ ctx[4]);
    			}

    			if (!current || dirty & /*isChatListVisible*/ 32 && div6_style_value !== (div6_style_value = /*isChatListVisible*/ ctx[5]
    			? 'right: 320px'
    			: 'right: 20px')) {
    				attr_dev(div6, "style", div6_style_value);
    			}

    			if (/*isChatListVisible*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*isChatListVisible*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t13.parentNode, t13);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*isVisible*/ ctx[0]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chatheader.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chatheader.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(chatheader);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks, detaching);
    			/*div0_binding*/ ctx[14](null);
    			if (detaching) detach_dev(t12);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t13);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $userDetails;
    	validate_store(userDetails, 'userDetails');
    	component_subscribe($$self, userDetails, $$value => $$invalidate(7, $userDetails = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('chat-widget-container', slots, []);
    	let { isVisible } = $$props;
    	const dispatch = createEventDispatcher();
    	const chatSocket = io("https://support.foop.com", { query: { token: getAuthKey() } });
    	let messages = [];
    	let messageLoading = false;
    	let ticketMainId = null;
    	let textareaValue = '';
    	let page = 1;
    	let totalMessages = 0;
    	let newBatch = [];
    	let isChatListVisible = false;
    	let selectedMessage = null;
    	let chatContainer;
    	let scrollTop = 0;
    	let scrollHeight = 0;
    	let clientHeight = 0;

    	//   content: null,
    	//   is_media_available: null,
    	//   is_location_available: null,
    	//   latitude: null,
    	//   longitude: null,
    	//   locality: null,
    	//   address: null,
    	//   category_id: null,
    	//   required_inputs: null,
    	//   ticket_id: null,
    	// });
    	const startNewConversation = () => {
    		page = 1;
    		$$invalidate(2, messages = []);
    		$$invalidate(1, selectedMessage = null);

    		chatSocket.emit("chat_ai_ticket_message_v2", {
    			app_type: "CITIZEN",
    			organisation_office_id: getPersonOrgOfficeId(),
    			constituency_id: 1,
    			ticket_main_id: null,
    			person_id: getPersonId(),
    			content: null,
    			is_media_available: null,
    			is_location_available: null,
    			latitude: null,
    			longitude: null,
    			locality: null,
    			address: null,
    			category_id: null,
    			required_inputs: null,
    			ticket_id: null
    		});
    	};

    	let exectuted = false;

    	if (!exectuted) {
    		exectuted = true;

    		chatSocket.emit("chat_ai_ticket_message_v2", {
    			app_type: "CITIZEN",
    			organisation_office_id: getPersonOrgOfficeId(),
    			constituency_id: 1,
    			ticket_main_id: null,
    			person_id: getPersonId(),
    			content: null,
    			is_media_available: null,
    			is_location_available: null,
    			latitude: null,
    			longitude: null,
    			locality: null,
    			address: null,
    			category_id: null,
    			required_inputs: null,
    			ticket_id: null
    		});
    	}

    	onMount(() => {
    		chatContainer.addEventListener('scroll', handleScroll);
    		console.log(chatSocket, 'chatSocket');

    		chatSocket.on("connect", () => {
    			console.log(chatSocket.connected);
    		});

    		console.log('onMount');
    	}); // chatSocket.emit("chat_ai_ticket_message_v2", {
    	//   app_type: "CITIZEN",
    	//   organisation_office_id: getPersonOrgOfficeId(),
    	//   constituency_id: 1,

    	//   ticket_main_id: null,
    	//   person_id: getPersonId(),
    	//   content: null,
    	//   is_media_available: null,
    	//   is_location_available: null,
    	//   latitude: null,
    	//   longitude: null,
    	//   locality: null,
    	//   address: null,
    	//   category_id: null,
    	//   required_inputs: null,
    	//   ticket_id: null,
    	// });
    	// console.log('hi from chat widget')
    	chatSocket.on('chat_ai_ticket_message_v2', data => {
    		if (data.person_id !== parseInt(getPersonId())) {
    			console.log('different id');
    			$$invalidate(3, messageLoading = false);
    			$$invalidate(2, messages = [data, ...messages]);
    		} else console.log('same id'); // messages = [...messages, data]

    		if (messages.length === 1) {
    			$$invalidate(12, ticketMainId = data.ticket_main_id);
    		}

    		console.log(messages);
    	});

    	console.log('hi from chat widget');

    	const sendMessage = () => {
    		console.log(textareaValue);

    		chatSocket.emit("chat_ai_ticket_message_v2", {
    			app_type: "CITIZEN",
    			organisation_office_id: getPersonOrgOfficeId(),
    			constituency_id: 1,
    			ticket_main_id: ticketMainId,
    			// ticket_main_id: 1689543928886,
    			person_id: getPersonId(),
    			content: textareaValue,
    			is_media_available: null,
    			is_location_available: null,
    			latitude: null,
    			longitude: null,
    			locality: null,
    			address: null,
    			category_id: null,
    			required_inputs: null,
    			ticket_id: null
    		});

    		$$invalidate(2, messages = [
    			{
    				content: textareaValue,
    				person_id: parseInt(getPersonId()),
    				title: $userDetails?.first_name + ' ' + $userDetails?.last_name,
    				person_avatar: $userDetails?.profile_image,
    				id: new Date().getTime(),
    				created_at: new Date().getTime()
    			},
    			...messages
    		]);

    		// messages = [...messages, { content: textareaValue, person_id: parseInt(getPersonId()), title: $userDetails?.first_name + ' ' + $userDetails?.last_name, person_avatar: $userDetails?.profile_image, id: new Date().getTime(), created_at: new Date().getTime()}]
    		$$invalidate(4, textareaValue = '');

    		$$invalidate(3, messageLoading = true);
    		console.log(messages);
    	};

    	// const scrollToBottom = node => {
    	// 	const scroll = () => node.scroll({
    	// 		top: node.scrollHeight,
    	// 		behavior: 'smooth',
    	// 	});
    	// 	scroll();
    	// 	return { update: scroll }
    	// };
    	function handleScroll(event) {
    		scrollTop = chatContainer.scrollTop;
    		scrollTop = Math.abs(scrollTop);
    		scrollHeight = chatContainer.scrollHeight;
    		clientHeight = chatContainer.clientHeight;
    		let havinesh = scrollHeight - clientHeight;

    		if (scrollTop === havinesh && newBatch.length > 0) {
    			console.log('load more');
    			page++;
    			fetchMessageList();
    		}
    	}

    	const fetchMessageList = () => {
    		const headers = {
    			'Authorization': 'Token 8379abbf7b54c8c7fff828719c8df3deb909cb7029ee5545b3bc8586fef6a245'
    		};

    		const payload = {
    			search_val: null,
    			page_size: 10,
    			page_number: page,
    			// ticket_main_id: 1689543928886,
    			ticket_main_id: ticketMainId,
    			applicable_to: "citizen"
    		};

    		axios$1.post('https://test.cleandesk.co.in/api/v1/hd/ticket/comments/list', { ...payload }, { headers }).then(response => {
    			console.log(response.data);
    			newBatch = response.data.rows;

    			// messages.update((data) => {
    			//   return [...data, ...newBatch];
    			// });
    			$$invalidate(2, messages = [...messages, ...newBatch]);

    			totalMessages = response.data.total;
    			console.log(messages);
    		}).catch(error => {
    			console.error(error); // messages = [...messages, response.data.rows];
    		});

    		console.log('fetchTicketList');
    	};

    	function infiniteHandler({ detail: { loaded, complete } }) {
    		fetch(`${api}&page=${page}`).then(response => response.json()).then(data => {
    			console.log(data);

    			if (data.length) {
    				page += 1;
    				list = [...data.reverse(), ...list];
    				loaded();
    			} else {
    				complete();
    			}
    		});

    		const headers = {
    			'Authorization': 'Token 8379abbf7b54c8c7fff828719c8df3deb909cb7029ee5545b3bc8586fef6a245'
    		};

    		const payload = {
    			search_val: null,
    			page_size: 5,
    			page_number: page,
    			ticket_main_id: 1689543928886,
    			// ticket_main_id: item.id,
    			applicable_to: "citizen"
    		};

    		axios$1.post('https://test.cleandesk.co.in/api/v1/hd/ticket/comments/list', { ...payload }, { headers }).then(response => {
    			if (response.data.rows.length) {
    				page += 1;

    				// messages.update((data) => {
    				//   return [ ...response.data.rows.reverse(), ...messages];
    				// });
    				$$invalidate(2, messages = [...messages, ...newBatch]);

    				loaded();
    			} else {
    				complete();
    			}
    		}); // console.log(response.data);
    		// messages.update((data) => {
    		//   return [...data, ...response.data.rows];
    		// });

    		// totalMessages = response.data.total;
    		// console.log(messages);
    		// messages = [...messages, response.data.rows];
    		console.log('fetchTicketList');
    	}

    	$$self.$$.on_mount.push(function () {
    		if (isVisible === undefined && !('isVisible' in $$props || $$self.$$.bound[$$self.$$.props['isVisible']])) {
    			console_1$1.warn("<chat-widget-container> was created without expected prop 'isVisible'");
    		}
    	});

    	const writable_props = ['isVisible'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<chat-widget-container> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			chatContainer = $$value;
    			$$invalidate(6, chatContainer);
    		});
    	}

    	function input_input_handler() {
    		textareaValue = this.value;
    		$$invalidate(4, textareaValue);
    	}

    	const click_handler = () => $$invalidate(5, isChatListVisible = !isChatListVisible);
    	const selectedItem_handler = item => $$invalidate(1, selectedMessage = item.detail);
    	const click_handler_1 = () => dispatch('closeWidget', true);

    	$$self.$$set = $$props => {
    		if ('isVisible' in $$props) $$invalidate(0, isVisible = $$props.isVisible);
    	};

    	$$self.$capture_state = () => ({
    		isVisible,
    		io,
    		onMount,
    		getAuthKey,
    		getPersonId,
    		getPersonOrgOfficeId,
    		userDetails,
    		DOMAIN,
    		ChatHeader,
    		ReverseInfiniteScroll,
    		axios: axios$1,
    		InfiniteScroll,
    		ChatListing,
    		createEventDispatcher,
    		dispatch,
    		chatSocket,
    		messages,
    		messageLoading,
    		ticketMainId,
    		textareaValue,
    		page,
    		totalMessages,
    		newBatch,
    		isChatListVisible,
    		selectedMessage,
    		chatContainer,
    		scrollTop,
    		scrollHeight,
    		clientHeight,
    		startNewConversation,
    		exectuted,
    		sendMessage,
    		handleScroll,
    		fetchMessageList,
    		infiniteHandler,
    		$userDetails
    	});

    	$$self.$inject_state = $$props => {
    		if ('isVisible' in $$props) $$invalidate(0, isVisible = $$props.isVisible);
    		if ('messages' in $$props) $$invalidate(2, messages = $$props.messages);
    		if ('messageLoading' in $$props) $$invalidate(3, messageLoading = $$props.messageLoading);
    		if ('ticketMainId' in $$props) $$invalidate(12, ticketMainId = $$props.ticketMainId);
    		if ('textareaValue' in $$props) $$invalidate(4, textareaValue = $$props.textareaValue);
    		if ('page' in $$props) page = $$props.page;
    		if ('totalMessages' in $$props) totalMessages = $$props.totalMessages;
    		if ('newBatch' in $$props) newBatch = $$props.newBatch;
    		if ('isChatListVisible' in $$props) $$invalidate(5, isChatListVisible = $$props.isChatListVisible);
    		if ('selectedMessage' in $$props) $$invalidate(1, selectedMessage = $$props.selectedMessage);
    		if ('chatContainer' in $$props) $$invalidate(6, chatContainer = $$props.chatContainer);
    		if ('scrollTop' in $$props) scrollTop = $$props.scrollTop;
    		if ('scrollHeight' in $$props) scrollHeight = $$props.scrollHeight;
    		if ('clientHeight' in $$props) clientHeight = $$props.clientHeight;
    		if ('exectuted' in $$props) $$invalidate(13, exectuted = $$props.exectuted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selectedMessage, ticketMainId*/ 4098) {
    			// $: console.log(selectedMessage, 'selectedMessage')
    			{
    				if (!!selectedMessage) {
    					$$invalidate(2, messages = []);
    					page = 1;
    					$$invalidate(12, ticketMainId = selectedMessage.id);
    					console.log(ticketMainId, 'ticketMainId');
    					fetchMessageList();
    				} else {
    					console.log('from else');
    					//   app_type: "CITIZEN",
    				} //   organisation_office_id: getPersonOrgOfficeId(),
    				//   constituency_id: 1,
    			} //   ticket_main_id: null,
    			//   person_id: getPersonId(),
    		}
    	};

    	return [
    		isVisible,
    		selectedMessage,
    		messages,
    		messageLoading,
    		textareaValue,
    		isChatListVisible,
    		chatContainer,
    		$userDetails,
    		dispatch,
    		startNewConversation,
    		sendMessage,
    		handleScroll,
    		ticketMainId,
    		exectuted,
    		div0_binding,
    		input_input_handler,
    		click_handler,
    		selectedItem_handler,
    		click_handler_1
    	];
    }

    class ChatWidget extends SvelteElement {
    	constructor(options) {
    		super();
    		

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{ isVisible: 0 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["isVisible"];
    	}

    	get isVisible() {
    		return this.$$.ctx[0];
    	}

    	set isVisible(isVisible) {
    		this.$$set({ isVisible });
    		flush();
    	}
    }

    customElements.define("chat-widget-container", ChatWidget);

    /* src/FinalApp.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file = "src/FinalApp.svelte";

    // (61:0) {#if !isVisible}
    function create_if_block_2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Chat";
    			attr_dev(button, "class", "cleandesk-launcher-frame");
    			add_location(button, file, 61, 2, 1860);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*showChatWidget*/ ctx[8], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(61:0) {#if !isVisible}",
    		ctx
    	});

    	return block;
    }

    // (68:0) {#if firstOpen === true}
    function create_if_block_1(ctx) {
    	let authmainfinal;
    	let current;

    	authmainfinal = new AuthMainFinal({
    			props: {
    				app_id: /*app_id*/ ctx[0],
    				app_secret: /*app_secret*/ ctx[1],
    				customer_id: /*customer_id*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(authmainfinal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(authmainfinal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const authmainfinal_changes = {};
    			if (dirty & /*app_id*/ 1) authmainfinal_changes.app_id = /*app_id*/ ctx[0];
    			if (dirty & /*app_secret*/ 2) authmainfinal_changes.app_secret = /*app_secret*/ ctx[1];
    			if (dirty & /*customer_id*/ 4) authmainfinal_changes.customer_id = /*customer_id*/ ctx[2];
    			authmainfinal.$set(authmainfinal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(authmainfinal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(authmainfinal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(authmainfinal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(68:0) {#if firstOpen === true}",
    		ctx
    	});

    	return block;
    }

    // (72:0) {#if $isAuthenticated === true}
    function create_if_block(ctx) {
    	let div;
    	let chatwidget;
    	let div_style_value;
    	let current;

    	chatwidget = new ChatWidget({
    			props: { isVisible: /*isVisible*/ ctx[4] },
    			$$inline: true
    		});

    	chatwidget.$on("closeWidget", /*closeWidget_handler*/ ctx[9]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(chatwidget.$$.fragment);

    			attr_dev(div, "style", div_style_value = /*isVisible*/ ctx[4]
    			? 'display: block'
    			: 'display: none');

    			add_location(div, file, 72, 2, 2071);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(chatwidget, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const chatwidget_changes = {};
    			if (dirty & /*isVisible*/ 16) chatwidget_changes.isVisible = /*isVisible*/ ctx[4];
    			chatwidget.$set(chatwidget_changes);

    			if (!current || dirty & /*isVisible*/ 16 && div_style_value !== (div_style_value = /*isVisible*/ ctx[4]
    			? 'display: block'
    			: 'display: none')) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chatwidget.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chatwidget.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(chatwidget);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(72:0) {#if $isAuthenticated === true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let span1;
    	let span0;
    	let div0;
    	let div1;
    	let p;
    	let ul;
    	let t3;
    	let li;
    	let current;
    	let if_block0 = !/*isVisible*/ ctx[4] && create_if_block_2(ctx);
    	let if_block1 = /*firstOpen*/ ctx[5] === true && create_if_block_1(ctx);
    	let if_block2 = /*$isAuthenticated*/ ctx[3] === true && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			span1 = element("span");
    			span0 = element("span");
    			div0 = element("div");
    			div1 = element("div");
    			p = element("p");
    			ul = element("ul");
    			t3 = space();
    			li = element("li");
    			this.c = noop$2;
    			attr_dev(span0, "class", /*cssKeep*/ ctx[6]);
    			add_location(span0, file, 80, 45, 2289);
    			add_location(div0, file, 80, 69, 2313);
    			attr_dev(div1, "id", /*cssJsKeep*/ ctx[7]);
    			add_location(div1, file, 80, 80, 2324);
    			add_location(p, file, 80, 106, 2350);
    			add_location(ul, file, 80, 113, 2357);
    			add_location(li, file, 80, 123, 2367);
    			set_style(span1, "display", "none");
    			attr_dev(span1, "class", /*cssKeep*/ ctx[6]);
    			add_location(span1, file, 80, 0, 2244);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, span0);
    			append_dev(span1, div0);
    			append_dev(span1, div1);
    			append_dev(span1, p);
    			append_dev(span1, ul);
    			append_dev(span1, t3);
    			append_dev(span1, li);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*isVisible*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*firstOpen*/ ctx[5] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*firstOpen*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*$isAuthenticated*/ ctx[3] === true) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*$isAuthenticated*/ 8) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span1);
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
    	let $isAuthenticated;
    	validate_store(isAuthenticated, 'isAuthenticated');
    	component_subscribe($$self, isAuthenticated, $$value => $$invalidate(3, $isAuthenticated = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('cleandesk-chat-widget', slots, []);
    	let { app_id = 1 } = $$props;
    	let { app_secret = 2 } = $$props;
    	let { customer_id = 4 } = $$props;

    	// let element = document.querySelector("route-package-tracker");
    	// function setShadowStyle(host, styleContent) {
    	//   var style = document.createElement("style");
    	//   style.innerHTML = styleContent;
    	//   host.shadowRoot.appendChild(style);
    	// }
    	// setShadowStyle(element, "@import './bundle.css'");
    	let cssKeep = "";

    	let cssJsKeep = "";

    	onMount(() => {
    		if (!!getAuthKey() && getPersonId() && getPersonOrgOfficeId() !== false) isAuthenticated.set(true);
    		console.log(app_id, app_secret, customer_id, 'finalapp');
    	});

    	// console.log(app_id, app_secret, customer_id, 'final app')
    	if (!!app_id === true) console.log('hi');

    	let isVisible = false;
    	let firstOpen = false;

    	function showChatWidget() {
    		$$invalidate(4, isVisible = !isVisible);
    		$$invalidate(5, firstOpen = true);
    	}

    	// onMount(() => {
    	//   if(!!getAuthKey() && getPersonId() && getPersonOrgOfficeId() !== false) isAuthenticated.set(true);
    	// })
    	let isUserAuthenticated = false;

    	console.log(isUserAuthenticated, 'isUserAuthenticated');
    	const writable_props = ['app_id', 'app_secret', 'customer_id'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<cleandesk-chat-widget> was created with unknown prop '${key}'`);
    	});

    	const closeWidget_handler = item => $$invalidate(4, isVisible = !item);

    	$$self.$$set = $$props => {
    		if ('app_id' in $$props) $$invalidate(0, app_id = $$props.app_id);
    		if ('app_secret' in $$props) $$invalidate(1, app_secret = $$props.app_secret);
    		if ('customer_id' in $$props) $$invalidate(2, customer_id = $$props.customer_id);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		getAuthKey,
    		getPersonId,
    		getPersonOrgOfficeId,
    		setAuthKey,
    		setPersonId,
    		setPersonOrgOfficeId,
    		AuthMainFinal,
    		Test,
    		isAuthenticated,
    		userDetails,
    		ChatWidget,
    		ChatListing,
    		app_id,
    		app_secret,
    		customer_id,
    		cssKeep,
    		cssJsKeep,
    		isVisible,
    		firstOpen,
    		showChatWidget,
    		isUserAuthenticated,
    		$isAuthenticated
    	});

    	$$self.$inject_state = $$props => {
    		if ('app_id' in $$props) $$invalidate(0, app_id = $$props.app_id);
    		if ('app_secret' in $$props) $$invalidate(1, app_secret = $$props.app_secret);
    		if ('customer_id' in $$props) $$invalidate(2, customer_id = $$props.customer_id);
    		if ('cssKeep' in $$props) $$invalidate(6, cssKeep = $$props.cssKeep);
    		if ('cssJsKeep' in $$props) $$invalidate(7, cssJsKeep = $$props.cssJsKeep);
    		if ('isVisible' in $$props) $$invalidate(4, isVisible = $$props.isVisible);
    		if ('firstOpen' in $$props) $$invalidate(5, firstOpen = $$props.firstOpen);
    		if ('isUserAuthenticated' in $$props) isUserAuthenticated = $$props.isUserAuthenticated;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$isAuthenticated*/ 8) {
    			{
    				isUserAuthenticated = $isAuthenticated;
    				console.log($isAuthenticated, 'isAuthenticated');
    			}
    		}
    	};

    	return [
    		app_id,
    		app_secret,
    		customer_id,
    		$isAuthenticated,
    		isVisible,
    		firstOpen,
    		cssKeep,
    		cssJsKeep,
    		showChatWidget,
    		closeWidget_handler
    	];
    }

    class FinalApp extends SvelteElement {
    	constructor(options) {
    		super();
    		const style = document.createElement('style');

    		style.textContent = `.havinesh{color:red}.cleandesk-launcher-frame{box-shadow:0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 2px 16px rgba(0, 18, 26, 0.16);z-index:2147482999 !important;position:fixed !important;bottom:20px;right:20px;height:56px !important;width:56px !important;border-radius:100px !important;overflow:hidden !important;background:#0000ff !important;color:#fff !important;opacity:0.9;transition:box-shadow 0.26s cubic-bezier(0.38, 0, 0.22, 1),
      opacity 0.26s ease-in-out}.cleandesk-launcher-frame:hover{cursor:pointer;box-shadow:0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 3px 12px rgba(0, 18, 26, 0.16), 0 2px 14px 0 rgba(0, 18, 26, 0.2);opacity:1}.close-widget-button{box-shadow:0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 2px 16px rgba(0, 18, 26, 0.16);z-index:2147482999 !important;position:fixed !important;bottom:590px;height:56px !important;width:56px !important;border-radius:100px !important;overflow:hidden !important;background:#0000ff !important;color:#fff !important;opacity:0.9;transition:box-shadow 0.26s cubic-bezier(0.38, 0, 0.22, 1),
      opacity 0.26s ease-in-out}.close-widget-button:hover{cursor:pointer;box-shadow:0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 3px 12px rgba(0, 18, 26, 0.16), 0 2px 14px 0 rgba(0, 18, 26, 0.2);opacity:1}p{font-weight:400;font-family:sans-serif}.chat-widget-container{position:fixed !important;bottom:20px;z-index:999999 !important;width:400px !important;height:560px !important;border-radius:8px !important;box-shadow:0px 1px 4px rgba(13, 22, 26, 0.08),
      0px 4px 16px rgba(13, 22, 26, 0.12), 0px 2px 12px rgba(13, 22, 26, 0.08);overflow:hidden;opacity:1 !important}.smith-chat-bar{position:absolute;bottom:0;width:100%;background-color:#f3f2f2}.smith-chat-bar-message{padding:12px;display:flex;align-items:center}.btn{font-weight:400;text-align:center;white-space:nowrap;vertical-align:middle;user-select:none;border:1px solid transparent;padding:0.375rem 0.75rem;font-size:14px;line-height:1.5;border-radius:2px;transition:color 0.15s ease-in-out, background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out}.send-btn{color:rgba(0, 18, 26, 0.59);background-color:#fff;border-color:#fff}.send-btn:hover{cursor:pointer;color:rgba(0, 18, 26, 0.93);background-color:#fff;border-color:#fff}.smith-chat-body{position:relative;flex:1;background-color:#fff;overflow:hidden auto}.smith-conversation-container{position:absolute;top:0;left:0;right:0;bottom:0}.smith-launcher-frame{box-shadow:0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 2px 16px rgba(0, 18, 26, 0.16);z-index:2147482999 !important;position:fixed !important;bottom:20px;right:20px;height:56px !important;width:56px !important;border-radius:100px !important;overflow:hidden !important;background:#0000ff !important;color:#fff !important;opacity:0.9;transition:box-shadow 0.26s cubic-bezier(0.38, 0, 0.22, 1),
      opacity 0.26s ease-in-out}.smith-launcher-frame:hover{cursor:pointer;box-shadow:0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 3px 12px rgba(0, 18, 26, 0.16), 0 2px 14px 0 rgba(0, 18, 26, 0.2);opacity:1}.header-profile-name{font-size:14px;font-weight:200;font-family:sans-serif}@keyframes bouncedelay{0%,80%,100%{transform:scale(0);-webkit-transform:scale(0)}40%{transform:scale(1);-webkit-transform:scale(1)}}@keyframes message-bounce{0%{transform:scale(0.9);-webkit-transform:scale(0.9)}50%{transform:scale(1.1);-webkit-transform:scale(1.1)}100%{transform:scale(0.9);-webkit-transform:scale(0.9)}}.spinner{position:absolute;top:50%;left:50%;width:45px;height:9px;margin-left:-22px;margin-top:-13px;text-align:center}.spinner>div{width:9px;height:9px;background-color:red;border-radius:100%;display:inline-block;animation:bouncedelay 1400ms ease-in-out infinite;animation-fill-mode:both}.spinner .bounce1{animation-delay:-0.32s}.spinner .bounce2{animation-delay:-0.16s}#container{background-color:#2e66bd;height:40px}.spinner{position:static !important;margin-top:-11px;margin-left:0px}.spinner div{background-color:#E0DEDE}@-webkit-keyframes message-bounce{0%{transform:scale(0.9);-webkit-transform:scale(0.9)}50%{transform:scale(1.1);-webkit-transform:scale(1.1)}100%{transform:scale(0.9);-webkit-transform:scale(0.9)}}@keyframes message-bounce{0%{transform:scale(0.9);-webkit-transform:scale(0.9)}50%{transform:scale(1.1);-webkit-transform:scale(1.1)}100%{transform:scale(0.9);-webkit-transform:scale(0.9)}}#myInput{background-image:url('https://www.w3schools.com/css/searchicon.png');background-position:10px 12px;background-repeat:no-repeat;width:216px;font-size:16px;padding:12px 20px 12px 40px;border:1px solid #ddd;margin-bottom:12px}ul{box-shadow:0px 1px 3px 0px rgba(0, 0, 0, 0.2),
      0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12);display:flex;flex-direction:column;border-radius:2px;width:100%;max-width:300px;max-height:100%;background-color:white;overflow-x:scroll;list-style:none;padding:0}li{box-sizing:border-box;transition:0.2s all;font-size:14px}li:hover{background-color:#E2E7FB}p{margin:0 12px 12px 12px;overflow:hidden;text-overflow:ellipsis}.list-img{margin-left:12px}.chat-list{height:calc(100vh - 130px)}`;

    		this.shadowRoot.appendChild(style);

    		init$1(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{ app_id: 0, app_secret: 1, customer_id: 2 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["app_id", "app_secret", "customer_id"];
    	}

    	get app_id() {
    		return this.$$.ctx[0];
    	}

    	set app_id(app_id) {
    		this.$$set({ app_id });
    		flush();
    	}

    	get app_secret() {
    		return this.$$.ctx[1];
    	}

    	set app_secret(app_secret) {
    		this.$$set({ app_secret });
    		flush();
    	}

    	get customer_id() {
    		return this.$$.ctx[2];
    	}

    	set customer_id(customer_id) {
    		this.$$set({ customer_id });
    		flush();
    	}
    }

    customElements.define("cleandesk-chat-widget", FinalApp);

    // import ChatHeader from "./components/ChatHeader.svelte";

    // const app = new havinesh({

    const app = new FinalApp({
      // const app = new ChatHeader({
      // target: document.body,
      // props: {
      // 	name: 'world'
      // }
    });

    // import NewApp from "./NewApp.svelte";
    // import App from "./App.svelte";
    // // import ChatHeader from "./components/ChatHeader.svelte";

    // const app = new App({
    //   // const app = new ChatHeader({
    //   target: document.body,
    //   // props: {
    //   // 	name: 'world'
    //   // }
    // });

    // export default app;

    return app;

})();
//# sourceMappingURL=bundle.js.map
