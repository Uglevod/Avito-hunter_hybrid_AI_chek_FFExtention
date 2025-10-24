.PHONY: build build-dev build-custom clean help install test

# Переменные
SHELL := /bin/bash
BUILD_SCRIPT := ./build.sh
OUTPUT_NAME ?= Avito_Hunter_LLM
XPI_FILE = $(OUTPUT_NAME).xpi

# Цвета
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m

help:
	@echo "$(BLUE)╔════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║  Avito Hunter LLM - Build Commands    ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@echo ""
	@echo "  $(YELLOW)make build$(NC)                - Build .xpi with default name"
	@echo "  $(YELLOW)make build-dev$(NC)            - Build with '_dev' suffix"
	@echo "  $(YELLOW)make build-custom NAME=..$(NC)  - Build with custom name"
	@echo "  $(YELLOW)make clean$(NC)                - Remove all .xpi files"
	@echo "  $(YELLOW)make help$(NC)                 - Show this help"
	@echo ""
	@echo "$(GREEN)Examples:$(NC)"
	@echo ""
	@echo "  make build"
	@echo "  make build-dev"
	@echo "  make build-custom NAME=MyExtension_v1.0"
	@echo ""

# Основная сборка
build:
	@echo "$(BLUE)Building extension...$(NC)"
	@bash $(BUILD_SCRIPT)

# Сборка dev версии
build-dev:
	@echo "$(BLUE)Building dev version...$(NC)"
	@bash $(BUILD_SCRIPT) "$(OUTPUT_NAME)_dev"

# Сборка с пользовательским названием
build-custom:
	@if [ -z "$(NAME)" ]; then \
		echo "$(RED)Error: NAME not specified$(NC)"; \
		echo "Usage: make build-custom NAME=MyName"; \
		exit 1; \
	fi
	@echo "$(BLUE)Building custom: $(NAME)$(NC)"
	@bash $(BUILD_SCRIPT) "$(NAME)"

# Очистка всех .xpi файлов
clean:
	@echo "$(YELLOW)Removing .xpi files...$(NC)"
	@rm -f *.xpi
	@echo "$(GREEN)Clean complete$(NC)"

# Проверка наличия необходимых файлов
check:
	@echo "$(BLUE)Checking required files...$(NC)"
	@for file in manifest.json background.js content.js popup.html popup.js sysPrompt icon16.png icon48.png icon128.png; do \
		if [ -f "$$file" ]; then \
			echo "$(GREEN)✓$(NC) $$file"; \
		else \
			echo "$(RED)✗$(NC) $$file"; \
		fi; \
	done

# Показать информацию о .xpi файле
info:
	@if [ -f "$(XPI_FILE)" ]; then \
		echo "$(BLUE)File Info:$(NC)"; \
		ls -lh "$(XPI_FILE)"; \
		echo ""; \
		echo "$(BLUE)Contents:$(NC)"; \
		unzip -l "$(XPI_FILE)"; \
	else \
		echo "$(RED)File not found: $(XPI_FILE)$(NC)"; \
	fi

# Список всех .xpi файлов
list:
	@echo "$(BLUE)Available .xpi files:$(NC)"
	@ls -lh *.xpi 2>/dev/null || echo "$(YELLOW)No .xpi files found$(NC)"

# Все цели без зависимостей
.PHONY: build build-dev build-custom clean help check info list
