---
sidebar_position: 2
---

# Connections Strings


Ramsha provides a flexible and powerful connection string management system that supports multiple databases, connection string aliases, and automatic resolution.

## Overview

The connection string system in Ramsha allows you to:
- Define multiple database connections with names
- Use attributes to specify which connection a DbContext should use
- Create aliases for connection strings
- Replace DbContext implementations while maintaining proper connection resolution

## Basic Configuration

### 1. Define Connection Strings in appsettings.json

```json
{
  "ConnectionStrings": {
    "Default": "Server=(localdb)\\MSSQLLocalDB;Database=MyAppDb;Trusted_Connection=True;",
    "MainDb": "Server=localhost;Database=MainDb;User=sa;Password=your_password;",
    "LogDb": "Server=localhost;Database=LogDb;User=sa;Password=your_password;",
    "ArchiveDb": "Server=localhost;Database=ArchiveDb;User=sa;Password=your_password;"
  }
}
```

### 2. Specify Connection String for DbContext

Use the `[ConnectionString]` attribute to specify which connection string a DbContext should use:

```csharp
[ConnectionString("MainDb")]
public class AppDbContext : RamshaEFDbContext<AppDbContext>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    
    // Your DbSets here
    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
}
```

### 3. Register DbContext in Module

```csharp
public class AppModule : RamshaModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // Register DbContext with options
        context.Services.AddRamshaDbContext<AppDbContext>(options =>
        {
            // Configure DbContext options here
        });
    }
}
```

## Connection String Aliases

### Why Use Aliases?

Aliases allow you to map multiple names to the same connection string. This is useful when:
- You have legacy code using different connection string names
- You want to provide backward compatibility
- You need to standardize connection string names across multiple applications

### Configuring Aliases

Configure aliases in your module's `ConfigureServices` method:

```csharp
public class AppModule : RamshaModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // Configure connection string aliases
        context.Services.Configure<ConnectionStringsOptions>(options =>
        {
            options.ConfigureAliases(builder =>
            {
                // Map "MainDb" and "Primary" to "Default" connection string
                builder.Map("Default", ["MainDb", "Primary"]);
                
                // Map "LoggingDb" to "LogDb" connection string
                builder.Map("LogDb", "LoggingDb");
            });
        });
        
        // Register your DbContext
        context.Services.AddRamshaDbContext<AppDbContext>();
    }
}
```

### How Aliases Work

With the configuration above:
- `[ConnectionString("MainDb")]` will use the "Default" connection string
- `[ConnectionString("Primary")]` will use the "Default" connection string
- `[ConnectionString("LoggingDb")]` will use the "LogDb" connection string

This means all these DbContext attributes will work with the same underlying connection strings:

```csharp
// All these will use the "Default" connection string
[ConnectionString("Default")]
[ConnectionString("MainDb")]
[ConnectionString("Primary")]
public class AppDbContext : RamshaEFDbContext<AppDbContext>
{
    // ...
}

// This will use the "LogDb" connection string
[ConnectionString("LogDb")]
[ConnectionString("LoggingDb")]
public class LogDbContext : RamshaEFDbContext<LogDbContext>
{
    // ...
}
```

## Advanced Scenarios

### Multiple DbContexts with Different Connections

```csharp
// Main application database
[ConnectionString("AppDb")]
public class AppDbContext : RamshaEFDbContext<AppDbContext>
{
    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
}

// Reporting database (read-only replica)
[ConnectionString("ReportDb")]
public class ReportDbContext : RamshaEFDbContext<ReportDbContext>
{
    public DbSet<SalesReport> SalesReports { get; set; }
    public DbSet<Analytics> Analytics { get; set; }
}

// Audit/logging database
[ConnectionString("AuditDb")]
public class AuditDbContext : RamshaEFDbContext<AuditDbContext>
{
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<SystemLog> SystemLogs { get; set; }
}
```

### Dynamic Connection String Resolution

You can implement custom connection string resolution logic:

```csharp
public class TenantConnectionStringResolver : IConnectionStringResolver
{
    private readonly IOptions<ConnectionStringsOptions> _options;
    private readonly ITenantService _tenantService;
    
    public TenantConnectionStringResolver(
        IOptions<ConnectionStringsOptions> options,
        ITenantService tenantService)
    {
        _options = options;
        _tenantService = tenantService;
    }
    
    public async Task<string?> ResolveAsync(string? connectionStringName = null)
    {
        var tenant = await _tenantService.GetCurrentTenantAsync();
        
        // Use tenant-specific connection string if available
        var tenantSpecificName = $"{connectionStringName}_{tenant.Id}";
        
        return _options.Value.Get(tenantSpecificName) 
               ?? _options.Value.Get(connectionStringName ?? "Default");
    }
}

// Register in module
context.Services.Replace<IConnectionStringResolver, TenantConnectionStringResolver>();
```

## Summary

Ramsha's connection string management system provides:
- **Attribute-based configuration** using `[ConnectionString]`
- **Alias support** for backward compatibility and standardization
- **handle DbContext replacement connection string** with automatic connection string resolution
- **Flexible resolution** through `IConnectionStringResolver`

This system allows you to manage complex multi-database scenarios while maintaining clean, maintainable code.

## Next Steps
* **[EfCore Database Migrations](./ef-core-migrations)**
* **[Repositories](./repositories)**
* **[Global Query Filters](./global-data-filters)**
