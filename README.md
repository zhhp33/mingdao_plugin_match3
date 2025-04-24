# 数据消消乐（mingdao_plugin_match3）

## 项目简介

**数据消消乐**是一款基于明道云视图插件开发规范实现的自定义消消乐游戏插件。插件支持自定义内容，结合明道云工作表数据，将数据与趣味游戏玩法融合，适用于数据可视化、数据趣味化展示等场景。

- 插件类型：明道云自定义视图插件
- 技术栈：React + Less + styled-components
- 适用平台：明道云 HAP 超级应用平台

## 主要特性

- 支持与明道云工作表数据实时交互
- 游戏玩法灵活，支持自定义字段内容
- 全屏自适应布局，移动端友好
- 支持最高分记录、进度条、动画特效
- 双击任意方块可快速切换回数据视图
- 代码结构清晰，易于二次开发和扩展

## 目录结构

```
mingdao_plugin_match3/
├── .config/                # 插件参数配置
│   └── params-config.json
├── dist/                   # 构建输出目录
├── node_modules/           # 依赖包
├── src/                    # 源码目录
│   ├── App.js              # 主应用逻辑
│   ├── index.js            # 入口文件
│   ├── style.less          # 样式文件
│   ├── icon.svg            # 插件图标
│   └── components/         # 组件目录
│       └── FieldDisplay.js
├── mdye.json               # 明道云插件配置
├── package.json            # 依赖与脚本
├── package-lock.json
└── .gitignore
```

## 安装与使用

1. 安装依赖

   ```bash
   npm install
   ```

2. 启动本地开发

   ```bash
   mdye start
   ```

3. 构建并推送到明道云

   ```bash
   mdye build
   mdye push -m "提交说明"
   ```

4. 在明道云插件中心关联并调试本地插件

## 主要依赖

- [react](https://reactjs.org/)
- [styled-components](https://styled-components.com/)
- [mdye](https://www.npmjs.com/package/mdye)
- [lodash](https://lodash.com/)

## 参数配置

插件参数通过 `.config/params-config.json` 进行管理，可自定义需要展示的字段等内容，具体配置可参考明道云官方文档。

## 参考文档

- [明道云视图插件开发文档](https://help.mingdao.com/extensions/developer/view/)
- [HAP前端开源项目](https://github.com/mingdaocom/pd-openweb)

---

如需详细开发说明或二次开发指导，请参考上述官方文档或联系项目维护者。 