
module.exports = Parser

function Parser (str, matchNextTok) {
    this.str = str
    this.pos = 0
    this.matchNextTok = matchNextTok
}

Parser.prototype.consume = function (n) {
    this.str = this.str.substr(n)
    this.pos += n
}

Parser.prototype.scan = function (regex, cb) {
    var captures = regex.exec(this.str)
    if (!captures) return
    var tok = cb(this.pos, captures)
    tok && this.consume(captures[0].length)
    return tok
}

Parser.prototype.eatWhitespace = function () {
    var c = /^\s+/.exec(this.str)
    c && this.consume(c[0].length)
}

Parser.prototype.read = function (s) {
    this.eatWhitespace()
    if (this.str.substr(0, s.length) != s) return false
    this.consume(s.length)
    return true
}

Parser.prototype._advance = function () {
    if (this.str.length == 0) {
        this._tok = null
        return
    }
    this._tok = this.matchNextTok(this)
}

Parser.prototype.advance = function () {
    this._tok || this._advance()
    var tok = this._tok
    this._tok = null
    return tok
}

Parser.prototype.nextToken = function () {
    this._tok || this._advance()
    return this._tok
}

Parser.prototype.parse = function (rbp) {
    rbp = rbp || 0
    var tok = this.advance()
    if (!tok) return null
    var left = tok.nud(this)
    while ((tok = this.nextToken()) && tok.lbp > rbp) {
        this.advance()
        left = tok.led(left, this)
    }
    return left
}
