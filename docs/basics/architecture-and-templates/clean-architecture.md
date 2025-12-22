---
sidebar_position: 2
---

# Clean Architecture

Clean Architecture helps you organize your application into distinct **layers with clear responsibilities**, keeping business rules independent from infrastructure and framework concerns.

## Clean Architecture in Ramsha


Ramsha Framework implements a layered Clean Architecture that enforces clear dependency rules, strong separation of concerns, and long-term maintainability.

Each layer has a single responsibility, and dependencies are strictly controlled.

---

## Ramsha Layered Architecture Overview

A Ramsha application is composed of the following basics layers:

**Shared** - **Domain** - **Contracts** - **Application** - **Persistence** - **Api** - **Startup**

These layers work together to form a clean, modular, and scalable system.

The **Ramsha Clean Web API template** implements this pattern, giving you a scalable, maintainable project baseline.

---

## Dependency Rules

Ramsha follows strict dependency rules to protect core logic and avoid tight coupling.

- **Shared** does not reference any layer
- All layers reference **Shared** (directly or indirectly)
- Dependencies never point upward
- Each layer references only what it needs

Dependency flow:

Domain → Shared

Contracts → Shared

Application → Domain, Contracts

Persistence → Domain

Api → Contracts

Startup → Application, Persistence, Api

This structure protects core logic from infrastructure and framework concerns.

---

## Layer Responsibilities

### Shared Layer

The **Shared layer** contains code that is **common and reusable** across the entire application.

Characteristics:
- Has **no dependencies** on any other layer
- Can be referenced by all layers
- Contains only generic, cross-cutting code

Typical contents:
- Common utilities
- Shared constants and enums
- Cross-cutting abstractions

This layer is the **foundation** of the system.

---

### Domain Layer

The **Domain layer** represents the **core business logic**.

Dependencies:
- References **Shared** only

Typical contents:
- Entities
- Domain Events
- Domain rules
- Business invariants

Key principle:
The Domain layer contains **pure business logic** and is completely independent of application flow, persistence, or transport mechanisms.

---

### Contracts Layer

The **Contracts layer** defines **communication boundaries** and it can be use by another module.

Dependencies:
- References **Shared** only

Typical contents:
- Interfaces
- DTOs
- Request and response models
- Public contracts exposed to the API
- Commands and Queries classes

Purpose:
- Decouple the API from internal application logic
- Provide stable, explicit interfaces

---

### Application Layer

The **Application layer** implements **use cases** and application behavior.

Dependencies:
- References **Domain**
- References **Contracts**

Typical contents:
- Application services
- Use case implementations
- Validation logic
- Orchestration logic
- Commands and Queries Handlers


Responsibilities:
- Coordinates business rules
- Uses domain entities
- Exposes functionality through contracts

This layer defines **what the system does**, not how it does it.

---

### Persistence Layer

The **Persistence layer** contains data-access logic.

Dependencies:
- References **Domain**

Typical contents:
- Database contexts
- ORM configurations
- Repository implementations

Key rule:
Persistence depends on the Domain, never the other way around.

This keeps business logic independent of storage technologies.

---

### API Layer

The **API layer** represents the **external boundary** of the application.  
It is responsible for exposing the system’s capabilities to the outside world through HTTP endpoints.

Dependencies:
- References **Contracts**

Typical contents:
- Controllers or endpoints
- Request handling
- Response shaping and serialization

Responsibilities:
- Handles HTTP concerns
- Delegates work using contracts
- Contains no business logic

The API layer knows *what* it can call, but not *how* it is implemented.

---

### Startup Layer

The **Startup layer** is responsible for **application composition**.

Dependencies:
- References **Application**
- References **Persistence**
- References **Api**

Responsibilities:
- Module registration
- Dependency injection setup
- Application bootstrapping

This layer is the **only place** where all layers come together.

---

## Clean Architecture + Modularity

Ramsha combines **Clean Architecture** with its **modular system**:

- Modules can span multiple layers
- Each module follows the same dependency rules
- Features remain isolated and cohesive

This enables large systems to remain organized and predictable.

---

## When to Use This Architecture

This layered architecture is ideal for:

- Medium to large applications
- Complex business logic
- Long-term projects
- Team-based development

For smaller projects, simpler templates may be sufficient.


## Next Steps

* **[Solution Templates](./ramsha-templates/solution-templates)**










