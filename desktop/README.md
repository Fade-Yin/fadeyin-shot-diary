# 片拉拉桌面版

当前本地开发版：0.7.0。新增起始帧／中间帧原尺寸 PNG 批量导出，统一序列分析，以及景别、角度、运镜的全片分布统计。详见 [更新说明](更新说明-0.7.0.md)。原 FadeYin 项目库标识保持不变。

Mac 旧版签名问题尚未解决；本次不代表发布了新的 Mac 正式版。

同一套 HTML 界面，使用 Electron 调用本机或随应用打包的 FFmpeg/FFprobe。

## 开发运行

1. 在 `desktop` 目录执行 `npm ci`。
2. `npm install` 会自动准备当前系统对应的 FFmpeg 和 FFprobe。
3. 执行 `npm start`。

## 打包

- Windows：执行 `npm run build:win`。
- Intel Mac：在 Intel Mac 上执行 `npm run build:mac:x64`。
- Apple 芯片 Mac：在 Apple 芯片 Mac 上执行 `npm run build:mac:arm64`。

构建时会自动把当前平台对应的 FFmpeg/FFprobe 放入程序，使用者无需另外安装。

macOS 正式外部分发需要在 Mac 环境签名并公证。
