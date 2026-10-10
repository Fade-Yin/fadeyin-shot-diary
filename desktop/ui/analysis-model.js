/* Pure model shared by the UI and Node regression tests. */
(function(root){
  const api={
    validateSequence(start,end,total,sequences,editingId='') {
      if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end>total||end<=start) return '请填写有效的起止镜头编号，包含结束镜头';
      if(sequences.some(s=>s.id!==editingId&&start<s.endShot&&end>s.startShot)) return '此范围与已有序列重叠，请调整起止镜头或先移除原序列';
      return '';
    },
    contiguousSelection(selected,total) {
      const indexes=[...selected].filter(i=>Number.isInteger(i)&&i>=0&&i<total).sort((a,b)=>a-b);
      return indexes.length&&indexes.every((v,i)=>i===0||v===indexes[i-1]+1)?{start:indexes[0],end:indexes.at(-1)+1}:null;
    },
    distribution(shots,notes,field,weight='count') {
      const groups=new Map(); let total=0,filled=0;
      shots.forEach((s,i)=>{
        const value=typeof notes[i]?.[field]==='string'?notes[i][field].trim():'';
        const amount=weight==='duration'?Math.max(0,s.end-s.start):1;
        const key=value||'未填写'; const g=groups.get(key)||{label:key,count:0,duration:0,value:0};
        g.count++;g.duration+=Math.max(0,s.end-s.start);g.value+=amount;total+=amount;if(value)filled++;groups.set(key,g);
      });
      return {total,filled,groups:[...groups.values()].sort((a,b)=>b.value-a.value||a.label.localeCompare(b.label,'zh')).map(g=>({...g,percent:total?g.value/total*100:0}))};
    }
  };
  if(typeof module==='object'&&module.exports)module.exports=api;else root.PianlalaAnalysis=api;
})(globalThis);
