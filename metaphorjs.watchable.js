

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
    else if (window.MetaphorJs && MetaphorJs.lib && MetaphorJs.lib.Promise) {
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
            var hash    = randomHash();
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
        trim = MetaphorJs ? MetaphorJs.trim : (function() {
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

        observable;

    var Watchable   = function(dataObj, code, fn, fnScope, userData) {

        if (!observable) {
            observable  = new Observable;
        }

        var self    = this,
            id      = nextHash(),
            type;

        if (isArray(dataObj) && code == "array") {
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


        self.code       = code;
        self.getterFn   = type == "expr" ? Watchable.createGetter(code) : null;
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
                    val = self.getterFn(self.obj);
                    break;
                case "object":
                    return copy(self.obj);
                case "array":
                    return self.obj.slice();
            }

            if (isArray(val)) {
                return val.slice();
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

            var self    = this;

            if (self.type == "attr") {
                self.obj[self.code] = val;
            }
            else if (self.type == "expr") {

                if (!self.setterFn) {
                    self.setterFn   = Watchable.createSetter(self.code);
                }

                self.setterFn(self.obj, val);
            }
            else {
                throw new Error("Cannot set value");
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

            var self    = this;

            self.curr   = null;
            self.obj    = null;

            if (self.itv) {
                self.clearInterval();
            }

            observable.destroyEvent(self.id);

            if (self.obj) {
                delete self.obj.$$watchers[self.code];
            }
        }
    });

    Watchable.create = function(obj, code, fn, fnScope, userData) {

        code = Watchable.normalizeExpr(obj, trim(code));

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

    Watchable.unsubscribeAndDestroy = function(obj, code, fn, fnScope) {
        code = trim(code);

        var ws = obj.$$watchers;

        if (ws && ws[code] && ws[code].unsubscribeAndDestroy(fn, fnScope)) {
            delete ws[code];
        }
    };

    Watchable.normalizeExpr = function(dataObj, expr) {
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

    Watchable.prepareCode = function(expr) {
        return expr.replace(REG_REPLACE_EXPR, '$1____.$3');
    };

    Watchable.createGetter = function(expr) {
        expr = expr.replace(REG_REPLACE_EXPR, '$1____.$3');
        return new Function('____', 'return ' + expr);
    };

    Watchable.createSetter = function(expr) {
        expr = expr.replace(REG_REPLACE_EXPR, '$1____.$3');
        return new Function('____', '$$$$', expr + ' = $$$$');
    };

    Watchable.createFunc = function(expr) {
        expr = expr.replace(REG_REPLACE_EXPR, '$1____.$3');
        return new Function('____', expr);
    };

    if (window.MetaphorJs && MetaphorJs.r) {
        MetaphorJs.r("MetaphorJs.lib.Watchable", Watchable);
    }

    if (typeof global != "undefined") {
        module.exports = Watchable;
    }

}());