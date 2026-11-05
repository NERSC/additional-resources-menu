import json
from pathlib import Path
import pytest
from jsonschema import validate, ValidationError, FormatChecker

HERE = Path(__file__).parent.resolve()
ROOT = HERE.parent


def test_version():
    from additional_resources_menu import __version__
    with (ROOT / "package.json").open() as f:
        pkg = json.load(f)
    assert __version__ == pkg["version"]


def test_labextension_paths():
    from additional_resources_menu import _jupyter_labextension_paths
    paths = _jupyter_labextension_paths()
    assert isinstance(paths, list)
    assert len(paths) == 1
    assert paths[0]["src"] == "labextension"
    assert paths[0]["dest"] == "additional-resources-menu"


def test_schema_validity():
    schema_path = ROOT / "schema" / "plugin.json"
    assert schema_path.exists()

    with schema_path.open() as f:
        schema = json.load(f)

    assert schema["title"] == "Additional Resources"
    assert schema["type"] == "object"
    assert "properties" in schema
    assert "links" in schema["properties"]
    assert "menu-title" in schema["properties"]
    assert "open-in-jupyter" in schema["properties"]
    assert "rank" in schema["properties"]
    assert schema["properties"]["links"]["items"]["properties"]["url"]["format"] == "uri"
    assert schema.get("jupyter.lab.setting-deprecated") is True


def test_example_overrides():
    schema_path = ROOT / "schema" / "plugin.json"
    overrides_path = ROOT / "example_overrides.json"

    with schema_path.open() as f:
        schema = json.load(f)

    with overrides_path.open() as f:
        overrides = json.load(f)

    plugin_settings = overrides.get("additional-resources-menu:plugin")
    assert plugin_settings is not None
    # Validate against schema with format checker
    validate(instance=plugin_settings, schema=schema, format_checker=FormatChecker())


def test_schema_validation_rejects_invalid_link():
    schema_path = ROOT / "schema" / "plugin.json"
    with schema_path.open() as f:
        schema = json.load(f)

    # Missing required 'url'
    invalid_settings = {
        "links": [{"name": "Only Name"}]
    }
    with pytest.raises(ValidationError):
        validate(instance=invalid_settings, schema=schema)


def test_schema_validation_rejects_invalid_url_format():
    schema_path = ROOT / "schema" / "plugin.json"
    with schema_path.open() as f:
        schema = json.load(f)

    # Invalid URI format
    invalid_settings = {
        "links": [{"name": "Bad URL", "url": "not a valid uri with spaces"}]
    }
    with pytest.raises(ValidationError):
        validate(instance=invalid_settings, schema=schema, format_checker=FormatChecker())

