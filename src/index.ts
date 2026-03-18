#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const execFileAsync = promisify(execFile);

async function sendNotification(title: string, body: string): Promise<void> {
  // Run via temp script file to prevent PowerShell injection
  const scriptPath = join(tmpdir(), `notify-mcp-${Date.now()}.ps1`);
  const escapedTitle = title.replace(/'/g, "''");
  const escapedBody = body.replace(/'/g, "''");
  const script = `New-BurntToastNotification -Text '${escapedTitle}', '${escapedBody}'`;

  try {
    await writeFile(scriptPath, script, "utf-8");
    await execFileAsync("pwsh", ["-ExecutionPolicy", "Bypass", "-File", scriptPath]);
  } finally {
    await unlink(scriptPath).catch(() => {});
  }
}

const server = new McpServer({
  name: "notify-mcp",
  version: "1.0.0",
});

server.tool(
  "send_notification",
  "Send a native Windows toast notification to the user's desktop. Use this whenever the user wants to be informed about something — including phrases like 'let me know', 'tell me', 'alert me', 'ping me', or 'notify me'. Also use this when a long-running task (e.g. build, test, deployment, file processing) completes, fails, or needs attention. The notification appears in the bottom-right corner and stays in the Windows notification center.",
  {
    title: z.string().describe("Notification title"),
    body: z.string().describe("Notification body"),
  },
  async ({ title, body }) => {
    try {
      await sendNotification(title, body);
      return {
        content: [{ type: "text" as const, text: `Notification sent: ${title}` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Notification failed: ${message}` }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("notify-mcp server started on stdio");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
