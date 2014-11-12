(function(){
"use strict";


var nextUid = function(){
    var uid = ['0', '0', '0'];

    // from AngularJs
    /**
     * @returns {String}
     */
    return function nextUid() {
        var index = uid.length;
        var digit;

        while(index) {
            index--;
            digit = uid[index].charCodeAt(0);
            if (digit == 57 /*'9'*/) {
                uid[index] = 'A';
                return uid.join('');
            }
            if (digit == 90  /*'Z'*/) {
                uid[index] = '0';
            } else {
                uid[index] = String.fromCharCode(digit + 1);
                return uid.join('');
            }
        }
        uid.unshift('0');
        return uid.join('');
    };
}();


var toString = Object.prototype.toString;

var undf = undefined;




var varType = function(){

    var types = {
        '[object String]': 0,
        '[object Number]': 1,
        '[object Boolean]': 2,
        '[object Object]': 3,
        '[object Function]': 4,
        '[object Array]': 5,
        '[object RegExp]': 9,
        '[object Date]': 10
    };


    /**
     * 'string': 0,
     * 'number': 1,
     * 'boolean': 2,
     * 'object': 3,
     * 'function': 4,
     * 'array': 5,
     * 'null': 6,
     * 'undefined': 7,
     * 'NaN': 8,
     * 'regexp': 9,
     * 'date': 10,
     * unknown: -1
     * @param {*} value
     * @returns {number}
     */
    return function varType(val) {

        if (!val) {
            if (val === null) {
                return 6;
            }
            if (val === undf) {
                return 7;
            }
        }

        var num = types[toString.call(val)];

        if (num === undf) {
            return -1;
        }

        if (num == 1 && isNaN(val)) {
            return 8;
        }

        return num;
    };

}();



/**
 * @param {*} value
 * @returns {boolean}
 */
function isArray(value) {
    return typeof value == "object" && varType(value) === 5;
};

function isFunction(value) {
    return typeof value == 'function';
};



function isString(value) {
    return typeof value == "string" || value === ""+value;
    //return typeof value == "string" || varType(value) === 0;
};



/**
 * @function trim
 * @param {String} value
 * @returns {string}
 */
var trim = function() {
    // native trim is way faster: http://jsperf.com/angular-trim-test
    // but IE doesn't have it... :-(
    if (!String.prototype.trim) {
        return function(value) {
            return isString(value) ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
        };
    }
    return function(value) {
        return isString(value) ? value.trim() : value;
    };
}();


var slice = Array.prototype.slice;

/**
 * @param {string} str
 * @param {string} separator
 * @param {bool} allowEmpty
 * @returns {[]}
 */
var split = function(str, separator, allowEmpty) {

    var l       = str.length,
        sl      = separator.length,
        i       = 0,
        prev    = 0,
        prevChar= "",
        inQDbl  = false,
        inQSng  = false,
        parts   = [],
        esc     = "\\",
        char;

    if (!sl) {
        return [str];
    }

    for (; i < l; i++) {

        char = str.charAt(i);

        if (char == esc) {
            i++;
            continue;
        }

        if (char == '"') {
            inQDbl = !inQDbl;
            continue;
        }
        if (char == "'") {
            inQSng = !inQSng;
            continue;
        }

        if (!inQDbl && !inQSng) {
            if ((sl == 1 && char == separator) ||
                (sl > 1 && str.substring(i, i + sl) == separator)) {

                if (str.substr(i - 1, sl) == separator ||
                    str.substr(i + 1, sl) == separator) {

                    if (!allowEmpty) {
                        i += (sl - 1);
                        continue;
                    }
                }

                parts.push(str.substring(prev, i).replace(esc + separator, separator));
                prev = i + sl;
                i += (sl - 1);
            }
        }

        prevChar = char;
    }

    parts.push(str.substring(prev).replace(esc + separator, separator));

    return parts;
};



function isDate(value) {
    return varType(value) === 10;
};



function isRegExp(value) {
    return varType(value) === 9;
};

function isWindow(obj) {
    return obj === window ||
           (obj && obj.document && obj.location && obj.alert && obj.setInterval);
};



// from Angular

var equals = function(){

    var equals = function equals(o1, o2) {
        if (o1 === o2) return true;
        if (o1 === null || o2 === null) return false;
        if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
        var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
        if (t1 == t2) {
            if (t1 == 'object') {
                if (isArray(o1)) {
                    if (!isArray(o2)) return false;
                    if ((length = o1.length) == o2.length) {
                        for(key=0; key<length; key++) {
                            if (!equals(o1[key], o2[key])) return false;
                        }
                        return true;
                    }
                } else if (isDate(o1)) {
                    return isDate(o2) && o1.getTime() == o2.getTime();
                } else if (isRegExp(o1) && isRegExp(o2)) {
                    return o1.toString() == o2.toString();
                } else {
                    if (isWindow(o1) || isWindow(o2) || isArray(o2)) return false;
                    keySet = {};
                    for(key in o1) {
                        if (key.charAt(0) == '$' || isFunction(o1[key])) {//&& typeof o1[key] == "object") {
                            continue;
                        }
                        //if (isFunction(o1[key])) {
                        //    continue;
                        //}
                        if (!equals(o1[key], o2[key])) {
                            return false;
                        }
                        keySet[key] = true;
                    }
                    for(key in o2) {
                        if (!keySet.hasOwnProperty(key) &&
                            key.charAt(0) != '$' &&
                            o2[key] !== undf &&
                            !isFunction(o2[key])) return false;
                    }
                    return true;
                }
            }
        }
        return false;
    };

    return equals;
}();



function isPlainObject(value) {
    // IE < 9 returns [object Object] from toString(htmlElement)
    return typeof value == "object" &&
           varType(value) === 3 &&
            !value.nodeType &&
            value.constructor === Object;

};

var strUndef = "undefined";



var copy = function() {

    var win = typeof window != strUndef ? window : null,
        glob = typeof global != strUndef ? global : null;

    var copy = function copy(source, dest){

        if (win && source === win) {
            throw new Error("Cannot copy window object");
        }
        if (glob && source === glob) {
            throw new Error("Cannot copy global object");
        }

        if (!dest) {
            dest = source;
            if (source) {
                if (isArray(source)) {
                    dest = copy(source, []);
                } else if (isDate(source)) {
                    dest = new Date(source.getTime());
                } else if (isRegExp(source)) {
                    dest = new RegExp(source.source);
                } else if (isPlainObject(source)) {
                    dest = copy(source, {});
                }
            }
        } else {
            if (source === dest) {
                throw new Error("Objects are identical");
            }
            if (isArray(source)) {
                dest.length = 0;
                for ( var i = 0, l = source.length; i < l; i++) {
                    dest.push(copy(source[i]));
                }
            } else {
                var key;
                for (key in dest) {
                    delete dest[key];
                }
                for (key in source) {
                    if (source.hasOwnProperty(key)) {
                        if (key.charAt(0) == '$' || isFunction(source[key])) {
                            dest[key] = source[key];
                        }
                        else {
                            dest[key] = copy(source[key]);
                        }
                    }
                }
            }
        }
        return dest;
    };

    return copy;
}();

/**
 * @param {Function} fn
 * @param {*} context
 */
var bind = Function.prototype.bind ?
              function(fn, context){
                  return fn.bind(context);
              } :
              function(fn, context) {
                  return function() {
                      return fn.apply(context, arguments);
                  };
              };



function isBool(value) {
    return value === true || value === false;
};




var extend = function(){

    /**
     * @param {Object} dst
     * @param {Object} src
     * @param {Object} src2 ... srcN
     * @param {boolean} override = false
     * @param {boolean} deep = false
     * @returns {object}
     */
    var extend = function extend() {


        var override    = false,
            deep        = false,
            args        = slice.call(arguments),
            dst         = args.shift(),
            src,
            k,
            value;

        if (isBool(args[args.length - 1])) {
            override    = args.pop();
        }
        if (isBool(args[args.length - 1])) {
            deep        = override;
            override    = args.pop();
        }

        while (args.length) {
            if (src = args.shift()) {
                for (k in src) {

                    if (src.hasOwnProperty(k) && (value = src[k]) !== undf) {

                        if (deep) {
                            if (dst[k] && isPlainObject(dst[k]) && isPlainObject(value)) {
                                extend(dst[k], value, override, deep);
                            }
                            else {
                                if (override === true || dst[k] == undf) { // == checks for null and undefined
                                    if (isPlainObject(value)) {
                                        dst[k] = {};
                                        extend(dst[k], value, override, true);
                                    }
                                    else {
                                        dst[k] = value;
                                    }
                                }
                            }
                        }
                        else {
                            if (override === true || dst[k] == undf) {
                                dst[k] = value;
                            }
                        }
                    }
                }
            }
        }

        return dst;
    };

    return extend;
}();



function isPrimitive(value) {
    var vt = varType(value);
    return vt < 3 && vt > -1;
};
// https://gist.github.com/jdalton/5e34d890105aca44399f

var isNative = function() {

    // Used to resolve the internal `[[Class]]` of values.
    var toString = Object.prototype.toString;

    // Used to resolve the decompiled source of functions.
    var fnToString = Function.prototype.toString;

    // Used to detect host constructors (Safari > 4; really typed array specific).
    var reHostCtor = /^\[object .+?Constructor\]$/;

    // Compile a regexp using a common native method as a template.
    // We chose `Object#toString` because there's a good chance it is not being mucked with.
    var reNative = RegExp('^' +
                          // Coerce `Object#toString` to a string.
                          String(toString)
                              // Escape any special regexp characters.
                              .replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
                              // Replace mentions of `toString` with `.*?` to keep the template generic.
                              // Replace thing like `for ...` to support environments, like Rhino, which add extra
                              // info such as method arity.
                              .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    return function isNative(value) {
        var type = typeof value;
        return type == 'function'
            // Use `Function#toString` to bypass the value's own `toString` method
            // and avoid being faked out.
            ? (!('prototype' in value) || reNative.test(fnToString.call(value)))
            // Fallback to a host object check because some environments will represent
            // things like typed arrays as DOM methods which may not conform to the
            // normal native pattern.
            : (value && type == 'object' && reHostCtor.test(toString.call(value))) || false;
    };

}();

function returnFalse() {
    return false;
};





/**
 * <p>A javascript event system implementing two patterns - observable and collector.</p>
 *
 * <p>Observable:</p>
 * <pre><code class="language-javascript">var o = new Observable;
 * o.on("event", function(x, y, z){ console.log([x, y, z]) });
 * o.trigger("event", 1, 2, 3); // [1, 2, 3]
 * </code></pre>
 *
 * <p>Collector:</p>
 * <pre><code class="language-javascript">var o = new Observable;
 * o.createEvent("collectStuff", "all");
 * o.on("collectStuff", function(){ return 1; });
 * o.on("collectStuff", function(){ return 2; });
 * var results = o.trigger("collectStuff"); // [1, 2]
 * </code></pre>
 *
 * <p>Although all methods are public there is getApi() method that allows you
 * extending your own objects without overriding "destroy" (which you probably have)</p>
 * <pre><code class="language-javascript">var o = new Observable;
 * $.extend(this, o.getApi());
 * this.on("event", function(){ alert("ok") });
 * this.trigger("event");
 * </code></pre>
 *
 * @class Observable
 * @version 1.1
 * @author johann kuindji
 * @link https://github.com/kuindji/metaphorjs-observable
 */
var Observable = function() {

    this.events = {};

};


extend(Observable.prototype, {

    /**
    * You don't have to call this function unless you want to pass returnResult param.
    * This function will be automatically called from {@link on} with <code>returnResult = false</code>,
    * so if you want to receive handler's return values, create event first, then call on().
    *
    * <pre><code class="language-javascript">var observable = new Observable;
    * observable.createEvent("collectStuff", "all");
    * observable.on("collectStuff", function(){ return 1; });
    * observable.on("collectStuff", function(){ return 2; });
    * var results = observable.trigger("collectStuff"); // [1, 2]
    * </code></pre>
    *
    * @method
    * @access public
    * @param {string} name {
    *       Event name
    *       @required
    * }
    * @param {bool|string} returnResult {
    *   false -- do not return results except if handler returned "false". This is how
    *   normal observables work.<br>
    *   "all" -- return all results as array<br>
    *   "merge" -- merge all results into one array (each result must be array)<br>
    *   "first" -- return result of the first handler<br>
    *   "last" -- return result of the last handler<br>
    *   @required
    * }
    * @return {ObservableEvent}
    */
    createEvent: function(name, returnResult) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new Event(name, returnResult);
        }
        return events[name];
    },

    /**
    * @method
    * @access public
    * @param {string} name Event name
    * @return {ObservableEvent|undefined}
    */
    getEvent: function(name) {
        name = name.toLowerCase();
        return this.events[name];
    },

    /**
    * Subscribe to an event or register collector function.
    * @method
    * @access public
    * @param {string} name {
    *       Event name
    *       @required
    * }
    * @param {function} fn {
    *       Callback function
    *       @required
    * }
    * @param {object} context "this" object for the callback function
    * @param {object} options {
    *       @type {bool} first {
    *           True to prepend to the list of handlers
    *           @default false
    *       }
    *       @type {number} limit {
    *           Call handler this number of times; 0 for unlimited
    *           @default 0
    *       }
    *       @type {number} start {
    *           Start calling handler after this number of calls. Starts from 1
    *           @default 1
    *       }
     *      @type {[]} append Append parameters
     *      @type {[]} prepend Prepend parameters
     *      @type {bool} allowDupes allow the same handler twice
    * }
    */
    on: function(name, fn, context, options) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new Event(name);
        }
        return events[name].on(fn, context, options);
    },

    /**
    * Same as {@link Observable.on}, but options.limit is forcefully set to 1.
    * @method
    * @access public
    */
    once: function(name, fn, context, options) {
        options     = options || {};
        options.limit = 1;
        return this.on(name, fn, context, options);
    },


    /**
    * Unsubscribe from an event
    * @method
    * @access public
    * @param {string} name Event name
    * @param {function} fn Event handler
    * @param {object} context If you called on() with context you must call un() with the same context
    */
    un: function(name, fn, context) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].un(fn, context);
    },

    /**
    * @method hasListener
    * @access public
    * @param {string} name Event name { @required }
    * @return bool
    */

    /**
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @param {function} fn Callback function { @required }
    * @param {object} context Function's "this" object
    * @return bool
    */
    hasListener: function(name, fn, context) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return false;
        }
        return events[name].hasListener(fn, context);
    },


    /**
    * Remove all listeners from all events
    * @method removeAllListeners
    * @access public
    */

    /**
    * Remove all listeners from specific event
    * @method
    * @access public
    * @param {string} name Event name { @required }
    */
    removeAllListeners: function(name) {
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].removeAllListeners();
    },

    /**
    * Trigger an event -- call all listeners.
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @param {*} ... As many other params as needed
    * @return mixed
    */
    trigger: function() {

        var name = arguments[0],
            events  = this.events;

        name = name.toLowerCase();

        if (!events[name]) {
            return null;
        }

        var e = events[name];
        return e.trigger.apply(e, slice.call(arguments, 1));
    },

    /**
    * Suspend an event. Suspended event will not call any listeners on trigger().
    * @method
    * @access public
    * @param {string} name Event name
    */
    suspendEvent: function(name) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].suspend();
    },

    /**
    * @method
    * @access public
    */
    suspendAllEvents: function() {
        var events  = this.events;
        for (var name in events) {
            events[name].suspend();
        }
    },

    /**
    * Resume suspended event.
    * @method
    * @access public
    * @param {string} name Event name
    */
    resumeEvent: function(name) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].resume();
    },

    /**
    * @method
    * @access public
    */
    resumeAllEvents: function() {
        var events  = this.events;
        for (var name in events) {
            events[name].resume();
        }
    },

    /**
     * @method
     * @access public
     * @param {string} name Event name
     */
    destroyEvent: function(name) {
        var events  = this.events;
        if (events[name]) {
            events[name].removeAllListeners();
            events[name].destroy();
            delete events[name];
        }
    },


    /**
    * Destroy observable
    * @method
    * @md-not-inheritable
    * @access public
    * @param {string} name Event name
    */
    destroy: function(name) {
        var events  = this.events;

        if (name) {
            name = name.toLowerCase();
            if (events[name]) {
                events[name].destroy();
                delete events[name];
            }
        }
        else {
            for (var i in events) {
                events[i].destroy();
            }

            this.events = {};
        }
    },

    /**
    * Get object with all functions except "destroy"
    * @method
    * @md-not-inheritable
    * @returns object
    */
    getApi: function() {

        var self    = this;

        if (!self.api) {

            var methods = [
                    "createEvent", "getEvent", "on", "un", "once", "hasListener", "removeAllListeners",
                    "trigger", "suspendEvent", "suspendAllEvents", "resumeEvent",
                    "resumeAllEvents", "destroyEvent"
                ],
                api = {},
                name;

            for(var i =- 1, l = methods.length;
                    ++i < l;
                    name = methods[i],
                    api[name] = bind(self[name], self)){}

            self.api = api;
        }

        return self.api;
    }
}, true, false);


/**
 * This class is private - you can't create an event other than via Observable.
 * See Observable reference.
 * @class ObservableEvent
 * @private
 */
var Event = function(name, returnResult) {

    var self    = this;

    self.name           = name;
    self.listeners      = [];
    self.map            = {};
    self.hash           = nextUid();
    self.uni            = '$$' + name + '_' + self.hash;
    self.suspended      = false;
    self.lid            = 0;
    self.returnResult   = returnResult === undf ? null : returnResult; // first|last|all
};


extend(Event.prototype, {

    /**
     * Get event name
     * @method
     * @returns {string}
     */
    getName: function() {
        return this.name;
    },

    /**
     * @method
     */
    destroy: function() {
        var self        = this;
        self.listeners  = null;
        self.map        = null;
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @param {object} options See Observable's on()
     */
    on: function(fn, context, options) {

        if (!fn) {
            return null;
        }

        context     = context || null;
        options     = options || {};

        var self        = this,
            uni         = self.uni,
            uniContext  = context || fn;

        if (uniContext[uni] && !options.allowDupes) {
            return null;
        }

        var id      = ++self.lid,
            first   = options.first || false;

        uniContext[uni]  = id;


        var e = {
            fn:         fn,
            context:    context,
            uniContext: uniContext,
            id:         id,
            called:     0, // how many times the function was triggered
            limit:      options.limit || 0, // how many times the function is allowed to trigger
            start:      options.start || 1, // from which attempt it is allowed to trigger the function
            count:      0, // how many attempts to trigger the function was made
            append:     options.append, // append parameters
            prepend:    options.prepend // prepend parameters
        };

        if (first) {
            self.listeners.unshift(e);
        }
        else {
            self.listeners.push(e);
        }

        self.map[id] = e;

        return id;
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @param {object} options See Observable's on()
     */
    once: function(fn, context, options) {

        options = options || {};
        options.once = true;

        return this.on(fn, context, options);
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     */
    un: function(fn, context) {

        var self        = this,
            inx         = -1,
            uni         = self.uni,
            listeners   = self.listeners,
            id;

        if (fn == parseInt(fn)) {
            id      = fn;
        }
        else {
            context = context || fn;
            id      = context[uni];
        }

        if (!id) {
            return false;
        }

        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i].id == id) {
                inx = i;
                delete listeners[i].uniContext[uni];
                break;
            }
        }

        if (inx == -1) {
            return false;
        }

        listeners.splice(inx, 1);
        delete self.map[id];
        return true;
    },

    /**
     * @method hasListener
     * @return bool
     */

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @return bool
     */
    hasListener: function(fn, context) {

        var self    = this,
            listeners   = self.listeners,
            id;

        if (fn) {

            context = context || fn;

            if (!isFunction(fn)) {
                id  = fn;
            }
            else {
                id  = context[self.uni];
            }

            if (!id) {
                return false;
            }

            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].id == id) {
                    return true;
                }
            }

            return false;
        }
        else {
            return listeners.length > 0;
        }
    },


    /**
     * @method
     */
    removeAllListeners: function() {
        var self    = this,
            listeners = self.listeners,
            uni     = self.uni,
            i, len;

        for (i = 0, len = listeners.length; i < len; i++) {
            delete listeners[i].uniContext[uni];
        }
        self.listeners   = [];
        self.map         = {};
    },

    /**
     * @method
     */
    suspend: function() {
        this.suspended = true;
    },

    /**
     * @method
     */
    resume: function() {
        this.suspended = false;
    },


    _prepareArgs: function(l, triggerArgs) {
        var args;

        if (l.append || l.prepend) {
            args    = slice.call(triggerArgs);
            if (l.prepend) {
                args    = l.prepend.concat(args);
            }
            if (l.append) {
                args    = args.concat(l.append);
            }
        }
        else {
            args = triggerArgs;
        }

        return args;
    },

    /**
     * @method
     * @return {*}
     */
    trigger: function() {

        var self            = this,
            listeners       = self.listeners,
            returnResult    = self.returnResult;

        if (self.suspended || listeners.length == 0) {
            return null;
        }

        var ret     = returnResult == "all" || returnResult == "merge" ?
                        [] : null,
            q, l,
            res;

        if (returnResult == "first") {
            q = [listeners[0]];
        }
        else {
            // create a snapshot of listeners list
            q = slice.call(listeners);
        }

        // now if during triggering someone unsubscribes
        // we won't skip any listener due to shifted
        // index
        while (l = q.shift()) {

            // listener may already have unsubscribed
            if (!l || !self.map[l.id]) {
                continue;
            }

            l.count++;

            if (l.count < l.start) {
                continue;
            }

            res = l.fn.apply(l.context, self._prepareArgs(l, arguments));

            l.called++;

            if (l.called == l.limit) {
                self.un(l.id);
            }

            if (returnResult == "all") {
                ret.push(res);
            }
            else if (returnResult == "merge" && res) {
                ret = ret.concat(res);
            }
            else if (returnResult == "first") {
                return res;
            }
            else if (returnResult == "last") {
                ret = res;
            }
            else if (returnResult == false && res === false) {
                return false;
            }
        }

        if (returnResult) {
            return ret;
        }
    }
}, true, false);






function levenshteinArray(from, to) {

    var m = from.length,
        n = to.length,
        D = new Array(m + 1),
        P = new Array(m + 1),
        i, j, c,
        route,
        cost,
        dist,
        ops = 0;

    if (m == n && m == 0) {
        return {
            changes: 0,
            distance: 0,
            prescription: []
        };
    }

    for (i = 0; i <= m; i++) {
        D[i]    = new Array(n + 1);
        P[i]    = new Array(n + 1);
        D[i][0] = i;
        P[i][0] = 'D';
    }
    for (i = 0; i <= n; i++) {
        D[0][i] = i;
        P[0][i] = 'I';
    }

    for (i = 1; i <= m; i++) {
        for (j = 1; j <= n; j++) {
            cost = (!equals(from[i - 1], to[j - 1])) ? 1 : 0;

            if(D[i][j - 1] < D[i - 1][j] && D[i][j - 1] < D[i - 1][j - 1] + cost) {
                //Insert
                D[i][j] = D[i][j - 1] + 1;
                P[i][j] = 'I';
            }
            else if(D[i - 1][j] < D[i - 1][j - 1] + cost) {
                //Delete
                D[i][j] = D[i - 1][j] + 1;
                P[i][j] = 'D';
            }
            else {
                //Replace or noop
                D[i][j] = D[i - 1][j - 1] + cost;
                if (cost == 1) {
                    P[i][j] = 'R';
                }
                else {
                    P[i][j] = '-';
                }
            }
        }
    }

    //Prescription
    route = [];
    i = m;
    j = n;

    do {
        c = P[i][j];
        route.push(c);
        if (c != '-') {
            ops++;
        }
        if(c == 'R' || c == '-') {
            i --;
            j --;
        }
        else if(c == 'D') {
            i --;
        }
        else {
            j --;
        }
    } while((i != 0) || (j != 0));

    dist = D[m][n];

    return {
        changes: ops / route.length,
        distance: dist,
        prescription: route.reverse()
    };
};
/**
 * @param {Function} fn
 * @param {Object} context
 * @param {[]} args
 * @param {number} timeout
 */
function async(fn, context, args, timeout) {
    setTimeout(function(){
        fn.apply(context, args || []);
    }, timeout || 0);
};



function error(e) {

    var stack = e.stack || (new Error).stack;

    if (typeof console != strUndef && console.log) {
        async(function(){
            console.log(e);
            if (stack) {
                console.log(stack);
            }
        });
    }
    else {
        throw e;
    }
};


function emptyFn(){};



var functionFactory = function() {

    var REG_REPLACE_EXPR    = /(^|[^a-z0-9_$\]\)'"])(\.)([^0-9])/ig,

        f               = Function,
        fnBodyStart     = 'try {',
        //getterBodyEnd   = ';} catch (thrownError) { return $$interceptor(thrownError, $$itself, ____); }',
        //setterBodyEnd   = ';} catch (thrownError) { return $$interceptor(thrownError, $$itself, ____, $$$$); }',
        getterBodyEnd   = ';} catch (thrownError) { return undefined; }',
        setterBodyEnd   = ';} catch (thrownError) { return undefined; }',


        /*interceptor     = function(thrownError, func, scope, value) {

            while (scope && !scope.$isRoot) {

                scope = scope.$parent;

                if (scope) {

                    try {
                        if (arguments.length == 4) {
                            return func.call(null, scope, value, emptyFn, func);
                        }
                        else {
                            return func.call(null, scope, emptyFn, func);
                        }
                    }
                    catch (newError) {}
                }
            }

            if (thrownError !== null) {
                error(thrownError);
            }

            return undf;
        },*/

        isFailed        = function(val) {
            return val === undf || (typeof val == "number" && isNaN(val));
        },

        wrapFunc        = function(func, returnsValue) {
            return function(scope) {
                var args = slice.call(arguments),
                    val;

                //args.push(interceptor);
                args.push(null);
                args.push(func);

                if (returnsValue) {
                    val = func.apply(null, args);
                    while (isFailed(val) && !scope.$isRoot) {
                        scope = scope.$parent;
                        args[0] = scope;
                        val = func.apply(null, args);
                    }
                    return val;
                }
                else {
                    return func.apply(null, args);
                }

                /*if (returnsValue && isFailed(val)) {//) {
                    args = slice.call(arguments);
                    args.unshift(func);
                    args.unshift(null);
                    return interceptor.apply(null, args);
                }
                else {
                    return val;
                }*/
            };
        },

        getterCache     = {},
        getterCacheCnt  = 0,

        createGetter    = function createGetter(expr) {

            try {
                if (!getterCache[expr]) {
                    getterCacheCnt++;
                    return getterCache[expr] = wrapFunc(new f(
                        '____',
                        '$$interceptor',
                        '$$itself',
                        "".concat(fnBodyStart, 'return ', expr.replace(REG_REPLACE_EXPR, '$1____.$3'), getterBodyEnd)
                    ), true);
                }
                return getterCache[expr];
            }
            catch (thrownError){
                error(thrownError);
                return emptyFn;
            }
        },

        setterCache     = {},
        setterCacheCnt  = 0,

        createSetter    = function createSetter(expr) {
            try {
                if (!setterCache[expr]) {
                    setterCacheCnt++;
                    var code = expr.replace(REG_REPLACE_EXPR, '$1____.$3');
                    return setterCache[expr] = wrapFunc(new f(
                        '____',
                        '$$$$',
                        '$$interceptor',
                        '$$itself',
                        "".concat(fnBodyStart, code, ' = $$$$', setterBodyEnd)
                    ));
                }
                return setterCache[expr];
            }
            catch (thrownError) {
                error(thrownError);
                return emptyFn;
            }
        },

        funcCache       = {},
        funcCacheCnt    = 0,

        createFunc      = function createFunc(expr) {
            try {
                if (!funcCache[expr]) {
                    funcCacheCnt++;
                    return funcCache[expr] = wrapFunc(new f(
                        '____',
                        '$$interceptor',
                        '$$itself',
                        "".concat(fnBodyStart, expr.replace(REG_REPLACE_EXPR, '$1____.$3'), getterBodyEnd)
                    ));
                }
                return funcCache[expr];
            }
            catch (thrownError) {
                error(thrownError);
                return emptyFn;
            }
        },

        resetCache = function() {
            getterCacheCnt >= 1000 && (getterCache = {});
            setterCacheCnt >= 1000 && (setterCache = {});
            funcCacheCnt >= 1000 && (funcCache = {});
        };

    return {
        createGetter: createGetter,
        createSetter: createSetter,
        createFunc: createFunc,
        resetCache: resetCache,
        enableResetCacheInterval: function() {
            setTimeout(resetCache, 10000);
        }
    };
}();



var createGetter = functionFactory.createGetter;




var createSetter = functionFactory.createSetter;



var Watchable = function(){

    var nativeObserver  = Object.observe && isNative(Object.observe),

        isStatic    = function(val) {

            if (!isString(val)) {
                return true;
            }

            var first   = val.substr(0, 1),
                last    = val.length - 1;

            if (first == '"' || first == "'") {
                if (val.indexOf(first, 1) == last) {
                    return val.substring(1, last);
                }
            }

            return false;
        },

        prescription2moves = function(a1, a2, prs, getKey) {

            var newPrs = [],
                i, l, k, action,
                map1 = {},
                prsi,
                a2i,
                index;

            for (i = 0, l = a1.length; i < l; i++) {
                k = getKey(a1[i]);
                if (k) {
                    map1[k] = i;
                }
            }

            a2i = 0;
            var used = {};

            for (prsi = 0, l = prs.length; prsi < l; prsi++) {

                action = prs[prsi];

                if (action == 'D') {
                    continue;
                }

                k = getKey(a2[a2i]);

                if (k != undf && used[k] !== true && (index = map1[k]) !== undf) {
                    newPrs.push(index);
                    used[k] = true;
                }
                else {
                    newPrs.push(action);
                }
                a2i++;
            }

            return newPrs;
        },


        observable;

    /**
     * @class Watchable
     */

    /**
     * @param {object} dataObj object containing observed property
     * @param {string} code property name or custom code
     * @param {function} fn optional listener
     * @param {object} fnScope optional listener's "this" object
     * @param {*} userData optional data to pass to the listener
     * @param {Namespace} namespace optional namespace to get filters and pipes from
     * @constructor
     */
    var Watchable   = function(dataObj, code, fn, fnScope, userData, namespace) {

        if (!observable) {
            observable  = new Observable;
        }

        var self    = this,
            id      = nextUid(),
            type,
            useObserver = false;

        if (namespace) {
            self.namespace = namespace;
            self.nsGet = namespace.get;
        }

        self.origCode = code;

        if (!isString(code)) {
            fnScope = fn;
            fn      = code;
            code    = null;
            type    = "object";
        }
        if (isString(dataObj)) {
            fnScope = fn;
            fn      = code;
            code    = dataObj;
            dataObj = null;
        }

        if (code && dataObj) {
            type    = dataObj.hasOwnProperty(code) ? "attr" : "expr";
        }
        if (code && !dataObj) {
            type    = "expr";
        }


        if (fn) {
            observable.on(id, fn, fnScope || this, {
                append: [userData],
                allowDupes: true
            });
        }

        if (type == "expr") {
            code        = self._parsePipes(code, dataObj, true);
            code        = self._parsePipes(code, dataObj, false);

            if (self.inputPipes || self.pipes) {
                code    = normalizeExpr(dataObj, code);
                type    = dataObj.hasOwnProperty(code) ? "attr" : "expr";
            }

            if (self.staticValue = isStatic(code)) {
                type    = "static";
            }
        }

        self.userData   = userData;
        self.code       = code;
        self.id         = id;
        self.type       = type;
        self.obj        = dataObj;

        if (type == "expr") {
            self.getterFn   = createGetter(code);
        }

        // Object.observe() doesn't work with expressions and may confuse more than help.
        // so the only thing it does on change, it sets changed flag
        // so that on the next digest cycle there wouldn't be any need
        // to compare values.

        // upd: still, the change event happens _after_ digest cycle
        // so lets think some more. :(

        /*if (type == "attr" && nativeObserver && !self.pipes && !self.inputPipes) {
            self.curr   = self._getValue();
            useObserver = isPrimitive(self.curr);
        }
        useObserver = false;*/

        if (type != "static" || self.pipes) {
            self.curr = self.curr || self._getValue();
            self.currCopy = isPrimitive(self.curr) ? self.curr : copy(self.curr);
        }
        else {
            self.check = returnFalse;
            self.curr = self.prev = self.staticValue;
        }

        /*if (useObserver) {
            self.obsrvDelegate = bind(self.onObserverChange, self);
            Object.observe(self.obj, self.obsrvDelegate);
        }*/
    };

    extend(Watchable.prototype, {

        namespace: null,
        nsGet: null,
        staticValue: null,
        origCode: null,
        code: null,
        getterFn: null,
        setterFn: null,
        id: null,
        type: null,
        obj: null,
        itv: null,
        curr: null,
        currCopy: null,
        prev: null,
        unfiltered: null,
        pipes: null,
        inputPipes: null,
        lastSetValue: null,
        userData: null,
        obsrvDelegate: null,
        obsrvChanged: false,


        _indexArrayItems: function(a) {

            var key = '$$' + this.id,
                i, l, item;

            if (a) {
                for (i = 0, l = a.length; i < l; i++) {
                    item = a[i];
                    if (item && !isPrimitive(item) && !item[key]) {
                        item[key] = nextUid();
                    }
                }
            }
        },


        _parsePipes: function(text, dataObj, input) {

            var self        = this,
                separator   = input ? ">>" : "|",
                propName    = input ? "inputPipes" : "pipes",
                cb          = input ? self.onInputParamChange : self.onPipeParamChange;

            if (text.indexOf(separator) == -1) {
                return text;
            }

            var parts   = split(text, separator),
                ret     = input ? parts.pop() : parts.shift(),
                pipes   = [],
                pipe,
                i, l;

            for(i = 0, l = parts.length; i < l; i++) {
                pipe = split(trim(parts[i]), ':');
                self._addPipe(pipes, pipe, dataObj, cb);
            }

            if (pipes.length) {
                self[propName] = pipes;
            }

            return trim(ret);
        },

        _addPipe: function(pipes, pipe, dataObj, onParamChange) {

            var self    = this,
                name    = pipe.shift(),
                fn      = null,
                ws      = [],
                i, l;

            if (self.nsGet) {
                fn      = self.nsGet("filter." + name, true);
            }
            if (!fn) {
                fn      = (typeof window != "undefined" ? window[name] : null) || dataObj[name];
            }

            if (isFunction(fn)) {

                for (i = -1, l = pipe.length; ++i < l;
                     ws.push(create(dataObj, pipe[i], onParamChange, self, null, self.namespace))) {}

                pipes.push([fn, pipe, ws]);
            }
        },


        _getValue: function() {

            var self    = this,
                val;

            switch (self.type) {
                case "static":
                    val = self.staticValue;
                    break;

                case "attr":
                    val = self.obj[self.code];
                    break;
                case "expr":
                    val = self.getterFn(self.obj);
                    break;
                case "object":
                    val = self.obj;
                    break;
            }


            if (isArray(val)) {
                if (!self.inputPipes) {
                    self._indexArrayItems(val);
                }
                val = val.slice();
            }

            self.unfiltered = val;

            val = self._runThroughPipes(val, self.pipes);

            return val;
        },


        _runThroughPipes: function(val, pipes) {

            if (pipes) {
                var j,
                    args,
                    exprs,
                    self    = this,
                    jlen    = pipes.length,
                    dataObj = self.obj,
                    z, zl;

                for (j = 0; j < jlen; j++) {
                    exprs   = pipes[j][1];
                    args    = [];
                    for (z = -1, zl = exprs.length; ++z < zl;
                         args.push(evaluate(exprs[z], dataObj))){}

                    args.unshift(dataObj);
                    args.unshift(val);

                    val     = pipes[j][0].apply(null, args);
                }
            }

            return val;
        },

        /**
         * Subscribe to the change event
         * @method
         * @param {function} fn listener
         * @param {object} fnScope listener's "this" object
         * @param {object} options see Observable's options in on()
         */
        subscribe: function(fn, fnScope, options) {
            observable.on(this.id, fn, fnScope, options);
        },

        /**
         * Unsubscribe from change event
         * @param {function} fn
         * @param {object} fnScope
         * @returns {*}
         */
        unsubscribe: function(fn, fnScope) {
            return observable.un(this.id, fn, fnScope);
        },

        /**
         * @returns {boolean}
         */
        hasPipes: function() {
            return this.pipes !== null;
        },

        /**
         * @returns {boolean}
         */
        hasInputPipes: function() {
            return this.inputPipes != null;
        },

        /**
         * Get current value (filtered and via executing the code)
         * @returns {*}
         */
        getValue: function() {
            return this._getValue();
        },

        /**
         * Get last calculated value before filters were applied
         * @returns {*}
         */
        getUnfilteredValue: function() {
            return this.unfiltered || this.curr;
        },

        /**
         * Get previous value
         * @returns {*}
         */
        getPrevValue: function() {
            return this.prev;
        },

        /**
         * Get simple array change prescription
         * @param {[]} from optional
         * @param {[]} to optional
         * @returns {[]}
         */
        getPrescription: function(from, to) {
            to = to || this._getValue();
            return levenshteinArray(from || [], to || []).prescription;
        },

        /**
         * Get array change prescription with moves
         * @param {[]} from
         * @param {function} trackByFn
         * @param {[]} to
         * @returns {[]}
         */
        getMovePrescription: function(from, trackByFn, to) {

            var self    = this;
                to      = to || self._getValue();

            return prescription2moves(
                from || [],
                to || [],
                self.getPrescription(from || [], to || []),
                trackByFn
            );
        },

        /**
         * Set value to observed property
         * @param {*} val
         */
        setValue: function(val) {

            var self    = this,
                type    = self.type;

            self.lastSetValue = val;

            val = self._runThroughPipes(val, self.inputPipes);

            if (type == "attr") {
                self.obj[self.code] = val;
            }
            else if (type == "expr") {

                if (!self.setterFn) {
                    self.setterFn   = createSetter(self.code);
                }

                self.setterFn(self.obj, val);
            }
            else if (type == "object") {
                self.obj = val;
            }
        },

        onInputParamChange: function(val, prev, async) {
            this.setValue(this.lastSetValue);
            if (async) {
                this.checkAll();
            }
        },

        onPipeParamChange: function(val, prev, async) {
            this.check();
        },

        onObserverChange: function(changes) {

            var self = this,
                code = self.code,
                i, l,
                change;

            for (i = 0, l = changes.length; i < l; i++) {
                change = changes[i];
                if (change.name == code) {
                    self.obsrvChanged = true;
                    break;
                }
            }
        },

        _check: function(async) {

            var self    = this,
                val     = self._getValue(),
                curr    = self.currCopy,
                eq;

            if (self.obsrvDelegate) {
                eq      = !self.obsrvChanged;
            }
            else {
                eq      = equals(curr, val);
            }

            if (!eq) {
                self.curr = val;
                self.prev = curr;
                self.currCopy = isPrimitive(val) ? val : copy(val);
                self.obsrvChanged = false;
                observable.trigger(self.id, val, curr, async);
                return true;
            }

            return false;
        },

        /**
         * Check for changes
         * @param {bool} async
         * @returns {bool}
         */
        check: function(async) {
            return this._check(async);
        },

        /**
         * Check all observed properties for changes
         * @returns {bool}
         */
        checkAll: function() {
            return this.obj.$$watchers.$checkAll();
        },

        /**
         * Get last calculated value (with filters and pipes)
         * @returns {*}
         */
        getLastResult: function() {
            return this.curr;
        },

        /**
         * Set time interval to check for changes periodically
         * @param {number} ms
         */
        setInterval: function(ms) {

            var self    = this;
            if (self.itv) {
                self.clearInterval();
            }
            self.itv = setInterval(function(){self.check();}, ms);
        },

        /**
         * Clear check interval
         * @method
         */
        clearInterval: function() {
            var self    = this;
            if (self.itv) {
                clearInterval(self.itv);
                self.itv = null;
            }
        },

        /**
         * Unsubscribe and destroy if there are no other listeners
         * @param {function} fn
         * @param {object} fnScope
         * @returns {boolean} true if destroyed
         */
        unsubscribeAndDestroy: function(fn, fnScope) {

            var self    = this,
                id      = self.id;

            if (fn) {
                observable.un(id, fn, fnScope);
            }

            if (!observable.hasListener(id)) {
                self.destroy();
                return true;
            }

            return false;
        },

        /**
         * @method
         */
        destroy: function() {

            var self    = this,
                pipes   = self.pipes,
                ipipes  = self.inputPipes,
                i, il,
                j, jl,
                ws;

            if (self.itv) {
                self.clearInterval();
            }

            if (pipes) {
                for (i = -1, il = pipes.length; ++i < il;) {
                    ws = pipes[i][2];
                    for (j = -1, jl = ws.length; ++j < jl;) {
                        ws[j].unsubscribeAndDestroy(self.check, self);
                    }
                }
            }
            if (ipipes) {
                for (i = -1, il = ipipes.length; ++i < il;) {
                    ws = ipipes[i][2];
                    for (j = -1, jl = ws.length; ++j < jl;) {
                        ws[j].unsubscribeAndDestroy(self.onInputParamChange, self);
                    }
                }
            }

            if (self.obsrvDelegate) {
                Object.unobserve(self.obj, self.obsrvDelegate);
            }

            if (self.obj) {
                //delete self.obj.$$watchers.$codes[self.origCode];
                self.obj.$$watchers.$codes[self.origCode] = null;
            }

            observable.destroyEvent(self.id);

            for (i in self) {
                if (self.hasOwnProperty(i)){
                    self[i] = null;
                }
            }
        }
    }, true, false);


    /**
     * @method
     * @static
     * @param {object} obj
     * @param {string} code
     * @param {function} fn
     * @param {object} fnScope
     * @param {*} userData
     * @param {Namespace} namespace
     * @returns {Watchable}
     */
    var create = function(obj, code, fn, fnScope, userData, namespace) {

            code = normalizeExpr(obj, trim(code));

            if (obj) {
                if (!obj.$$watchers) {
                    obj.$$watchers = {
                        $codes: {},
                        $checkAll: function() {

                            var ws      = this.$codes,
                                i,
                                changes = 0;

                            for (i in ws) {

                                if (ws[i] && ws[i].check()) {
                                    changes++;
                                }
                            }

                            return changes;
                        },
                        $destroyAll: function() {

                            var ws      = this.$codes,
                                i;

                            for (i in ws) {
                                if (ws[i]) {
                                    ws[i].destroy();
                                    //delete ws[i];
                                    ws[i] = null;
                                }
                            }
                        }
                    };
                }

                if (obj.$$watchers.$codes[code]) {
                    obj.$$watchers.$codes[code].subscribe(fn, fnScope, {append: [userData], allowDupes: true});
                }
                else {
                    obj.$$watchers.$codes[code] = new Watchable(obj, code, fn, fnScope, userData, namespace);
                }

                return obj.$$watchers.$codes[code];
            }
            else {
                return new Watchable(obj, code, fn, fnScope, userData, namespace);
            }
        },

        /**
         * @method
         * @static
         * @param {object} obj
         * @param {string} code
         * @param {function} fn
         * @param {object} fnScope
         */
        unsubscribeAndDestroy = function(obj, code, fn, fnScope) {
            code = trim(code);

            var ws = obj.$$watchers ? obj.$$watchers.$codes : null;

            if (ws && ws[code] && ws[code].unsubscribeAndDestroy(fn, fnScope)) {
                //delete ws[code];
                ws[code] = null;
            }
        },

        /**
         * Normalize expression
         * @param {object} dataObj
         * @param {string} expr
         * @returns {string}
         */
        normalizeExpr = function(dataObj, expr) {
            if (dataObj && expr) {
                if (dataObj.hasOwnProperty(expr)) {
                    return expr;
                }
                var prop;
                if (expr.charAt(0) == '.') {
                    prop = expr.substr(1);
                    if (dataObj.hasOwnProperty(prop)) {
                        return prop;
                    }
                }
            }
            return expr;
        },

        /**
         * Evaluate code against object
         * @param {string} expr
         * @param {object} scope
         * @returns {*}
         */
        evaluate    = function(expr, scope) {
            var val;
            if (val = isStatic(expr)) {
                return val;
            }
            return createGetter(expr)(scope);
        };



    Watchable.create = create;
    Watchable.unsubscribeAndDestroy = unsubscribeAndDestroy;
    Watchable.normalizeExpr = normalizeExpr;
    Watchable.eval = evaluate;
    Watchable.usesNativeObserver = function() {
        return nativeObserver;
    };

    return Watchable;
}();



MetaphorJs['Watchable'] = Watchable;
typeof global != "undefined" ? (global['MetaphorJs'] = MetaphorJs) : (window['MetaphorJs'] = MetaphorJs);

}());