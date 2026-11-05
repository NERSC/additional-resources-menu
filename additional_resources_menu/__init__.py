
import json
from pathlib import Path

from ._version import __version__

HERE = Path(__file__).parent.resolve()

_pkg_path = HERE / "labextension" / "package.json"
if _pkg_path.exists():
    with _pkg_path.open() as fid:
        _data = json.load(fid)
    _dest = _data.get("name", "additional-resources-menu")
else:
    _dest = "additional-resources-menu"


def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": _dest
    }]

