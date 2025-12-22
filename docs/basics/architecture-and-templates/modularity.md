---
sidebar_position: 1
---

# Modularity

Modularity is a core concept in the **Ramsha Framework**.  
It allows you to build applications as a collection of **independent, self-contained modules**, making your system easier to develop, test, and maintain.

---

## What Is Modularity?

**Modularity** means organizing your application into separate modules, where each module:

- Represents a specific feature or domain
- Has a clear responsibility
- Can be developed and maintained independently
- Communicates with other modules through well-defined contracts

This approach helps prevent tightly coupled code and improves long-term maintainability.

---

## Why Modularity Matters

Traditional monolithic applications often become difficult to maintain as they grow.  
Ramsha’s modular design helps you avoid these problems by:

- Reducing coupling between features
- Making the codebase easier to understand
- Allowing teams to work on different modules in parallel
- Simplifying testing and refactoring
- Enabling gradual system growth without breaking existing functionality

---

## Modularity in Ramsha Framework

In Ramsha Framework, a **module** is a first-class building block of the application.  
Each module is represented by a class that **inherits from `RamshaModule`** and participates in the application lifecycle.

A module can:

- Declare dependencies on other modules
- Prepare some configuration can be use before register services complete and build
- Register services into the dependency injection container
- Run logic during application startup
- React to application shutdown

This design gives Ramsha a **structured, predictable, and extensible** modular system.

---

## Module Lifecycle

### Overview

Every Ramsha module goes through five distinct lifecycle phases:

```
1. Register    → Declare module dependencies
2. Prepare     → Configure options can be access before register the services 
3. BuildServices → Register services in DI container
4. OnInit      → Initialize when application starts
5. OnShutdown  → Clean up when application stops
```


## Detailed Lifecycle

### 1- Register Phase

The first phase where modules declare their dependencies on other modules:

```csharp
public class AppModule : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        base.Register(context);
        
        // Declare dependencies
        context.DependsOn<AspNetCoreMvcModule>();
    }
}
```

**Key Points:**
- Dependencies are loaded before the module
- Order matters: List dependencies in the order they should be initialized
- Circular dependencies are not allowed
- All dependencies must be available

### 2- Prepare Phase

Configure options and settings before services are registered and this options can be use when register the application services:

```csharp
public override void Prepare(PrepareContext context)
{
    base.Prepare(context);
    
    // Configure custom options
    context.Configure<MyOptions>(options =>
    {
        options.Setting1 = "value1";
        options.Setting2 = 42;
    });
}
```

**Key Points:**
- Access to IConfiguration
- Configure options before service registration

### 3- BuildServices Phase

Register services in the dependency injection container:

```csharp
public override void BuildServices(BuildServicesContext context)
{
    base.BuildServices(context);
    
    // Register application services
    context.Services.AddTransient<IProductService, ProductService>();
    context.Services.AddScoped<IOrderService, OrderService>();
    
    // Register DbContext
    context.Services.AddRamshaDbContext<AppDbContext>(options =>
    {
        options.AddDefaultRepositories(includeAllEntities: true);
    });
    
    // Configure options
    context.Services.Configure<MyServiceOptions>(options =>
    {
        options.ConnectionTimeout = TimeSpan.FromSeconds(30);
    });
}
```

**Key Points:**
- Register all application services
- Configure middleware and pipeline
- Set up database contexts
- Register repositories and data access

### 4- OnInit Phase

Initialize the module when the application starts:

```csharp
public override void OnInit(InitContext context)
{
    base.OnInit(context);
    
    // Get services from the container
    var logger = context.ServiceProvider.GetRequiredService<ILogger<AppModule>>();
    logger.LogInformation("AppModule initialized");
    
    // Perform startup tasks
    var dataSeeder = context.ServiceProvider.GetRequiredService<IDataSeeder>();
    dataSeeder.SeedAsync().GetAwaiter().GetResult();
}

```

**Key Points:**
- Access to fully configured ServiceProvider
- Perform data seeding
- Run database migrations
- Use or add Middlewares to pipeline

### 5- OnShutdown Phase

Clean up resources when the application stops:

```csharp
public override void OnShutdown(ShutdownContext context)
{
    base.OnShutdown(context);
    
    var logger = context.ServiceProvider.GetRequiredService<ILogger<AppModule>>();
    logger.LogInformation("AppModule shutting down");
}

```

**Key Points:**
- Close database connections
- Flush caches
- Log shutdown information



## Synchronous and Asynchronous Support

Each lifecycle method has an **async alternative**:

```csharp
public virtual Task OnInitAsync(InitContext context)
```

This allows modules to:

* Perform async I/O
* Await external services
* Avoid blocking startup threads

Ramsha automatically supports both sync and async execution paths.

---

## Creating Modules

### Simple Module

A basic module with minimal configuration:

```csharp

public class SimpleModule : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        base.Register(context);
        context.DependsOn<AspNetCoreMvcModule>();
    }

    public override void BuildServices(BuildServicesContext context)
    {
        base.BuildServices(context);
        context.Services.AddTransient<IMyService, MyService>();
    }
}
```

### Feature Module

A module organizing a specific feature:

```csharp
public class ProductsModule : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        base.Register(context);
        
        context
            .DependsOn<EntityFrameworkCoreSqlServerModule>()
            .DependsOn<AspNetCoreMvcModule>();
    }

    public override void Prepare(PrepareContext context)
    {
        base.Prepare(context);
        
        var configuration = context.GetConfiguration();
        context.Configure<ProductsOptions>(configuration.GetSection("Products"));
    }

    public override void BuildServices(BuildServicesContext context)
    {
        base.BuildServices(context);

        // Register services
        context.Services.AddTransient<IProductService, ProductService>();

        // get options that defined inside Prepare phase
        var productOptions = context.Services.ExecutePreparedOptions<ProductsOptions>();
      
        context.Services.AddRamshaDbContext<AppDbContext>(options =>
        {
            optiona
            .AddDefaultRepositories(includeAllEntities:productOptions.IncludeAllEntities)
            .AddRepository<Product,IProductRepository,ProductRepository>();
        });
    
    }
}
```


## Module Dependencies

### Declaring Dependencies

```csharp
public class AppModule : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        base.Register(context);
        
        // Single dependency
        context.DependsOn<AspNetCoreMvcModule>();
        
        // Multiple dependencies (chained)
        context
            .DependsOn<EntityFrameworkCoreSqlServerModule>()
            .DependsOn<IdentityApplicationModule>()
            .DependsOn<PermissionsApplicationModule>();
    }
}
```

### Dependency Resolution Order

Modules are initialized in dependency order:

```
AppModule depends on:
  └─ IdentityModule depends on:
      └─ EntityFrameworkCoreModule depends on:
          └─ CoreModule

Initialization order:
1. CoreModule
2. EntityFrameworkCoreModule
3. IdentityModule
4. AppModule
```

### Avoiding Circular Dependencies

**Bad Example:**
```csharp
// ModuleA depends on ModuleB
public class ModuleA : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        context.DependsOn<ModuleB>();  // ❌ Circular dependency!
    }
}

// ModuleB depends on ModuleA
public class ModuleB : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        context.DependsOn<ModuleA>();  // ❌ Circular dependency!
    }
}
```

**Good Example:**
```csharp
// Extract common functionality to a shared module
public class SharedModule : RamshaModule { }

public class ModuleA : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        context.DependsOn<SharedModule>();  // ✓ Both depend on shared module
    }
}

public class ModuleB : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        context.DependsOn<SharedModule>();  // ✓ No circular dependency
    }
}
```



## Lifecycle Phase Details

| Phase | Purpose | Key Actions | When to Use |
|-------|---------|-------------|-------------|
| **Register** | Declare dependencies | `context.DependsOn<T>()` | Module requires other modules |
| **Prepare** | Pre-configuration | Setup module state before DI | Early initialization logic |
| **Build Services** | Service registration | `context.Services.AddX()` | Register DI services |
| **OnInit** | Runtime setup | Database seeding, cache warming | Post-DI initialization |
| **OnShutdown** | Cleanup | Close connections, release resources | Graceful shutdown |


---

## Next Steps

Continue learning about Ramsha architecture:

* **[Clean Architecture](./clean-architecture)**
* **[Solution Templates](./ramsha-templates/solution-templates)**






