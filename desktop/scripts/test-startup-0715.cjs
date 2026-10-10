const fs=require('fs'),path=require('path'),assert=require('assert');
const source=fs.readFileSync(path.join(__dirname,'../ui/workbench.js'),'utf8');
const destructive=source.indexOf("for(const bar of document.querySelectorAll('.dockBar'))");
const move=source.indexOf("playerBar.append($('#drop'))");
assert.ok(destructive>=0&&destructive<move,'Header formatting must precede moving live controls');
assert.equal((source.match(/bar\.innerHTML=/g)||[]).length,1,'No later destructive header replacement');
assert.ok(source.indexOf("document.head.append(sheet)")<destructive,'Stylesheet loads before enhancements');
// Model DOM innerHTML semantics, which the earlier general-purpose doubles omitted.
class Node{constructor(name){this.name=name;this.children=[]}append(node){this.children.push(node)}set innerHTML(value){this.children=[]}}
const header=new Node('header'),button=new Node('report');header.innerHTML='title';header.append(button);assert.equal(header.children[0],button);
header.innerHTML='title';assert.equal(header.children.length,0,'Control loss must be observable in the regression model');
console.log('PASS startup regression guard: stylesheet first; destructive header formatting before control moves; no later replacement. Source/DOM-semantics guard, not native window acceptance.');
