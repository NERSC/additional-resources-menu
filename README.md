# additional_resources_menu

A JupyterLab extension.

This extension adds an Additional Resources submenu to the Help Menu in JupyterLab. This submenu provides links to
outside documentation as set in the `overrides.json` file (see Configuration).

## Requirements

- JupyterLab >= 4.0 < 5

## Install

To install the extension, enter the root repository folder and execute:

```bash
pip install additional-resources-menu
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall additional-resources-menu
```

If that does not work, you can directly delete the extension folder from Jupyter. See
<a href="https://jupyterlab.readthedocs.io/en/latest/user/directories.html#extensions">this link</a>
to find where extensions are installed.

## Configuration

The additional resources menu is designed for central management by system administrators. User configuration is disabled in the JupyterLab Settings Editor (`jupyter.lab.setting-deprecated: true`), ensuring users cannot accidentally alter or remove institutionally provided links.

Administrators configure the menu by placing an `overrides.json` or `overrides.d/additional-resources-menu.json` file in Jupyter's settings directory:

```bash
# Locate your Jupyter settings directory
jupyter lab path
# Typically: <sys-prefix>/share/jupyter/lab/settings/overrides.d/additional-resources-menu.json
```

Example configuration (`overrides.d/additional-resources-menu.json` or `overrides.json`):

```json
{
  "additional-resources-menu:plugin": {
    "menu-title": "NERSC Resources",
    "open-in-jupyter": false,
    "rank": 10,
    "links": [
      {
        "name": "NERSC Technical Documentation",
        "url": "https://docs.nersc.gov"
      },
      {
        "name": "NERSC Jupyter Documentation",
        "url": "https://docs.nersc.gov/services/jupyter"
      }
    ]
  }
}
```

See `example_overrides.json` for a full template.

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the additional_resources_menu directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

### Running tests

#### Frontend Unit Tests

Run Jest tests for URL validation, mixed content checks, and widget instantiation:

```bash
jlpm run test
```

#### Python Unit Tests

Run pytest unit tests for package metadata and schema validation:

```bash
pytest
```

#### Galata / Playwright UI Tests

Run end-to-end browser tests using JupyterLab Galata and Playwright:

```bash
# Install UI test dependencies and browsers (first time only)
cd ui-tests && jlpm install && jlpm playwright install chromium && cd ..

# Run UI tests
jlpm run test:ui
```

### Development uninstall

```bash
pip uninstall additional_resources_menu
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `additional-resources-menu` within that folder.
