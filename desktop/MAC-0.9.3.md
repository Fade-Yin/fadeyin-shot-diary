# 片拉拉 0.9.3 · Apple Silicon

以 Windows 0.9.3 的功能为基线，使用同一镜头、笔记、项目与导出数据模型。镜头画面悬停播放、离开暂停，暂停进度保留。

## macOS 适配

- 使用系统窗口控制按钮，工具栏为其留出空间。
- 原生菜单顺序：片拉拉、文件、编辑、显示、镜头、窗口、帮助。
- 标准快捷键：⌘O 打开、⌘N 新建、⌘, 设置、⌘Z 撤销、⇧⌘Z 重做、⌘W 关闭窗口、⌘Q 退出。
- 视图模式、布局、项目备注、截图、导出等工具栏功能也有原生菜单入口。
- 系统字体优先，图标继承文字颜色；区分主操作、分组与次要信息。
- 跟随系统或手动浅／深色外观，同时同步系统窗口外观。
- 保留系统减少动态效果、减少透明效果及提高对比度的适配。
- 关闭窗口与退出应用遵循 macOS 行为，不使用 Windows 托盘关闭对话框。

参考 Apple 官方指南：

- https://developer.apple.com/design/human-interface-guidelines/designing-for-macos
- https://developer.apple.com/design/human-interface-guidelines/the-menu-bar
- https://developer.apple.com/design/human-interface-guidelines/toolbars
- https://developer.apple.com/design/human-interface-guidelines/dark-mode

## 构建与验证

原生 arm64 CI 构建 DMG、ZIP；使用仓库已有 Developer ID 证书与 Apple API 公证凭据。凭据不写入源码。构建需通过签名完整性、原生架构、FFmpeg 实际编码、FFprobe 元数据读取、Apple staple 与 Gatekeeper 检查才上传安装包。

Mac 真机完整视觉、VoiceOver 和鼠标交互验收仍需补充，不能将命令行检查等同于完整 UI 验收。
