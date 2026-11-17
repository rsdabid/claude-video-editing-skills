# Exports the natural SFX pass (cues_v3.txt) as a Premiere-importable FCP7 XML sequence:
# one mono clip per cue (trim + fades baked, gain/pan left as editable clip settings), plus a room-reverb stem.
import librosa,numpy as np,subprocess,os,urllib.parse,math
W=os.path.dirname(os.path.abspath(__file__)); P=os.path.dirname(W); os.chdir(W)
FPS=30; SEQ_FR=409; SEQ_S=SEQ_FR/FPS
OUT=os.path.join(P,'Premiere'); CL=os.path.join(OUT,'SFX clips'); os.makedirs(CL,exist_ok=True)
cues=[l.split(None,5) for l in open('cues_v3.txt') if l.strip() and not l.startswith('#')]
KEYS=('kA','kB','kC','kD')
peaks={}; items=[]
for i,c in enumerate(cues):
    n,t,g,fi,pan=c[0],float(c[1]),float(c[2]),float(c[3]),float(c[4]); note=c[5].strip() if len(c)>5 else n
    if n not in peaks:
        y,sr=librosa.load(f'dnorm/{n}.wav',sr=22050); env=librosa.feature.rms(y=y,hop_length=64)[0]
        peaks[n]=(np.argmax(env>env.max()*0.5) if n in KEYS else np.argmax(env))*64/sr
    st=max(0,t-peaks[n]); trim=max(0,peaks[n]-t)
    src=f'dnorm/{n}.wav'; dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',src]))-trim
    dur=min(dur,SEQ_S-st)
    fname=f'{i+1:02d}_{n}_{t:05.2f}s.wav'
    af=f"atrim=start={trim:.4f}:duration={dur:.4f},asetpts=N/SR/TB"
    if fi>0: af+=f",afade=t=in:d={fi}"
    if st+dur>=12.9: af+=f",afade=t=out:st={max(0,12.9-st):.3f}:d=0.73"
    subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-af',af,'-ac','1','-ar','48000','-c:a','pcm_s24le',os.path.join(CL,fname)],check=True)
    s_fr=round(st*FPS); d_fr=max(1,math.floor(dur*FPS))
    items.append(dict(name=f'{note} ({n})',file=fname,start=s_fr,end=min(SEQ_FR,s_fr+d_fr),dur=d_fr,gain=10**(g/20)*10**(4/20),pan=pan))
# room reverb stem, rendered from the same chain used in the v2 mix
subprocess.run(['ffmpeg','-v','error','-y','-i','mix_v3.wav','-af','highpass=f=250,lowpass=f=7000,aecho=0.8:0.9:37|61|89:0.30|0.20|0.12','-ar','48000','-c:a','pcm_s24le',os.path.join(CL,'00_room_reverb_reference.wav')],check=True)
# greedy track packing, no overlaps per track
tracks=[]
for it in sorted(items,key=lambda x:x['start']):
    for tr in tracks:
        if tr[-1]['end']<=it['start']: tr.append(it); break
    else: tracks.append([it])
def url(p): return 'file://localhost'+urllib.parse.quote(p)
rate=f'<rate><timebase>{FPS}</timebase><ntsc>FALSE</ntsc></rate>'
fid=[0]
def fileblock(path,frames,video=False):
    fid[0]+=1; f=f'file-{fid[0]}'
    media=(f'<video><samplecharacteristics>{rate}<width>1920</width><height>1080</height></samplecharacteristics></video>' if video else
           '<audio><samplecharacteristics><depth>24</depth><samplerate>48000</samplerate></samplecharacteristics><channelcount>1</channelcount></audio>')
    return f'<file id="{f}"><name>{os.path.basename(path)}</name><pathurl>{url(path)}</pathurl>{rate}<duration>{frames}</duration><media>{media}</media></file>'
def aclip(cid,it,path):
    lvl=f'<filter><effect><name>Audio Levels</name><effectid>audiolevels</effectid><effectcategory>audiolevels</effectcategory><effecttype>audiolevels</effecttype><mediatype>audio</mediatype><parameter><parameterid>level</parameterid><name>Level</name><valuemin>0</valuemin><valuemax>3.98109</valuemax><value>{it["gain"]:.5f}</value></parameter></effect></filter>'
    pan=f'<filter><effect><name>Audio Pan</name><effectid>audiopan</effectid><effectcategory>audiopan</effectcategory><effecttype>audiopan</effecttype><mediatype>audio</mediatype><parameter><parameterid>pan</parameterid><name>Pan</name><valuemin>-1</valuemin><valuemax>1</valuemax><value>{it["pan"]:.2f}</value></parameter></effect></filter>'
    return (f'<clipitem id="{cid}"><name>{it["name"]}</name><enabled>TRUE</enabled><duration>{it["dur"]}</duration>{rate}'
            f'<start>{it["start"]}</start><end>{it["end"]}</end><in>0</in><out>{it["end"]-it["start"]}</out>'
            f'{fileblock(path,it["dur"])}<sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack>{lvl}{pan}</clipitem>')
vid=os.path.join(P,'Raw Footage','keyboard.mp4')
v=(f'<video><format><samplecharacteristics>{rate}<width>1920</width><height>1080</height><pixelaspectratio>square</pixelaspectratio></samplecharacteristics></format>'
   f'<track><clipitem id="v1"><name>keyboard.mp4</name><enabled>TRUE</enabled><duration>{SEQ_FR}</duration>{rate}<start>0</start><end>{SEQ_FR}</end><in>0</in><out>{SEQ_FR}</out>{fileblock(vid,SEQ_FR,True)}</clipitem></track></video>')
a='<audio><numOutputChannels>2</numOutputChannels><format><samplecharacteristics><depth>24</depth><samplerate>48000</samplerate></samplecharacteristics></format>'
n=0
for tr in tracks:
    a+='<track>'+''.join(aclip(f'a{(n:=n+1)}',it,os.path.join(CL,it['file'])) for it in tr)+'</track>'
rv=dict(name='Room reverb (reference stem, -12 dB)',file='00_room_reverb_reference.wav',start=0,end=SEQ_FR,dur=SEQ_FR,gain=10**(-8/20),pan=0)
a+='<track>'+aclip('arev',rv,os.path.join(CL,rv['file']))+'</track></audio>'
xml=('<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE xmeml>\n<xmeml version="4"><sequence id="seq1"><name>Keyboard Promo - SFX natural v2</name>'
     f'<duration>{SEQ_FR}</duration>{rate}<timecode>{rate}<string>00:00:00:00</string><frame>0</frame><displayformat>NDF</displayformat></timecode>'
     f'<media>{v}{a}</media></sequence></xmeml>\n')
open(os.path.join(OUT,'Keyboard Promo - SFX v2.xml'),'w').write(xml)
print(len(items),'clips on',len(tracks),'audio tracks + reverb track')
