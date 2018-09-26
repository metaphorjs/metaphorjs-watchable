(function(){
/* BUNDLE START 003 */
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


    /*
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

        if (num === 1 && isNaN(val)) {
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
    return typeof value === "object" && varType(value) === 5;
};



/**
 * @param {*} list
 * @returns {[]}
 */
function toArray(list) {
    if (list && !list.length != undf && list !== ""+list) {
        for(var a = [], i =- 1, l = list.length>>>0; ++i !== l; a[i] = list[i]){}
        return a;
    }
    else if (list) {
        return [list];
    }
    else {
        return [];
    }
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


var slice = Array.prototype.slice;

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
            // IE < 9 fix: check for hasOwnProperty presence
            if ((src = args.shift()) && src.hasOwnProperty) {
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

function returnFalse() {
    return false;
};

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


/**
 * @param {Function} fn
 * @param {Object} context
 * @param {[]} args
 * @param {number} timeout
 */
function async(fn, context, args, timeout) {
    return setTimeout(function(){
        fn.apply(context, args || []);
    }, timeout || 0);
};




/**
 * This class is private - you can't create an event other than via Observable.
 * See {@link class:Observable} reference.
 * @class ObservableEvent
 * @private
 */
var ObservableEvent = function(name, options) {

    var self    = this;

    self.name           = name;
    self.listeners      = [];
    self.map            = {};
    self.hash           = nextUid();
    self.uni            = '$$' + name + '_' + self.hash;
    self.suspended      = false;
    self.lid            = 0;

    if (typeof options === "object" && options !== null) {
        extend(self, options, true, false);
    }
    else {
        self.returnResult = options;
    }
};


extend(ObservableEvent.prototype, {

    name: null,
    listeners: null,
    map: null,
    hash: null,
    uni: null,
    suspended: false,
    lid: null,
    returnResult: null,
    autoTrigger: null,
    lastTrigger: null,
    triggerFilter: null,
    filterContext: null,
    expectPromises: false,
    resolvePromises: false,

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
        var self        = this,
            k;

        for (k in self) {
            self[k] = null;
        }
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @param {object} options See {@link class:Observable.on}
     */
    on: function(fn, context, options) {

        if (!fn) {
            return null;
        }

        context     = context || null;
        options     = options || {};

        var self        = this,
            uni         = self.uni,
            uniContext  = fn || context;

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
            async:      false,
            called:     0, // how many times the function was triggered
            limit:      0, // how many times the function is allowed to trigger
            start:      1, // from which attempt it is allowed to trigger the function
            count:      0, // how many attempts to trigger the function was made
            append:     null, // append parameters
            prepend:    null // prepend parameters
        };

        extend(e, options, true, false);

        if (e.async === true) {
            e.async = 1;
        }

        if (first) {
            self.listeners.unshift(e);
        }
        else {
            self.listeners.push(e);
        }

        self.map[id] = e;

        if (self.autoTrigger && self.lastTrigger && !self.suspended) {
            var prevFilter = self.triggerFilter;
            self.triggerFilter = function(l){
                if (l.id === id) {
                    return prevFilter ? prevFilter(l) !== false : true;
                }
                return false;
            };
            self.trigger.apply(self, self.lastTrigger);
            self.triggerFilter = prevFilter;
        }

        return id;
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @param {object} options See {@link class:Observable.on}
     */
    once: function(fn, context, options) {

        options = options || {};
        options.limit = 1;

        return this.on(fn, context, options);
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Callback context
     */
    un: function(fn, context) {

        var self        = this,
            inx         = -1,
            uni         = self.uni,
            listeners   = self.listeners,
            id;

        if (fn == parseInt(fn)) {
            id      = parseInt(fn);
        }
        else {
            context = context || fn;
            id      = context[uni];
        }

        if (!id) {
            return false;
        }

        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i].id === id) {
                inx = i;
                delete listeners[i].uniContext[uni];
                break;
            }
        }

        if (inx === -1) {
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
     * @param {object} context Callback context
     * @return boolean
     */
    hasListener: function(fn, context) {

        var self    = this,
            listeners   = self.listeners,
            id;

        if (fn) {

            context = context || fn;

            if (!isFunction(fn)) {
                id  = parseInt(fn);
            }
            else {
                id  = context[self.uni];
            }

            if (!id) {
                return false;
            }

            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].id === id) {
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
            rr              = self.returnResult,
            filter          = self.triggerFilter,
            filterContext   = self.filterContext,
            expectPromises  = self.expectPromises,
            results         = [],
            prevPromise,
            resPromise,
            args, 
            resolver;

        if (self.suspended) {
            return null;
        }

        if (self.autoTrigger) {
            self.lastTrigger = slice.call(arguments);
        }

        if (listeners.length === 0) {
            return null;
        }

        var ret     = rr === "all" || rr === "concat" ?
                        [] : 
                        (rr === "merge" ? {} : null),
            q, l,
            res;

        if (rr === "first") {
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

            args = self._prepareArgs(l, arguments);

            if (filter && filter.call(filterContext, l, args, self) === false) {
                continue;
            }

            if (l.filter && l.filter.apply(l.filterContext || l.context, args) === false) {
                continue;
            }

            l.count++;

            if (l.count < l.start) {
                continue;
            }

            if (l.async && !expectPromises) {
                res = null;
                async(l.fn, l.context, args, l.async);
            }
            else {
                if (expectPromises) {
                    resolver = function(l, rr, args){
                        return function(value) {

                            if (rr === "pipe") {
                                args[0] = value;
                                args = self._prepareArgs(l, args);
                            }
                            
                            return l.fn.apply(l.context, args);
                        }
                    }(l, rr, slice.call(arguments));

                    if (prevPromise) {
                        res = prevPromise.then(resolver);
                    }
                    else {
                        res = l.fn.apply(l.context, args);
                    }

                    res.catch(function(err){
                        console.log(err);
                    });
                }
                else {
                    res = l.fn.apply(l.context, args);
                }
            }

            l.called++;

            if (l.called === l.limit) {
                self.un(l.id);
            }

            // This rule is valid in all cases sync and async.
            // It either returns first value or first promise.
            if (rr === "first") {
                return res;
            }
        
            // Promise branch
            if (expectPromises) {
            
                // we collect all results for further processing/resolving
                results.push(res);

                if (rr === "pipe" && res) {
                    prevPromise = res;
                }
            }
            else {
                if (rr !== null) {
                    if (rr === "all") {
                        ret.push(res);
                    }
                    else if (rr === "concat" && res) {
                        ret = ret.concat(res);
                    }
                    else if (rr === "merge") {
                        extend(ret, res, true, false);
                    }
                    else if (rr === "nonempty" && res) {
                        return res;
                    }
                    else if (rr === "pipe") {
                        ret = res;
                        arguments[0] = res;
                    }
                    else if (rr === "last") {
                        ret = res;
                    }
                    else if (rr === false && res === false) {
                        return false;
                    }
                    else if (rr === true && res === true) {
                        return true;
                    }
                }
            }
        }

        if (expectPromises) {
            resPromise = Promise.all(results);
            if (self.resolvePromises && rr !== null && rr !== "all") {
                resPromise = resPromise.then(function(values){
                    var i, l = values.length, res;
                    for(i = 0; i < l; i++) {
                        res = values[i];
                        if (rr === "concat" && res) {
                            ret = ret.concat(res);
                        }
                        else if (rr === "merge") {
                            extend(ret, res, true, false);
                        }
                        else if (rr === "nonempty" && res) {
                            return res;
                        }
                        else if (rr === false && res === false) {
                            return false;
                        }
                        else if (rr === true && res === true) {
                            return true;
                        }
                    }
                    return ret;
                });
            }
            return resPromise;
        }
        else return ret;
    }
}, true, false);








/**
 * @description A javascript event system implementing two patterns - observable and collector.
 * @description Observable:
 * @code examples/observable.js
 *
 * @description Collector:
 * @code examples/collector.js
 *
 * @class Observable
 * @version 1.2
 * @author Ivan Kuindzhi
 * @link https://github.com/kuindji/metaphorjs-observable
 */
var Observable = function() {

    this.events = {};

};


extend(Observable.prototype, {



    /**
    * You don't have to call this function unless you want to pass params other than event name.
    * Normally, events are created automatically.
    *
    * @method createEvent
    * @access public
    * @param {string} name {
    *       Event name
    *       @required
    * }
    * @param {bool|string} returnResult {
    *   false -- return first 'false' result and stop calling listeners after that<br>
    *   true -- return first 'true' result and stop calling listeners after that<br>
    *   "all" -- return all results as array<br>
    *   "concat" -- merge all results into one array (each result must be array)<br>
    *   "merge" -- merge all results into one object (each result much be object)<br>
    *   "pipe" -- pass return value of previous listener to the next listener.
    *             Only first trigger parameter is being replaced with return value,
    *             others stay as is.<br>
    *   "first" -- return result of the first handler (next listener will not be called)<br>
    *   "nonempty" -- return first nonempty result<br>
    *   "last" -- return result of the last handler (all listeners will be called)<br>
    * }
    * @param {bool} autoTrigger {
    *   once triggered, all future subscribers will be automatically called
    *   with last trigger params
    *   @code examples/autoTrigger.js
    * }
    * @param {function} triggerFilter {
    *   This function will be called each time event is triggered. Return false to skip listener.
    *   @code examples/triggerFilter.js
    *   @param {object} listener This object contains all information about the listener, including
    *       all data you provided in options while subscribing to the event.
    *   @param {[]} arguments
    *   @return {bool}
    * }
    * @param {object} filterContext triggerFilter's context
    * @return {ObservableEvent}
    */

    /**
     * @method createEvent
     * @param {string} name
     * @param {object} options {
     *  Options object or returnResult value. All options are optional.
     *  @type {string|bool} returnResult
     *  @type {bool} autoTrigger
     *  @type {function} triggerFilter
     *  @type {object} filterContext
     *  @type {bool} expectPromises
     *  @type {bool} resolvePromises
     * }
     * @returns {ObservableEvent}
     */
    createEvent: function(name, options) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new ObservableEvent(name, options);
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
    *       Event name. Use '*' to subscribe to all events.
    *       @required
    * }
    * @param {function} fn {
    *       Callback function
    *       @required
    * }
    * @param {object} context "this" object for the callback function
    * @param {object} options {
    *       You can pass any key-value pairs in this object. All of them will be passed 
    *       to triggerFilter (if you're using one).
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
        *      @type {bool|int} async run event asynchronously. If event was
        *                      created with <code>expectPromises: true</code>, 
        *                      this option is ignored.
    * }
    */
    on: function(name, fn, context, options) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new ObservableEvent(name);
        }
        return events[name].on(fn, context, options);
    },

    /**
    * Same as {@link class:Observable.on}, but options.limit is forcefully set to 1.
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
    * @param {object} context If you called on() with context you must 
    *                         call un() with the same context
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
     * Relay all events of <code>eventSource</code> through this observable.
     * @method
     * @access public
     * @param {object} eventSource
     * @param {string} eventName
     */
    relayEvent: function(eventSource, eventName) {
        eventSource.on(eventName, this.trigger, this, {
            prepend: eventName === "*" ? null : [eventName]
        });
    },

    /**
     * Stop relaying events of <code>eventSource</code>
     * @method
     * @access public
     * @param {object} eventSource
     * @param {string} eventName
     */
    unrelayEvent: function(eventSource, eventName) {
        eventSource.un(eventName, this.trigger, this);
    },

    /**
     * @method hasListener
     * @access public
     * @return bool
     */

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
        var events = this.events;

        if (name) {
            name = name.toLowerCase();
            if (!events[name]) {
                return false;
            }
            return fn ? events[name].hasListener(fn, context) : true;
        }
        else {
            for (name in events) {
                if (events[name].hasListener()) {
                    return true;
                }
            }
            return false;
        }
    },

    /**
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @return bool
    */
    hasEvent: function(name) {
        return !!this.events[name];
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
        if (name) {
            if (!events[name]) {
                return;
            }
            events[name].removeAllListeners();
        }
        else {
            for (name in events) {
                events[name].removeAllListeners();
            }
        }
    },

    /**
    * Trigger an event -- call all listeners. Also triggers '*' event.
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @param {*} ... As many other params as needed
    * @return mixed
    */
    trigger: function() {

        var name = arguments[0],
            events  = this.events,
            e,
            res = null;

        name = name.toLowerCase();

        if (events[name]) {
            e = events[name];
            res = e.trigger.apply(e, slice.call(arguments, 1));
        }
        
        // trigger * event with current event name
        // as first argument
        if (e = events["*"]) {
            e.trigger.apply(e, arguments);
        }
        
        return res;
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
    */
    destroy: function() {
        var self    = this,
            events  = self.events;

        for (var i in events) {
            self.destroyEvent(i);
        }

        for (i in self) {
            self[i] = null;
        }
    },

    /**
    * Although all methods are public there is getApi() method that allows you
    * extending your own objects without overriding "destroy" (which you probably have)
    * @code examples/api.js
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
                    "resumeAllEvents", "destroyEvent",
                    "relayEvent", "unrelayEvent"
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



var error = (function(){

    var listeners = [];

    var error = function error(e) {

        var i, l;

        for (i = 0, l = listeners.length; i < l; i++) {
            if (listeners[i][0].call(listeners[i][1], e) === false) {
                return;
            }
        }

        var stack = (e ? e.stack : null) || (new Error).stack;

        if (typeof console != strUndef && console.error) {
            //async(function(){
                if (e) {
                    console.error(e);
                }
                if (stack) {
                    console.error(stack);
                }
            //});
        }
        else {
            throw e;
        }
    };

    error.on = function(fn, context) {
        error.un(fn, context);
        listeners.push([fn, context]);
    };

    error.un = function(fn, context) {
        var i, l;
        for (i = 0, l = listeners.length; i < l; i++) {
            if (listeners[i][0] === fn && listeners[i][1] === context) {
                listeners.splice(i, 1);
                break;
            }
        }
    };

    return error;
}());




function emptyFn(){};



var functionFactory = function() {

    var REG_REPLACE_EXPR    = /((^|[^a-z0-9_$\]\)'"])|(this))(\.)([^0-9])/ig,
        REG_REPLACER        = "$2____.$5",

        f               = Function,
        fnBodyStart     = 'try {',
        getterBodyEnd   = ';} catch (thrownError) { return undefined; }',
        setterBodyEnd   = ';} catch (thrownError) { return undefined; }',

        getterCache     = {},
        getterCacheCnt  = 0,

        createGetter    = function createGetter(expr, returnAsCode) {

            try {
                if (!getterCache[expr] || returnAsCode) {
                    getterCacheCnt++;

                    var body = "".concat(
                        fnBodyStart,
                        'return ',
                        expr.replace(REG_REPLACE_EXPR, REG_REPLACER),
                        getterBodyEnd
                    );

                    if (returnAsCode) {
                        return "function(____) {" + body + "}";
                    }
                    else {
                        return getterCache[expr] = new f(
                            '____',
                            body
                        );
                    }
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

        createSetter    = function createSetter(expr, returnAsCode) {
            try {
                if (!setterCache[expr] || returnAsCode) {
                    setterCacheCnt++;
                    var code = expr.replace(REG_REPLACE_EXPR, REG_REPLACER),
                        body = "".concat(fnBodyStart, code, ' = $$$$', setterBodyEnd);

                    if (returnAsCode) {
                        return "function(____, $$$$) {" + body + "}";
                    }
                    else {
                        return setterCache[expr] = new f(
                            '____',
                            '$$$$',
                            body
                        );
                    }
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

        createFunc      = function createFunc(expr, returnAsCode) {
            try {
                if (!funcCache[expr] || returnAsCode) {
                    funcCacheCnt++;

                    var body = "".concat(
                        fnBodyStart,
                        expr.replace(REG_REPLACE_EXPR, REG_REPLACER),
                        getterBodyEnd
                    );

                    if (returnAsCode) {
                        return "function(____) {" + body + "}";
                    }
                    else {
                        return funcCache[expr] = new f(
                            '____',
                            body
                        );
                    }
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

    var isStatic    = function(val) {

            if (!isString(val)) {
                return true;
            }

            var first   = val.substr(0, 1),
                last    = val.length - 1;

            if (first === '"' || first === "'") {
                if (val.indexOf(first, 1) === last) {
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

                if (action === 'D') {
                    continue;
                }

                k = getKey(a2[a2i]);

                if (k !== undf && used[k] !== true && (index = map1[k]) !== undf) {
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
     *  @subparam {*} userData optional data to pass to the listener
     *  @subparam {function} filterLookup
     *  @subparam {*} mock do not calculate real values, use mock instead
     *  @subparam {function} predefined getter fn
     * @param {object} opt
     * @constructor
     */
    var Watchable   = function(dataObj, code, fn, fnScope, opt) {

        if (!observable) {
            observable  = new Observable;
        }

        opt = opt || {};

        var self    = this,
            id      = nextUid(),
            type;

        if (opt.filterLookup) {
            self.filterLookup = opt.filterLookup;
        }

        self.mock = opt.mock;
        self.origCode = code;

        if (opt.mock && code.indexOf(".") === -1) {
            type = "attr";
        }
        else if (code && dataObj) {
            type    = dataObj.hasOwnProperty(code) ? "attr" : "expr";
        }
        else if (code && !dataObj) {
            type = "expr";
        }


        if (fn) {
            observable.on(id, fn, fnScope || this, {
                append: [opt.userData],
                allowDupes: true
            });
        }

        if (type === "expr") {
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

        self.userData   = opt.userData;
        self.code       = code;
        self.id         = id;
        self.type       = type;
        self.obj        = dataObj;

        if (type === "expr") {
            self.getterFn   = opt.getterFn || createGetter(code);
        }

        if (type !== "static" || self.pipes) {
            self.curr = self.curr || self._getValue();
            self.currCopy = isPrimitive(self.curr) ? self.curr : copy(self.curr);
        }
        else {
            self.check = returnFalse;
            self.curr = self.prev = self.staticValue;
        }
    };

    extend(Watchable.prototype, {

        //namespace: null,
        //nsGet: null,

        filterLookup: null,

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
        unfilteredCopy: null,
        unfiltered: null,
        pipes: null,
        inputPipes: null,
        lastSetValue: null,
        userData: null,
        obsrvDelegate: null,
        obsrvChanged: false,
        forcePipes: false,

        mock: false,

        // means that pipes always return the same output given the same input.
        // if you want to mark pipe as undeterministic - put ? before it
        // {{ .somevalue | ?pipe }}
        // then value will be passed through all pipes on each check.
        deterministic: true,

        getConfig: function() {
            var getterFn = null;
            if (this.type === "expr") {
                getterFn   = createGetter(this.code, true);
            }
            return {
                type: this.type,
                code: this.origCode,
                withoutPipes: this.code,
                getter: getterFn,
                hasPipes: this.pipes !== null,
                hasInputPipes: this.inputPipes !== null
            }
        },

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

            if (text.indexOf(separator) === -1) {
                return text;
            }

            var parts   = split(text, separator),
                ret     = input ? parts.pop() : parts.shift(),
                pipes   = [],
                pipe,
                i, l;

            for(i = 0, l = parts.length; i < l; i++) {
                pipe = split(trim(parts[i]), ':');
                self._addPipe(pipes, pipe, dataObj, cb, false);
            }

            if (pipes.length) {
                self[propName] = pipes;
            }

            return trim(ret);
        },

        prependInuptPipe: function() {
            this.inputPipes = this.inputPipes || [];
            this._addPipe(
                this.inputPipes,
                toArray(arguments),
                this.obj,
                this.onInputParamChange,
                true
            );
        },
        addInuptPipe: function() {
            this.inputPipes = this.inputPipes || [];
            this._addPipe(
                this.inputPipes,
                toArray(arguments),
                this.obj,
                this.onInputParamChange,
                false
            );
        },

        addPipe: function() {
            this.pipes = this.pipes || [];
            this._addPipe(
                this.pipes,
                toArray(arguments),
                this.obj,
                this.onPipeParamChange,
                false
            );
        },
        prependPipe: function() {
            this.pipes = this.pipes || [];
            this._addPipe(
                this.pipes,
                toArray(arguments),
                this.obj,
                this.onPipeParamChange,
                true
            );
        },

        _addPipe: function(pipes, pipe, dataObj, onParamChange, prepend) {

            var self    = this,
                name    = pipe.shift(),
                fn      = isFunction(name) ? name : null,
                ws      = [],
                fchar   = fn ? null : name.substr(0,1),
                opt     = {
                    neg: false,
                    dblneg: false,
                    undeterm: false,
                    name: name
                },
                i, l;

            if (!fn) {
                if (name.substr(0, 2) === "!!") {
                    name = name.substr(2);
                    opt.dblneg = true;
                }
                else {
                    if (fchar === "!") {
                        name = name.substr(1);
                        opt.neg = true;
                    }
                    else if (fchar === "?") {
                        name = name.substr(1);
                        opt.undeterm = true;
                    }
                }
            }
            else {
                opt.name = fn.name;
            }

            if (self.mock) {
                fn      = function(){};
            }
            else {
                if (!fn && self.filterLookup) {
                    fn = self.filterLookup(name);
                }
                if (!fn) {
                    fn = (typeof window !== "undefined" ? window[name] : null) || dataObj[name];
                }
            }

            //console.log(!!self.nsGet, name, fn)

            if (isFunction(fn)) {

                for (i = -1, l = pipe.length; ++i < l;
                     ws.push(create(
                         dataObj,
                         pipe[i],
                         onParamChange,
                         self,
                         {
                             filterLookup: self.filterLookup,
                             mock: self.mock
                         }
                     ))) {}

                if (fn.$undeterministic) {
                    opt.undeterm = true;
                }

                pipes[prepend?"unshift":"push"]([fn, pipe, ws, opt]);

                if (opt.undeterm) {
                    self.deterministic = false;
                }
            }
        },

        _getRawValue: function() {
            var self    = this,
                val;

            if (self.mock) {
                return self.mock;
            }

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

            return val;
        },

        _getValue: function(useUnfiltered) {

            var self    = this,
                val     = useUnfiltered ? self.unfiltered : self._getRawValue();

            self.unfiltered = val;

            if (self.mock) {
                val = self.mock;
            }
            else {
                val = self._runThroughPipes(val, self.pipes);
            }

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
                    opt,
                    z, zl;

                for (j = 0; j < jlen; j++) {
                    exprs   = pipes[j][1];
                    opt     = pipes[j][3];
                    args    = [];
                    for (z = -1, zl = exprs.length; ++z < zl;
                         args.push(evaluate(exprs[z], dataObj))){}

                    args.unshift(dataObj);
                    args.unshift(val);

                    val     = pipes[j][0].apply(null, args);

                    if (opt.neg) {
                        val = !val;
                    }
                    else if (opt.dblneg) {
                        val = !!val;
                    }
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
         * @param {function|string} p
         * @returns {boolean}
         */
        hasPipe: function(p) {
            return this._hasPipe(this.pipes, p);
        },

        /**
         * @param {function|string} p
         * @returns {boolean}
         */
        hasInputPipe: function(p) {
            return this._hasPipe(this.inputPipes, p);
        },

        /**
         * @param {array} pipes
         * @param {function|string} p
         * @returns {boolean}
         */
        _hasPipe: function(pipes, p) {
            if (!pipes) {
                return false;
            }
            var i, l, name;
            name = isFunction(p) ? p.name : p;
            for (i = 0, l = pipes.length; i < l; i++) {
                if (pipes[i][3].name === name) {
                    return true;
                }
            }
            return false;
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
         * Get last calculated value (with filters and pipes)
         * @returns {*}
         */
        getLastValue: function() {
            return this.curr;
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

            if (type === "attr") {
                self.obj[self.code] = val;
            }
            else if (type === "expr") {

                if (!self.setterFn) {
                    self.setterFn   = createSetter(self.code);
                }

                self.setterFn(self.obj, val);
            }
            else if (type === "object") {
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
            this.forcePipes = true;
            this.check();
            this.forcePipes = false;
        },

        /*onObserverChange: function(changes) {

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
        },*/

        _check: function(async) {

            var self    = this,
                val;

            if (self.deterministic && self.pipes && !self.forcePipes) {
                if (!self._checkUnfiltered()) {
                    return false;
                }
                else {
                    // code smell.
                    // useUnfiltered param implies that
                    // _checkUnfiltered has been called.
                    val = self._getValue(true);
                }
            }
            else {
                val     = self._getValue();
            }

            var curr    = self.currCopy,
                eq      = equals(curr, val);

            //if (self.obsrvDelegate) {
            //    eq      = !self.obsrvChanged;
            //}
            //else {
            //    eq      = equals(curr, val);
            //}

            if (!eq) {
                self.curr = val;
                self.prev = curr;
                self.currCopy = isPrimitive(val) ? val : copy(val);
                //self.obsrvChanged = false;
                observable.trigger(self.id, val, curr, async);
                return true;
            }

            return false;
        },

        _checkUnfiltered: function() {

            var self    = this,
                val     = self._getRawValue(),
                curr    = self.unfilteredCopy,
                eq      = equals(curr, val);

            if (!eq) {
                self.unfiltered = val;
                self.unfilteredCopy = isPrimitive(val) ? val : copy(val);
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
            
            if (!id) {
                return false;
            }

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

            //if (self.obsrvDelegate) {
            //    Object.unobserve(self.obj, self.obsrvDelegate);
            //}

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
     * @param {object} opt
     * @returns {Watchable}
     */
    var create = function(obj, code, fn, fnScope, opt) {

            opt = opt || {};
            code = code || "";

            code = normalizeExpr(obj, trim(code), opt.mock);

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
                    obj.$$watchers.$codes[code].subscribe(fn, fnScope,
                        {append: [opt.userData || null], allowDupes: true});
                }
                else {
                    obj.$$watchers.$codes[code] = new Watchable(
                        obj, code, fn, fnScope, opt);
                }

                return obj.$$watchers.$codes[code];
            }
            else {
                return new Watchable(obj, code, fn, fnScope, opt);
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
         * @param {*} mockMode
         * @returns {string}
         */
        normalizeExpr = function(dataObj, expr, mockMode) {

            if (expr.substr(0, 2) === '{{') {
                expr = expr.substring(2, expr.length - 2);
            }

            // in mock mode we can't check dataObj for having
            // a property. dataObj does not exists in this
            // context
            if (mockMode) {
                var match;
                if ((match = expr.match(/(^|this)\.([A-Z0-9_$]+)$/i)) !== null) {
                    return match[2];
                }
                else {
                    return expr;
                }
            }

            if (dataObj && expr) {
                if (dataObj.hasOwnProperty(expr)) {
                    return expr;
                }
                var prop;
                if (expr.charAt(0) === '.') {
                    prop = expr.substr(1);
                    if (dataObj.hasOwnProperty(prop)) {
                        return prop;
                    }
                }
                else if (expr.substr(0, 5) === "this.") {
                    prop = expr.substr(5);
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
         * @param {object} opt
         * @returns {*}
         */
        evaluate    = function(expr, scope, opt) {
            var val;
            if (val = isStatic(expr)) {
                return val;
            }
            if (expr.indexOf('|') === -1) {
                return createGetter(expr)(scope);
            }
            var w = create(scope, expr, null, null, opt),
                v = w.getValue();
            w.unsubscribeAndDestroy();
            return v;
        };



    Watchable.create = create;
    Watchable.unsubscribeAndDestroy = unsubscribeAndDestroy;
    Watchable.normalizeExpr = normalizeExpr;
    Watchable.eval = evaluate;

    return Watchable;
}();



var __mjsExport = {};
__mjsExport['Watchable'] = Watchable;

typeof global != "undefined" ? (global['MetaphorJs'] = __mjsExport) : (window['MetaphorJs'] = __mjsExport);

}());/* BUNDLE END 003 */