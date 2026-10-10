# macOS 正式发布

源码仓库保持私有；仅向 Fade-Yin/fadeyin-downloads 的 v0.7.30 发布安装包。

## GitHub Secrets

在本私有仓库 Settings → Secrets and variables → Actions 配置：

| Secret | 内容 |
| --- | --- |
| CSC_LINK | 含私钥的 Developer ID Application .p12 的 Base64 内容；不要使用 Apple Development 或 Mac App Distribution 证书 |
| CSC_KEY_PASSWORD | 该 .p12 的导出密码 |
| APPLE_API_KEY | 用于 Apple 公证的团队 App Store Connect API Key 的 .p8 原始内容 |
| APPLE_API_KEY_ID | API Key ID |
| APPLE_API_ISSUER | 团队 API Issuer ID |

只在 Secrets 填值，不提交证书、私钥或凭据。工作流将 .p8 写入权限受限的临时目录并在结束时删除；electron-builder 临时导入签名证书。

## 构建与验证

手动运行 mac-release.yml。两个架构都必须成功。缺少凭据、非 Developer ID、嵌套签名错误、公证不通过或 stapling 失败时，工作流不得产出正式安装包。应用先经 Apple 公证并 staple，再生成 ZIP；DMG 另行提交 Apple 公证并 staple。ZIP 自身不能 staple，应验证解压后的应用票据。安装包全部完成后才计算 SHA-256。

## 浏览器首次启动验收与发布

CI 验证不代表本机 UI 验收。保持现有公开版本为预发布，直到以下检查完成。

1. 取回私有 Actions 产物，对比 SHA-256。在本机分别检查 app/DMG 的 stapler validate 与 Gatekeeper。
2. 在原生 Apple 芯片和 Intel Mac 上分别验收；Rosetta 可做补充，不能替代原生 Intel 验收。
3. 如需公开下载验收，先仅将通过 CI 的 DMG/ZIP 和对应校验文件更新到 fadeyin-downloads 预发布。不得上传私有源码、Actions 整包、证书或日志。
4. 在 Chrome/Safari 重新下载最终安装包，确认保留 com.apple.quarantine；通过 Finder 安装到 Applications 并首次启动。不要清除 quarantine、临时重签或绕过安全设置。
5. 验证首次打开没有“已损坏”，正常通过系统的开发者确认提示；导入测试影片、生成缩略图、自动检测切点、导出片段，验证实际 FFmpeg/FFprobe 调用。
6. 记录两个架构、系统版本、安装包 SHA-256、下载来源和验收结果后，再更新发布说明与发布状态。现有 Windows 未签名说明应保留。
