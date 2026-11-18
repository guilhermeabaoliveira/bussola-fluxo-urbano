import bpy,json,os
from pathlib import Path
OUT=Path(__file__).resolve().parent
results=[]
for path in sorted(OUT.glob('*.blend')):
 if path.name=='bancada-completa.blend':continue
 bpy.ops.wm.read_factory_settings(use_empty=True)
 with bpy.data.libraries.load(str(path),link=False) as (src,dst):dst.objects=src.objects
 for obj in dst.objects:
  if obj and obj.name not in bpy.context.scene.objects:bpy.context.scene.collection.objects.link(obj)
 bpy.context.scene.unit_settings.system='METRIC'
 bpy.context.scene.frame_set(1)
 temporary=path.with_suffix('.scene.blend')
 bpy.ops.wm.save_as_mainfile(filepath=str(temporary))
 os.replace(temporary,path)
 results.append({'file':path.name,'scene':bpy.context.scene.name,'objects':len(bpy.context.scene.objects)})
(OUT/'individual-scenes-verification.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print('INDIVIDUAL_SCENES_READY',len(results),flush=True)
