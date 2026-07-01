.PHONY: install validate lint check clean
install:
	npm ci
validate:
	npm run validate
lint:
	npx -y @stoplight/spectral-cli@6 lint "openapi/**/*.yaml" --ruleset .spectral.yaml
check: validate lint
clean:
	rm -rf node_modules
