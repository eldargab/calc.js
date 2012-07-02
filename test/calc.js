var should = require('should')
var Calc = require('../lib/calc')

function printExpression (exp) {
    return Array.isArray(exp) ? exp.join('; ') : exp
}

function test (exp, res) {
    it(printExpression(exp) + ' => ' + res, function () {
        var calc = Calc()
        exp = Array.isArray(exp) ? exp : [exp]
        var values = exp.map(function (ex) {
            return calc(ex)
        })
        values[values.length - 1].should.equal(res)
    })
}

describe('Calc', function () {
    test('1 + 1', 2)
    test('2 - 1', 1)
    test('-1', -1)
    test('+1', 1)
    test('2 + 3*3', 11)
    test('4/2', 2)
    test('4 / 2^2', 1)
    test('2 * (1 + 1)', 4)
    test('pow(2, 2)^2', 16)
    test(['a = 10', 'b = a + 5'], 15)
})