# Self Encrypt 🔐

## Generate Key

```bash
deno task generate . -p password -s salt -name foo

deno task generate ./path/to/key/dir
```

## Encrypt File

```bash
deno task encrypt ./path/to/file.txt -k ./path/to/key.key
```

## Decrypt File

```bash
deno task decrypt ./path/to/file.txt -k ./path/to/key.key
```
