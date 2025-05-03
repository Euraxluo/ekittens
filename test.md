# 炸弹猫(Exploding Kittens)游戏逻辑说明

## 一、游戏目标
- 在所有玩家中存活到最后的玩家获胜
- 如果抽到爆炸猫卡且没有拆弹卡,玩家立即淘汰
- 需要通过各种功能卡或者行动卡来增加自己的生存机会

## 二、核心卡牌类型

### 1. 基础卡牌
- **爆炸猫卡(Exploding Kitten)**
  - 抽到即爆炸
  - 必须使用拆弹卡化解
  - 否则玩家立即淘汰

- **拆弹卡(Defuse)**
  - 用于拆除爆炸猫
  - 使用后可以将爆炸猫放回牌堆任意位置
  - 游戏开始时每人发1张

### 2. 行动卡牌
- **预见未来(See the Future)**
  - 查看牌堆顶部3张牌
  - 不改变牌堆的顺序

- **改变未来(Alter the Future)**
  - 查看并重新排列牌堆顶部3张牌

- **跳过(Skip)**
  - 结束当前回合而不抽牌
  - 下一位玩家继续

- **攻击(Attack)**
  - 结束当前回合而不抽牌
  - 下一位玩家必须连续进行2个回合
  - 升级:指定任意玩家,移除行动功能

- **打乱(Shuffle)**
  - 随机打乱整个牌堆

- **偷看(Mark)**
  - 查看其他玩家的一张手牌

- **反转(Reverse)**
  - 改变游戏进行方向
  - 顺时针变逆时针,反之亦然
  - 升级:转为行动卡

- **植入(Bury)**
  - 将一张手牌放入牌堆任意位置

## 三、游戏流程

### 1. 游戏准备
1. 根据玩家人数准备相应数量的爆炸猫卡(玩家人数-1)
2. 每人发1张拆弹卡
3. 洗牌并发给每人4张基础牌
4. 将爆炸猫卡洗入剩余牌堆

### 2. 回合流程
1. 玩家可以使用任意数量的手牌
2. 回合结束时必须抽一张牌,除非:
   - 使用跳过卡
   - 使用攻击卡
   - 上述卡牌可以结束当前回合可以称为具有行动功能的行动卡,但是行动功能只是行动卡的附属功能
3. 如果抽到爆炸猫:
   - 有拆弹卡则可以存活
   - 无拆弹卡则淘汰

### 3. 特殊规则
- 可以任意使用功能卡组合
- 某些卡牌可以影响游戏顺序
- 爆炸后的玩家所有手牌弃置

## 四、游戏交互流程

### 1. 游戏开局流程
```mermaid
sequenceDiagram
    participant Client as 客户端
    participant Gateway as WebSocket网关
    participant GameServer as 游戏服务器
    participant Redis as Redis缓存
    participant DB as PostgreSQL
    
    Client->>Gateway: 加入游戏大厅
    Gateway->>GameServer: 转发加入请求
    GameServer->>Redis: 创建/获取大厅信息
    GameServer-->>Client: 返回大厅信息
    
    Note over Client,GameServer: 等待玩家加入...
    
    Client->>Gateway: 开始游戏请求
    Gateway->>GameServer: 转发开始请求
    
    GameServer->>GameServer: 初始化牌堆
    GameServer->>GameServer: 发放初始手牌
    GameServer->>Redis: 保存游戏初始状态
    GameServer-->>Client: 广播游戏开始
    GameServer-->>Client: 发送各自手牌
```

### 2. 游戏进行流程
```mermaid
sequenceDiagram
    participant P1 as 玩家1
    participant P2 as 玩家2
    participant Server as 游戏服务器
    participant Deck as 牌堆
    participant Discard as 弃牌堆
    
    Note over P1,P2: 轮到玩家1回合
    
    P1->>Server: 使用预见未来卡
    Server->>Deck: 查看顶部3张
    Server-->>P1: 返回预见结果
    
    P1->>Server: 使用跳过卡
    Server->>Discard: 跳过卡进入弃牌堆
    Server-->>P1: 确认跳过
    Server-->>P2: 通知下一回合
    
    Note over P1,P2: 轮到玩家2回合
    
    P2->>Server: 抽一张牌
    Server->>Deck: 移除顶部一张
    alt 抽到爆炸猫
        Server-->>P2: 显示爆炸
        P2->>Server: 使用拆弹卡
        Server->>P2: 请选择放回位置
        P2->>Server: 选择位置
        Server->>Deck: 放回爆炸猫
    else 普通卡牌
        Server-->>P2: 发送抽到的牌
    end
```

### 3. 状态同步流程
```mermaid
sequenceDiagram
    participant Client as 客户端
    participant WS as WebSocket
    participant Game as 游戏服务
    participant Cache as 状态缓存
    
    Note over Client,Cache: 实时状态同步
    
    Game->>Cache: 更新游戏状态
    Game->>WS: 广播状态变更
    WS-->>Client: 推送状态更新
    
    alt 断线重连
        Client->>WS: 重连请求
        WS->>Game: 获取当前状态
        Game->>Cache: 读取游戏状态
        Cache-->>Client: 同步完整状态
    end
```

### 4. 关键状态数据结构
```mermaid
classDiagram
    class GameState {
        +String id
        +Player[] players
        +Card[] deck
        +Card[] discard
        +int turn
        +MatchState state
        +Context context
    }
    
    class Player {
        +String id
        +String username
        +Card[] cards
        +Card[] marked
        +boolean isOut
    }
    
    class Card {
        +String id
        +String name
        +String type
    }
    
    class Context {
        +boolean reversed
        +int attacks
        +boolean noped
        +int ikspot
    }
    
    GameState "1" *-- "*" Player
    GameState "1" *-- "*" Card
    Player "1" *-- "*" Card
```

## 五、关键状态变化
1. **回合状态**
   - waiting-for-action: 等待玩家行动
   - defuse-exploding-kitten: 等待拆弹
   - insert-exploding-kitten: 放回爆炸猫
   - alter-the-future: 改变未来
   - share-the-future: 分享未来视

2. **游戏上下文**
   - 玩家回合
   - 攻击次数
   - 游戏方向
   - 特殊卡牌位置

## 六、游戏隐私保护需求

### 1. 核心隐私数据与状态转换
```mermaid
stateDiagram-v2
    [*] --> 牌堆初始化
    
    state "牌堆状态" as DeckState {
        完全加密 --> 部分解密: 预见未来/改变未来
        部分解密 --> 完全加密: 行动结束
        完全加密 --> 抽牌解密: 玩家抽牌
        抽牌解密 --> 完全加密: 抽牌完成
    }

    state "玩家手牌" as HandState {
        私密状态 --> 部分公开: 被偷看/标记
        部分公开 --> 私密状态: 使用卡牌
        私密状态 --> 完全公开: 玩家淘汰
    }

    state "特殊操作" as SpecialState {
        state "预见未来" as Future {
            加密牌堆信息 --> 单人可见
            单人可见 --> 加密牌堆信息
        }
        state "改变未来" as AlterFuture {
            加密牌堆信息 --> 单人可见并可改
            单人可见并可改 --> 加密牌堆信息
        }
        state "爆炸猫放置" as PlaceKitten {
            公开操作权 --> 隐藏位置
            隐藏位置 --> 加密牌堆信息
        }
    }
```

### 2. 隐私保护时机表
```mermaid
graph TD
    A[游戏状态] --> B{需要保护的时机}
    B --> C[牌堆状态]
    B --> D[玩家手牌]
    B --> E[特殊卡牌效果]
    
    C --> C1[完全保密期]
    C1 --> C11[游戏进行中]
    C1 --> C12[洗牌后]
    
    C --> C2[部分解密期]
    C2 --> C21[预见未来时]
    C2 --> C22[改变未来时]
    
    D --> D1[完全保密期]
    D1 --> D11[持有手牌时]
    D1 --> D12[行动决策时]
    
    D --> D2[部分解密期]
    D2 --> D21[被偷看时]
    D2 --> D22[被标记时]
    
    E --> E1[完全保密期]
    E1 --> E11[放置爆炸猫]
    E1 --> E12[改变顺序]
    
    E --> E2[部分公开期]
    E2 --> E21[使用特殊卡时]
    E2 --> E22[效果生效时]
```

### 3. 关键隐私保护点

1. **牌堆信息(持续性保护)**
   - 保护内容：
     * 牌堆顺序
     * 特定位置的卡牌
     * 剩余卡牌数量统计
   - 解密条件：
     * 抽牌时对当前玩家解密
     * 使用预见未来时临时解密
     * 游戏结束时全部解密

2. **玩家手牌(选择性保护)**
   - 保护内容：
     * 持有的卡牌类型
     * 获得卡牌的顺序
   - 解密条件：
     * 被偷看时向特定玩家解密
     * 使用卡牌时公开
     * 被标记时部分公开
     * 淘汰时完全公开

3. **特殊卡牌效果(临时性保护)**
   - 保护内容：
     * 预见未来的信息
     * 改变未来的新顺序
     * 爆炸猫的放置位置
   - 解密条件：
     * 效果目标玩家可见
     * 效果触发时解密
     * 效果结束后重新加密

4. **玩家行动(实时性保护)**
   - 保护内容：
     * 行动选择
     * 目标选择
     * 连锁反应决策
   - 解密条件：
     * 行动提交后公开
     * 效果生效时公开
     * 回合结束时全部公开

### 4. 信息保护责任链
```mermaid
flowchart TD
    A[游戏状态] --> B[加密层]
    B --> C[验证层]
    C --> D[业务层]
    
    B --> B1[牌堆加密]
    B --> B2[手牌加密]
    B --> B3[行动加密]
    
    C --> C1[零知识证明]
    C --> C2[状态验证]
    C --> C3[行动验证]
    
    D --> D1[游戏逻辑]
    D --> D2[状态同步]
    D --> D3[玩家交互]
```

这些隐私保护机制需要确保:
1. 游戏公平性
2. 数据隐私性
3. 操作不可否认性
4. 状态可验证性

在迁移到Web3时,这些保护机制需要通过零知识证明、同态加密等密码学工具来实现。
