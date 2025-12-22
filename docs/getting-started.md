---
sidebar_position: 2
---

# Getting Started

## Requirements

Before using Ramsha Framework, make sure you have:

* .NET SDK (version 9.0)
* Basic knowledge of Aspnetcore and backend development

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

### Quick Start

#### Creating a New Application
Use the CLI tool to scaffold a new application:

```bash
ramsha new api MyApp
```
Or:
```bash
dotnet new ramsha-api -n MyApp
```
This creates a new ASP.NET Core Simple API project with the Ramsha framework.

---

## Next Steps

After installation, continue with:

- **[Modularity](./basics/architecture-and-templates/modularity)**
- **[Solution Templates](./basics/architecture-and-templates/ramsha-templates/solution-templates)**
