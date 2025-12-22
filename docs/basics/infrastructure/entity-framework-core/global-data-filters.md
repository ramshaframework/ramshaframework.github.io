---
sidebar_position: 5
---

# Global Query Filters

Global query filters in Ramsha automatically apply filtering conditions to all queries for specific entity types. This is particularly useful for implementing cross-cutting concerns like soft delete, multi-tenancy, or entity state management without repeating the same conditions throughout your codebase.

## Built-in Filters

Ramsha provides built-in global filters for common scenarios like soft delete. These filters are automatically applied to entities that implement specific interfaces.

### 1. Soft Delete Filter

Ramsha includes a built-in soft delete filter that automatically filters out deleted entities.

#### Implementation:

```csharp
// Your entity implements ISoftDelete
public class Product : Entity<Guid>, ISoftDelete
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    
    // ISoftDelete properties (automatically filtered)
    public string? DeletedBy { get; set; }
    public DateTime? DeletionDate { get; set; }
}
```
Usage - automatically filters out **deleted** products
```csharp
public class ProductService(IRepository<Product, Guid> productRepository)
{
    public async Task<List<Product>> GetAllProductsAsync()
    {
        // Automatically excludes products where IsDeleted == true
        return await _productRepository.GetListAsync();
    }
}
```

#### Disable Soft Deleted Filter:
Sometimes may need to disable the global filter so we can use `IGlobalQueryFilterManager` to Disable/Enable the Global filters:

```csharp
public class AdminProductService (
        IRepository<Product, Guid> productRepository,
        IGlobalQueryFilterManager globalFilterManager)
{
    
    public async Task<List<Product>> GetAllProductsIncludingDeletedAsync()
    {
        // Temporarily disable soft delete filter
        using (globalFilterManager.Disable<ISoftDelete>())
        {
            // Returns all products including deleted ones
            return await productRepository.GetListAsync();
        }
        // Filter is automatically re-enabled after the using block
    }
}
```

## Custom Filters
While Ramsha has built-in soft delete, you might need add some more custom filters like filter for active/inactive entities or another filter 

### Custom Active/Inactive Filter

Here we will add custom filter for active/inactive entities (like temporarily disabling products without deleting them).

#### Create a Custom Active Filter:

Define interface for active entities:
```csharp
public interface IActive
{
    bool IsActive { get; set; }
}
```

Implement interface in your entity
```csharp

public class Product : Entity<Guid>, IActive
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    
    // IActive implementation
    public bool IsActive { get; set; };
}

```

Create global filter provider
```csharp

public class ActiveEntitiesFilterProvider 
    : EFGlobalQueryFilterProvider<AppDbContext, IActive>
{
    protected override Expression<Func<IActiveEntity, bool>> CreateFilterExpression(
        AppDbContext dbContext)
    {
        return entity => entity.IsActive;
    }
}
```

Register in module
```csharp
public class AppModule : RamshaModule
{
    public override void BuildServices(BuildServicesContext context)
    {
        context.Services.AddRamshaDbContext<AppDbContext>(options =>
        {
            // Register the custom active filter
            options.AddGlobalQueryFilterProvider<ActiveEntitiesFilterProvider>();
            // other options ...
        });
    }
}
```

#### Usage Examples:

```csharp
public class ProductService(
        IRepository<Product, Guid> productRepository,
        IGlobalQueryFilterManager globalFilterManager
)
{
    // Get only active products (default behavior)
    public async Task<List<Product>> GetActiveProductsAsync()
    {
        return await productRepository.GetListAsync();
        // Automatically filters to IsActive == true
    }
    
    // Admin method to get all products including inactive
    public async Task<List<Product>> GetAllProductsAdminAsync()
    {
        using (globalFilterManager.Disable<IActive>())
        {
            return await productRepository.GetListAsync();
        }
    }
}
```

## Combining Multiple Filters

Entities can implement multiple filter interfaces:

```csharp
// Entity with both soft delete and active filters
public class Product : Entity<Guid>, ISoftDelete, IActive
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    
    // ISoftDelete
    public string? DeletedBy { get; set; }
    public DateTime? DeletionDate { get; set; }
    
    // IActive
    public bool IsActive { get; set; }
}

// Both filters work together automatically
public class ProductService (
        IRepository<Product, Guid> productRepository,
)
{
    public async Task<List<Product>> GetAvailableProductsAsync()
    {
        // Returns products where:
        // IsDeleted == false AND IsActive == true
        return await productRepository.GetListAsync();
    }
}
```

### Disable specific filters when needed
```csharp
public class AdminService (
        IRepository<Product, Guid> productRepository,
        IGlobalFilterManager globalFilterManager)
{
    
    public async Task<List<Product>> GetAllProductsForAdminAsync()
    {
        // Disable both filters
        using (globalFilterManager.Disable<ISoftDelete>())
        using (globalFilterManager.Disable<IActive>())
        {
            // Returns ALL products including:
            // - Deleted products
            // - Inactive products
            return await productRepository.GetListAsync();
        }
    }
    
    public async Task<List<Product>> GetInactiveButNotDeletedAsync()
    {
        // Disable only active filter
        using (globalFilterManager.Disable<IActiveEntity>())
        {
            // Returns products where:
            // IsDeleted == false (soft delete filter still active)
            // IsActive can be true or false
            return await productRepository.GetListAsync();
        }
    }
}
```

## Default Filter State Value:
You can set default value for the global filter, for ex we want the the IsActive global filter enabled by default:
```csharp

public override void BuildServices(BuildServicesContext context)
{
    context.Services.Configure<GlobalQueryFilterOptions>(options =>
    {
        options.DefaultStates[typeof(IActive)] = new GlobalQueryFilterState(true);
    });
}

```

## Next Steps
* **[UnitOfWork](../unit-of-work)**
