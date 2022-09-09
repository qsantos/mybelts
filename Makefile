build/index.html: $(shell find src -type f) node_modules
	npm run build

node_modules: package.json
	npm ci
