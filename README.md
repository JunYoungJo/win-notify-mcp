# win-notify-mcp

An MCP server that sends native Windows toast notifications using [BurntToast](https://github.com/Windos/BurntToast). Notifications appear in the bottom-right corner and persist in the Windows notification center.

## Prerequisites

- **Windows 10/11**
- **PowerShell 7+** (`pwsh`)
- **BurntToast** PowerShell module

Install BurntToast:

```powershell
pwsh -Command "Install-Module -Name BurntToast -Scope CurrentUser"
```

## Setup

Add to your MCP client configuration (e.g. Claude Desktop, Claude Code):

### Using npx (npm)

```json
{
  "mcpServers": {
    "notify": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "-y", "win-notify-mcp"],
      "env": {}
    }
  }
}
```

### Using npx (GitHub)

```json
{
  "mcpServers": {
    "notify": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "-y", "github:JunYoungJo/win-notify-mcp"],
      "env": {}
    }
  }
}
```

## Tools

### `send_notification`

Sends a Windows toast notification.

| Parameter | Type   | Description        |
|-----------|--------|--------------------|
| `title`   | string | Notification title |
| `body`    | string | Notification body  |

### Example

```
"Send me a notification when the build is done"
```

The AI will call `send_notification` with an appropriate title and body, and a toast notification will appear on your desktop.

## License

MIT
