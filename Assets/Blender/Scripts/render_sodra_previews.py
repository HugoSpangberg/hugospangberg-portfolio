from __future__ import annotations

import shutil
from pathlib import Path
import sys

import bpy
from mathutils import Vector

sys.path.append(str(Path(__file__).resolve().parent))

from blender_common import EXPORTS, PREVIEWS, reset_scene


def look_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def configure_scene(background: tuple[float, float, float], resolution: tuple[int, int] = (1280, 900)) -> None:
    scene = bpy.context.scene
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except TypeError:
        scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = resolution[0]
    scene.render.resolution_y = resolution[1]
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1
    world = scene.world or bpy.data.worlds.new("World")
    scene.world = world
    world.color = background
    if hasattr(scene, "eevee"):
        if hasattr(scene.eevee, "use_gtao"):
            scene.eevee.use_gtao = True
        if hasattr(scene.eevee, "gtao_distance"):
            scene.eevee.gtao_distance = 3
        if hasattr(scene.eevee, "gtao_factor"):
            scene.eevee.gtao_factor = 1.4


def add_light(name: str, light_type: str, location: tuple[float, float, float], energy: float, target: tuple[float, float, float]) -> None:
    data = bpy.data.lights.new(name, light_type)
    data.energy = energy
    if light_type == "AREA":
        data.size = 4.0
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    bpy.context.collection.objects.link(obj)
    look_at(obj, target)


def import_sodra() -> None:
    glb_path = EXPORTS / "sodra.glb"
    if not glb_path.exists():
        raise FileNotFoundError(f"Missing Södra GLB: {glb_path}")
    bpy.ops.import_scene.gltf(filepath=str(glb_path))


def render_preview(name: str, background: tuple[float, float, float], camera_location: tuple[float, float, float], target: tuple[float, float, float], focal_length: float) -> None:
    reset_scene()
    import_sodra()
    configure_scene(background)

    camera_data = bpy.data.cameras.new(f"{name}_Camera")
    camera = bpy.data.objects.new(f"{name}_Camera", camera_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera
    camera.location = camera_location
    camera.data.lens = focal_length
    camera.data.clip_end = 80
    look_at(camera, target)

    add_light(f"{name}_KeyLight", "AREA", (-3.2, -4.5, 5.0), 480, target)
    add_light(f"{name}_FillLight", "AREA", (3.2, -3.0, 2.8), 90, target)
    add_light(f"{name}_RimLight", "POINT", (2.6, 1.4, 3.2), 95, target)

    PREVIEWS.mkdir(parents=True, exist_ok=True)
    output = PREVIEWS / name
    bpy.context.scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)


render_preview(
    "sodra-validation.png",
    (0.46, 0.46, 0.43),
    (4.10, -5.55, 2.95),
    (0.10, -1.30, 1.05),
    42,
)
render_preview(
    "sodra-hero.png",
    (0.035, 0.055, 0.045),
    (4.25, -5.85, 2.70),
    (0.05, -1.30, 1.12),
    44,
)

shutil.copy2(PREVIEWS / "sodra-hero.png", PREVIEWS / "sodra.png")
after_dir = PREVIEWS / "After"
after_dir.mkdir(parents=True, exist_ok=True)
shutil.copy2(PREVIEWS / "sodra-hero.png", after_dir / "sodra.png")
