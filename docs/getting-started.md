---
sidebar_position: 2
---

# Getting Started

## Requirements

Before using Ramsha Framework, make sure you have:

* .NET SDK (Latest version)
* Basic knowledge of ASP.NET Core and backend development

You can verify your .NET installation by running:

```bash
dotnet --version
```

---

## Installing Ramsha Dependencies and tools

### Ramsha CLI Tool - Direct Download 
You can download the latest version of the Ramsha CLI from the official GitHub releases page:
[GitHub Releases](https://github.com/sulaimanmugahed/Ramsha-Framework/releases).

After downloading:

Place the executable in a directory included in your system PATH or run it directly from its location


Verify the installation:
```bash
ramsha --help
```



### Ramsha Templates Installation
Ramsha project templates are distributed via NuGet.

Install the templates using the following command:
```bash
dotnet new install Ramsha.Templates
```
Once installed, you can list available Ramsha templates:
```bash
dotnet new list
```


---

## Quick Start

### Creating a New Project with Visual Studio
You can create a Ramsha project directly from **Visual Studio** using the installed templates.

### Step 1: Choose the Ramsha Template

![Filtering Ramsha templates in Visual Studio](pathname:///img/create-project-vs-1.jpg)
---

### Step 2: Configure Project Name and Location

![Configure Project Name and Location](pathname:///img/create-project-vs-2.jpg)


---

### Step 3: Configure Ramsha Options

In this step, you can customize how the Ramsha project is created:

* **Use Database**

  * Enable or disable database support
* **Database Provider**

  * Select the database provider (SQL Server, PostgreSQL, etc.)

After configuring the options, click **Create**.

![Configure Ramsha Options](pathname:///img/create-project-vs-3.jpg)

Visual Studio will generate the project with the selected configuration.

---

### Creating a New Application with CLI
You can also use the CLI tool to scaffold a new application:

```bash
ramsha new api MyApp -d
```
Or:
```bash
dotnet new ramsha-api -n MyApp --useDatabase
```
This creates a new ASP.NET Core Simple API project with the Ramsha framework.

---

## Run the Application

```bash
dotnet run
```
Open your browser:
* `http://localhost:<port>/scalar`

Then you should see `Scalar-UI` docs for your application.


## Ramsha Project Overview
After creating a new project with Ramsha, you get a **modular ASP.NET Core application** that is ready to scale.

## Startup Configuration

Every Ramsha application starts by configuring the framework in `Program.cs`.  
This is where the **startup module** is defined and the application is bootstrapped.

### Fluent Startup Configuration

For simple applications, Ramsha provides a fluent API to define the startup configuration directly:

```csharp
using Ramsha.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

await builder.AddRamshaAsync(module =>
{
    module
        .Register(ctx =>
        {
            ctx.DependsOn<AspNetCoreMvcModule>();
        })
        .BuildServices(ctx =>
        {
        })
        .OnInit(ctx =>
        {
        });
});

var app = builder.Build();

await app.UseRamshaAsync();

app.MapGet("/ping", () => Results.Ok("Pang !!"));

await app.RunAsync();
```
This approach keeps the startup code minimal and easy to read, making it ideal for small applications.


---


## Module Classes

As the application grows, functionality is typically organized into **separate modules**.
These modules are defined as classes by inheriting from `RamshaModule`.

### Example: Application Module

```csharp

public class MyAppModule : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        base.Register(context);

        context.DependsOn<AspNetCoreMvcModule>();
    }

    public override void BuildServices(BuildServicesContext context)
    {
        base.BuildServices(context);

        context.Services.AddScoped<MyCustomService>();
    }
}
```
Then inside program.cs:
```csharp
var builder = WebApplication.CreateBuilder(args);

await builder.AddRamshaAsync<MyAppModule>();

var app = builder.Build();

await app.UseRamshaAsync();

app.MapGet("/ping", () => Results.Ok("Pang !!"));

await app.RunAsync();
```

Defining modules this way helps keep responsibilities separated and makes the application easier to maintain and extend.

--- 

### Application Registration and Configuration (AddRamshaAsync)

AddRamshaAsync is responsible for configuring the Ramsha framework and registering all required modules and services.

```csharp
await builder.AddRamshaAsync<MyAppModule>();
```
It runs before the application is built and prepares the dependency injection container.




### Application Initialization (UseRamshaAsync) 

After building the application, Ramsha must be initialized and integrated into the ASP.NET Core request pipeline.

```csharp
var app = builder.Build();
await app.UseRamshaAsync();
```
Calling UseRamshaAsync is a critical step in the application startup process.  
When this method is executed, Ramsha:
* Initializes all registered modules 
* Executes each module’s initialization logic 
* Integrates required middleware into the ASP.NET Core pipeline 

At this stage, all modules are fully constructed and ready to handle requests.




:::note Want to learn more?
This page covers the basic startup process.  
For a deeper understanding of module phases, lifecycle hooks, and execution order,
see the **[Modularity](./basics/architecture-and-templates/modularity)** documentation.
:::


---

## Built-in Modules Overview

Ramsha comes with a set of **built-in modules** that provide common functionality out of the box.
These modules can be plugged into your application simply by declaring a dependency.

One of the most commonly used built-in modules is the **Identity Module**.

---

## Identity Module (Quick Introduction)

The **Identity Module** provides a ready-to-use User/Role management system.


By adding this module, your application immediately gains a complete identity system without additional setup.


## Adding Identity Module to Your Application

To enable the Identity Module, [install](./builtin-modules/identity/identity-module-installation) required packages, and add its modules classes as a dependencies in your startup configuration or application module.

```csharp
await builder.AddRamshaAsync(module =>
{
    module.Register(ctx =>
    {
        ctx
            .DependsOn<IdentityApplicationModule>()
            .DependsOn<IdentityPersistenceModule>()
            .DependsOn<EntityFrameworkCoreSqlServerModule>()
            .DependsOn<IdentityApiModule>();
    });
});
```
Then, inside your DbContext:
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // ..
    modelBuilder.ConfigureIdentity();
}
```
Then run and apply migrations to add identity entities.


>That’s it — no additional configuration is required to get started.


## What You Get Out of the Box

Once the Identity Module is enabled:

* User and role management is fully configured
* Required services are registered automatically
* Database tables are created 
* REST APIs are exposed and ready to use


## Ready-to-Use Identity APIs

The `IdentityApiModule` exposes a set of APIs that can be accessed immediately.

![Identity APIs in Browser](pathname:///img/identity-apis-scalar.jpg)



### Learn More About `Identity` and other Built-in Modules

This section is only a quick overview.

For full installation instructions, configuration options, customization, and advanced usage, see the full documentation for **[Built-in Modules](/docs/category/builtin-modules)**

---

## Next Steps

Continue with:

- **[Modularity](./basics/architecture-and-templates/modularity)**
- **[Clean Architecture](./basics/architecture-and-templates/clean-architecture)**
- **[Solution Templates](./basics/architecture-and-templates/ramsha-templates/solution-templates)**

