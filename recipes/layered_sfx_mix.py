# Natural pass: Drive-library SFX from cues_v3.txt, peak-aligned, glued with a light shared room reverb.
import librosa,numpy as np,sys,subprocess,os
W=os.path.dirname(os.path.abspath(__file__)); os.chdir(W)
out=sys.argv[1]
cues=[l.split(None,5) for l in open('cues_v3.txt') if l.strip() and not l.startswith('#')]
peaks={}; ins=[]; fc=[]; labs=[]
for i,c in enumerate(cues):
    n,t,g,fi,pan=c[0],float(c[1]),float(c[2]),float(c[3]),float(c[4])
    if n not in peaks:
        y,sr=librosa.load(f'dnorm/{n}.wav',sr=22050); env=librosa.feature.rms(y=y,hop_length=64)[0]
        # key presses align on their first transient (key-down), everything else on its loudest point
        peaks[n]=(np.argmax(env>env.max()*0.5) if n in ('kA','kB','kC','kD') else np.argmax(env))*64/sr
    pk=peaks[n]; st=max(0,t-pk); trim=max(0,pk-t)
    f=f"[{i}:a]aformat=sample_fmts=fltp:channel_layouts=stereo:sample_rates=48000"
    if trim>0: f+=f",atrim=start={trim:.3f},asetpts=N/SR/TB"
    f+=f",volume={g}dB"
    if fi>0: f+=f",afade=t=in:d={fi}"
    l=1-max(0,pan); r=1+min(0,pan); ms=int(st*1000)
    f+=f",pan=stereo|c0={l:.2f}*c0|c1={r:.2f}*c1,adelay={ms}|{ms}[s{i}]"
    fc.append(f); labs.append(f"[s{i}]"); ins+=['-i',f'dnorm/{n}.wav']
    print(f"{n:18s} hit {t:6.3f} start {st:6.3f}")
fc.append("".join(labs)+f"amix=inputs={len(cues)}:normalize=0:duration=longest,apad,atrim=0:13.633,asplit=2[dry][wet0]")
fc.append("[wet0]highpass=f=250,lowpass=f=7000,aecho=0.8:0.9:37|61|89:0.30|0.20|0.12,volume=-12dB[wet]")
fc.append("[dry][wet]amix=inputs=2:normalize=0,afade=t=out:st=12.9:d=0.73,volume=7dB,alimiter=limit=0.55:attack=2:release=60:level=disabled[mix]")
open('fc_v3.txt','w').write(";".join(fc))
subprocess.run(['ffmpeg','-v','error','-y',*ins,'-/filter_complex','fc_v3.txt','-map','[mix]','-c:a','pcm_f32le','mix_v3.wav'],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-i','../Raw Footage/keyboard.mp4','-i','mix_v3.wav','-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','256k','-shortest',out],check=True)
