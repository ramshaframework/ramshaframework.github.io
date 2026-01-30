---
sidebar_position: 1
---

# Ramsha Engine


At the heart of the **Ramsha Framework** is the **Ramsha Engine**, which
drives all module management, dependency resolution, and lifecycle
execution.

The engine is **the core runtime** that powers:

- **Ramsha as a Service**
- **Ramsha External App**
- **Ramsha Internal App**

All of them use the same engine concepts, they differ in **who controls
the application, hosting, and configuration**.

---

## What is the Ramsha Engine ?

The **Ramsha Engine** is responsible for:

- Loading modules
- Preparing modules
- Registering modules services
- Executing module lifecycle hooks ( `Initialize`, `Shutdown`)

Every Ramsha-based application, whether hosted in ASP.NET Core or fully
managed by Ramsha, runs on top of this engine.

---

## Ramsha as a Service Engine

Integrate Ramsha modules into an **existing ASP.NET Core application**
without taking ownership of the application lifecycle.

Key points:

- Uses the **host-provided `IServiceProvider`**
- No application identity (`InstanceId`) or name
- can not recreated programmatically
- Does not have creation options
- Only initializes modules and integrates Ramsha into an existing app

**Use Case:**
You want to add Ramsha modules (like **IdentityModule**) to an existing
web app without fully letting Ramsha manage the app.

### Example
```csharp {3-6}
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRamsha(ramsha =>
{
    ramsha.AddModule<IdentityModule>();
});

var app = builder.Build();

app.UseRamsha();

app.Run();
```
:::
::::

---

## External Ramsha App Engine

Run a Ramsha App inside an existing host while still providing full app
identity and options.

Key points:

- Uses external IServiceProvider (like As Service)
- Tracks app identity (InstanceId) and AppName
- Supports creation options (Environment , Configuration sources and
  AppInfo)
- Supports Startup Module

Use Case: You want a full Ramsha App but need it to share DI,
configuration, or middleware with an existing host.

### Example

```csharp {3}
var builder = WebApplication.CreateBuilder(args);

builder.AddRamshaApp<StartupModule>();

var app = builder.Build();

app.UseRamsha();

app.Run();
```

---

## Ramsha Internal App Engine

Create a standalone Ramsha App where App is fully managed by the engine
itself

Key points:

- Tracks app identity (InstanceId) and optional AppName.
- Each app has its own ServiceProvider and isolated environment
- Fully self-contained: Ramsha manages services, modules, and lifecycle
- Supports creation options (Environment , Configuration sources and
  AppInfo)
- Supports Startup Module

Use Case: You want a full Ramsha-driven application independent of the
host. Ideal for microservices or standalone backend apps.

### Example

```csharp 
var app = RamshaFactory.CreateApp<MyAppStartupModule>(options =>
{
    options.AppName = "MyInternalApp";
    options.Environment = "Development";
});

Console.WriteLine($"App ID: {app.InstanceId}");
Console.WriteLine($"App Name: {app.ApplicationName}");

// Configure modules and services
await app.ConfigureAsync();
```

---

