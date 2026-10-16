# 片拉拉 · Pianlala

## 当前版本 0.9.4（2026-10-16）

源码已采用 [MIT](LICENSE)，第三方组件保持原有许可，见 [第三方声明](THIRD_PARTY_NOTICES.md)。开发者：B站 Fadeyin。

## 下载最新版

| 平台 | 0.9.4 安装包 |
| --- | --- |
| Mac · Apple Silicon（M1 及更新芯片，macOS 12+） | [下载 DMG](https://github.com/Fade-Yin/fadeyin-shot-diary/releases/download/v0.9.4/Pianlala-macOS-arm64-0.9.4.dmg) · [下载 ZIP](https://github.com/Fade-Yin/fadeyin-shot-diary/releases/download/v0.9.4/Pianlala-macOS-arm64-0.9.4.zip) |
| Mac · Intel（x64，macOS 12+）· **未测试** | [下载 DMG](https://github.com/Fade-Yin/fadeyin-shot-diary/releases/download/v0.9.4/Pianlala-macOS-x64-0.9.4.dmg) · [下载 ZIP](https://github.com/Fade-Yin/fadeyin-shot-diary/releases/download/v0.9.4/Pianlala-macOS-x64-0.9.4.zip) |
| Windows · x64 | [下载便携版 EXE](https://github.com/Fade-Yin/fadeyin-shot-diary/releases/download/v0.9.4/Pianlala-Windows-Portable-0.9.4.exe) |

[最新发布页与校验文件](https://github.com/Fade-Yin/fadeyin-shot-diary/releases/latest)

Mac 发布流程强制验证 Developer ID 签名、Apple 公证、公证票据（staple）及 Gatekeeper；只有通过检查才公开发布，见 [0.9.4 构建与验证记录](https://github.com/Fade-Yin/fadeyin-shot-diary/actions/workflows/mac-arm64-094.yml)。完整 Mac 真机界面交互验收尚未完成。Apple Silicon 安装包为 arm64；Intel 安装包为 x64，未完成 Intel 真机测试。

0.9.4 取消分析和拉片模式的分页，全部镜头连续滚动显示；两个模式均支持拖动播放器时间轴后自动定位并高亮镜头，保留序列筛选且不触发播放。

## 简介

### Mac Intel 版说明

**Intel（x64）版未测试：未经 Intel Mac 真机界面及完整操作流程测试。** 安装包通过 Intel 构建机的自动回归、架构与媒体工具检查，以及签名、公证、Gatekeeper 验证后，追加至 [0.9.4 发布页](https://github.com/Fade-Yin/fadeyin-shot-diary/releases/tag/v0.9.4)。自动检查不等同于完整真机验收。Intel Mac 请选择 x64；M 系列芯片请选择 arm64。

新版包含系统跟随的浅深色 UI、镜头悬停播放与离开暂停、时间线当前镜头拉片面板、项目独立的自定义字段，以及静帧、镜头 MP4、CSV、拉片日记导出。Mac 版补充原生菜单栏、标准 Command 快捷键与窗口外观联动。

Node.js 22：在 `desktop` 下运行 `npm ci`、`npm start`。
Windows 打包运行 `npm run build:win`；Apple Silicon Mac 运行 `npm run build:mac:arm64`。
Actions 的 Build signed Mac ARM64 0.9.4 工作流提供 macOS 原生构建、回归测试、签名与公证检查。

面向电影学习与逐镜分析的本地拉片工具。导入视频，检测镜头切点，浏览中间帧，按场次整理并填写拉片笔记。

**AI 功能暂未上线。** AI 按钮保持灰色，提示「功能未上线，敬请稍后」；当前版本不支持填写 API Key 或调用 AI 分析。

## 功能

- 桌面版通过 FFmpeg 检测切点，提取每个镜头的中间帧。
- 手动添加切点、合并镜头，播放对应镜头。
- 手动分场或建立序列，每场有标题、封面与独立标签页。
- 填写景别、角度、运镜、光色、画面内容、声音和备注；支持常用下拉项与自定义输入。
- 拖动分析列表表头调整顺序，拖动列边缘调整宽度。
- 左侧项目库保存镜头、分场与笔记，方便继续拉片。
- 全片通览：亮度、指纹、剪辑密度及音频电平。
- 导出包含视频和笔记的单文件拉片日记，或导出飞书兼容 CSV。

## 开始使用

### Windows 桌面版

使用上方「下载最新版」中的 Windows 便携版 EXE，双击运行即可。已内置 FFmpeg 和 FFprobe，无需另外下载或安装。Windows 版尚未进行发布者代码签名。

### Mac 桌面版

使用上方 Mac DMG，打开后将「片拉拉」拖入「应用程序」。也可下载 ZIP 并解压应用。M 系列芯片请选择 arm64，Intel 芯片请选择 x64；Intel 版未经真机使用测试。

仓库的「Download ZIP」是桌面版源码，不是网页版本，也不是可执行程序。界面文件仅作为 Electron 应用内部资源随 EXE 打包，不提供单独的 HTML 使用方式。

### 从源码启动桌面版

需要 Node.js 与 npm。在仓库根目录打开终端：

```sh
cd desktop
npm ci
npm start
```

首次安装需要联网下载 Electron、FFmpeg 等依赖。不要把 Windows 的 `node_modules` 复制到 Mac 使用。

## 拉片步骤

1. 打开视频，或把视频拖入播放器；新视频会自动创建项目并检测镜头，预览框内可停止检测。
2. 如需调整结果，设置检测灵敏度和最短镜头帧数，再点击「重新分析」。桌面版读取原片帧率。
3. 鼠标进入分镜画面即可播放，离开立即暂停，画面和进度保留；再次进入可继续播放。
4. 检查镜头边界。拖动缩放滑块放大时间线并横向滚动；输入镜头编号点击「定位」。时间线获得焦点后，方向键选择，Shift＋方向键连续多选，回车播放。选择工具可点击镜头，Shift 点击可连续多选；刀片工具用于手动添加切点。快捷键 V 为选择工具，B 为刀片工具。
5. 选中连续镜头后点击「选中镜头分场」或「建立序列」，填写标题和范围。分场不会自动生成，当前不支持场次范围重叠。
6. 在场次标签页填写景别、角度、运镜、光色、画面内容、声音和备注。分场封面默认取场次时间中间帧，也可用「当前画面设为封面」更换。
7. 使用「导出拉片日记」生成阅读报告。报告固定使用导出开始时的数据；处理期间暂时锁定项目编辑。重新分析与分场删除、拆分、合并支持撤销。

## 保存与恢复

项目自动保存在应用的本机存储中，**不是云端同步，也不会复制原视频**。请保留原视频。

清除应用数据可能使原项目无法访问。导出拉片日记是阅读与分享文件，当前没有把导出日记重新导入为可编辑项目的入口，不能替代完整可编辑项目备份。

## 导出说明

| 导出方式 | 内容与限制 |
| --- | --- |
| 拉片日记 | 内嵌原视频、镜头图片、笔记和场次标签；文件较大，手机是否能打开取决于浏览器、编码和可用内存。 |
| 镜头报告 | 内嵌原视频和镜头卡片，可点击播放镜头。 |
| 桌面 MP4 | 通过 FFmpeg 重新编码导出镜头片段，保留画面分辨率；不是无损复制。每次自动新建独立子文件夹，避免覆盖。导出期间可点击「取消」停止，已完成的片段保留。 |
| 飞书兼容 CSV | 导出文字表格，可手动导入飞书等表格工具；不包含图片、视频附件，不是自动同步。 |

各项导出功能统一在右上角「导出」中选择，按当前编辑后的镜头切点执行。

## 已知问题

本轮修复及验证范围详见 [KNOWN_ISSUES.md](KNOWN_ISSUES.md)。已修复笔记重映射、连续合并、导出快照、避免覆盖、分场撤销及时间线操作等问题。

自动切点仍需要人工检查，特别是叠化、闪光、快速运动与可变帧率素材。重要笔记建议额外保存文字副本。

## 构建

在 `desktop` 目录执行：

```sh
npm run check
npm run build:win
```

Mac arm64 构建命令为 `npm run build:mac:arm64`，应在 Apple Silicon Mac 环境安装依赖并构建。正式构建需提供 Developer ID 签名和 Apple 公证凭据；不要将凭据提交到源码。Mac 适配详情见 [MAC-0.9.3.md](desktop/MAC-0.9.3.md)。

## 数据与依赖

影片分析与笔记保存在本机。导出的单文件 HTML 包含原视频，分享该文件也会分享其中的视频内容。

仓库包含桌面应用源码、图标和文档，不包含影片、私人笔记或缓存。安装包作为 Release 附件单独分发。应用源码使用 MIT；第三方依赖分别遵循自己的许可证，MIT 不覆盖 FFmpeg 等第三方组件。对应构建的许可证及源码提供要求仍需单独核对，详见 [第三方声明](THIRD_PARTY_NOTICES.md)。
