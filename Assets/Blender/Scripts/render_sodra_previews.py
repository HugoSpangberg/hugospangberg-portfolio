from __future__ import annotations

import shutil
from pathlib import Path
import sys

import bpy
from mathutils import Vector

sys.path.append(str(Path(__file__).resolve().parent))

from blender_common import EXPORTS, PREVIEWS, reset_scene


TARGET = (-0.30, -1.95, 0.94)


def look_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def configure_scene(background: tuple[float, float, float], resolution: tuple[int, int]) -> None:
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
        if hasattr(scene.eevee, "taa_render_samples"):
            scene.eevee.taa_render_samples = 48
        if hasattr(scene.eevee, "use_gtao"):
            scene.eevee.use_gtao = True
        if hasattr(scene.eevee, "gtao_distance"):
            scene.eevee.gtao_distance = 3
        if hasattr(scene.eevee, "gtao_factor"):
            scene.eevee.gtao_factor = 1.25


def add_light(name: str, light_type: str, location: tuple[float, float, float], energy: float, target: tuple[float, float, float], size: float = 4.0) -> None:
    data = bpy.data.lights.new(name, light_type)
    data.energy = energy
    if light_type == "AREA":
        data.size = size
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    bpy.context.collection.objects.link(obj)
    look_at(obj, target)


def import_sodra() -> None:
    glb_path = EXPORTS / "sodra.glb"
    if not glb_path.exists():
        raise FileNotFoundError(f"Missing Sodra GLB: {glb_path}")
    bpy.ops.import_scene.gltf(filepath=str(glb_path))


def render_preview(
    name: str,
    background: tuple[float, float, float],
    camera_location: tuple[float, float, float],
    target: tuple[float, float, float],
    focal_length: float,
    resolution: tuple[int, int] = (1280, 900),
    orthographic_scale: float | None = None,
) -> None:
    reset_scene()
    import_sodra()
    configure_scene(background, resolution)

    camera_data = bpy.data.cameras.new(f"{name}_Camera")
    camera = bpy.data.objects.new(f"{name}_Camera", camera_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera
    camera.location = camera_location
    camera.data.lens = focal_length
    camera.data.clip_end = 80
    if orthographic_scale is not None:
        camera.data.type = "ORTHO"
        camera.data.ortho_scale = orthographic_scale
    look_at(camera, target)

    add_light(f"{name}_KeyLight", "AREA", (-3.0, -4.7, 5.2), 540, target, 4.4)
    add_light(f"{name}_FillLight", "AREA", (3.5, -2.4, 3.0), 120, target, 5.0)
    add_light(f"{name}_RimLight", "POINT", (2.4, 1.3, 3.1), 85, target)

    PREVIEWS.mkdir(parents=True, exist_ok=True)
    output = PREVIEWS / name
    bpy.context.scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {output.relative_to(PREVIEWS.parent)}")


render_preview(
    "sodra-front-validation.png",
    (0.47, 0.47, 0.44),
    (4.20, -5.95, 2.45),
    TARGET,
    45,
)
render_preview(
    "sodra-rear-validation.png",
    (0.47, 0.47, 0.44),
    (-3.55, 1.45, 2.35),
    (-0.30, -1.55, 0.88),
    43,
)
render_preview(
    "sodra-aerial-validation.png",
    (0.47, 0.47, 0.44),
    (-0.30, -1.85, 7.0),
    (-0.30, -1.85, 0.0),
    50,
    (1280, 900),
    5.90,
)
render_preview(
    "sodra-hero-preview.png",
    (0.025, 0.045, 0.038),
    (4.25, -6.10, 2.55),
    TARGET,
    46,
)
render_preview(
    "sodra-hero-250px-preview.png",
    (0.025, 0.045, 0.038),
    (4.25, -6.10, 2.55),
    TARGET,
    46,
    (250, 180),
)

shutil.copy2(PREVIEWS / "sodra-front-validation.png", PREVIEWS / "sodra-validation.png")
shutil.copy2(PREVIEWS / "sodra-hero-preview.png", PREVIEWS / "sodra-hero.png")
shutil.copy2(PREVIEWS / "sodra-hero-preview.png", PREVIEWS / "sodra.png")
after_dir = PREVIEWS / "After"
after_dir.mkdir(parents=True, exist_ok=True)
shutil.copy2(PREVIEWS / "sodra-hero-preview.png", after_dir / "sodra.png")
