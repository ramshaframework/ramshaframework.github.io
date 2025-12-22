---
sidebar_position: 1
---


# Local Messaging

Ramsha provides a **Local Messaging system** for implementing **CQRS commands, queries, and local domain events**. It integrates seamlessly with **Unit of Work**, aggregates, and application services or controllers, enabling consistent and atomic operations.

---

# Installing Local Messaging

Local Messaging in Ramsha is built on two essential packages that provide a clean architecture for handling commands, queries, events, and their handlers.

## Required Packages

The Local Messaging system consists of:

1. **`Ramsha.LocalMessaging.Abstractions`** - Contains interfaces, base classes, and contracts for:
   - Commands and command handlers
   - Queries and query handlers  
   - Events and event handlers
   - Core messaging abstractions

2. **`Ramsha.LocalMessaging`** - Contains the complete implementation:
   - `LocalMessagingModule` for dependency registration
   - Mediator pattern implementation
   - Handler discovery and execution
   - All concrete implementations

## Installation

### Option 1: Automatic Installation (Recommended)

If your project references `Ramsha.Common.Application`, the Local Messaging packages are **already included**. No additional installation is required.

### Option 2: Manual Installation

If you're building a modular application without `Ramsha.Common.Application`, install the package:

```bash
# Install the main package (automatically includes Abstractions)
dotnet add package Ramsha.LocalMessaging
```

# Adding LocalMessagingModule Dependency

## Automatic Module Registration

Local Messaging is **automatically enabled** when you use `Ramsha.Common.Application`. If your module depends on `CommonApplicationModule`, the Local Messaging system is already available without any additional configuration.

```csharp
// Your AppModule.cs
public class AppModule : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        // If you depend on Ramsha.Common.Application.Module,
        // LocalMessagingModule is automatically included
        context.DependsOn<CommonApplicationModule>();
        
        // No need to explicitly depend on LocalMessagingModule
        // It's already registered by the common application module
    }
}
```

## Manual Module Registration (When Not Using Common Application)

Only use explicit dependency when you're **not** using `Ramsha.Common.Application`:

```csharp
// Only needed in modular applications without Ramsha.Common.Application
public class AppModule : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        base.Register(context);
        
        // Explicitly depend on LocalMessagingModule
        // ONLY when not using Ramsha.Common.Application
        context.DependsOn<LocalMessagingModule>();
    }
}
```

## What Gets Registered Automatically

When Local Messaging is enabled (either automatically or manually), the following services are registered in the dependency injection container:

- **`IRamshaMediator`** - Main mediator for sending commands and queries
- **`ILocalBus`** - For publishing and handling local events
- **`IUnitOfWorkLocalEventBus`** - For handling events within Unit of Work 

---

## 3. Configuring Local Messaging

Configure **assemblies and handlers** during the **Prepare phase** :

```csharp
public override void Prepare(PrepareContext context)
{
    base.Prepare(context);

    context.Configure<LocalMessagingOptions>(options =>
    {
        options.AddMessagesFromAssembly<AppModule>();
    });
}
```

* `AddMessagesFromAssembly<T>()` scans all commands, queries, and events in the specified assembly.

---

## 4. Commands and Command Handlers

### 4.1 Defining a Command

```csharp
public class CreateProductCommand : IRamshaCommand<int>
{
    public string Name { get; set; } = default!;
    public decimal Price { get; set; }
}
```

* Commands represent **write operations** and may return a result.

### 4.2 Implementing a Command Handler

```csharp
public class CreateProductCommandHandler(IRepository<Product,int> repository)
 : CommandHandler<CreateProductCommand, int>
{
    public override async Task<int> HandleAsync(CreateProductCommand command, CancellationToken cancellationToken = default)
    {
        var product = new Product { Name = command.Name, Price = command.Price };

        await repository.AddAsync(product);

        return product.Id;
    }
}
```

---

## 5. Queries and Query Handlers

### 5.1 Defining a Query

```csharp
public class GetProductByIdQuery : IRamshaQuery<ProductDto?>
{
    public int Id { get; set; }
}
```

* Queries are **read-only** and return a value.

### 5.2 Implementing a Query Handler

```csharp
public class GetProductByIdQueryHandler(IRepository<Product> repository) 
: QueryHandler<GetProductByIdQuery, ProductDto?>
{
    public override async Task<ProductDto?> HandleAsync(GetProductByIdQuery query, CancellationToken cancellationToken = default)
    {
        var product = await _repository.FindAsync(query.Id);
        if (product == null) return null;

        return new ProductDto { Id = product.Id, Name = product.Name, Price = product.Price };
    }
}
```

---

## 6. Local Events and Event Handlers

### 6.1 Defining a Local Event

```csharp
public record ProductCreatedEvent(int ProductId,string Name);
```

### 6.2 Implementing a Local Event Handler

```csharp
public class ProductCreatedEventHandler : LocalEventHandler<ProductCreatedEvent>
{
    public override Task HandleAsync(ProductCreatedEvent message, CancellationToken cancellationToken = default)
    {
        Console.WriteLine($"Product created: {message.Name} (ID: {message.ProductId})");
        return Task.CompletedTask;
    }
}
```

* Events raised inside aggregates are **enqueued in UnitOfWork**.
* Dispatched automatically after **UnitOfWork commits**.

---

## 7. Using Local Messaging in Controllers
`RamshaControllerBase` already has `IRamshaMediator` service so you dont need to inject it when you inherit from any Ramsha Controller:

```csharp
[ApiController]
[Route("api/products")]
public class ProductsController : RamshaControllerBase
{
    // Create a product
    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CreateProductCommand command)
    {
        int id = await Mediator.Send(command);
        return Ok(new { ProductId = id });
    }

    // Get a product
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var query = new GetProductByIdQuery { Id = id };
        ProductDto product = await Mediator.Send(query);

        if (product == null) return NotFound();
        return Ok(product);
    }
}
```

* `Mediator.Send()` resolves the correct **handler automatically**.
* UnitOfWork integration ensures **domain events are published** after commit.

---

## 8. Domain Events Integration

Aggregates can raise **domain events**:

```csharp
public class Product : AggregateRoot<int>
{
    public string Name { get; set; } = default!;
    public decimal Price { get; set; }

    //Should called after create product to Raise the event
    public void MarkAsCreated()
    {
        RaiseEvent(new ProductCreatedEvent { ProductId = Id, Name = Name });
    }
}
```

* EF Core interceptors or repositories **collect events during SaveChanges**.
* Events are enqueued in **UnitOfWork**.
* Published via **`UnitOfWorkLocalBus`** before commit completes.

---

## 9. Full Flow Summary

1. Controller sends **command** via `Mediator.Send`.
2. `CommandHandler` executes logic and optionally raises **domain events**.
3. Repositories save changes.
4. Domain events are **collected in UnitOfWork**.
5. On `UnitOfWork.CompleteAsync()`, events are published via `LocalBus`.
6. `LocalEventHandler`s execute asynchronously.

---

## Next Steps
* **[Best Practices](../best-practices)**



