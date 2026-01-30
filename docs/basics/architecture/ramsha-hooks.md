---
sidebar_position: 3
---

# Ramsha Hooks

**Ramsha Hooks** provide a structured way to execute logic during
critical moments in the application lifecycle. They allow modules and
libraries to run code **when the application initializes** and **when it
shuts down**, without tightly coupling that logic to startup files.

Hooks are especially useful for:

- Database migrations
- Seeding data
- Resource initialization
- Cleanup and graceful shutdown logic

---

## What Are Ramsha Hooks?

A **hook** is a contributor class that Ramsha automatically executes at
a specific lifecycle moment.

Currently, Ramsha supports **two hooks**:
- Init Hook: Trigger When the application initializes
- Shutdown Hook: Trigger When the application is stopping


Each hook is implemented as a **contributor** class and registered
through `RamshaHooksOptions`.

---

## Why Hooks Matter

Without hooks, initialization and shutdown logic often ends up:

- Inside `Program.cs`
- Inside `Startup`
- Duplicated across modules
- Hard to reuse or test

Ramsha Hooks solve this by:

- Centralizing lifecycle logic
- Keeping modules self-contained
- Improving modularity

---

## Hook Execution Flow

Hooks are applied automatically when:


```csharp
app.UseRamsha();
```

Behind the scenes, Ramsha:

1.  Initializes the Ramsha engine
2.  Executes all **Init Hook contributors**
3.  Builds and applies the Ramsha pipeline
4.  Registers shutdown callbacks
5.  Executes **Shutdown Hook contributors** on application stop

---

## Init Hook

### Purpose

The **Init Hook** runs **when the application starts**. It is ideal for
logic that must execute **after DI is ready** but **before the
application starts serving requests**.

Common use cases:

- Applying database migrations
- Seeding initial data
- Initializing background resources
- Preloading configuration or caches

---

### Init Hook Interface

```csharp
public interface IInitHookContributor
{
    Task OnInitialize(InitContext context);
}
```


---

### Creating an Init Hook Contributor

Create a class inside your module or class library and implement
`IInitHookContributor`.

#### Example: Entity Framework Core Migration Hook

```csharp
using Ramsha.EntityFrameworkCore;

public class EntityFrameworkCoreInitHookContributor : IInitHookContributor
{
    public async Task OnInitialize(InitContext context)
    {
        var provider = context.ServiceProvider;
        var dbContexts = provider.GetServices<IRamshaEFDbContext>();

        if (dbContexts != null)
        {
            foreach (var db in dbContexts)
            {
                if (db.Database.GetPendingMigrations().Any())
                {
                    await db.Database.MigrateAsync();
                }
            }
        }
    }
}
```


**What this does:**

- Resolves all registered Ramsha DbContexts
- Checks for pending migrations
- Applies migrations automatically on startup

---

### Registering Init Hooks

Init hooks must be registered using `RamshaHooksOptions`.

```csharp
context.Services.Configure<RamshaHooksOptions>(options =>
{
    options.InitHookContributors.Add<EntityFrameworkCoreInitHookContributor>();
});
```


This is typically done inside the **BuildServices** phase of a module.

---

## Shutdown Hook
### Purpose

The **Shutdown Hook** runs **when the application is stopping**.

Use it for:

- Releasing resources
- Closing connections
- Flushing logs

---

### Shutdown Hook Interface

```csharp
public interface IShutdownHookContributor
{
    Task OnShutdown(ShutdownContext context);
}
```


---

### Creating a Shutdown Hook Contributor

```csharp
public class AppShutdownHookContributor : IShutdownHookContributor
{
    public Task OnShutdown(ShutdownContext context)
    {
        var logger = context.ServiceProvider
        .GetRequiredService<ILogger<AppShutdownHookContributor>>();

        logger.LogInformation("Application is shutting down...");

        return Task.CompletedTask;
    }
}
```
---

### Registering Shutdown Hooks

```csharp
builder.Services.Configure<RamshaHooksOptions>(options =>
{
    options.ShutdownHookContributor.Add<AppShutdownHookContributor>();
});
```

---

## Continue with:

* **[Clean Architecture](./clean-architecture)**
