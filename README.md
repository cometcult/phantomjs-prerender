# phantomjs-prerender

## How to run

```bash
phantomjs --disk-cache=no phantomjs-prerender.js {port} {URL}
```

* `{port}` – port internally used to serve rendered HTML
* `{URL}` – remote URL which will be rendered by PhantomJS to static HTML
