from __future__ import annotations

import sys
from pathlib import Path

import bpy

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from common import PREVIEWS, SOURCES

MASTER_BLEND = SOURCES / "career-world-master.blend"


def set_render_defaults(width: int, height: int, filepath: Path, validation: bool) -> None:
    bpy.context.scene.render.engine = "BLENDER_EEVEE_NEXT"
    bpy.context.scene.eevee.taa_render_samples = 64
    if hasattr(bpy.context.scene.eevee, "use_gtao"):
        bpy.context.scene.eevee.use_gtao = True
    if hasattr(bpy.context.scene.eevee, "gtao_distance"):
        bpy.context.scene.eevee.gtao_distance = 3
    if hasattr(bpy.context.scene.eevee, "gtao_factor"):
        bpy.context.scene.eevee.gtao_factor = 1.15
    bpy.context.scene.render.resolution_x = width
    bpy.context.scene.render.resolution_y = height
    bpy.context.scene.render.filepath = str(filepath)
    bpy.context.scene.view_settings.view_transform = "Filmic"
    bpy.context.scene.view_settings.look = "Medium High Contrast"
    bpy.context.scene.world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world.color = (0.12, 0.13, 0.13) if validation else (0.015, 0.028, 0.024)


def render(camera_name: str, output_name: str, width: int, height: int, validation: bool) -> None:
    camera = bpy.data.objects.get(camera_name)
    if camera is None:
        raise RuntimeError(f"Missing preview camera {camera_name}. Run npm run models:assemble first.")
    bpy.context.scene.camera = camera
    set_render_defaults(width, height, PREVIEWS / output_name, validation)
    bpy.ops.render.render(write_still=True)
    print(f"Rendered master preview {output_name}")


def main() -> None:
    if not MASTER_BLEND.exists():
        raise SystemExit("Missing master scene. Run npm run models:assemble first.")

    PREVIEWS.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.open_mainfile(filepath=str(MASTER_BLEND))
    render("Camera_Master_Hero", "career-world-master-validation.png", 1440, 980, True)
    render("Camera_Master_Hero", "career-world-master-hero.png", 1440, 980, False)
    render("Camera_Master_Mobile", "career-world-master-mobile.png", 900, 1280, False)
    render("Camera_Master_Hero", "career-world-master-desktop-final.png", 1440, 980, False)
    render("Camera_Master_Mobile", "career-world-master-mobile-final.png", 900, 1280, False)
    render("Camera_Master_Left", "career-world-master-left-final.png", 1440, 980, False)
    render("Camera_Master_Right", "career-world-master-right-final.png", 1440, 980, False)
    render("Camera_Focus_Sodra", "sodra-in-world-final.png", 1280, 900, False)
    render("Camera_Focus_Visma", "visma-in-world-final.png", 1280, 900, False)
    render("Camera_Focus_Filmstaden", "filmstaden-in-world-final.png", 1280, 900, False)
    render("Camera_Focus_Dasa", "dasa-in-world-final.png", 1280, 900, False)
    render("Camera_Focus_Education", "education-in-world-final.png", 1280, 900, False)


if __name__ == "__main__":
    main()
