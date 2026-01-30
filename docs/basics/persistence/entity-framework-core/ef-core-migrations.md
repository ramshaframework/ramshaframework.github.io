---
sidebar_position: 3
---

# Database Migrations

Entity Framework Core includes a powerful migration system. Ramsha builds on this foundation to provide a consistent, streamlined way to manage database changes during application development.

## RamshaDesignTimeDbContextFactory Class

The foundation for creating migrations in Ramsha is the `RamshaDesignTimeDbContextFactory<TModule, TDbContext>` abstract class. This class implements the [`IDesignTimeDbContextFactory<TDbContext>`](https://learn.microsoft.com/en-us/dotnet/api/microsoft.entityframeworkcore.design.idesigntimedbcontextfactory-1?view=efcore-10.0&viewFallbackFrom=efcore-latest) interface and provides the infrastructure needed for EF Core Tools to create migrations in a Ramsha application.

The key responsibilities of this abstract class are:
- Initializing the Ramsha application module during design time
- Building the service provider with proper configuration
- Creating and configuring the DbContext instance for migration generation
- Handling environment-specific configuration loading

## Overview

There are two distinct phases in the migration process:
1. **Creating Migrations** - Generating migration files from model changes
2. **Applying Migrations** - Updating the database with generated migrations

## Creating Migrations

Migrations are always created using **EF Core Tools** with the Design-Time DbContext Factory pattern. This approach uses Microsoft's `dotnet ef` CLI tools along with a **Design-Time DbContext Factory** (`IDesignTimeDbContextFactory<TContext>`).

### How the Design-Time Factory Works

When you create migrations, the following flow occurs:

1. **Developer runs `dotnet ef migrations add`**
2. **EF Core Tools** searches for an `IDesignTimeDbContextFactory<TContext>` implementation
3. **RamshaDesignTimeDbContext** initializes the Ramsha application module
4. **Module builds services** and registers the DbContext
5. **Factory creates DbContext instance** with proper configuration
6. **EF Core generates migration files** based on model changes

### Implementation

#### 1. Create Your Design-Time Factory

This class created by default if u create the project with [`Ramsha Soultions Templates`](../../../ramsha-tools-and-templates/solution-templates), If not exist you can create new class:

```csharp
public class AppDbContextDesignTimeFactory 
    : RamshaDesignTimeDbContext<AppModule, AppDbContext>
{
    // Default implementation is sufficient for most cases
}
```

#### 2. Install Required Package

```bash
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

#### 3. Migration Commands

**Simple Project Structure:**
```bash
# Add a new migration
dotnet ef migrations add InitialCreate
```

**Clean Architecture Template:**
```bash
# From startup layer path
dotnet ef migrations add InitialCreate --project ../MyApp.Persistence/MyApp.Persistence.csproj

# From persistence layer path  
dotnet ef migrations add InitialCreate --startup-project ../MyApp.Startup/MyApp.Startup.csproj
```

## Applying Migrations

Once migrations are created, you have **two approaches** to apply them to the database:

### 1. EF Core Tools Migration Application (Manual)

Apply migrations using the `dotnet ef` CLI tool:

```bash
# Simple project
dotnet ef database update

# Clean architecture
dotnet ef database update --project ../MyApp.Persistence/MyApp.Persistence.csproj
```

**Best for:** Development environments, testing, and CI/CD pipelines

### 2. Programmatic Migration Application (Automatic)

Apply migrations automatically through code during application startup:

```csharp
public class AppModule : RamshaModule
{
    public override async Task OnInitAsync(ApplicationInitializationContext context)
    {
        // Apply pending migrations on application startup
        var dbContext = context.ServiceProvider.GetRequiredService<AppDbContext>();
        await dbContext.Database.MigrateAsync();
    }
}
```

**Best for:** Production deployments, containerized applications, and automatic updates

## Configuration for Migration Creation

### Migration-Specific Settings

Create `appsettings.Migrations.json` in your startup project for migration creation:

```json
{
  "ConnectionStrings": {
    "Default": "Server=(localdb)\\mssqllocaldb;Database=DemoApp;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

### Customizing Design-Time Configuration

```csharp
public class AppDbContextDesignTimeFactory 
    : RamshaDesignTimeDbContext<AppModule, AppDbContext>
{
    protected override IConfigurationRoot BuildConfiguration()
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") 
            ?? "Development";
        
        return new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddJsonFile($"appsettings.Migrations.json", optional: true)
            .AddEnvironmentVariables()
            .AddUserSecrets<AppDbContextDesignTimeFactory>(optional: true)
            .Build();
    }
}
```

## Migration Workflow Summary

1. **Development Phase:**
   - Make model changes to your entities
   - Run `dotnet ef migrations add <Name>` to generate migration files
   - Review generated migration files

2. **Application Phase (Choose One):**
   - **Option A:** Use `dotnet ef database update` (development/CI)
   - **Option B:** Let application apply migrations automatically via `MigrateAsync()` (production)



---


## Next Steps
* **[Repositories](./repositories)**
* **[Global Query Filters](./global-data-filters)**