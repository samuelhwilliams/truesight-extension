# TrueSight Extension Makefile

EXTENSION_NAME = truesight
VERSION = $(shell grep '"version"' manifest.json | sed 's/.*"version": *"\([^"]*\)".*/\1/')
PACKAGE_NAME = $(EXTENSION_NAME)-v$(VERSION).zip

# Files to include in the package
PACKAGE_FILES = manifest.json background.js content.js icons/

.PHONY: package clean help

# Default target
all: package

# Package the extension for Chrome Web Store upload
package: clean
	@echo "Packaging $(EXTENSION_NAME) v$(VERSION)..."
	@zip -r $(PACKAGE_NAME) $(PACKAGE_FILES) -x "*.DS_Store" "*.git*" "*~" "*.tmp"
	@echo "Package created: $(PACKAGE_NAME)"
	@echo "Ready for upload to Chrome Web Store"

# Clean up generated files
clean:
	@echo "Cleaning up..."
	@rm -f $(EXTENSION_NAME)-*.zip

# Show help
help:
	@echo "Available targets:"
	@echo "  package  - Package the extension for Chrome Web Store upload"
	@echo "  clean    - Remove generated package files"
	@echo "  help     - Show this help message"