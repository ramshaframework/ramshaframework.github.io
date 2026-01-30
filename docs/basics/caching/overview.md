---
sidebar_position: 1
---


# Overview


Caching in the **Ramsha Framework** provides a unified, modular, and
provider-agnostic way to store and retrieve cached data across your
application.

Ramsha caching is built on top of
**Microsoft.Extensions.Caching.Hybrid** and exposes a simple abstraction
that works consistently across all Ramsha engine modes.

Ramsha caching is designed to:

- Be **modular** and optional
- Decouple application logic from caching infrastructure
- Support both in-memory and distributed caching transparently

At the center of the caching system is the `IRamshaCache` abstraction.

---

## Default Caching Behavior

When you install and enable **only** the `Ramsha.Caching` package:

- Cache entries are stored **in memory only**
- No external infrastructure is required
- Ideal for:
  - Development environments
  - Single-instance applications
  - Lightweight services

This default behavior works out of the box with zero additional
configuration.

---

## Hybrid Cache Concept

Ramsha uses **Hybrid Cache**, a modern caching abstraction that combines
multiple cache layers into a single API.

Hybrid Cache supports:

- **Local in-memory cache (L1)** for fast access
- **Optional distributed cache (L2)** for shared storage

The cache resolution flow is:

1.  Check in-memory cache
2.  If not found, check distributed cache (if configured)
3.  If still not found, execute a factory to generate the value
4.  Store the result back into the cache layers

Ramsha configures Hybrid Cache internally while keeping application code
independent of where cached data is stored.

---

## Cache Stampede Protection

Hybrid Cache automatically prevents **cache stampedes**.

When multiple requests attempt to access the same cache key at the same
time:

- Only **one factory execution** is allowed
- Other callers wait for the result
- Once completed, all callers receive the cached value

This behavior is available even when using in-memory caching only.

---

## Cache Keys and Tags

### Cache Keys

Cache keys must uniquely identify cached data.

Best practices:

- Use stable and predictable key formats
- Include identifiers (e.g. `product:42`)
- Avoid very large keys

Key length limits are configurable through `RamshaCachingOptions`.

---

### Cache Tags

Ramsha caching supports **tag-based invalidation**.

Tags allow you to:

- Group related cache entries
- Invalidate multiple entries at once
- Simplify cache cleanup logic

This is especially useful for domain-based cache invalidation.

---

## Enabling Caching

Enable caching by depending on the `CachingModule`:



import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="service" label="As Service">

```csharp {5}
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRamsha(ramsha =>
{
    ramsha.AddCaching(); // or ramsha.AddModule<CachingModule>
});

var app = builder.Build();
app.UseRamsha();
app.Run();
```
</TabItem>

<TabItem value="module" label="Module-based">

```csharp {6}
public class MyModule : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        base.Register(context);
        context.DependsOn<CachingModule>();
    }
}
```
</TabItem>

</Tabs>

---


## IRamshaCache Interface

Applications and modules interact with caching through `IRamshaCache`.

This ensures:

- No dependency on specific caching providers
- Easy testing and replacement
- Clean separation between logic and infrastructure

## Common Cache Operations

### Get or Create

```csharp
app.MapGet("products", async (IRamshaCache cache) =>
{
    return await cache.GetOrCreateAsync(
    "products:all",
    async ct => await LoadProductsAsync(),
    new RamshaCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(10),
        LocalCacheExpiration = TimeSpan.FromMinutes(2)
    });
});
```


This method:

- Reads from cache if available
- Executes the factory only if needed
- Writes results back to cache layers

## Set Cache Entry

Sometime you want only to set data to the cache:

```csharp
await _cache.SetAsync(
    "products:all",
    products,
    new RamshaCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(10)
    });
```

### Remove Cache Entry

```csharp
await _cache.RemoveAsync("products:all");
```


### Remove by Tag
```csharp
await _cache.RemoveByTagAsync("products");
```


---

## Configuration

Caching behavior is configured using RamshaCachingOptions, typically
during the Prepare phase of a module.

These options control:

- Cache key limits
- Payload size limits
- Default expiration values
- Local vs distributed cache expiration

---

## Continue with:

- **[Redis Caching](./redis-caching)**
