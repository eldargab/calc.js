# calc.js

The toy CLI calculator writed as an exercies. It uses
[Pratt's](http://boole.stanford.edu/pratt.html) [Top Down Operator
Precedence](http://mauke.hopto.org/stuff/papers/p41-pratt.pdf) technique also
described in [this article](http://javascript.crockford.com/tdop/tdop.html).

## Capabilities

```
    ✓ 1 + 1 => 2
    ✓ 2 - 1 => 1
    ✓ -1 => -1
    ✓ +1 => 1
    ✓ 2 + 3*3 => 11
    ✓ 4/2 => 2
    ✓ 4 / 2^2 => 1
    ✓ 2 * (1 + 1) => 4
    ✓ pow(2, 2)^2 => 16
    ✓ a = 10; b = a + 5 => 15


  ✔ 10 tests complete (9ms)
```

## Installation

```
$ npm install https://github.com/eldargab/calc.js
```

To run tests first install dev dependencies

```
$ npm install -d
```

then run

```
$ make test
```

To start repl:

```
$ make repl
```

or simply invoke calc executable.

# License

MIT