---
sidebar_position: 3
---

# Solution Templates

Ramsha Framework provides a set of **pre-configured solution templates** to help you kickstart your applications with best practices and modular architecture already in place.

---

## Available Templates

### 1- Ramsha Simple Web API Template (`ramsha-api`)
A minimal, simple API template for building RESTful services with Ramsha Framework.

**Features:**
- Simple
- Modular architecture
- EfCore Support

**Usage:**
```bash
ramsha new api MyApiProject
```
# or

```bash
dotnet new ramsha-api -n MyApiProject
```

---

## Usage Examples

### Ramsha CLI
```bash
# Basic project
ramsha new api MyProject

# With database (SQL Server)
ramsha new api MyProject -d

# With database (PostgreSql)
ramsha new api MyProject -d --dbProvider postgres

```

### .NET CLI
```bash
# Basic project
dotnet new ramsha-api -n MyProject

# With database (PostgreSQL)
dotnet new ramsha-api -n MyProject --useDatabase --dbProvider postgres

```

---
### 2- Ramsha Clean Web API Template (`ramsha-c-api`)
A clean API template for building RESTful services with Ramsha Framework.

**Features:**
- Clean architecture
- Modular architecture
- EfCore Support

**Usage:**
```bash
ramsha new c-api MyApiProject
```
# or

```bash
dotnet new ramsha-c-api -n MyApiProject
```

---

## Usage Examples

### Ramsha CLI
```bash
# Basic project
ramsha new c-api MyProject

# With database (Default SQL Server)
ramsha new c-api MyProject -d

# With database (PostgreSql)
ramsha new c-api MyProject -d --dbProvider postgres

```

### .NET CLI
```bash
# Basic project
dotnet new ramsha-c-api -n MyProject

# With database (PostgreSQL)
dotnet new ramsha-c-api -n MyProject --useDatabase --dbProvider postgres

```
