# Vendor scripts

Drop pre-built third-party files here — a library you load from a CDN fallback,
an analytics snippet, anything you do not want concatenated or minified.

The build copies this folder verbatim to `js/vendor/` in the output, so
reference it directly:

```html
<script src="./js/vendor/some-library.min.js"></script>
```
