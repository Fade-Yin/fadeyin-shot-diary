function template(send){
 const action=(id,label,accelerator)=>({id,label,...(accelerator?{accelerator}:{}),click:()=>send(id)});
 return [
  {label:'片拉拉',submenu:[{role:'about',label:'关于片拉拉'},{type:'separator'},action('settings','设置…','Command+,'),{type:'separator'},{role:'services',label:'服务'},{type:'separator'},{role:'hide',label:'隐藏片拉拉'},{role:'hideOthers',label:'隐藏其他'},{role:'unhide',label:'全部显示'},{type:'separator'},{role:'quit',label:'退出片拉拉'}]},
  {label:'文件',submenu:[action('new','新建项目','Command+N'),action('open','打开视频…','Command+O'),{type:'separator'},action('notes','项目备注…'),action('export','导出…','Command+Shift+E'),{type:'separator'},{role:'close',label:'关闭窗口'}]},
  {label:'编辑',submenu:[action('undo','撤销','Command+Z'),action('redo','重做','Command+Shift+Z'),{type:'separator'},{role:'cut',label:'剪切'},{role:'copy',label:'拷贝'},{role:'paste',label:'粘贴'},{role:'selectAll',label:'全选'}]},
  {label:'显示',submenu:[action('analysis','分析模式'),action('lap','拉片模式'),action('timeline','时间线模式'),{type:'separator'},action('sidebar','显示／隐藏项目边栏','Control+Command+S'),action('layout','工作区布局…'),action('search','搜索项目与命令…','Command+K'),{type:'separator'},{role:'togglefullscreen',label:'进入／退出全屏'}]},
  {label:'镜头',submenu:[action('detect','检测切点'),action('detect-options','检测选项…'),{type:'separator'},action('select','选择工具'),action('blade','切分工具'),action('capture','保存当前画面'),action('sequence','新建序列')]},
  {role:'windowMenu',label:'窗口'},
  {role:'help',label:'帮助',submenu:[action('shortcuts','键盘快捷键')]}
 ];
}
module.exports={template};
