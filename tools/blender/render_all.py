import json
import math
import os
import pathlib

try:
    import bpy
    HAS_BPY = True
except ImportError:
    HAS_BPY = False

ROOT_DIR = pathlib.Path(__file__).resolve().parents[2]
CATALOG_PATH = ROOT_DIR / "catalog" / "models.json"
MODELS_OUT_DIR = ROOT_DIR / "ui" / "src" / "assets" / "models"
RENDERS_OUT_DIR = ROOT_DIR / "ui" / "src" / "assets" / "renders"


def hex_to_rgba(hex_str):
    value = hex_str.lstrip("#")
    r = int(value[0:2], 16) / 255.0
    g = int(value[2:4], 16) / 255.0
    b = int(value[4:6], 16) / 255.0
    return (r, g, b, 1.0)


def create_pbr_material(name, base_color, roughness=0.22, metallic=0.0, emissive=None):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if emissive and "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emissive
            bsdf.inputs["Emission Strength"].default_value = 3.5
    return mat


def build_earbuds_hierarchy(model_def, primary_hex):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    color_rgba = hex_to_rgba(primary_hex)
    body_mat = create_pbr_material("SatinShell", color_rgba, roughness=0.24, metallic=0.05)
    led_mat = create_pbr_material("StatusLed", (0.18, 0.82, 0.34, 1.0), roughness=0.1, emissive=(0.18, 0.82, 0.34, 1.0))

    is_pro = "pro" in model_def["id"]
    width_scale = 1.28 if is_pro else 1.05

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.0, -0.25))
    case_body = bpy.context.active_object
    case_body.name = "case_body"
    case_body.scale = (width_scale, 0.56, 0.78)
    bpy.ops.object.modifier_add(type="BEVEL")
    case_body.modifiers["Bevel"].width = 0.18
    case_body.modifiers["Bevel"].segments = 4
    case_body.data.materials.append(body_mat)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.28, 0.15))
    case_lid = bpy.context.active_object
    case_lid.name = "case_lid"
    case_lid.scale = (width_scale, 0.56, 0.32)
    bpy.ops.object.modifier_add(type="BEVEL")
    case_lid.modifiers["Bevel"].width = 0.16
    case_lid.modifiers["Bevel"].segments = 4
    case_lid.data.materials.append(body_mat)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, location=(-0.38, 0.0, 0.15))
    bud_left = bpy.context.active_object
    bud_left.name = "bud_left"
    bud_left.data.materials.append(body_mat)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, location=(0.38, 0.0, 0.15))
    bud_right = bpy.context.active_object
    bud_right.name = "bud_right"
    bud_right.data.materials.append(body_mat)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.035, location=(0.0, -0.57, -0.18))
    led = bpy.context.active_object
    led.name = "led"
    led.data.materials.append(led_mat)

    if model_def["kind"] == "over-ear":
        bpy.ops.mesh.primitive_torus_add(major_radius=0.45, minor_radius=0.12, location=(0.0, 0.0, 0.35))
        cushions = bpy.context.active_object
        cushions.name = "ear_cushions"
        cushions.data.materials.append(body_mat)

    return case_lid


def setup_studio_camera_and_lights():
    bpy.ops.object.camera_add(location=(0.0, -3.6, 1.15), rotation=(math.radians(74), 0.0, 0.0))
    cam = bpy.context.active_object
    bpy.context.scene.camera = cam

    bpy.ops.object.light_add(type="AREA", location=(2.2, -2.0, 2.8))
    key_light = bpy.context.active_object
    key_light.data.energy = 140.0

    bpy.ops.object.light_add(type="AREA", location=(-2.4, -1.5, 1.6))
    fill_light = bpy.context.active_object
    fill_light.data.energy = 60.0

    scene = bpy.context.scene
    scene.render.film_transparent = True
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024


def process_catalog():
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    MODELS_OUT_DIR.mkdir(parents=True, exist_ok=True)
    RENDERS_OUT_DIR.mkdir(parents=True, exist_ok=True)

    for model_def in catalog["models"]:
        model_id = model_def["id"]
        primary_hex = model_def["colors"][0]["hex"]
        model_render_dir = RENDERS_OUT_DIR / model_id
        model_render_dir.mkdir(parents=True, exist_ok=True)

        if HAS_BPY:
            case_lid = build_earbuds_hierarchy(model_def, primary_hex)
            setup_studio_camera_and_lights()
            glb_path = MODELS_OUT_DIR / f"{model_id}.glb"
            bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format="GLB")
            case_lid.rotation_euler[0] = 0.0
            bpy.context.scene.render.filepath = str(model_render_dir / "case-closed.png")
            bpy.ops.render.render(write_still=True)
            case_lid.rotation_euler[0] = math.radians(-75)
            bpy.context.scene.render.filepath = str(model_render_dir / "case-open.png")
            bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    process_catalog()
