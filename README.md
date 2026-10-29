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

The additional resources menu is populated with links that are specified in the `overrides.json` file. Click
<a href="https://jupyterlab.readthedocs.io/en/latest/user/directories.html#overrides-json">this link</a>
to see where your overrides.json file is installed. This will set the additional resources for all users who
access Jupyter through the shared install (so this file must be set for all virtual environments or installs).

View the example_overrides.json file above to see how to format this file

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
# Install browsers (first time only)
npx playwright install --with-deps chromium

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
