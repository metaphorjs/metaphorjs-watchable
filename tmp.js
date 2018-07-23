
var equals = require("metaphorjs/src/func/equals.js");

var levenshteinArray = function(S1, S2) {

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
    };

var prescription2moves = function(a1, a2, prs, mapBy) {

    var newPrs = [],
        i, l, action,
        map = {},
        index,
        getKey = function(item) {
            if (mapBy == '$') {
                return item;
            }
            else {
                return item[mapBy];
            }
        };

    for (i = 0, l = a1.length; i < l; i++) {
        map[getKey(a1[i])] = i;
    }

    for (i = 0, l = prs.length; i < l; i++) {
        action = prs[i];

        if (action == "-" || action == "D") {
            newPrs.push(action);
        }
        else {
            if ((index = map[getKey(a2[i])]) !== undefined) {
                newPrs.push(index);
            }
            else {
                newPrs.push(action);
            }
        }
    }

    return newPrs;
};


var a1 = [{id: 1}, {id: 2}, {id: 3}];
var a2 = [{id: 3}, {id: 2}, {id: 4}, {id: 1}];

var start = (new Date).getTime();
var res = levenshteinArray(a1, a2);
var prs = prescription2moves(a1, a2, res.prescription, 'id');
var end = (new Date).getTime();

console.log(a1, '->', a2);
console.log(res);
console.log(prs);
console.log(end - start);