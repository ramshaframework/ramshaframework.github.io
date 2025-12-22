---
sidebar_position: 5
---

# Authorization

Ramsha provides a **flexible and extensible authorization system** that integrates seamlessly with ASP.NET Core `[Authorize]` attributes, while supporting **custom permission value resolvers** and multiple providers.

---

## Permission Definitions

Permissions in Ramsha are defined using the `IPermissionDefinitionProvider` interface. Each permission belongs to a **group** and can have **child permissions** to form a hierarchical structure.

### Example

```csharp
public static class ProductPermissions
{
    public const string GroupName = "products";

    public static class Manage
    {
        public const string Default = $"{GroupName}:manage";
        public const string Create = $"{GroupName}:manage:create";
        public const string Update = $"{GroupName}:manage:update";
        public const string Delete = $"{GroupName}:manage:delete";
    }
}

public class ProductPermissionsDefinition : IPermissionDefinitionProvider
{
    public void Define(IPermissionDefinitionContext context)
    {
        context.Group(ProductPermissions.GroupName, g =>
        {
            g.Permission(ProductPermissions.Manage.Default).Children(c =>
            {
                c.Add(ProductPermissions.Manage.Create);
                c.Add(ProductPermissions.Manage.Update);
                c.Add(ProductPermissions.Manage.Delete);
            });
        });
    }
}
````

* `GroupName` organizes related permissions
* Permissions can have **children**, creating hierarchical permission structures
* Each permission can specify **providers**, which control which resolvers are executed

---

## Checking Permissions

Permissions can be checked manually using `IPermissionChecker`:

```csharp
public class ProductAppService(IPermissionChecker permissionChecker)
{

    public async Task<bool> CanUserCreateProductAsync(ClaimsPrincipal? user)
    {
        return await permissionChecker.IsAssignedAsync(user, ProductPermissions.Manage.Create);
    }
}
```

* Useful for **conditional UI rendering**, background jobs, or programmatic logic
* `IPermissionChecker` internally calls the **resolver system** for permission evaluation

---

## Permission Value Resolvers

Resolvers determine whether a permission is granted. Each resolver returns a `PermissionStatus`:

* `Allow` → permission granted, stop further evaluation
* `Deny` → permission denied, stop further evaluation
* `None` → continue to the next resolver

Only resolvers whose **provider name matches** the permission's `Providers` list are executed.

### Built-in Resolver Example

```csharp
public class UserPermissionValueResolver(IPermissionStore store)
    : PermissionValueResolver("U")
{
    public override async Task<PermissionStatus> ResolveAsync(PermissionResolveContext context)
    {
        var userId = context.Principal?.FindUserId();
        if (userId is null) return PermissionStatus.None;

        var isAssigned = await store.IsAssignedAsync(
            context.Permission.Name, GetProviderName(), userId);

        return isAssigned ? PermissionStatus.Allow : PermissionStatus.None;
    }
}
```

* `"U"` is the **provider name** for this resolver
* Only permissions specifying this provider will execute this resolver

---

### Custom Resolver Example

```csharp
public class RoleBasedPermissionResolver(IRoleStore roleStore)
    : PermissionValueResolver("R")
{
    public override async Task<PermissionStatus> ResolveAsync(PermissionResolveContext context)
    {
        var userId = context.Principal?.FindUserId();
        if (userId is null) return PermissionStatus.None;

        var hasRolePermission = await roleStore.HasPermissionAsync(userId, context.Permission.Name);
        return hasRolePermission ? PermissionStatus.Allow : PermissionStatus.None;
    }
}
```

* `"R"` ensures this resolver is applied only for permissions using that provider
* You can create **multiple custom resolvers** for different scenarios

---

## Permission Status

```csharp
public enum PermissionStatus
{
    None = 0,  // Not determined yet
    Allow = 1, // Granted
    Deny = 2   // Explicitly denied
}
```

* Resolvers are executed **in order**
* The **first resolver to return `Allow` or `Deny` stops further evaluation**
* If all resolvers return `None`, the **final status is `Deny`**
* This ensures predictable and consistent permission evaluation

---

## Registering Permission Value Resolvers

Resolvers are registered during the **configuration phase**:

```csharp
context.Configure<RamshaPermissionOptions>(options =>
{
    options.ValueResolvers.Add<UserPermissionValueResolver>();

    // Control execution order
    options.ValueResolvers.AddBefore<UserPermissionValueResolver, RoleBasedPermissionResolver>();
});
```

* The **order of resolvers is important**
* Only resolvers whose **provider matches the permission** are executed
* You can use `AddBefore` or `AddAfter` to control execution order
* Custom resolvers can be added for advanced scenarios

---

## Using `[Authorize]` Attribute

Permissions can be enforced declaratively on controllers or endpoints:

```csharp

public class ProductsController : RamshaApiController
{
    [Authorize(Permission = ProductPermissions.Manage.Create)]
    [HttpPost("create")]
    public async Task<IActionResult> CreateProduct()
    {
        return Ok();
    }
}
```

* `[Authorize]` internally **uses `IPermissionChecker`** and the resolver system
* Ensures **consistent permission evaluation** across manual checks and attribute-based authorization
* Works with **hierarchical permissions** and **custom resolvers**
* Respects the **provider filtering** for each resolver


## Next Steps
* **[Local Messaging](./messaging/local-messaging)**
* **[Best Practices](./best-practices)**





