var Parser = require('./parser')

function error (msg, pos) {
    var err = new Error(msg)
    err.pos = pos
    return err
}

var tokens = {}


function Tok (type, proto) {
    tokens[type] = function (pos) {
        this.pos = pos
        this.init && this.init.apply(this, Array.prototype.slice.call(arguments, 1))
    }
    proto.type = type
    proto.error = function (msg) {
        return error(msg, this.pos)
    }
    tokens[type].prototype = proto
}

function Prefix (type, proto) {
    proto.led = proto.led || function () {
        throw this.error('Operator missing before ' + this.val)
    }
    Tok(type, proto)
}

Prefix('number', {
    init: function (val) {
        this.val = val
    },
    nud: function () { return this },
    eval: function (env) {
        return Number(this.val)
    }
})

Prefix('function', {
    init: function (name) {
        this.name = name
        this.args = []
    },
    nud: function (p) {
        if (p.read(')')) return this

        this.args.push(p.parse())

        while (p.read(',')) {
            this.args.push(p.parse())
        }

        if (!p.read(')')) throw error('Expected ")"', p.pos)
        return this
    },
    eval: function (env) {
        var fn = env[this.name]
        if (typeof fn != 'function') throw this.error(this.name + ' is not a function')
        var args = this.args.map(function (arg) {
            return arg.eval(env)
        })
        return fn.apply(env, args)
    }
})

Prefix('ref', {
    init: function (name) {
        this.name = name
    },
    nud: function () {
        return this
    },
    eval: function (env) {
        var val = env[this.name]
        if (typeof val == 'function') throw this.error(this.name + ' is a function')
        if (val == null) throw this.error(this.name + ' is undefined')
        return val
    }
})

Prefix('(', {
    nud: function (p) {
        var exp = p.parse()
        if (!p.read(')')) throw error('Expected ")"', p.pos)
        return exp
    }
})


function InfixArithm (type, bp, eval, nud) {
    Tok(type, {
        lbp: bp,
        led: function (left, p) {
            this.left = left
            this.right = p.parse(bp)
            if (this.right == null) throw this.error('Right argument missing for ' + type)
            return this
        },
        eval: function (env) {
            return eval.call(this, this.left.eval(env), this.right.eval(env))
        },
        nud: nud || function (p) {
            throw this.error('Left argument missing for ' + type)
        }
    })
}

InfixArithm('^', 7, function (left, right) {
    return Math.pow(left, right)
})

InfixArithm('*', 5, function (left, right) {
    return left * right
})

InfixArithm('/', 5, function (left, right) {
    if (right == 0) throw this.error('Division by zero')
    return left / right
})

var zero = {
    eval: function () {
        return 0
    }
}

InfixArithm('+', 3, function (left, right) {
    return left + right
}, function (p) {
    return this.led(zero, p)
})

InfixArithm('-', 3, function (left, right) {
    return left - right
}, function (p) {
    return this.led(zero, p)
})

Tok('=', {
    lbp: 1,
    nud: function () {
        throw this.error('Missing reference to assign to')
    },
    led: function (left, p) {
        if (left.type != 'ref') throw this.error('You can assign values only to references')
        this.ref = left.name
        this.src = p.parse(1)
        return this
    },
    eval: function (env) {
        return env[this.ref] = this.src.eval(env)
    }
})


function readToken (p) {
    p.eatWhitespace()
    return p.scan(/^[\d\.]+/, function (pos, capt) {
        return new tokens.number(pos, capt[0])
    }) || p.scan(/^([a-zA-Z]\w*)(\s*\()?/, function (pos, capt) {
        return capt[2]
            ? new tokens.function(pos, capt[1])
            : new tokens.ref(pos, capt[1])
    }) || (function () {
        var Type = tokens[p.str[0]]
        if (Type) {
            var pos = p.pos
            p.consume(1)
            return new Type(pos)
        }
    })()
}

function parse (str) {
    var p = new Parser(str, readToken)
    var result = p.parse()
    if (p.str.length > 0) throw error('Unexpected symbol', p.pos)
    return result
}

module.exports = function () {
    var env = Object.create(Math)

    return function evaluate (str) {
        var tok = parse(str)
        return tok && tok.eval(env)
    }
}
