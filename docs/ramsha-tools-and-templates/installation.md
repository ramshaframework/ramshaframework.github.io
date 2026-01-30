---
sidebar_position: 1
---

# Installing



## Installing Ramsha Templates and tools

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

```sh
dotnet new install Ramsha.Templates
```

Once installed, you can list available Ramsha templates:

```sh
dotnet new list
```