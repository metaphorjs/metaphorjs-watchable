

(function(){

    "use strict";

    if (typeof window == "undefined") {
        global.window = global;
    }

    var Observable;

    if (typeof global != "undefined") {
        try {
            Observable = require("metaphorjs-observable");
        }
        catch (e) {
            if (global.Observable) {
                Observable = global.Observable;
            }
        }
    }
    else if (window.MetaphorJs && MetaphorJs.lib && MetaphorJs.lib.Observable) {
        Observable = MetaphorJs.lib.Observable;
    }


    var REG_REPLACE_EXPR = /(^|[^a-z0-9_$])(\.)([^0-9])/ig,
        hashes     = {},
        randomHash = function() {
            var N = 10;
            return new Array(N+1).join((Math.random().toString(36)+'00000000000000000')
                .slice(2, 18)).slice(0, N);
        },
        nextHash    = window.MetaphorJs && MetaphorJs.nextUid ? MetaphorJs.nextUid : function() {
            var hash = randomHash();
            return !hashes[hash] ? (hashes[hash] = hash) : nextHash();
        },
        toString    = Object.prototype.toString,
        isArray     = function(obj) {
            return toString.call(obj) === '[object Array]';
        },
        isObject    = function(value) {
            return value != null && typeof value === 'object';
        },
        isDate      = function(value) {
            return toString.call(value) === '[object Date]';
        },
        isFunction  = function(value) {
            return typeof value === 'function';
        },
        isRegExp    = function(value) {
            return toString.call(value) === '[object RegExp]';
        },
        isWindow    = function(obj) {
            return obj && obj.document && obj.location && obj.alert && obj.setInterval;
        },
        extend      = function(trg, src) {
            for (var i in src) {
                if (src.hasOwnProperty(i)) {
                    trg[i] = src[i];
                }
            }
        },
        copy    = function(source, destination){
            if (isWindow(source)) {
                throw new Error("Cannot copy window object");
            }

            if (!destination) {
                destination = source;
                if (source) {
                    if (isArray(source)) {
                        destination = copy(source, []);
                    } else if (isDate(source)) {
                        destination = new Date(source.getTime());
                    } else if (isRegExp(source)) {
                        destination = new RegExp(source.source);
                    } else if (isObject(source)) {
                        destination = copy(source, {});
                    }
                }
            } else {
                if (source === destination) {
                    throw new Error("Objects are identical");
                }
                if (isArray(source)) {
                    destination.length = 0;
                    for ( var i = 0; i < source.length; i++) {
                        destination.push(copy(source[i]));
                    }
                } else {
                    var key;
                    for (key in destination) {
                        delete destination[key];
                    }
                    for (key in source) {
                        destination[key] = copy(source[key]);
                    }
                }
            }
            return destination;
        },
        equals  = function(o1, o2) {
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
                            if (key.charAt(0) === '$' && typeof o1[key] == "object") {
                                continue;
                            }
                            if (isFunction(o1[key])) {
                                continue;
                            }
                            if (!equals(o1[key], o2[key])) {
                                return false;
                            }
                            keySet[key] = true;
                        }
                        for(key in o2) {
                            if (!keySet.hasOwnProperty(key) &&
                                key.charAt(0) !== '$' &&
                                o2[key] !== undefined &&
                                !isFunction(o2[key])) return false;
                        }
                        return true;
                    }
                }
            }
            return false;
        },
        levenshteinArray = function(S1, S2) {

            var m = S1.length,
                n = S2.length,
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
                    cost = (!equals(S1[i - 1], S2[j - 1])) ? 1 : 0;

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
        },
        trim = window.MetaphorJs ? MetaphorJs.trim : (function() {
            // native trim is way faster: http://jsperf.com/angular-trim-test
            // but IE doesn't have it... :-(
            if (!String.prototype.trim) {
                return function(value) {
                    return typeof value == "string" ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
                };
            }
            return function(value) {
                return typeof value == "string" ? value.trim() : value;
            };
        })(),

        observable,

        g = window.MetaphorJs ? MetaphorJs.ns.get : null;



    var Watchable   = function(dataObj, code, fn, fnScope, userData) {

        if (!observable) {
            observable  = new Observable;
        }

        var self    = this,
            id      = nextHash(),
            type;

        if (isArray(dataObj) && code === null) {
            type    = "array";
        }
        else {

            if (typeof code != "string") {
                fnScope = fn;
                fn      = code;
                code    = null;
                type    = "object"; // isArray(obj) ? "collection" :
            }
            if (typeof dataObj == "string") {
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
        }

        if (fn) {
            observable.on(id, fn, fnScope || this, {
                append: [userData],
                allowDupes: true
            });
        }

        code            = self._processPipes(code, dataObj);

        self.code       = code;
        self.getterFn   = type == "expr" ? createGetter(code) : null;
        self.id         = id;
        self.type       = type;
        self.obj        = dataObj;
        self.itv        = null;
        self.curr       = self._getValue();
    };

    extend(Watchable.prototype, {

        code: null,
        getterFn: null,
        setterFn: null,
        id: null,
        type: null,
        obj: null,
        itv: null,
        curr: null,
        arraySlice: false,
        pipes: null,

        _addPipe: function(pipes, pipe, dataObj) {

            var name    = pipe[0],
                fn      = null,
                ws      = [],
                i, l,
                expr,
                first;

            if (g) {
                fn = g("filter." + name, true);
            }
            if (!fn) {
                fn = window[name] || dataObj[name];
            }

            if (typeof fn == "function") {

                if (fn.$expectExpressions) {
                    for (i = 1, l = pipe.length; i < l; i++) {
                        expr = pipe[i];
                        first = expr.substr(0,1);
                        if (first != '"' && first != "'") {
                            ws.push(create(dataObj, expr, self.check, self));
                        }
                    }
                }

                pipes.push([fn, pipe.slice(1), ws]);
            }
        },

        _processPipes: function(text, dataObj) {

            var self        = this,
                index       = 0,
                textLength  = text.length,
                pipes       = [],
                pIndex,
                prev, next, pipe,
                found       = false,
                ret         = text;

            while(index < textLength) {

                if ((pIndex  = text.indexOf('|', index)) != -1) {

                    prev = text.charAt(pIndex -1);
                    next = text.charAt(pIndex + 1);

                    if (prev != '|' && prev != "'" && prev != '"' && next != '|' && next != "'" && next != '"') {
                        if (!found) {
                            found = true;
                            ret = trim(text.substring(0, pIndex));
                        }
                        else {
                            pipe = trim(text.substring(index, pIndex)).split(":");

                            self._addPipe(pipes, pipe, dataObj);
                        }
                    }
                    index = pIndex + 1;
                }
                else {
                    if (found) {
                        pipe = trim(text.substr(index)).split(":");
                        self._addPipe(pipes, pipe, dataObj);
                    }
                    break;
                }
            }

            if (pipes.length) {
                self.pipes = pipes;
            }

            return ret;
        },

        _checkCode: function() {

            var self    = this,
                val     = self._getValue(),
                changed = false,
                prev    = self.curr,
                lev;

            if (isArray(prev) && isArray(val)) {

                lev     = levenshteinArray(prev, val);

                if (lev.changes) {
                    self.curr = val.slice();
                    observable.trigger(self.id, lev, val, prev);
                    return true;
                }

                return false;
            }

            if (val !== prev) {
                self.curr = val;
                observable.trigger(self.id, val, prev);
                changed = true;
            }

            return changed;
        },

        _checkObject: function() {

            var self    = this,
                obj     = self.obj,
                curr    = self.curr;

            if (!equals(curr, obj)) {
                self.curr = copy(obj);
                observable.trigger(self.id, obj, curr);
                return true;
            }

            return false;
        },

        _checkArray: function() {

            var self    = this,
                curr    = self.curr,
                obj     = self.obj,
                lev     = levenshteinArray(curr, obj);

            if (lev.changes) {
                self.curr = obj.slice();
                observable.trigger(self.id, lev, obj, curr);
                return true;
            }

            return false;
        },


        _getValue: function() {

            var self    = this,
                val;

            switch (self.type) {
                case "attr":
                    val = self.obj[self.code];
                    break;
                case "expr":
                    try {
                        val = self.getterFn(self.obj);
                    }
                    catch (e) {
                        if (window.MetaphorJs) {
                            MetaphorJs.asyncError(e);
                        }
                        else {
                            throw e;
                        }
                    }
                    if (typeof val == "undefined") {
                        val = "";
                    }
                    break;
                case "object":
                    val = copy(self.obj);
                    break;
                case "array":
                    val = self.obj;
                    break;
            }

            if (isArray(val)) {
                val = val.slice();
            }

            var pipes   = self.pipes;

            if (pipes) {
                var j,
                    args,
                    jlen    = pipes.length;

                for (j = 0; j < jlen; j++) {
                    args    = pipes[j][1].slice();
                    args.unshift(val);
                    args.push(self.obj);
                    val     = pipes[j][0].apply(null, args);
                }

            }


            return val;
        },


        addListener: function(fn, fnScope, options) {
            return observable.on(this.id, fn, fnScope, options);
        },

        removeListener: function(fn, fnScope) {
            return observable.un(this.id, fn, fnScope);
        },


        getValue: function() {
            return this._getValue();
        },

        setValue: function(val) {

            var self    = this,
                type    = self.type;

            if (type == "attr") {
                self.obj[self.code] = val;
            }
            else if (type == "expr") {

                if (!self.setterFn) {
                    self.setterFn   = createSetter(self.code);
                }

                self.setterFn(self.obj, val);
            }
            else if (type == "array") {
                self.obj = val;
            }
            else {
                throw "Cannot set value";
            }
        },

        check: function() {

            var self    = this;

            switch (self.type) {
                case "expr":
                case "attr":
                    return self._checkCode();

                case "object":
                    return self._checkObject();

                case "array":
                    return self._checkArray();
            }

            return false;
        },

        checkAll: function() {
            return this.obj.$$watchers.$checkAll();
        },

        getLastResult: function() {
            return this.curr;
        },

        setInterval: function(ms) {

            var self    = this;
            if (self.itv) {
                self.clearInterval();
            }
            self.itv = setInterval(function(){self.check();}, ms);
        },

        clearInterval: function() {
            var self    = this;
            if (self.itv) {
                clearInterval(self.itv);
                self.itv = null;
            }
        },

        unsubscribeAndDestroy: function(fn, fnScope) {

            var self    = this,
                id      = self.id;

            observable.un(id, fn, fnScope);

            if (!observable.hasListener(id)) {
                self.destroy();
                return true;
            }

            return false;
        },

        destroy: function() {

            var self    = this,
                pipes   = self.pipes,
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

            self.curr   = null;
            self.obj    = null;
            self.pipes  = null;

            observable.destroyEvent(self.id);

            if (self.obj) {
                delete self.obj.$$watchers[self.code];
            }
        }
    });


    var create = function(obj, code, fn, fnScope, userData) {

        code = normalizeExpr(obj, trim(code));

        if (obj) {
            if (!obj.$$watchers) {
                obj.$$watchers = {
                    $checkAll: function() {

                        var self    = this,
                            i,
                            changes = 0;

                        for (i in self) {

                            if (i.charAt(0) != '$' && self[i].check()) {
                                changes++;
                            }
                            else if (i.charAt(0) == '$' && self[i] instanceof Watchable && self[i].check()) {
                                changes++;
                            }
                        }

                        return changes;
                    },
                    $destroyAll: function() {

                        var self    = this,
                            i;

                        for (i in self) {
                            if (i.charAt(0) != '$' || self[i] instanceof Watchable) {
                                self[i].destroy();
                                delete self[i];
                            }
                        }
                    }
                };
            }
            if (obj.$$watchers[code]) {
                obj.$$watchers[code].addListener(fn, fnScope, {append: [userData], allowDupes: true});
            }
            else {
                obj.$$watchers[code] = new Watchable(obj, code, fn, fnScope, userData);
            }
            return obj.$$watchers[code];
        }
        else {
            return new Watchable(obj, code, fn, fnScope, userData);
        }
    };

    var unsubscribeAndDestroy = function(obj, code, fn, fnScope) {
        code = trim(code);

        var ws = obj.$$watchers;

        if (ws && ws[code] && ws[code].unsubscribeAndDestroy(fn, fnScope)) {
            delete ws[code];
        }
    };

    var normalizeExpr = function(dataObj, expr) {
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
    };

    var f = Function;

    var prepareCode = function prepareCode(expr) {
        return expr.replace(REG_REPLACE_EXPR, '$1____.$3');
    };

    var getterCache = {};
    var createGetter = function createGetter(expr) {
        if (!getterCache[expr]) {
            return getterCache[expr] = new f('____', 'return '.concat(expr.replace(REG_REPLACE_EXPR, '$1____.$3')));
        }
        return getterCache[expr];
    };

    var setterCache = {};
    var createSetter = function createSetter(expr) {
        if (!setterCache[expr]) {
            var code = expr.replace(REG_REPLACE_EXPR, '$1____.$3');
            return setterCache[expr] = new f('____', '$$$$', code.concat(' = $$$$'));
        }
        return setterCache[expr];
    };

    var funcCache = {};
    var createFunc = function createFunc(expr) {
        if (!funcCache[expr]) {
            return funcCache[expr] = new f('____', expr.replace(REG_REPLACE_EXPR, '$1____.$3'));
        }
        return funcCache[expr];
    };

    Watchable.create = create;
    Watchable.unsubscribeAndDestroy = unsubscribeAndDestroy;
    Watchable.normalizeExpr = normalizeExpr;
    Watchable.prepareCode = prepareCode;
    Watchable.createGetter = createGetter;
    Watchable.createSetter = createSetter;
    Watchable.createFunc = createFunc;


    if (window.MetaphorJs && MetaphorJs.r) {
        MetaphorJs.r("MetaphorJs.lib.Watchable", Watchable);
    }

    if (typeof global != "undefined") {
        module.exports = Watchable;
    }

}());