test:
	./node_modules/.bin/mocha -R spec

repl:
	node bin/calc

.PHONY: test repl