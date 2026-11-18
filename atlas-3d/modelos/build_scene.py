import bpy, math, json
from pathlib import Path
from mathutils import Vector
OUT=Path(__file__).resolve().parent
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
M={}
for n,c in {'mdf':(.38,.24,.10,1),'preto':(.025,.03,.04,1),'verde':(.025,.26,.13,1),'azul':(.035,.14,.48,1),'metal':(.55,.59,.62,1),'branco':(.86,.87,.86,1),'vermelho':(.70,.035,.025,1),'amarelo':(.92,.62,.02,1),'roxo':(.4,.10,.6,1),'laranja':(.9,.23,.02,1),'ciano':(.02,.65,.8,1),'gnd':(.085,.095,.115,1)}.items():
 m=bpy.data.materials.new(n);m.diffuse_color=c;m.use_nodes=True;m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=c;M[n]=m
groups={}; metadata=[]
def group(n,pos=(0,0,0)):
 o=bpy.data.objects.new(n,None);scene.collection.objects.link(o);o.location=Vector(pos)/1000;groups[n]=o;bpy.context.view_layer.update();return o
def record(o,g,mat,fn,kit='construção',approx=True):
 o.parent=groups[g];o.matrix_parent_inverse=groups[g].matrix_world.inverted();o.data.materials.append(M[mat]);metadata.append({'id':o.name,'group':g,'dimensions_mm':[round(v*1000,3) for v in o.dimensions],'material':mat,'function':fn,'origin':kit,'approximation':approx});return o
def box(n,c,d,g,mat='mdf',fn='estrutura',kit='construção'):
 bpy.ops.mesh.primitive_cube_add(size=1,location=Vector(c)/1000);o=bpy.context.object;o.name=n;o.dimensions=Vector(d)/1000;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return record(o,g,mat,fn,kit)
def cyl(n,c,r,h,g,mat='metal',axis='Z',fn='representação',kit='kit'):
 rot=(math.pi/2,0,0) if axis=='Y' else (0,math.pi/2,0) if axis=='X' else (0,0,0)
 bpy.ops.mesh.primitive_cylinder_add(vertices=40,radius=r/1000,depth=h/1000,location=Vector(c)/1000,rotation=rot);o=bpy.context.object;o.name=n;return record(o,g,mat,fn,kit)
def wire(n,pts,g,mat,r=.65):
 cu=bpy.data.curves.new(n,'CURVE');cu.dimensions='3D';cu.bevel_depth=r/1000;cu.bevel_resolution=2;s=cu.splines.new('POLY');s.points.add(len(pts)-1)
 for p,co in zip(s.points,pts):p.co=(*[a/1000 for a in co],1)
 o=bpy.data.objects.new(n,cu);scene.collection.objects.link(o);o.parent=groups[g];cu.materials.append(M[mat]);metadata.append({'id':n,'group':g,'material':mat,'function':'chicote ilustrativo com terminais identificados','origin':'kit/extensões adicionais','approximation':True});return o
for n in ['base','totem','sensor_A','sensor_B','sensor_C','anteparo_A','anteparo_B','anteparo_C','arduino','protoboard','cabos','fonte']:group(n)
box('base_MDF_600x400x3',(300,200,-1.5),(600,400,3),'base')
for x in (15,585):
 for y in (15,385):cyl('pe_%s_%s'%(x,y),(x,y,-15.5),10,25,'base','preto',fn='pé25mm')
for y in (15.5,384.5):box('reforco_longo_'+str(y),(300,y,-4.5),(594,25,3),'base')
for x in (15.5,584.5):box('reforco_curto_'+str(x),(x,200,-4.5),(25,344,3),'base')
# Rotas em Y estilizadas, pintadas sobre a base, sem relevos no feixe.
for x in (110,310,510):
 box('via_'+str(x),(x,190,.15),(80,180,.3),'base','branco','via gráfica')
 dx=x-300;dy=-40;length=math.hypot(dx,dy);nx=-dy/length*16;ny=dx/length*16
 vs=[((px+sg*nx)/1000,(py+sg*ny)/1000,.0005) for px,py,sg in [(300,320,1),(x,280,1),(x,280,-1),(300,320,-1)]]
 me=bpy.data.meshes.new('ramal_plano');me.from_pydata(vs,[],[(0,1,2,3)]);ob=bpy.data.objects.new('ramal_'+str(x),me);scene.collection.objects.link(ob);record(ob,'base','branco','ramal gráfico plano')
box('via_entrada',(300,350,.2),(55,100,.4),'base','branco','entrada gráfica')
for i,L in enumerate('ABC'):
 x=30+i*200;g='sensor_'+L
 box('suporte_'+L,(x-16.3,180,42.5),(3,60,85),g)
 box('pe_sensor_'+L,(x-10,180,1.5),(35,60,3),g)
 box('HC_SR04_PCB_'+L,(x-13,180,60),(1.6,45,20),g,'verde','PCB HC-SR04','kit' if i==0 else 'adicional')
 for yy in (168,192):
  cyl('transdutor_'+L+str(yy),(x-7,yy,60),8,14,g,'metal','X','transdutor', 'kit' if i==0 else 'adicional')
  cyl('face_'+L+str(yy),(x+.05,yy,60),6.5,.2,g,'preto','X')
 for j,pin in enumerate(['VCC','TRIG','ECHO','GND']):
  box('pino_'+L+'_'+pin,(x-16,176+j*2.54,48),(5,.65,.65),g,'metal','terminal '+pin)
 ag='alvo_'+L;group(ag,(110+i*200,70,0));box('painel_alvo_'+L,(110+i*200,70,60),(3,100,60),ag,'amarelo','alvo plano experimental')
 box('pega_alvo_'+L,(110+i*200,70,100),(3,30,20),ag,'mdf','pega manual')
 # parent offset explicitly preserves rest geometry in global millimetres
 for child in groups[ag].children:child.matrix_parent_inverse=groups[ag].matrix_world.inverted()
 for frame,y,z in [(1,70,0),(45,180,0),(85,275,0),(110,275,80),(145,70,80),(175,70,0)]:groups[ag].location=Vector((110+i*200,y,z))/1000;groups[ag].keyframe_insert(data_path='location',frame=frame)
 groups[ag].location=Vector((110+i*200,70,0))/1000
 bg='anteparo_'+L;box('painel_fundo_'+L,(170+i*200,180,60),(3,100,80),bg,'mdf','backstop a140mm')
 box('pe_fundo_'+L,(175+i*200,180,1.5),(30,100,3),bg)
# Coluna: seis painéis independentes, frente com janela de acesso ao horn.
box('totem_painel_traseiro',(300,334,67.5),(60,3,135),'totem','preto')
for x in (271.5,328.5):box('totem_lateral_'+str(x),(x,350,67.5),(3,29,135),'totem','preto')
for z in (1.5,133.5):box('totem_tampa_'+str(z),(300,350,z),(54,29,3),'totem','preto')
box('totem_frente_inferior',(300,366,48),(60,3,96),'totem','preto')
box('totem_frente_superior',(300,366,132),(60,3,6),'totem','preto')
for x in (277.5,322.5):box('totem_frente_janela_'+str(x),(x,366,112.5),(15,3,33),'totem','preto')
box('totem_pe',(300,350,1.5),(80,60,3),'totem','preto')
# Annulus provides opening instead of pretending that the servo shaft penetrates solid MDF.
verts=[];faces=[]
for y in (368,371):
 for r in (45,13):
  for k in range(96):a=k*math.tau/96;verts.append(((300+r*math.cos(a))/1000,y/1000,(120+r*math.sin(a))/1000))
for k in range(96):q=(k+1)%96;faces.extend([(k,q,96+q,96+k),(192+k,288+k,288+q,192+q),(k,192+k,192+q,q),(96+k,96+q,288+q,288+k)])
me=bpy.data.meshes.new('disco_anel');me.from_pydata(verts,[],faces);o=bpy.data.objects.new('disco_vertical_janela_nao_certificada',me);scene.collection.objects.link(o);record(o,'totem','preto','mostrador fixo com abertura de acesso')
# Face impressa contínua: cobre a abertura de montagem, preservando passagem do eixo.
vs=[];fs=[]
for r in (43,4):
 for k in range(96):
  a=k*math.tau/96;vs.append(((300+r*math.sin(a))/1000,.3715,(120+r*math.cos(a))/1000))
for k in range(96):q=(k+1)%96;fs.append((k,q,96+q,96+k))
me=bpy.data.meshes.new('face_impressa');me.from_pydata(vs,[],fs);ob=bpy.data.objects.new('mostrador_impresso_preto',me);scene.collection.objects.link(ob);record(ob,'totem','preto','face gráfica fina com furo central; não tampa estrutural')
# Rosa de 16 pontas facetadas, unidas no centro como a referência da maquete.
colors=['azul','vermelho','verde','amarelo','laranja','azul','roxo','verde']
for k in range(16):
 a=k*math.tau/16;r=37 if k%2==0 else 28
 for side in (-1,1):
  points=[(4,a),(14,a+side*math.pi/8),(r,a)]
  pts=[((300+rr*math.sin(aa))/1000,.3718,(120+rr*math.cos(aa))/1000) for rr,aa in points]
  me=bpy.data.meshes.new('rosa_faceta');me.from_pydata(pts,[],[(0,1,2)]);o=bpy.data.objects.new('rosa_faceta_%02d_%s'%(k,side),me);scene.collection.objects.link(o);record(o,'totem',colors[(k+(side==1))%8],'rosa dos ventos impressa facetada')
box('SG90_carcaca',(300,352,120),(23,29,12.2),'totem','azul','SG90 envelope aproximado','kit')
cyl('SG90_saida_representada',(300,369.5,120),3,5,'totem','metal','Y','posição de saída ilustrativa, comprimento não certificado')
group('ponteiro',(300,374.3,120));groups['ponteiro'].parent=groups['totem']
cyl('horn_original_representado',(300,373,120),7,2,'ponteiro','branco','Y','horn original, estrias não modeladas')
cyl('parafuso_original_representado',(300,375.5,120),1.6,2,'ponteiro','metal','Y','parafuso original; rosca não certificada')
# Ponteiro afilado bicolor com volume, cubo e cauda curta.
for label,dx,mat in [('claro',-4,'branco'),('sombra',4,'metal')]:
 pts=[(300,374.3,157),(300+dx,374.3,120),(300,374.3,111)]
 vs=[(x/1000,(y+t)/1000,z/1000) for t in (-.6,.6) for x,y,z in pts]
 me=bpy.data.meshes.new('agulha');me.from_pydata(vs,[],[(0,1,2),(3,5,4),(0,3,4,1),(1,4,5,2),(2,5,3,0)])
 ob=bpy.data.objects.new('ponteiro_afilado_'+label,me);scene.collection.objects.link(ob);record(ob,'ponteiro',mat,'ponteiro leve afilado')
cyl('cubo_ponteiro',(300,376.8,120),4,1.4,'ponteiro','amarelo','Y')
# Aro duplo e letras de vias; texto identificado como representação do módulo.
for k in range(96):
 a=k*math.tau/96;b=(k+1)*math.tau/96
 wire('aro_mostrador_'+str(k),[(300+44*math.cos(a),371.8,120+44*math.sin(a)),(300+44*math.cos(b),371.8,120+44*math.sin(b))],'totem','metal',.45)
def label_mesh(name,text,loc,size,g,mat):
 cu=bpy.data.curves.new(name,'FONT');cu.body=text;cu.size=size/1000;cu.align_x='CENTER';cu.extrude=.0001
 ob=bpy.data.objects.new(name,cu);scene.collection.objects.link(ob);ob.location=Vector(loc)/1000;ob.rotation_euler=(math.pi/2,0,0);ob.data.materials.append(M[mat]);ob.parent=groups[g];ob.matrix_parent_inverse=groups[g].matrix_world.inverted()
 bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.convert(target='MESH');ob.select_set(False)
for txt,x,z in [('A',337,116),('B',300,156),('C',263,116)]:
 label_mesh('via_impresso_'+txt,txt,(x,372.2,z),8,'totem','branco')
 bpy.data.objects['via_impresso_'+txt].rotation_euler=(math.pi/2,0,math.pi)

for fr,ang in [(1,90),(45,40),(85,90),(125,140),(175,15)]:groups['ponteiro'].rotation_euler[1]=math.radians(90-ang);groups['ponteiro'].keyframe_insert(data_path='rotation_euler',frame=fr)
box('UNO_PCB',(270,42,8),(68.6,53.4,1.6),'arduino','azul','UNO R3 envelope nominal','kit')

label_mesh('UNO_identificacao','UNO R3',(272,53,9.1),4,'arduino','branco')
bpy.data.objects['UNO_identificacao'].rotation_euler=(0,0,0)
box('UNO_microcontrolador_DIP',(275,38,11),(35,8,4),'arduino','preto','encapsulamento ilustrativo de microcontrolador')
for x in range(260,292,3):
 for y in (32.5,43.5):box('UNO_perna_DIP_'+str(x)+'_'+str(y),(x,y,10),(1,3,2),'arduino','metal')
for x in (249,256):cyl('UNO_capacitor_'+str(x),(x,54,11),2,5,'arduino','metal')
box('UNO_jack_DC',(240,54,13),(13,9,9),'arduino','preto','conector DC ilustrativo')
for x in (249,291):
 for y in (25,58):cyl('UNO_furo_representado_'+str(x)+'_'+str(y),(x,y,8.9),1.4,.3,'arduino','metal')

box('UNO_USB',(235,30,15),(16,12,12),'arduino','metal','USB aproximado','kit')
box('protoboard830',(450,45,8),(165,55,10),'protoboard','branco','protoboard830 envelope não certificado','kit')
# A single mesh carries the reference 830-contact layout (630 + 200).
hole_points=[(371.26+2.54*k,y,13.03) for k in range(63) for y in (30,32.54,35.08,37.62,40.16,49.84,52.38,54.92,57.46,60)]
hole_points += [(375.07+2.54*(k+k//5),y,13.03) for k in range(50) for y in (21,23.54,66.46,69)]
vs=[];fs=[]
for x,y,z in hole_points:
 j=len(vs);vs.extend([((x+dx)/1000,(y+dy)/1000,z/1000) for dx,dy in [(-.55,-.55),(.55,-.55),(.55,.55),(-.55,.55)]]);fs.append((j,j+1,j+2,j+3))
me=bpy.data.meshes.new('contatos_protoboard');me.from_pydata(vs,[],fs);ob=bpy.data.objects.new('contatos_protoboard_830_referencia',me);scene.collection.objects.link(ob);record(ob,'protoboard','preto','grade de referência; não é medição do exemplar')

# Acabamento removível da faixa técnica; folga sob os alvos a partir de Z30.
for label,x,y,w,d,h in [('UNO',270,42,92,65,25),('protoboard',450,45,176,66,25),('fonte',173,45,102,70,40)]:
 g='carenagem_'+label.lower();group(g)
 box('cobertura_tecnica_'+label+'_tampa',(x,y,h),(w,d,3),g,'preto','tampa removível de apresentação; MDF adicional a orçar')
 for xx in (x-w/2+1.5,x+w/2-1.5):box('cobertura_tecnica_'+label+'_lateral_'+str(xx),(xx,y,h/2),(3,d,h),g,'preto')
 box('cobertura_tecnica_'+label+'_frente',(x,y+d/2-1.5,h/2),(w-6,3,h),g,'preto')

# Organized wiring: millimetres, explicit netlist, sequential sensor pins unchanged.
# Endpoint geometry remains a dimensioned proposal, not a certified UNO drill template.
def terminal_label(key):
 if key.startswith('BB5V_'):return 'Protoboard P+'+str([5,10,15,20,25,30][int(key.split('_')[-1])])
 if key.startswith('BBGND_'):return 'Protoboard N-'+str([4,9,14,19,24,23][int(key.split('_')[-1])])
 return key.replace('UNO_', 'UNO ').replace('HC_', 'HC-SR04 ').replace('_', ' ')

def wiring_plan():
 uno={f'D{n}':(299-2.54*n,65,18) for n in range(8)}
 uno.update({f'D{n}':(273.6-2.54*(n-8),65,18) for n in range(8,14)})
 uno.update({pin:(258.36-2.54*k,65,18) for k,pin in enumerate(['GND_DIG','AREF','SDA','SCL'])})
 uno.update({pin:(249+2.54*k,19,18) for k,pin in enumerate(['NC','IOREF','RESET','3V3','5V','GND','GND2','VIN'])})
 uno.update({f'A{k}':(286.3+2.54*k,19,18) for k in range(6)})
 terminals={f'UNO_{pin}':pt for pin,pt in uno.items()}
 for k in range(6):
  terminals['BB5V_'+str(k)]=(375.07+2.54*((4+5*k)+(4+5*k)//5),23.54,14)
  idx=[3,8,13,18,23,22][k]
  terminals['BBGND_'+str(k)]=(375.07+2.54*(idx+idx//5),66.46,14)
 terminals.update({'FONTE_POS':(218,40,18),'FONTE_GND':(218,50,18)})
 for j,pin in enumerate(['SIGNAL','POS','GND']):terminals['SERVO_'+pin]=(297.46+2.54*j,340,112)
 nets=[];holes=[]
 def add(name,start_id,end_id,color,source_hole,dest_hole,source_path=None):
  start,end=terminals[start_id],terminals[end_id];layer=-8-len(nets)*.85
  sh,dh=source_hole,dest_hole
  source=source_path or [start,(sh[0],sh[1],start[2])]
  # One dedicated lower level per insulated conductor: no accidental bare junctions.
  pts=source+[(sh[0],sh[1],layer),(sh[0],96+len(nets)*1.5,layer),(dh[0],96+len(nets)*1.5,layer),(dh[0],dh[1],layer)]
  if end_id.startswith('UNO_') or end_id.startswith('BB'):
   pts += [(dh[0],dh[1],21.5),(end[0],dh[1],21.5),(end[0],end[1],21.5),end]
  else:pts += [(dh[0],dh[1],end[2]),end]
  # Remove zero-length route segments before rounding the bends.
  pts=[p for i,p in enumerate(pts) if i==0 or p!=pts[i-1]]
  nets.append({'id':name,'name':name.replace('_',' '),'from':start_id,'to':end_id,'color':color,'function':'alimentação' if color in ('vermelho','gnd') else 'sinal','fromLabel':terminal_label(start_id),'toLabel':terminal_label(end_id),'points_mm':pts,'objectNames':[name]})
 for i,L in enumerate('ABC'):
  x=30+200*i;holes.append({'id':'HC_'+L,'center':(46+200*i,137,-1.5),'size':(19,17,8),'hosts':['base_MDF_600x400x3']})
  holes.append({'id':'HC_'+L+'_header','center':(x-16.3,180,48),'size':(8,15,6),'hosts':['suporte_'+L]})
  for j,pin in enumerate(['VCC','TRIG','ECHO','GND']):
   start_id='HC_'+L+'_'+pin;terminals[start_id]=(x-18,176+2.54*j,48)
   end_id={'VCC':'BB5V_'+str(i),'TRIG':'UNO_D'+str(2+2*i),'ECHO':'UNO_D'+str(3+2*i),'GND':'BBGND_'+str(i)}[pin]
   sh=(42+200*i+2.54*j,140-2*j);end=terminals[end_id];dh=(end[0],86)
   source=[terminals[start_id],(x-22-1.2*j,176+2.54*j,48),(x-22-1.2*j,sh[1],48),(x-22-1.2*j,sh[1],6),(sh[0],sh[1],6)]
   add('HC_'+L+'_'+pin,start_id,end_id,{'VCC':'vermelho','TRIG':'amarelo','ECHO':'ciano','GND':'gnd'}[pin],sh,dh,source)
 add('UNO_5V_BARRAMENTO','UNO_5V','BB5V_3','vermelho',(260,86),(terminals['BB5V_3'][0],86),[terminals['UNO_5V'],(259.16,19,21.5),(260,19,21.5),(260,86,21.5)])
 add('UNO_GND_BARRAMENTO','UNO_GND','BBGND_3','gnd',(262.54,86),(terminals['BBGND_3'][0],86),[terminals['UNO_GND'],(261.70,19,21.5),(262.54,19,21.5),(262.54,86,21.5)])
 for j,(pin,end_id,color) in enumerate([('SIGNAL','UNO_D9','laranja'),('POS','FONTE_POS','vermelho'),('GND','BBGND_4','gnd')]):
  sh=(297.46+2.54*j,340);end=terminals[end_id];dh=(220,end[1]) if end_id.startswith('FONTE') else (end[0],86)
  add('SERVO_'+pin,'SERVO_'+pin,end_id,color,sh,dh)
 add('FONTE_GND_COMUM','FONTE_GND','BBGND_5','gnd',(222,50),(terminals['BBGND_5'][0],86),[terminals['FONTE_GND'],(222,50,18)])
 holes += [
  {'id':'UNO_passagem','center':(278,86,-1.5),'size':(46,5,8),'hosts':['base_MDF_600x400x3']},
  {'id':'BB_passagem','center':(424,86,-1.5),'size':(92,5,8),'hosts':['base_MDF_600x400x3']},
  {'id':'fonte_passagem','center':(220.5,45,-1.5),'size':(6,16,8),'hosts':['base_MDF_600x400x3']},
  {'id':'servo_passagem','center':(300,340,0),'size':(10,6,12),'hosts':['base_MDF_600x400x3','totem_pe','totem_tampa_1.5']},
  {'id':'UNO_frente_chicotes','center':(278,73,18),'size':(46,8,11),'hosts':['cobertura_tecnica_UNO_frente']},
  {'id':'BB_frente_chicotes','center':(424,76.5,18),'size':(92,8,11),'hosts':['cobertura_tecnica_protoboard_frente']},
  {'id':'USB_saida','center':(224,30,15),'size':(8,10,8),'hosts':['cobertura_tecnica_UNO_lateral_225.5']}
 ]
 return {'nets':nets,'terminals':terminals,'passages':holes,'note':'Chicotes isolados em níveis inferiores separados; aberturas propostas exigem medição de conectores e verificação estrutural antes do corte. Positivos UNO e fonte externa separados; GND comum.'}

def rounded_route(points,radius=2):
 # Quadratic corner fillets, shortened at tight pin fan-outs; no diagonal trunk.
 out=[Vector(points[0])]
 for i in range(1,len(points)-1):
  a,b,c=map(Vector,points[i-1:i+2]);u=a-b;v=c-b
  if u.length<.001 or v.length<.001:continue
  d=min(radius,u.length*.25,v.length*.25);p=b+u.normalized()*d;q=b+v.normalized()*d
  out.append(p)
  for k in range(1,7):
   t=k/6;out.append((1-t)**2*p+2*(1-t)*t*b+t*t*q)
 out.append(Vector(points[-1]));return [tuple(p) for p in out]

wiring=wiring_plan()
# Individually open sockets, including the distinct D0–D7/D8–D13 banks.
for key,pt in wiring['terminals'].items():
 if key.startswith('UNO_'):
  x,y,z=pt
  for dx,dy,w,d in [(-.9,0,.6,2.4),(.9,0,.6,2.4),(0,-.9,1.2,.6),(0,.9,1.2,.6)]:box('socket_'+key+'_'+str(dx)+'_'+str(dy),(x+dx,y+dy,14),(w,d,10),'arduino','preto','header aberto '+key)
  box('contato_'+key,(x,y,10),(1.1,1.1,.3),'arduino','metal','contato interior '+key)
  label_mesh('etiqueta_'+key,key[4:],(x,y-3 if y==65 else y+3,9.2),1.6,'arduino','branco');bpy.data.objects['etiqueta_'+key].rotation_euler=(0,0,0)
for key,pt in wiring['terminals'].items():
 if key.startswith('BB'):
  cyl('furo_'+key,(pt[0],pt[1],13.1),.7,.2,'protoboard','preto',fn='contato dedicado '+terminal_label(key),kit='kit')
  label_mesh('etiqueta_'+key,terminal_label(key).replace('Protoboard ',''),(pt[0],pt[1]+(3 if key.startswith('BB5V') else -3),13.4),1.7,'protoboard','preto');bpy.data.objects['etiqueta_'+key].rotation_euler=(0,0,0)
for label,y,color in [('5V',23.54,'vermelho'),('GND',66.46,'gnd')]:
 box('rail_'+label,(450,y+1.1,13.05),(150,.4,.1),'protoboard',color,'trilho '+label)
 label_mesh('rail_label_'+label,label,(415,y+2,13.3),2.5,'protoboard',color);bpy.data.objects['rail_label_'+label].rotation_euler=(0,0,0)
box('fonte_baixa_tensao_representada',(173,45,18),(90,50,30),'fonte','preto','fonte externa: envelope não certificado','adicional/emprestada')
for label in ['FONTE_POS','FONTE_GND']:box(label,wiring['terminals'][label],(3,3,3),'fonte','vermelho' if label.endswith('POS') else 'gnd','borne '+label)
# Real Boolean passages in the actual solid support/lid, not lines through MDF.
for passage in wiring['passages']:
 for host_name in passage['hosts']:
  host=bpy.data.objects.get(host_name)
  if host is None:raise RuntimeError('Host de passagem ausente: '+host_name)
  bpy.ops.mesh.primitive_cube_add(size=1,location=Vector(passage['center'])/1000);cutter=bpy.context.object;cutter.dimensions=Vector(passage['size'])/1000;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
  modifier=host.modifiers.new('passagem_'+passage['id'],'BOOLEAN');modifier.operation='DIFFERENCE';modifier.object=cutter
  bpy.context.view_layer.objects.active=host;bpy.ops.object.modifier_apply(modifier=modifier.name);bpy.data.objects.remove(cutter,do_unlink=True)
  metadata.append({'id':'abertura_'+passage['id']+'_'+host_name,'group':host.parent.name,'function':'abertura real proposta; medir conector antes de fabricar','dimensions_mm':passage['size'],'origin':'construção','approximation':True})
for net in wiring['nets']:
 wire(net['id'],rounded_route(net['points_mm']),'cabos',net['color'],.4)
 metadata[-1].update({'from':net['from'],'to':net['to'],'endpoints_mm':[net['points_mm'][0],net['points_mm'][-1]],'pin':net['to'],'points_mm':net['points_mm']})
# Plug housings end at the actual named contacts; no floating cable tips.
for net in wiring['nets']:
 for side,key in [('origem',net['from']),('destino',net['to'])]:
  x,y,z=wiring['terminals'][key];name='conector_'+net['id']+'_'+side
  if key.startswith('UNO_'):
   box(name,(x,y,19.5),(2.1,2.1,3),'cabos','gnd','plug macho no contato '+key)
   box(name+'_pino',(x,y,14.05),(.6,.6,7.9),'cabos','metal','terminal inserido no header')
  elif key.startswith('BB'):
   box(name,(x,y,16.5),(2.1,2.1,5),'cabos','gnd','plug no contato dedicado '+key)
  elif key.startswith('HC_'):
   box(name,(x-1.7,y,z),(5,2.1,2.1),'cabos','gnd','conector fêmea '+key)
  elif key.startswith('SERVO_'):
   box(name,(x,y,113),(2.1,2.1,3.8),'cabos','gnd','saída do cabo do servo')
  else:continue
  net['objectNames'].append(name)
  if key.startswith('UNO_'):net['objectNames'].append(name+'_pino')
# Underside retaining loops support each bundle without enclosing the wires in solids.
for L,cx,cy,bottom in [('A',46,130,-12),('B',246,130,-15.4),('C',446,130,-18.8),('servo',300,250,-23)]:
 width=24 if L!='servo' else 14
 for dx in (-width/2,width/2):
  box('presilha_'+L+'_lado_'+str(dx),(cx+dx,cy,(-3+bottom)/2),(2,3,-3-bottom),'cabos','gnd','suporte de chicote sob a base')
 box('presilha_'+L+'_fundo',(cx,cy,bottom-.7),(width+2,3,1.4),'cabos','gnd','fecho inferior do chicote; fixação a definir')
wire('USB_sem_uniao_positivos',rounded_route([(235,30,15),(220,30,15),(220,0,15)]),'cabos','gnd',2)

group('servo');groups['servo'].parent=groups['totem']
for ob in list(scene.objects):
 if ob.name.startswith('SG90_'):ob.parent=groups['servo']
scene.frame_start=1;scene.frame_end=175;scene.frame_set(1)
scene.world.color=(.18,.18,.18)
manifest={'version':1,'units':'metres','millimetres_per_unit':1000,'gltf_coordinates':'[x,z,-y]/1000 from Blender millimetres; exporter handles transforms','pointer_gltf_axis':'Z (Blender Y maps to glTF -Z)','base_mm':[600,400,3],'profile_cm':{'enter':9,'exit':12,'target':8,'backstop':14},'groups':list(groups),'objects':metadata,'wiring':wiring,'dynamic':{'targets':{'ids':['alvo_A','alvo_B','alvo_C'],'rest_mm':[[110,70,0],[310,70,0],[510,70,0]],'travel_y_mm':[70,275],'lift_z_mm':80},'pointer':{'id':'ponteiro','pivot_mm':[300,374.3,120],'axis':'Y','up_angle':90,'angles':[40,90,140],'neutral':15}},'limitations':['Geometria didática não liberada para corte','Encaixes e estrias SG90 não certificados','Cabos roteados com pinagem identificada; posições individuais dos terminais UNO/protoboard são ilustrativas','Fonte e protoboard com envelopes aproximados; confirmar peças reais'],'files':{'assembly_blend':'modelos/bancada-completa.blend','assembly_glb':'modelos/bancada-completa.glb'}}
(OUT.parent/'scene-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'bancada-completa.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'bancada-completa.glb'),export_format='GLB',export_animations=True)
print('ASSEMBLY_READY',flush=True)
# Individuais: manter coordenadas de conjunto, sem desmontar parentagem.
sets={n:[n] for n in groups}
sets.update({'sensor-suporte':['sensor_A'],'alvo':['alvo_A'],'anteparo':['anteparo_A'],'cabos-fonte':['cabos','fonte'],'sensor':['HC_SR04_PCB_A','transdutor_A168','transdutor_A192','face_A168','face_A192','pino_A_VCC','pino_A_TRIG','pino_A_ECHO','pino_A_GND'],'suporte':['suporte_A','pe_sensor_A']})
for name,ids in sets.items():
 bpy.ops.object.select_all(action='DESELECT')
 for ob in scene.objects:
  ancestor=ob
  while ancestor and ancestor.name not in ids:ancestor=ancestor.parent
  if ancestor:ob.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(OUT/(name+'.glb')),export_format='GLB',use_selection=True,export_animations=True)
 bpy.data.libraries.write(str(OUT/(name+'.blend')),set(bpy.context.selected_objects),fake_user=True)
# Five actual renders.
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.render.resolution_x=1000;scene.render.resolution_y=720;scene.render.resolution_percentage=100
bpy.ops.object.light_add(type='AREA',location=(.25,.1,.8));bpy.context.object.data.energy=120;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=.6
for name,pos,target in [('perspectiva',(.85,.85,.65),(.30,.20,.03)),('frente',(.30,1.0,.35),(.30,.20,.05)),('planta',(.30,.20,1.0),(.30,.20,0)),('totem-detalhe',(.46,.75,.28),(.30,.35,.11)),('inferior',(.85,.75,-.4),(.30,.20,-.01))]:
 bpy.ops.object.camera_add(location=pos);cam=bpy.context.object;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=.24 if name=='totem-detalhe' else .8;scene.camera=cam;scene.render.filepath=str(OUT/(name+'.png'));bpy.ops.render.render(write_still=True)
print('ALL_DONE',flush=True)
