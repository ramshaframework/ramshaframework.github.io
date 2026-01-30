---
sidebar_position: 1
---

# Overview

## EF Core Integration with Ramsha

Ramsha Framework provides a structured and extensible integration with Entity Framework Core through a base `DbContext` abstraction called `RamshaEFDbContext`. This integration simplifies database operations while maintaining flexibility and adhering to best practices.

---

## Quick Start

### 1- Create Your DbContext

Instead of inheriting directly from `DbContext`, create your application DbContext by inheriting from `RamshaEFDbContext`:

```csharp
[ConnectionString("Default")]
public class AppDbContext(DbContextOptions<AppDbContext> options) 
    : RamshaEFDbContext<AppDbContext>(options)
{
    // Define your DbSets
    public DbSet<Product> Products { get; set; }
    public DbSet<Customer> Customers { get; set; }
}
```

### 2- Install Required Packages

First, install the core EF package and your chosen database provider:

```bash
# Core EF package (always required)
# This is typically included in your main Ramsha setup

# Choose ONE database provider:
dotnet add package Ramsha.EntityFrameworkCore.SqlServer      # For SQL Server
# OR
dotnet add package Ramsha.EntityFrameworkCore.PostgreSql   # For PostgreSQL
# OR
dotnet add package Ramsha.EntityFrameworkCore.Sqlite       # For SQLite
```

### 3. Configure Your Application Module

Register dependencies in your module's `Register` method:

```csharp
public class Module : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        base.Register(context);
        
        // Declare dependency on your chosen provider module
        context.DependsOn<EntityFrameworkCoreSqlServerModule>();
        // OR: context.DependsOn<EntityFrameworkCorePostgreSqlModule>();
        // OR: context.DependsOn<EntityFrameworkCoreSqliteModule>();
    }
    
    public override void BuildServices(BuildServicesContext context)
    {
        base.BuildServices(context);

        // Register your DbContext in the DI container
        context.Services.AddRamshaDbContext<AppDbContext>();
    }
}
```

---

## Package Architecture

### Core Package (`Ramsha.EntityFrameworkCore`)
This foundational package provides:
- **`RamshaEFDbContext`** - Base DbContext with built-in functionality
- **Global query filter infrastructure** - Automatic filtering for soft delete, tenant isolation, etc.
- **Unit of Work integration** - Transaction management
- **Base repository implementations** - Consistent data access patterns

> **Important**: This package is **database-agnostic** and doesn't include any specific provider.

### Provider Packages
Each provider package includes:
- Database-specific provider implementation
- Automatic reference to the core `Ramsha.EntityFrameworkCore` package

**Choose only one provider package based on your database:**

| Database | Package |
|----------|---------|
| SQL Server | `Ramsha.EntityFrameworkCore.SqlServer` |
| PostgreSQL | `Ramsha.EntityFrameworkCore.PostgreSql` |
| SQLite | `Ramsha.EntityFrameworkCore.Sqlite` |

---

## Configuration Guide

### Step 1: Declare Provider Dependency
In your module's `Register` phase, declare which database provider you're using:

```csharp
public override void Register(RegisterContext context)
{
    base.Register(context);
    
    // SQL Server Example
    context.DependsOn<EntityFrameworkCoreSqlServerModule>();
}
```

### Step 2: Register DbContext
In your module's `BuildServices` phase, register your DbContext:

```csharp
public override void BuildServices(BuildServicesContext context)
{
    base.BuildServices(context);
    
    // Clean Architecture: Typically done in Persistence layer module
    context.Services.AddRamshaDbContext<AppDbContext>();
}
```

### Step 3: Configure Connection Strings
Use the `ConnectionString` attribute to specify which connection string to use:

```csharp
[ConnectionString("Default")]  // Uses "Default" connection string from appsettings
public class AppDbContext : RamshaEFDbContext<AppDbContext>
{
    // Your DbContext implementation
}

```

---

## DbContext Replacement

### Replacing DbContext Implementations

Ramsha allows you to replace DbContext implementations while maintaining proper connection string resolution. This is useful when:

1. You want to extend an existing DbContext
2. You need to customize DbContext behavior for specific modules
3. You're using modular architecture where different modules provide their own DbContexts

### Example: Replacing DbContext

```csharp
// Interface for identity module
public interface IIdentityDbContext
{
    DbSet<User> Users { get; set; }
    DbSet<Role> Roles { get; set; }
}

// Implementation in identity module
[ConnectionString("IdentityDb")]
public class IdentityDbContext : RamshaEFDbContext<IdentityDbContext>, IIdentityDbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
}

// In your main application, replace IdentityDbContext with AppDbContext
public class AppModule : RamshaModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // Register AppDbContext and replace IIdentityDbContext
        context.Services.AddRamshaDbContext<AppDbContext>(options =>
        {
            options.ReplaceDbContext<IIdentityDbContext>();
        });
        
        // Other services...
    }
}

// AppDbContext implements IIdentityDbContext
[ConnectionString("MainDb")]
public class AppDbContext : RamshaEFDbContext<AppDbContext>, IIdentityDbContext
{
    // IIdentityDbContext implementation
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    
    // Additional AppDbContext properties
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
}
```

### How Connection String Resolution Works with Replacement

When you replace a DbContext, the connection string resolution follows these rules:

1. **Direct Attribute Usage**: When a service requests `IIdentityDbContext`, it gets `AppDbContext`
2. **Connection String Lookup**: The system looks for `[ConnectionString]` attribute on `AppDbContext`
3. **String Resolution**: Finds "MainDb" connection string from configuration
4. **Alias Check**: If "MainDb" is an alias, resolves to the actual connection string name

This means that even though `IIdentityDbContext` originally used "IdentityDb" connection string, after replacement it uses whatever connection string `AppDbContext` is configured with.


## Next Steps

After setting up your DbContext, explore:
* **[Connection String](./connections-strings)**
* **[EFCore Migrations](./ef-core-migrations)**
* **[Repositories](./repositories)**
* **[Global Query Filters](./global-data-filters)**





