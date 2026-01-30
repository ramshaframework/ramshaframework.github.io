---
sidebar_position: 2
---

# Getting Started

## Requirements

Before using Ramsha Framework, make sure you have:

- .NET 10 SDK (Latest version)
- Basic knowledge of ASP.NET Core and backend development

You can verify your .NET installation by running:

```bash
dotnet --version
```

---

## Getting Started with Ramsha (Recommended way)

The easiest way to start using Ramsha is by adding it **as a service**.

### Step 1: Register Ramsha Services

In `Program.cs`, add Ramsha to the service container:
```csharp {3-6}
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRamsha(ramsha =>
{
    //ramsha.AddModule<SettingsModule>();
});
```
In this step:

- AddRamsha enables and Configure the Ramsha Engine
- Modules are added using a clear and fluent API like:
  `AddModule<SettingsModule>()`
- All required services are registered automatically

---

### Step 2: Initialize Ramsha
After building the application, initialize Ramsha in the ASP.NET Core
request pipeline:

```csharp {3}
var app = builder.Build();

app.UseRamsha();

app.MapGet("/ping", () => Results.Ok("Pang !!"));

app.Run();
```
Calling `UseRamsha`:

- Initializes all registered Ramsha Hooks Contributors.
- Integrates required middleware into the ASP.NET Core pipeline

---

## Built-in Modules Overview

Ramsha comes with a set of **built-in modules** that provide common
functionality out of the box. These modules can be plugged into your
application simply by adding them as services or declaring as a
dependency.

One of the most commonly used built-in modules is the **Identity
Module**.

## Identity Module (Quick Introduction)
The **Identity Module** provides a ready-to-use User/Role management
system.

By adding this module, your application immediately gains a complete
identity system without additional setup.


## Adding Identity Module to Your Application

### Step 1: Install Required Packages
To enable the Identity Module, install the following packages.

- `Ramsha.Identity` package Which includes all identity-related modules:

```shell
dotnet add package Ramsha.Identity
```
- Ramsha Entity Framework Core Provider
Identity uses Entity Framework Core to persist data. Install one Ramsha
EF provider based on your database. Example: SQL Server:

```shell
dotnet add package Ramsha.EntityFrameworkCore.SqlServer
```
- EF Core Tools (for Migrations) Required to create and apply database
  migrations:

```shell
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

### Step 2: Register Modules
After installing the required packages, register the Identity and EF
Core modules in Program.cs:

```csharp {8-9}
using Ramsha;

var builder = WebApplication.CreateBuilder(args); 

builder.Service.AddRamsha(ramsha =>
{
    ramsha
    .AddIdentity() // or ramsha.AddModule<IdentityModule>()
    .AddEFSqlServer(); // or ramsha.AddModule<EntityFrameworkCoreSqlServerModule>();
});

builder.Service.AddRamshaDbContext<AppDbContext>();

var app = builder.Build();

app.UseRamsha();

app.Run();
```

Then, Configure identity inside your DbContext:

```csharp {8}
public class AppDbContext(DbContextOptions<AppDbContext> options)
: RamshaEFDbContext<AppDbContext>(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ConfigureIdentity();
    }
}
```
Then run and apply migrations to add identity entities.

> That's it --- no additional configuration is required to get started.


## What You Get Out of the Box

Once the Identity Module is enabled:

* User and role management is fully configured
* Required services are registered automatically
* Database tables are created 
* REST APIs are exposed and ready to use


## Ready-to-Use Identity APIs

The `IdentityApiModule` exposes a set of APIs that can be accessed
immediately, so open your browser and type
`http://localhost:<port>/scalar`, Then you should see `Scalar-UI` docs
for your Identity endpoints

![Identity APIs in Browser](pathname:///img/identity-apis-scalar.jpg)



### Learn More About `Identity` and other Built-in Modules

This section is only a quick overview.

For full installation instructions, configuration options, customization, and advanced usage, see the full documentation for **[Built-in Modules](/docs/category/builtin-modules)**

---

## Next Steps

Continue with:

- **[Ramsha Engine](./basics/architecture/ramsha-engine)**
- **[Modularity](./basics/architecture/modularity)**
- **[Ramsha Hooks](./basics/architecture/ramsha-hooks)**
- **[Ramsha Tools & Templates](./ramsha-tools-and-templates/installation)**

