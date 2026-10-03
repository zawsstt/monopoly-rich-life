# 大富翁 · 富贵人生 WEB 版

> 3D 沙盘大富翁 —— 一张书桌、一座城、六个奇人、一把骰子。
> 纯浏览器运行 · 无需安装 · 支持 2-4 人联机对战

![style](https://img.shields.io/badge/style-low--poly_3D-blue) ![engine](https://img.shields.io/badge/engine-Three.js_r147-green) ![net](https://img.shields.io/badge/multiplayer-WebRTC+Supabase-orange) ![storage](https://img.shields.io/badge/storage-Supabase_Storage-success) ![license](https://img.shields.io/badge/license-学习专用·禁用商用-red)

![游戏海报](assets/img/scene_poster.jpg)

### 0x01 简介

传闻这座城里，六位奇人共守一张书桌沙盘——掷下骰子，买地起楼，坐地收租；哪怕进了局子，也只是命运的又一次洗牌。

整个棋盘微缩在书房的一张木桌上：22 块地产各有独属的建筑风格与四级成长（小屋 → 洋房 → 大厦 → 城堡），街区被环状马路环绕，角色与警车都走在马路上；有幸运格的横财，也有雷劈般的巨额账单。堆积木般写成的 Three.js 工厂让这座城在浏览器里 60FPS 运转。

**v4.12 起整体接入 Supabase 云底座**：素材走 Supabase Storage CDN（本地副本自动兜底），战绩上云生成本网排行榜，联机信令摆脱第三方免费云——详见 0x05。

### 0x02 玩法特性

- **双视角自由镜头**：全局俯瞰 / 跟随角色第一人称，拖拽 360° 环绕、滚轮缩放，WASD 与方向键精准推镜
- **六位奇人**：地产大亨 · 商界女强人 · 元气少女 · 围地狂魔 · 神秘怪人 · AI 投资人，各自 3D 精细建模

| 富老板 | 钱掌柜 | 糖糖 | 土老财 | 丧彪 | 豆豆 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| ![富老板](assets/img/face3_boss.png) | ![钱掌柜](assets/img/face3_qian.png) | ![糖糖](assets/img/face3_tang.png) | ![土老财](assets/img/face3_tu.png) | ![丧彪](assets/img/face3_ren.png) | ![豆豆](assets/img/face3_doudou.png) |

- **22 街区 × 4 级建筑**：南锣鼓巷的灰瓦、武康路的洋楼、山塘街的水乡、大唐不夜城的唐风、铜锣湾的霓虹……每格独属一套成长族谱，从平地一路长成城堡：

<p>
<img src="assets/img/b_boss_1.png" width="120" alt="Lv1 小屋">
<img src="assets/img/b_boss_2.png" width="120" alt="Lv2 洋房">
<img src="assets/img/b_boss_3.png" width="120" alt="Lv3 大厦">
<img src="assets/img/b_boss_4.png" width="120" alt="Lv4 城堡">
</p>

- **拍卖大厅**：破产清算触发全场竞拍——舞台大屏、主持人落槌、玩家举牌竞价，开局猜拳定出价顺序；旁观的玩家退出后其余竞拍者照常轮转出价，价高者得
- **12 种入狱案由**：飙车、酒驾、遛恐龙不拴绳……警车押送全程只出警车不出人；拘留所（行政拘留 + 罚款）与监狱（可保释）分流处置
- **季节事件 / 幸运格 / 道具**：建设周、收租季、财神日轮转（不与上季重复）；路障、遥控骰子、护身符伺机而动
- **P2P 联机**：WebRTC 直连 + 自家 Supabase Realtime 信令的房主权威对战，房间码邀请、断线宽限重连、实时聊天与表情
- **排行榜双轨**：本机榜 + 🌐 全网榜（Supabase）三榜 Top10，胜场榜 / 收租榜 / 监狱风云榜，第一名号千金难换

### 0x03 目录结构

```bash
.
├── index.html                  # 入口（大厅 + 对局 DOM + [SB] Supabase 引导段 + 首屏加载器）
├── css/style.css               # 全部样式
├── js/lib                      # three.min.js 等库
├── src
│   ├── data.js                 # 40 格棋盘 / 事件卡 / 角色 / 全部数值配置
│   ├── game.js                 # 游戏引擎：回合状态机 + 经济系统（零渲染依赖）
│   ├── uix.js                  # DOM UI：面板 / 弹窗 / 拍卖大厅 / 排行榜（本机 + 全网）
│   ├── view3d.js               # 3D 引擎：场景 / 相机 / 行走 / 骑乘 / 特效
│   ├── buildings3d.js          # 参数化建筑工厂（回退方案）
│   ├── supa-rtc.js             # Supabase Realtime 信令层（Phoenix WS）+ WebRTC 封装
│   ├── net.js                  # 联机对战（房主权威，数据面走 WebRTC DataChannel）
│   ├── bgm.js                  # 音乐播放器（主界面 / 对局双场景）
│   ├── sfx.js                  # WebAudio 音效合成
│   ├── ai.js                   # AI 决策
│   ├── psa.js                  # 公益短片净化系统（gongyi_movie/）
│   ├── career.js               # 生涯称号档案
│   └── main.js                 # 入口与大厅
├── assets                      # 素材（img / audio / sfx / models，仓库副本作 CDN 兜底）
├── gongyi_movie                # 公益短片（视频A-F.mp4，入狱净化播放）
├── supabase
│   └── migrations              # 云端初始化 SQL：storage 桶 / 排行榜 / 联机房间表 + RLS
└── tools                       # 运维脚本：素材上传 / 缓存指纹 bump
```

### 0x04 本地运行

任意静态服务器指向本目录即可（建议关闭缓存）：

```bash
python -m http.server 8123    # 或 npx serve .
# 浏览器打开 http://localhost:8123
```

调试参数：`?auto=1` 直接开局（配 `&rounds=6&money=9000&players=2`）· `?nofly=1` 跳过开场飞掠 · `?auction=格号` 强制开拍（格号须为地产格）· `?theme=modern` 切现代写实棋盘 · `?cdn=0` 强制本地素材（不走 Supabase）· `?legacychar=1` 回退旧角色模型

### 0x05 联机对战（Supabase 信令 + WebRTC 数据面）

主菜单 → 🌐 联机对战 → 房主「创建房间」得到 5 位房间码 → 朋友输入房间码加入（最多 3 位客人，空位自动补 AI）。

- **信令层**：房间码映射到 Supabase Realtime Broadcast 频道（`room:CODE`），offer / answer / ICE 经频道定向交换——不再依赖 PeerJS 免费云，信令可控可查
- **数据层**：游戏数据全程走 WebRTC DataChannel P2P 直连，房主权威结算，低延迟不打折
- **房间表**：`mp_rooms` / `mp_members` 记录房间状态与心跳（超时 3 分钟自动关闭）
- **断线宽限**：对局中断线 90 秒内可凭令牌重连续玩（刷新页面令牌自动恢复），宽限超时由 AI 接管
- 内置聊天与 8 个快捷表情

### 0x06 排行榜与名号（本机 + 全网）

大厅输入「你的名号」后开局，战绩自动计入两套排行榜：

- **本机榜**：localStorage 持久，离线可看
- **🌐 全网榜**：结算时经 `report_round` RPC 上报 Supabase（增量式防刷，RLS 收窄写路径），任何设备的玩家同榜竞技

### 0x07 素材与云底座

- 素材默认从 **Supabase Storage 公开桶 `game-assets`** 分发（CDN），仓库内副本自动兜底：任一资源 CDN 拉取失败即整会话降级本地，游戏不白屏
- 棋盘主题模型按需加载：经典 / 现代两套 3D 资产只载当前主题的一套（省 ~3.5MB 首开流量），联机时跟随房主主题动态补载
- 部署者可通过 `tools/upload-assets.mjs` 一键把 `assets/` + `gongyi_movie/` 同步进自家 Supabase 项目（见 `supabase/migrations/` 初始化 SQL）

### 0x08 声明与许可

**本项目仅供学习、交流使用，严禁用于任何形式的商业用途。**

- 不得对本项目或其衍生作品进行销售、付费下载、广告变现、捆绑商业推广
- 二次创作（魔改、转载）请保留本声明并标注来源
- 游戏素材（立绘 / 建筑 / 音频）仅限本项目的学习演示场景

© 2026 大富翁 · 富贵人生 WEB 版 — 学习交流项目，祝各位发财。
