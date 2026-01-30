---
sidebar_position: 2
---

# Redis Caching

Redis caching extends Ramsha's hybrid caching strategy by adding a
**distributed cache layer** using **StackExchange.Redis**.

This allows multiple application instances to share cached data while
keeping the same `IRamshaCache` API.

> **Note:** To use Redis caching, you must install the
> **`Ramsha.Caching.Redis`** NuGet package.

---

## Why Add Redis ?

While in-memory caching is sufficient for single-instance apps,
distributed cache is useful when:

- Multiple app instances need to share cached data
- Cache invalidation must propagate across nodes
- Persistent cache is desired across process restarts

Redis serves as the **secondary (L2) cache** for HybridCache, while
local memory remains the **primary (L1) cache**.

---

## RedisCachingModule

The `RedisCachingModule` depends on `CachingModule` and registers Redis
as a distributed cache provider. HybridCache automatically upgrades to
use Redis for the second cache layer.

---

## Enabling Redis Caching

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="service" label="As Service">

```csharp
builder.Services.AddRamsha(ramsha =>
{
    ramsha.AddRedisCaching(); // or ramsha.AddModule<RedisCachingModule>();
});
```

> **Note:** There is no need to call `ramsha.AddCaching()` separately .
> `AddRedisCaching()` automatically includes the core caching module .

</TabItem>

<TabItem value="module" label="Module-based">

```csharp
public class MyModule : RamshaModule
{
    public override void Register(RegisterContext context)
    {
        base.Register(context);
        context.DependsOn<RedisCachingModule>();
    }
}
```


> **Note:** You do **not** need to depend on `CachingModule` directly.
> `RedisCachingModule` already includes it internally.

</TabItem>

</Tabs>

---

## Redis Configuration

Configure Redis in your application settings:

```json {9-12}
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Redis": {
    "Configuration": "127.0.0.1:6379",
    "InstanceName": "my_app_"
  }
}
```

- `Configuration` = Redis server address(es)
- `InstanceName` = Optional prefix for all cache keys

HybridCache will use this distributed provider as its L2 cache
automatically.

---

## How It Works

Once Redis is enabled:

1.  **Local memory (L1)** is checked first
2.  **Redis (L2)** is checked if L1 misses
3.  If still missing, the factory function generates the value
4.  The result is written back to **both L1 and L2** caches

This gives:

- Fast local reads
- Shared cache across nodes
- Stampede protection
- Tag-based invalidation support

---

## Cache Operations (Same API)

Redis caching uses the **same `IRamshaCache` API** as in-memory caching:

```csharp
app.MapGet("products", async (IRamshaCache cache) =>
{
    return await cache.GetOrCreateAsync(
    "products:all",
    async ct => await LoadProductsAsync()
    );
});
```


No changes are required in your application code when switching from
in-memory to Redis.

---

## Continue with:

- **[Local Messaging](../messaging/local-messaging)**
