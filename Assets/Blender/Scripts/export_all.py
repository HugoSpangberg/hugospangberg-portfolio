import runpy
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent

for script in [
    "build_filmstaden.py",
    "build_visma.py",
    "build_sodra.py",
    "build_dasa_forestry.py",
    "build_education.py",
]:
    runpy.run_path(str(SCRIPT_DIR / script), run_name="__main__")
