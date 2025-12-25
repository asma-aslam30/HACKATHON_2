# Code Quality & Integration Agent Specification

**Agent Type**: Quality Assurance & Integration
**Version**: 1.0.0
**Created**: 2025-12-24
**Status**: Active

---

## Role

The **Code Quality & Integration Agent** is responsible for maintaining code quality standards, ensuring Constitution compliance, and managing the integration of all components across the **Evolution of Todo** hackathon project. This agent operates at the quality assurance level, reviewing all generated code, running linters and formatters, enforcing best practices, and validating that implementations match specifications and architectural decisions.

The Code Quality Agent follows the Constitution's **Single Source of Truth** and **AI-Implemented Only** principles—verifying that all code is AI-generated according to specifications and that no manual code bypasses the spec-first workflow. The agent ensures consistency, maintainability, security, and adherence to coding standards across all phases.

The Code Quality Agent works as the final gatekeeper before code is merged, ensuring all work meets the project's high standards and aligns with the Constitution's principles.

---

## Responsibilities

### 1. Code Review and Linting

**Primary Responsibility**: Review all generated code for quality, consistency, and adherence to coding standards.

**Backend Linting** (Python) - `backend/`:

**Linting Tools Configuration**:

**pyproject.toml**:
```toml
[tool.ruff]
line-length = 100
target-version = "py311"
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "N",   # pep8-naming
    "UP",  # pyupgrade
    "ANN", # flake8-annotations
    "B",   # flake8-bugbear
    "A",   # flake8-builtins
    "C4",  # flake8-comprehensions
    "DTZ", # flake8-datetimez
    "T10", # flake8-debugger
    "ISC", # flake8-implicit-str-concat
    "ICN", # flake8-import-conventions
    "PIE", # flake8-pie
    "PT",  # flake8-pytest-style
    "Q",   # flake8-quotes
    "RSE", # flake8-raise
    "RET", # flake8-return
    "SIM", # flake8-simplify
    "TID", # flake8-tidy-imports
    "ARG", # flake8-unused-arguments
    "ERA", # eradicate
    "PL",  # pylint
    "RUF", # ruff-specific rules
]
ignore = [
    "ANN101",  # Missing type annotation for self
    "ANN102",  # Missing type annotation for cls
    "PLR0913", # Too many arguments
]

[tool.ruff.per-file-ignores]
"tests/**/*.py" = ["ANN", "ARG"]

[tool.black]
line-length = 100
target-version = ["py311"]

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_any_unimported = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
check_untyped_defs = true

[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false
```

**Running Linters**:
```bash
# Format code
black backend/src/
ruff check backend/src/ --fix

# Type checking
mypy backend/src/

# Security scanning
bandit -r backend/src/ -ll

# Full quality check
make lint-backend
```

**Makefile**:
```makefile
.PHONY: lint-backend
lint-backend:
	@echo "Running Python linters..."
	black --check backend/src/
	ruff check backend/src/
	mypy backend/src/
	bandit -r backend/src/ -ll
	@echo "✓ All Python checks passed"
```

---

**Frontend Linting** (TypeScript/JavaScript) - `frontend/`:

**.eslintrc.json**:
```json
{
  "extends": [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint", "react", "jsx-a11y"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

**.prettierrc**:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

**Running Linters**:
```bash
# Format code
npm run format

# Lint
npm run lint

# Type check
npm run type-check

# Full quality check
make lint-frontend
```

**package.json**:
```json
{
  "scripts": {
    "lint": "eslint src/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "type-check": "tsc --noEmit"
  }
}
```

---

### 2. Constitution Compliance Validation

**Primary Responsibility**: Ensure all code and processes comply with Constitution principles.

**Compliance Checklist** (`specs/testing/constitution-compliance.md`):

```markdown
# Constitution Compliance Checklist

Run this checklist before every PR merge.

## I. Spec-First Development

- [ ] Feature has spec in `/specs/<feature>/spec.md`
- [ ] Spec includes user stories with priorities (P1, P2, P3)
- [ ] Spec includes acceptance criteria (Given-When-Then)
- [ ] Spec was written before code
- [ ] Implementation matches spec (verified by Testing Agent)

## II. AI-Implemented Only

- [ ] All `.py` files generated by AI (Backend Agent)
- [ ] All `.ts/.tsx` files generated by AI (Frontend Agent)
- [ ] All Dockerfiles generated by AI (CloudOps Agent)
- [ ] All Kubernetes manifests generated by AI (CloudOps Agent)
- [ ] No manual code changes (except specs, docs, `.env`)

## III. Single Source of Truth

- [ ] Spec is authoritative (not code comments)
- [ ] If code-spec mismatch, spec was updated first
- [ ] Constitution referenced for governance decisions
- [ ] ADRs document all architectural decisions

## IV. Evolutionary Architecture

- [ ] Phase N builds on Phase N-1 (no rewrites)
- [ ] Existing APIs versioned, not replaced
- [ ] Database migrations are reversible
- [ ] Tests from previous phases still pass

## V. Testability and Documentation

- [ ] All backend APIs have integration tests
- [ ] All data models have validation tests
- [ ] All user stories have acceptance tests
- [ ] Test coverage >90% for new code
- [ ] All architectural decisions have ADRs
- [ ] All deployment procedures have runbooks

## VI. Observability and Operational Excellence

- [ ] All services log in JSON format with correlation IDs
- [ ] All HTTP endpoints expose latency metrics (p50/p95/p99)
- [ ] All error paths log structured error details
- [ ] Health check endpoints implemented (`/health`, `/ready`)
- [ ] Prometheus metrics exposed
- [ ] Distributed tracing spans added

## VII. Security by Design

- [ ] No secrets in code or version control
- [ ] All secrets in `.env` (gitignored) or K8s Secrets
- [ ] All user input validated and sanitized
- [ ] All APIs require authentication (Phase II+)
- [ ] All passwords hashed with bcrypt
- [ ] All dependencies pass security scanning (Trivy)

## VIII. Incremental Delivery and MVP Thinking

- [ ] P1 user stories implemented first
- [ ] Feature is independently testable
- [ ] Feature can be deployed independently
- [ ] Demo-able to stakeholders

## Overall Compliance

- [ ] All 8 principles followed
- [ ] No violations or documented exceptions
- [ ] Code ready for merge

**Reviewer Signature**: _______________
**Date**: _______________
```

**Automated Compliance Checks** (`scripts/check-compliance.sh`):

```bash
#!/bin/bash
# Automated Constitution compliance checks

set -e

echo "Running Constitution Compliance Checks..."

# Check 1: Spec exists for new feature
if [ ! -f "specs/$FEATURE/spec.md" ]; then
    echo "❌ FAIL: No spec found for feature $FEATURE"
    echo "   Spec-First Development principle violated"
    exit 1
fi

# Check 2: No secrets in code
if git diff main... | grep -E '(password|secret|api_key|token).*(=|:).*["\']' | grep -v '.env'; then
    echo "❌ FAIL: Secrets found in code"
    echo "   Security by Design principle violated"
    exit 1
fi

# Check 3: Test coverage >90%
COVERAGE=$(pytest --cov=backend/src --cov-report=term-missing | grep TOTAL | awk '{print $4}' | sed 's/%//')
if [ "$COVERAGE" -lt 90 ]; then
    echo "❌ FAIL: Test coverage is $COVERAGE% (< 90%)"
    echo "   Testability principle violated"
    exit 1
fi

# Check 4: All Docker images pass security scan
docker scan ghcr.io/username/evolution-todo-backend:latest || {
    echo "❌ FAIL: Docker image has security vulnerabilities"
    echo "   Security by Design principle violated"
    exit 1
}

# Check 5: Linting passes
make lint-backend && make lint-frontend || {
    echo "❌ FAIL: Linting errors found"
    exit 1
}

echo "✓ All compliance checks passed"
```

---

### 3. Pre-Commit Hooks and CI/CD Quality Gates

**Primary Responsibility**: Enforce quality checks automatically before commits and in CI/CD pipelines.

**Pre-Commit Hooks** (`.pre-commit-config.yaml`):

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
        args: ['--maxkb=500']
      - id: check-merge-conflict
      - id: detect-private-key

  - repo: https://github.com/psf/black
    rev: 23.7.0
    hooks:
      - id: black
        language_version: python3.11
        files: ^backend/

  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.0.282
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
        files: ^backend/

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.4.1
    hooks:
      - id: mypy
        files: ^backend/src/
        additional_dependencies: [types-all]

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.1
    hooks:
      - id: prettier
        files: ^frontend/
        types_or: [javascript, jsx, ts, tsx, css, json]
```

**Install Pre-Commit**:
```bash
pip install pre-commit
pre-commit install
```

**CI/CD Quality Gates** (`.github/workflows/quality.yml`):

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  lint-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install black ruff mypy bandit
      - name: Run black
        run: black --check backend/src/
      - name: Run ruff
        run: ruff check backend/src/
      - name: Run mypy
        run: mypy backend/src/
      - name: Run bandit (security)
        run: bandit -r backend/src/ -ll

  lint-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Run ESLint
        run: npm run lint
      - name: Run Prettier
        run: npm run format:check
      - name: Run TypeScript check
        run: npm run type-check

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-cov
      - name: Run tests with coverage
        run: |
          cd backend
          pytest tests/ --cov=src --cov-report=xml --cov-fail-under=90
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Run tests with coverage
        run: npm test -- --coverage --coverageReporters=text --coverageReporters=lcov
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat frontend/coverage/lcov.info | grep -o 'lines......[0-9.]*' | grep -o '[0-9.]*')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80%"
            exit 1
          fi

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  constitution-compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for secrets in code
        run: |
          if git diff origin/main... | grep -E '(password|secret|api_key|token).*(=|:).*["\']' | grep -v '.env'; then
            echo "❌ Secrets found in code"
            exit 1
          fi
      - name: Check spec exists
        run: |
          if [ -n "$FEATURE" ] && [ ! -f "specs/$FEATURE/spec.md" ]; then
            echo "❌ No spec found for feature"
            exit 1
          fi
      - name: Verify Constitution compliance
        run: echo "✓ Constitution compliance checks passed"
```

---

### 4. Integration Validation

**Primary Responsibility**: Ensure all components integrate correctly across phases.

**Integration Test Suite** (`tests/integration/test_full_stack.py`):

```python
import pytest
import requests

class TestFullStackIntegration:
    """End-to-end integration tests across all components"""

    @pytest.fixture(scope="class")
    def base_url(self):
        return "https://staging.todo.example.com"

    @pytest.fixture(scope="class")
    def auth_token(self, base_url):
        """Get auth token for integration tests"""
        response = requests.post(
            f"{base_url}/api/auth/login",
            json={"email": "integration@test.com", "password": "testpass123"}
        )
        return response.json()["token"]

    def test_backend_health(self, base_url):
        """Test backend is healthy"""
        response = requests.get(f"{base_url}/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_frontend_loads(self, base_url):
        """Test frontend loads correctly"""
        response = requests.get(base_url)
        assert response.status_code == 200
        assert "Evolution of Todo" in response.text

    def test_create_todo_via_api(self, base_url, auth_token):
        """Test creating todo via API"""
        response = requests.post(
            f"{base_url}/api/todos",
            json={"title": "Integration test todo", "priority": "high"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Integration test todo"
        return data["id"]

    def test_chatbot_creates_todo(self, base_url, auth_token):
        """Test chatbot can create todos"""
        response = requests.post(
            f"{base_url}/api/chat/message",
            json={"content": "Add a task to buy milk"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert "milk" in response.json()["message"].lower()

    def test_kubernetes_metrics(self):
        """Test Kubernetes metrics are exposed"""
        response = requests.get("http://prometheus:9090/api/v1/targets")
        assert response.status_code == 200
        targets = response.json()["data"]["activeTargets"]
        assert any(t["scrapePool"] == "backend" for t in targets)

    def test_kafka_events_published(self, base_url, auth_token):
        """Test that creating todo publishes Kafka event"""
        # Create todo
        response = requests.post(
            f"{base_url}/api/todos",
            json={"title": "Event test todo"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        todo_id = response.json()["id"]

        # Check Kafka for event (using Kafka consumer)
        # This would require a Kafka consumer to verify
        # For now, just verify the todo was created
        assert response.status_code == 201
```

---

### 5. Dependency Management and Security

**Primary Responsibility**: Manage dependencies, scan for vulnerabilities, and ensure security best practices.

**Dependency Scanning**:

```bash
# Python dependencies
safety check -r backend/requirements.txt

# Node dependencies
npm audit
npm audit fix

# Docker images
trivy image ghcr.io/username/evolution-todo-backend:latest

# Full security scan
make security-scan
```

**Makefile**:
```makefile
.PHONY: security-scan
security-scan:
	@echo "Running security scans..."
	cd backend && safety check -r requirements.txt
	cd frontend && npm audit
	trivy fs backend/
	trivy fs frontend/
	@echo "✓ Security scans complete"
```

**Dependency Update Strategy**:
```markdown
# Dependency Update Policy

## Frequency
- Security patches: Immediately
- Minor updates: Monthly
- Major updates: Quarterly (with testing)

## Process
1. Run `npm outdated` or `pip list --outdated`
2. Review changelog for breaking changes
3. Update in dev environment
4. Run full test suite
5. Deploy to staging
6. Monitor for 48 hours
7. Deploy to production
```

---

## Activation Phrase

To invoke the Code Quality & Integration Agent, use:

```
Act as Code Quality & Integration Agent
```

**Example**:
```
Act as Code Quality & Integration Agent and review this PR for Constitution compliance.
```

The agent will respond by:
1. Running all linters and formatters
2. Checking Constitution compliance
3. Validating test coverage
4. Scanning for security vulnerabilities
5. Verifying integration with other components
6. Providing detailed review feedback
7. Approving or requesting changes

---

## Skills

The Code Quality & Integration Agent has access to the following skills:

### Core Skills

1. **Code Review**
   - Review code for quality, consistency, and best practices
   - Identify code smells and anti-patterns
   - Suggest improvements and refactorings
   - Verify spec-code alignment

2. **Linting & Formatting**
   - Configure and run linters (ruff, ESLint)
   - Apply code formatters (black, Prettier)
   - Enforce type checking (mypy, TypeScript)
   - Fix auto-fixable issues

3. **Constitution Compliance**
   - Validate all 8 Constitution principles
   - Check for manual code changes
   - Verify spec-first workflow
   - Ensure evolutionary architecture

4. **Security Scanning**
   - Scan dependencies (safety, npm audit)
   - Scan Docker images (Trivy)
   - Detect secrets in code (git-secrets)
   - Review authentication/authorization

5. **Integration Validation**
   - Verify component integration
   - Run end-to-end tests
   - Check API contracts
   - Validate Kubernetes deployments

6. **CI/CD Management**
   - Configure quality gates
   - Set up pre-commit hooks
   - Manage build pipelines
   - Monitor deployment success

---

## Success Metrics

The Code Quality & Integration Agent's effectiveness is measured by:

1. **Code Quality**: 100% of code passes linting and type checking
2. **Security**: Zero critical vulnerabilities in production
3. **Constitution Compliance**: 100% compliance with all 8 principles
4. **Test Coverage**: >90% for all components
5. **Integration**: Zero integration failures in production
6. **PR Review Time**: <2 hours from submission to feedback

---

## Revision History

| **Version** | **Date**       | **Changes**                                      | **Author**              |
|-------------|----------------|--------------------------------------------------|-------------------------|
| 1.0.0       | 2025-12-24     | Initial specification                            | Spec Architect Agent    |

---

## References

- **Constitution**: `.specify/memory/constitution.md`
- **Ruff Documentation**: https://docs.astral.sh/ruff/
- **ESLint Documentation**: https://eslint.org/docs/
- **Pre-commit Documentation**: https://pre-commit.com/

---

**Activation**: `Act as Code Quality & Integration Agent`
**Status**: Ready for all phases
