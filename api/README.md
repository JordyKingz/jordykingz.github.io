# Malware presign endpoint

The Vercel function in `api/presign.ts` returns short-lived upload or download URLs for the malware dropbox. Configure the following environment variables in Vercel so the function can talk to DigitalOcean Spaces:

- `DO_API_BUCKET` – Spaces bucket name that stores the uploads.
- `DO_API_REGION` – Region slug (for example `ams3`).
- `DO_API_KEY` / `DO_API_SECRET` – API keys for the Spaces access key pair.
- `BEARER_TOKEN` – Optional Basic auth token that must match the `malwareConfig.bearerToken` value embedded in the site.
- `MALWARE_CORS_ORIGIN` – Optional `Access-Control-Allow-Origin` override. Defaults to `*` for staging.
- `DO_API_ENDPOINT` – Optional override when using a custom Spaces domain.

## Testing locally

Run `vercel dev` (or any Node server that can execute the handler), then issue a request:

```bash
curl -X POST http://localhost:3000/api/presign \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $API_TOKEN" \
  -d '{
        "filename": "uploads/test.bin",
        "type": "PUT",
        "duration": "30m",
        "contentType": "application/octet-stream"
      }'
```

The response contains the signed `url` that `assets/js/malware.js` uses for the actual upload. The same endpoint also supports `type: "GET"` for download links.
