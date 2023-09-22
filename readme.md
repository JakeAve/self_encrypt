# Self Encrypt 🔐

Encrypt important files and data using open source code with no logs, no
internet connection and no fee.

## Installation

## Installer

- Download installer for your operating system
- Run the installer by executing it directly

Example:

```bash
<path-to-installer>/self_encrypt_🔐_installer_aarch64-apple-darwin.pkg
```

Note: The installer will access the internet to download its corresponding
version

## Deno Install

If you have Deno, you can use this command:

```bash
deno install --allow-net=raw.githubusercontent.com --allow-read --allow-write -n self_encrypt_🔐_installer_aarch64-apple-darwin.pkg https://raw.githubusercontent.com/JakeAve/self_encrypt/main/scripts/install.ts
```

## CLI

### Help

You can ask for help at almost any point.

```bash
self_encrypt
self_encrypt --help
self_encrypt enc --help
self_encrypt dec --help
self_encrypt keys gen --help
```

### Keys

View the keys you have saved using self_encrypt. Keys can be manually added in
the `keys_meta` file.

```bash
self_encrypt keys --help

self_encrypt keys
self_encrypt keys list
```

### Generate Key

Generate a crypto key as a binary file with a `.key` extension.

```bash
self_encrypt keys gen --help

self_encrypt keys gen
## Generates a random AES-GCM 256 bit key. Will assign a random name in the keys_meta file.

self_encrypt keys gen [key-name] ## don't include a file extension
## Generates a random AES-GCM 256 bit key with the name specified.
```

The password (`-p`/`--password`) and salt options (`-s`/`--salt`) are to create
repeatable keys that can be regenerated with the same salt and password. Since
this is being used in a cli environment the value for the salt can be just as
arbitrary as the password (think of it as two passwords). This can be useful if
you want to be able to recreate the same key in different places. There are
options to use a password and salt to encrypt and decrypt, so hypothetically you
can encrypt files without saving a key at all - just remember your password and
salt.

When using the directory options (`-d`/`--directory`), the key will still be
added to the `keys_meta` file with its correct path. However, if self_encrypt
ever detects that the path is no longer valid, it will remove the entry from
`keys_meta`.

### Remove Key

Removes a key by its name. This deletes the file and entry in the `keys_meta`.

```bash
self_encrypt keys rm <key-name>
```

### Encypt

```bash
self_encrypt enc <file-path>
# will prompt you to use a key saved to self_encrypt

self_encrypt enc <file-path> [key-name-or-path-to-key]
# will encrypt the file using the key
```

### Decrypt

```bash
self_encrypt dec <file-path>
# will prompt you to use a key saved to self_encrypt

self_encrypt dec <file-path> [key-name-or-path-to-key]
# will decrypt the file using the key
```

## keys_meta

The keys generated in self_encrypt are pure binaries. There is no way to quickly
remember what algorithm the key uses, how big it is or what its used for.

The `keys_meta` file is a tool to keep track of keys. It is formatted in YAML
and can be edited directly. self_encrypt will update it programmatically as you
generate or remove keys.

`keys_meta` does not look for files outside of the `keys_🔑🔑` directory, so you
can still hide keys from self_encrypt by saving them to a different directory
and removing them from the `keys_meta`.
