"""Rebuild the research figures: python -m pip install matplotlib; python tools/generate_research_charts.py.

Inputs and provenance are shipped beside the SVGs. No estimated experiment outcomes
are used: measured, externally reported, computed and illustrative figures are distinct.
"""
from pathlib import Path
import csv
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'research'
OUT.mkdir(parents=True, exist_ok=True)
INK, ORANGE, GRAY = '#252323', '#f55314', '#a7a19c'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'text.color':INK,
    'axes.labelcolor':INK,'xtick.color':INK,'ytick.color':INK,'axes.edgecolor':'#c9c4bf',
    'axes.spines.top':False,'axes.spines.right':False,'axes.titleweight':'bold',
    'svg.fonttype':'none','svg.hashsalt':'omansh-research','savefig.facecolor':'white'})
manifest=[]

def finish(fig, slug, title, kind, rows, sources):
    fig.savefig(OUT/f'{slug}.svg', bbox_inches='tight', metadata={'Date':None,'Title':title,
        'Description':kind+'; generated using Matplotlib. See accompanying CSV and chart-manifest.json.'})
    plt.close(fig)
    with (OUT/f'{slug}.csv').open('w',newline='',encoding='utf-8') as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
    manifest.append({'slug':slug,'title':title,'kind':kind,'sources':sources,'generator':'Matplotlib'})

data=json.loads((OUT/'memory-benchmark.json').read_text(encoding='utf-8'))
rows=data['aggregate']
labels=['BM25','TF-IDF','Graph traversal','PageRank','PACE','CTQW']
fig,ax=plt.subplots(figsize=(8.3,4.5),layout='constrained')
bars=ax.barh(labels,[r['recall_at_k'] for r in rows],color=[GRAY]*5+[ORANGE],height=.6)
ax.invert_yaxis();ax.set_xlim(0,1.14);ax.set_xticks([0,.25,.5,.75,1]);ax.set_xlabel('Recall@3, answerable synthetic queries')
ax.set_title('Graph methods tied on recall',loc='left',pad=19)
for bar,r in zip(bars,rows):ax.text(bar.get_width()+.02,bar.get_y()+bar.get_height()/2,f"{r['recall_at_k']:.3f}",va='center')
finish(fig,'memory-recall','Graph methods tied on recall','Historical measured result, 18 October 2026',rows,[data['provenance']])

fig,ax=plt.subplots(figsize=(8.3,4.5),layout='constrained');y=np.arange(len(rows))
ax.barh(y-.17,[r['p50_ms'] for r in rows],height=.3,color=INK,label='p50')
ax.barh(y+.17,[r['p95_ms'] for r in rows],height=.3,color=ORANGE,label='p95')
ax.set_yticks(y,labels);ax.invert_yaxis();ax.set_xlabel('Retrieval computation time, milliseconds');ax.set_xlim(0,28)
ax.set_title('Latency belongs beside retrieval quality',loc='left',pad=19);ax.legend(frameon=False,loc='upper right',bbox_to_anchor=(1,-.12),ncol=2)
for i,r in enumerate(rows):ax.text(r['p95_ms']+.35,i+.17,f"{r['p95_ms']:.2f}",va='center',fontsize=10)
finish(fig,'memory-latency','Historical retrieval latency','Historical measured result, 18 October 2026',rows,[data['provenance']])

# Decimal MB avoids mixing published rounded file sizes with binary flash capacity.
flash_bytes=16*1024*1024;model_partition_offset=0x210000
flash_mb=flash_bytes/1e6;partition_mb=(flash_bytes-model_partition_offset)/1e6
sizes=[{'model':'Whistle full, published','size_decimal_mb':16.9},
       {'model':'Whistle depth 4, community port','size_decimal_mb':14.5}]
fig,ax=plt.subplots(figsize=(8.3,4.2),layout='constrained')
bars=ax.barh(['Full Whistle','Depth 4 port'],[r['size_decimal_mb'] for r in sizes],color=[GRAY,ORANGE],height=.45)
ax.invert_yaxis();ax.set_xlim(0,20);ax.set_xlabel('Model file size, decimal MB, rounded by source')
ax.axvline(partition_mb,color=INK,linestyle='--',label=f'Model partition: {partition_mb:.2f} MB')
ax.axvline(flash_mb,color=GRAY,linestyle=':',label=f'Entire 16 MiB flash: {flash_mb:.2f} MB')
ax.set_title('Storage is the first constraint',loc='left',pad=19)
for bar,r in zip(bars,sizes):ax.text(bar.get_width()+.2,bar.get_y()+bar.get_height()/2,str(r['size_decimal_mb']),va='center')
ax.legend(frameon=False,loc='lower left',bbox_to_anchor=(0,-.58))
finish(fig,'esp32-storage','Whistle model sizes against an S3 model partition',
       'External reported model sizes and computed flash capacities',sizes,
       ['https://huggingface.co/Cactus-Compute/whistle','https://github.com/andrisgauracs/whistle-esp32'])

timing=[{'quantity':'Audio duration','seconds':2.0},{'quantity':'Reported processing time','seconds':6.3}]
fig,ax=plt.subplots(figsize=(8.3,3.8),layout='constrained')
bars=ax.barh([r['quantity'] for r in timing],[r['seconds'] for r in timing],color=[GRAY,ORANGE],height=.45)
ax.invert_yaxis();ax.set_xlim(0,8);ax.set_xlabel('Seconds');ax.set_title('Runs on-device; faster-than-real-time is still a goal',loc='left',pad=19)
for bar,r in zip(bars,timing):ax.text(bar.get_width()+.15,bar.get_y()+bar.get_height()/2,str(r['seconds'])+' s',va='center')
finish(fig,'esp32-timing','Community S3 timing for one English command',
       'External reported result, S3 at 240 MHz, depth 4, one 2-second command; not my benchmark',timing,
       ['https://github.com/andrisgauracs/whistle-esp32'])

# A probability identity, not fabricated creativity scores or experimental results.
fig,ax=plt.subplots(figsize=(8.3,4.3),layout='constrained');analytical=[]
for p,color in [(.1,GRAY),(.25,INK),(.5,ORANGE)]:
    n=np.arange(1,33);probability=1-(1-p)**n
    ax.plot(n,probability,color=color,label=f'Assumed per-candidate validity p = {p:g}',linewidth=2)
    analytical.extend({'candidate_count':int(k),'assumed_p':p,'probability_at_least_one_valid':float(v)} for k,v in zip(n,probability))
ax.set_xlim(1,32);ax.set_ylim(0,1.04);ax.set_xlabel('Independently generated candidates');ax.set_ylabel('Probability of at least one valid candidate')
ax.set_title('More candidates also require more verification',loc='left',pad=19);ax.legend(frameon=False,fontsize=9,loc='lower right')
finish(fig,'hallucinative-search','Independent-candidate probability illustration',
       'Analytical illustration only: 1-(1-p)^n; p is assumed and candidates are independent; not measured creativity',analytical,[])

reward=[{'component':'Yield','weight':.4},{'component':'Causal match','weight':.2},
        {'component':'Reasoning proxy','weight':.2},{'component':'Financial signal','weight':.2}]
fig,ax=plt.subplots(figsize=(8.3,4.1),layout='constrained')
bars=ax.barh([r['component'] for r in reward],[r['weight'] for r in reward],color=[ORANGE,GRAY,GRAY,INK],height=.5)
ax.invert_yaxis();ax.set_xlim(0,.52);ax.set_xlabel('Coefficient in the current reward formula')
ax.set_title('A reward formula is a design choice',loc='left',pad=19)
for bar,r in zip(bars,reward):ax.text(bar.get_width()+.012,bar.get_y()+bar.get_height()/2,str(r['weight']),va='center')
finish(fig,'manufacturing-reward','Fab Yield Agent implemented reward coefficients',
       'Code-derived coefficients, not measured learning performance',reward,
       ['https://github.com/omansharora5/fab-yield-agent/blob/0732e65711cdb6000db1b82c0cc95138861b1315/environment/env.py'])

phases=[('Explore',1,4),('Hypothesize',5,8),('Refine',9,11),('Submit',12,12)]
budget=[{'step':i,'remaining_after_step':12-i} for i in range(13)]
fig,ax=plt.subplots(figsize=(8.3,4.3),layout='constrained')
for i,(name,lo,hi) in enumerate(phases):
    ax.axvspan(lo-.5,hi+.5,color=ORANGE if i==3 else GRAY,alpha=.12 if i!=3 else .2)
    ax.text((lo+hi)/2,12.6,name,ha='center',fontsize=10)
ax.step([r['step'] for r in budget],[r['remaining_after_step'] for r in budget],where='post',color=INK,linewidth=2)
ax.scatter(range(13),[12-i for i in range(13)],color=ORANGE,s=25,zorder=3)
ax.set_xticks(range(0,13,2));ax.set_xlim(0,12.5);ax.set_ylim(-.5,14);ax.set_xlabel('Steps used');ax.set_ylabel('Remaining steps')
ax.set_title('Twelve steps to investigate and submit',loc='left',pad=19)
finish(fig,'semiconductor-budget','Fab Yield Agent episode budget',
       'Environment rule illustration, not a yield or training result',budget,
       ['https://github.com/omansharora5/fab-yield-agent/blob/0732e65711cdb6000db1b82c0cc95138861b1315/environment/env.py'])
(OUT/'chart-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(f'Generated {len(manifest)} Matplotlib SVGs with CSV data and provenance.')
