---
sidebar_position: 3
---

# Settings

## Overview

Ramsha Framework provides a **powerful, extensible, and strongly-typed settings system** designed to centralize application configuration while keeping it **explicit, predictable, and scalable**.

Ramsha settings:

- Are defined centrally
- Are strongly typed
- Support default values
- Are grouped logically
- Can be resolved from multiple sources
- Are fully extensible via custom resolvers
- Allow fine-grained control over resolution order

---

## Core Concepts

### What Is a Setting?

A **setting** represents a configurable value that affects application behavior, such as:

- Business rules
- Feature toggles
- Thresholds and limits
- Application-level options

---

## Defining Settings Models

Settings values are represented using **plain C# classes**.

### Example: Product Discount Settings

```csharp
public class ProductDiscountSettings
{
    public int Discount { get; set; }
    public bool HasDiscount { get; set; }
}
````

This ensures:

* Strong typing
* IntelliSense support
* Compile-time safety

---

## Defining Setting Names

Setting names should always be centralized to avoid magic strings.

```csharp
public class ProductSettingNames
{
    public const string GroupName = "ProductsSettings";
    public const string DiscountSettings = "DiscountSettings";
}
```

---

## Setting Definitions

Internally, every setting is represented by a `SettingDefinition`.

```csharp
public class SettingDefinition
{
    public string Name { get; set; }
    public string? GroupName { get; set; }
    public Type ValueType { get; set; }
    public string? Description { get; set; }
    public object? DefaultValue { get; set; }
    public List<string> Providers { get; set; } = [];
}
```

### Explanation

| Property       | Description                     |
| -------------- | ------------------------------- |
| `Name`         | Unique name of the setting      |
| `GroupName`    | Optional group name             |
| `ValueType`    | CLR type of the value           |
| `Description`  | Optional description            |
| `DefaultValue` | Fallback value                  |
| `Providers`    | Allowed resolver provider names |

---

## Creating Setting Definition Providers

Settings are defined using **Setting Definition Providers**.

```csharp
public class ProductSettingDefinitions : ISettingDefinitionProvider
{
    public void Define(ISettingDefinitionContext context)
    {
        context.Group(ProductSettingNames.GroupName, group =>
        {
            group.Setting(
                ProductSettingNames.DiscountSettings,
                new ProductDiscountSettings
                {
                    Discount = 20,
                    HasDiscount = true
                });
        });
    }
}
```

### What This Does

* Creates a settings group
* Defines a setting
* Assigns a strongly typed default value

---

## Registering Setting Definitions

Setting definitions must be registered during the **BuildServices phase** of a module.

```csharp
public override void BuildServices(BuildServicesContext context)
{
    context.Services.Configure<RamshaSettingsOptions>(options =>
    {
        options.DefinitionProviders.Add<ProductSettingDefinitions>();
    });
}
```

---

## Setting Value Resolvers

Settings values are resolved using **Setting Value Resolvers**, which determine **where a setting value comes from**, such as:

* Configuration
* Memory defaults
* Database
* External systems

All resolvers inherit from:

```csharp
SettingValueResolver
```

Each resolver has a **provider name**, which uniquely identifies it.

---

## Built-in Resolvers

### Configuration Setting Resolver

```csharp
public class ConfigurationSettingValueResolver(IConfiguration configuration)
    : SettingValueResolver("C")
{
    public override Task<T?> ResolveAsync<T>(SettingDefinition def)
        where T : default
    {
        var section = def.GroupName is not null
            ? configuration.GetSection(def.GroupName).GetSection(def.Name)
            : configuration.GetSection(def.Name);

        return Task.FromResult(section.Get<T>());
    }
}
```

**Provider Name:** `C`
Reads values from configuration sources.

---

### Memory (Default) Setting Resolver

```csharp
public class MemorySettingValueResolver()
    : SettingValueResolver("M")
{
    public override Task<T?> ResolveAsync<T>(SettingDefinition def)
        where T : default
    {
        return Task.FromResult(
            def.DefaultValue is not null
                ? (T)def.DefaultValue
                : default
        );
    }
}
```

**Provider Name:** `M`
Behavior: returns the default value defined in the `SettingDefinition`.

---

## Registering Setting Value Resolvers

Resolvers are registered in **RamshaSettingsOptions**:

```csharp
services.Configure<RamshaSettingsOptions>(options =>
{
    options.ValueResolvers.Add<ConfigurationSettingValueResolver>();
    options.ValueResolvers.Add<MemorySettingValueResolver>();
});
```

### Resolver Order Matters

* Resolvers are executed **in the order they appear**.
* The first resolver that returns a value **wins**.
* You can control the order using:

```csharp
options.ValueResolvers.AddBefore<MemorySettingValueResolver, CustomResolver>();
options.ValueResolvers.AddAfter<ConfigurationSettingValueResolver, CustomResolver>();
```

---

## Custom Resolvers

You can create custom resolvers by inheriting from `SettingValueResolver`.

```csharp
public class CustomSettingResolver : SettingValueResolver("X")
{
    public override Task<T?> ResolveAsync<T>(SettingDefinition def)
        where T : default
    {
        // custom logic
        return Task.FromResult(default(T));
    }
}
```

Then register it:

```csharp
services.Configure<RamshaSettingsOptions>(options =>
{
    options.ValueResolvers.Add<CustomSettingResolver>();
});
```

---

## Provider-Based Resolution

Each `SettingDefinition` can specify **allowed provider names**:

* If `Providers` is empty: all resolvers are allowed
* If `Providers` contains provider names: only resolvers with matching names execute

```csharp
group.Setting(
    ProductSettingNames.DiscountSettings,
    new ProductDiscountSettings { Discount = 20, HasDiscount = true },
    providers: new[] { "C" } // only configuration resolver
);
```

---

## Resolving Settings Using ISettingResolver

Settings are consumed via `ISettingResolver`:

```csharp
public class AppSettingsController(
    ISettingResolver settingResolver
) : RamshaApiController
{
    [HttpGet(nameof(GetProductDiscountSettings))]
    public async Task<ProductDiscountSettings?> GetProductDiscountSettings()
    {
        return await settingResolver.ResolveAsync<ProductDiscountSettings>(
            ProductSettingNames.DiscountSettings
        );
    }
}
```

* Finds the setting definition
* Applies provider filtering
* Executes resolvers in order
* Returns strongly typed value

---

## Summary

Ramsha Settings System:

* Centralizes settings definitions
* Supports multiple value sources via resolvers
* Provides fine-grained control over **resolver order**
* Allows **custom resolvers**
* Supports **provider-based filtering**
* Provides safe defaults
* Ensures **explicit, predictable, and strongly typed configuration**

This design makes your configuration:

* Clear
* Maintainable
* Flexible
* Fully aligned with Clean Architecture principles

## Next Steps
* **[Authorization](./authorization)**
* **[Local Messaging](../basics/messaging/local-messaging)**



