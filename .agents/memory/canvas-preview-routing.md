---
name: Canvas preview routing
description: The routing convention that keeps mockup-sandbox iframe frames live on the workspace canvas.
---

Mockup-sandbox iframe URLs on the canvas must use the shared domain route without an explicit `:8000` port: `https://<domain>/__mockup/preview/<folder>/<Component>`.

**Why:** Direct-port URLs can render in an app screenshot but leave the canvas iframe in a failed state.

**How to apply:** When creating or updating a canvas mockup frame, resolve the workspace domain and omit the mockup server port from the iframe URL. Keep the component preview server running separately.