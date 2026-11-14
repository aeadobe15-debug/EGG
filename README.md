# Egg · 卵形工坊

手机与电脑可用的蛋形交互建模网页。包含整数米参数、独立 X/Z 截面直径、顶部及底部圆润度、透明模式、尺寸框、紫色高度标尺、地面网格和 8 款随形材质。

## 上传 GitHub 并开启网页

1. 解压本压缩包。不要直接把 ZIP 上传到 GitHub，GitHub 不会替你解压。
2. 在你的 GitHub 账号创建公开（Public）仓库，名称填写 Egg。
3. 进入仓库，点击 Add file → Upload files（空仓库可点击 uploading an existing file）。
4. 把解压后的文件上传到仓库根目录，确保打开仓库就能直接看见 index.html、app.js、materials.js，而不是再套一层文件夹。
5. 点击 Commit changes 提交。README.md 和 .nojekyll 也可以一起上传。
6. 打开仓库 Settings → Pages。
7. Source 选择 Deploy from a branch；Branch 选择 main；目录选择 / (root)，点击 Save。
8. 等待 Pages 显示发布成功，再打开其提供的网址。

如果仓库为 aeadobe15-debug/Egg，发布成功后默认地址通常为：
https://aeadobe15-debug.github.io/Egg/

该网址需要完成上述发布步骤才会生效。若出现 404，请先检查 Pages 发布状态、根目录是否有 index.html，以及网址大小写是否与仓库名称一致。

官方设置说明：
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 使用与限制

- 不需要安装依赖或执行构建命令；三个网页文件必须放在同一目录。
- 材质在本地生成，不依赖外部图片、字体或 JavaScript CDN。
- 参数保存在当前浏览器，换设备后不会自动同步。
- STL 只包含几何形状，不包含材质，坐标按米导出。
- 建议使用安卓浏览器或 iPhone Safari；具体机型尚未全面测试。
- GitHub Pages 在中国大陆不同运营商网络下的可达性需要实际测试，不能保证全部网络稳定打开。

材质设计参考：https://wikimon.net/Digitama
