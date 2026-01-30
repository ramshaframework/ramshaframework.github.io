---
sidebar_position: 2
---

# Unit of Work

## Overview

Ramsha Framework provides a **robust Unit of Work (UoW) system** inspired by ABP’s Unit of Work concept, but with a **different execution model**.

Unlike ABP, **Ramsha does not rely on dynamic proxies or attributes** to manage Unit of Work boundaries.  
Instead, Ramsha uses **explicit, method-based Unit of Work control** that is:

- Clear and predictable  
- Easy to debug  
- Fully integrated with Controllers, Application Services, and Repositories  
- Automatically applied at the HTTP request level  

---

## Key Concepts

- A **Unit of Work** represents a single logical operation
- All database operations inside a UoW share:
  - The same DbContext
  - The same transaction (if enabled)
- A Unit of Work can be:
  - **Transactional**
  - **Non-transactional**
- Unit of Work instances can be **nested**
- Only the **outermost Unit of Work** commits or rolls back

---

## Automatic Unit of Work per Request

Ramsha provides a **Unit of Work middleware** that automatically creates a reserved Unit of Work for each HTTP request.

```csharp
public class UnitOfWorkMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        using (var uow = unitOfWorkManager.Reserve(
            RamshaUnitOfWorkReservationNames.ActionUnitOfWorkReservationName))
        {
            await next(context);
            await uow.CompleteAsync();
        }
    }
}
````

This means:

* Every HTTP request already runs inside a Unit of Work
* Controllers, services, and repositories reuse the same UoW
* Manual transaction handling is usually unnecessary

---

## Using Unit of Work in Controllers (Clear Examples)

All API controllers inherit from:

```csharp
RamshaControllerBase
```

### Example: Non-Transactional Unit of Work in Controller

```csharp
public class ProductController(IProductRepository productRepository)
 : RamshaApiController
{
    [HttpPost]
    public async Task<RamshaResult<string>> Create(CreateProductDto input)
    {
       return await UnitOfWork(async () =>
        {
            var product = new Product(input.Name, input.Price);
            await productRepository.AddAsync(product);
            return product.Id.ToString();
        });
    }
}
```

**What happens here:**

* The request already has a reserved Unit of Work
* `UnitOfWork(...)` reuses it
* `SaveChanges` is called automatically
* No explicit transaction is created

---

### Example: Transactional Unit of Work in Controller

```csharp
[HttpPost("order")]
public async Task<RamshaResult> CreateOrder(CreateOrderDto input)
{
   return await TransactionalUnitOfWork(async () =>
    {
        await _orderRepository.AddAsync(new Order(input.CustomerId));
        await _inventoryRepository.DecreaseStockAsync(input.ProductId);
        return RamshaResult.Ok();
    });
}
```

**Use transactional UoW when:**

* Multiple writes must succeed together
* Business consistency is critical

---

## Using Unit of Work in Application Services (Clear Examples)

All application services inherit from:

```csharp
RamshaService
```

### Example: Non-Transactional Unit of Work in Application Service

```csharp
public class ProductAppService(IProductRepository productRepository)
 : RamshaService
{
    public async Task CreateAsync(CreateProductDto input)
    {
        await UnitOfWork(async () =>
        {
            var product = new Product(input.Name, input.Price);
            await _productRepository.AddAsync(product);
        });
    }
}
```

---

### Example: Transactional Unit of Work in Application Service

```csharp
public class OrderAppService(
        IOrderRepository orderRepository,
        IInventoryRepository inventoryRepository) : RamshaService
{
    public async Task<RamshaResult> PlaceOrderAsync(PlaceOrderDto input)
    {
       return await TransactionalUnitOfWork(async () =>
        {
            await orderRepository.AddAsync(new Order(input.CustomerId));
            await inventoryRepository.DecreaseStockAsync(input.ProductId);
            return RamshaResult.Ok();
        });
    }
}
```

**Key points:**

* Controllers and Application Services behave identically
* Unit of Work logic stays explicit and readable
* No attributes or magic interception

---

## Using Unit of Work in Repositories

Ramsha repositories automatically integrate with Unit of Work.

Base repository:

```csharp
EFCoreRepository<TDbContext, TEntity>
```

### Example Repository Method

```csharp
public async Task<TEntity> AddAsync(TEntity entity)
{
    return await UnitOfWork(async () =>
    {
        var context = await GetDbContextAsync();
        var entry = await context.Set<TEntity>().AddAsync(entity);
        return entry.Entity;
    });
}
```

**Behavior:**

* Reuses existing Unit of Work if present
* Does not commit independently
* SaveChanges is coordinated by the outer UoW

---

## Transactional vs Non-Transactional Summary

| Type              | When to Use                                   |
| ----------------- | --------------------------------------------- |
| Non-Transactional | Simple CRUD, reads, performance paths         |
| Transactional     | Multi-step writes, consistency-critical logic |

---

## Injecting IUnitOfWorkManager Directly
In advanced scenarios, you can inject and control the Unit of Work manually.

```csharp
public class BackgroundJob
{
    private readonly IUnitOfWorkManager _unitOfWorkManager;

    public BackgroundJob(IUnitOfWorkManager unitOfWorkManager)
    {
        _unitOfWorkManager = unitOfWorkManager;
    }

    public async Task ExecuteAsync()
    {
        using var uow = _unitOfWorkManager.Begin(
            new UnitOfWorkOptions { IsTransactional = true });

        // database operations

        await uow.CompleteAsync();
    }
}
```

Use this approach for:

* Background jobs
* Console apps
* Integration scenarios

---

## Summary

Ramsha Unit of Work system:

* Uses **explicit method-based control**
* Avoids attributes and proxies
* Automatically scopes one UoW per request
* Works consistently across:

  * Controllers
  * Application Services
  * Repositories
* Supports transactional and non-transactional flows

This design ensures clarity, safety, and clean architecture alignment.

---

## Next Steps
* **[Settings](../settings)**
* **[Authorization](../authorization)**

