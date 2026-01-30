---
sidebar_position: 4
---

# Repositories

## Repository Pattern in Ramsha

The repository pattern in Ramsha provides a clean abstraction layer between your domain logic and data access code. It offers both default implementations for common operations and flexibility to create custom repositories when needed.

## Overview

Ramsha's repository system provides:
- **Default repositories** for common CRUD operations
- **Custom repositories** for domain-specific queries
- **Automatic registration** through fluent configuration
- **Unit of Work integration** for transaction management

## Quick Start

### 1. Define Your Entity

```csharp
public sealed class Product : Entity<Guid>
{
    public string Name { get; set; }
    public decimal Price { get; set; }
    public Guid CategoryId { get; set; }
    public Category Category { get; set; }
}
```

### 2. Enable The Default Repositories Registration

```csharp
public class AppModule : RamshaModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddRamshaDbContext<AppDbContext>(options =>
        {
            // this will Add default repositories for all entities
            options.AddDefaultRepositories(true);
        });
    }
}
```

## Base Repository Interface

Ramsha provides a Generic and base interfaces for repositories:

### Base Repository Interfaces

```csharp
// Marker interface for all repositories
public interface IRepository { }

// Repository for entities without specifying ID type
public interface IRepository<TEntity> : IRepository
    where TEntity : IEntity
{
    Task<TEntity?> AddAsync(TEntity entity);
    Task<List<TEntity>> GetListAsync();
    // others common methods
}

// Repository for entities with specific ID type
public interface IRepository<TEntity, TId> : IRepository<TEntity>
    where TId : IEquatable<TId>
    where TEntity : IEntity<TId>
{
    Task<bool> DeleteAsync(TId id);
    Task<TEntity?> FindAsync(TId id);
    // others common methods
}
```

## Default Repositories

### Using Default Repository Implementation

When you register default repositories, Ramsha automatically provides implementations for common operations:

```csharp
// Registration
options.AddDefaultRepositories(true); // For all entities
```

# or
```csharp
options.AddDefaultRepository<Product>();  // For specific entity
```

# So you can use in service

```csharp
public class ProductService
{
    private readonly IRepository<Product, Guid> _productRepository;
    
    public ProductService(IRepository<Product, Guid> productRepository)
    {
        _productRepository = productRepository;
    }
    
    public async Task<Product?> GetProductAsync(Guid id)
    {
        return await _productRepository.FindAsync(id);
    }
    
    public async Task<List<Product>> GetExpensiveProductsAsync()
    {
        return await _productRepository.GetListAsync(
            p => p.Price > 1000
        );
    }
}
```

## Custom Repositories

### Creating a Custom Repository

When you need domain-specific query logic, create a custom repository:

#### 1. Define Repository Interface

```csharp
public interface IProductRepository : IRepository<Product, Guid>
{
    // Custom methods for domain-specific queries
    Task<List<Product>> GetProductsByCategoryAsync(Guid categoryId);
    // other methods
}
```

#### 2. Implement Custom Repository

```csharp
public class ProductRepository : EFCoreRepository<AppDbContext, Product, Guid>, IProductRepository
{
    public async Task<List<Product>> GetProductsByCategoryAsync(Guid categoryId)
    {
        var context = await GetDbContextAsync();
        return await context.Set<Product>()
            .Where(p => p.CategoryId == categoryId)
            .ToListAsync();
    }
}
```

#### 3. Register Custom Repository

```csharp
context.Services.AddRamshaDbContext<AppDbContext>(options =>
{
    options.AddRepository<Product, IProductRepository, ProductRepository>();
});
```

#### 4. Use Custom Repository

```csharp
public class ProductAppService(IProductRepository productRepository)
{
    public async Task<decimal> CalculateCategoryValueAsync(Guid categoryId)
    {
        var products = await productRepository.GetProductsByCategoryAsync(categoryId);
        return products.Sum(p => p.Price);
    }
}
```
## Advanced Usage

### Custom Repository Base Classes

You can create a custom base repositories and replace the default:

```csharp
public class AppRepository<TEntity> 
    : EFCoreRepository<AppDbContext, TEntity>
    where TEntity : class, IEntity
{
    // add here Shared methods
}
public class AppRepository<TEntity, TKey> 
    : EFCoreRepository<AppDbContext, TEntity, TKey>
    where TEntity : class, IEntity<TKey>
    where TKey : IEquatable<TKey>
{
    // add here Shared methods
}
```
## Then Configure Options:
```csharp
context.Services.AddRamshaDbContext<AppDbContext>(options =>
{
    //...
    options.SetDefaultRepositoryClasses(
        typeof(AppRepository<,>),   
        typeof(AppRepository<>)       
    );
});
```
---

## Next Steps
* **[Global Query Filters](./global-data-filters)**
* **[UnitOfWork](../unit-of-work)**






