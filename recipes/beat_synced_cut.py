# Relaxed beat-synced cut: each shot is a fixed source window stretched (slowed, never sped up) to fill its beats,
# with motion-interpolated slow-mo and a warm cinematic grade.
import subprocess,os,sys
W=os.path.dirname(os.path.abspath(__file__)); os.chdir(W)
SRC='../Raw Footage/IMG_5357.MOV'; SONG='song/song.wav'
S0=15.29; B0,BP=15.323072,0.4761708; END_BEAT=60
SEGS=[  # (src_in, src_out, beats, note)
 (2.15,3.00,2,'box glance'),
 (15.50,17.50,6,'unwrapping the camera'),
 (17.50,19.90,6,'camera comes out of the wrap'),
 (19.90,21.30,4,'front of the camera'),
 (21.30,22.80,4,'top dials'),
 (29.40,30.90,4,'screen flips out'),
 (63.00,63.90,2,'Sigma box glance'),
 (77.60,79.00,4,'plastic bag comes off'),
 (79.00,81.00,6,'lens out, turning'),
 (82.40,83.90,4,'lens turn'),
 (105.00,106.40,4,'lens mounted, twist'),
 (127.30,128.80,4,'front cap off'),
 (141.50,144.30,6,'front glass hero'),
 (153.90,155.60,4,'holding the full camera + lens'),
]
GRADE=("eq=contrast=1.12:saturation=1.06:gamma=0.98,"
       "colorbalance=rs=-0.03:bs=0.04:rm=0.04:gm=0.01:bm=-0.03:rh=0.06:gh=0.02:bh=-0.05,"
       "curves=all='0/0 0.25/0.21 0.5/0.5 0.75/0.79 1/1',"
       "unsharp=5:5:0.7:5:5:0.0")
cuts=[0]; k=0
for s in SEGS:
    k+=s[2]; cuts.append(round((B0+BP*k-S0)*30))
assert k==END_BEAT, k
total=cuts[-1]; fc=[]; labs=[]
for i,(a,b,nb,_) in enumerate(SEGS):
    n=cuts[i+1]-cuts[i]; sp=(b-a)/(n/30); assert sp<=1.0001, (i,sp)
    # light slow-downs (>0.9x) skip interpolation: it warps printed text on the boxes
    fc.append(f"[0:v]trim=start={a}:end={b+0.2},setpts=PTS-STARTPTS,fps=30,setpts=PTS/{sp:.4f},"
              +(f"minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1," if sp<0.9 else "fps=30,")+f"trim=end_frame={n},setpts=PTS-STARTPTS,scale=1080:1920,setsar=1[v{i}]")
    labs.append(f"[v{i}]"); print(f"{i+1:2d} {SEGS[i][3]:30s} {sp:.2f}x  {n} frames")
fc.append("".join(labs)+f"concat=n={len(SEGS)}:v=1:a=0,{GRADE},format=yuv420p[v]")
dur=total/30
fc.append(f"[1:a]atrim=start={S0}:duration={dur:.4f},asetpts=PTS-STARTPTS,afade=t=out:st={dur-0.35:.3f}:d=0.35,volume=-4dB,alimiter=limit=0.84:attack=1:release=50:level=disabled[a]")
open('fc_cut_v3.txt','w').write(";\n".join(fc))
open('cuts_v3.txt','w').write("\n".join(f"{cuts[i]} {SEGS[i][3]}" for i in range(len(SEGS))))
subprocess.run(['ffmpeg','-v','error','-y','-i',SRC,'-i',SONG,'-/filter_complex','fc_cut_v3.txt','-map','[v]','-map','[a]','-c:v','libx264','-crf','16','-preset','medium','-r','30','-c:a','aac','-b:a','256k','-movflags','+faststart',sys.argv[1]],check=True)
print('frames',total,'secs',round(dur,3))
