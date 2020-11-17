# Web Dev Server

Web Dev Server is a new type of compiler that compiles each file as they come in.

## Running Web Dev Server

- Checkout this branch
- `yarn`
- Run `script/develop` until it finishes first webpack build. Then turn it off. We use this right now to prepare the static files + auth/onboarding pages.
- Update `hass_frontend/index.html`, find where we import the scripts and replace with:
  ```html
  <script>
    // Load scripts from Web dev server
    import("http://localhost:8000/src/entrypoints/core.ts");
    import("http://localhost:8000/src/entrypoints/app.ts");
  ```
  _(Drop the "use-credentials" part in dev and update the import URLs to import from web dev server)_
- Start web dev server `wds --watch`
- Open Home Assistant as usual.
