// 游戏清单：加新游戏只改这里。首页的今日游戏、上新日历、全部游戏都从这张表生成。
//   id      存档里用的名字，定了就别改
//   no      第几期
//   date    上线日期（当天它就是「今日游戏」）；没有新游戏上线的日子，在已上线的游戏里按天轮换
//   url     游戏入口
//   cover   封面图（实机截图），pos 是裁切时的焦点位置
//   tags    用于筛选和搜索；screen 是 竖屏 / 横屏
//   record  读这个游戏自己的存档，返回首页上显示的那句成绩；没有成绩返回 ''
const read = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };

export const GAMES = [
  {
    id: 'td', no: 1, date: '2026-11-14', name: '晶塔守卫', url: 'td/', cover: 'covers/td.jpg', pos: '50% 50%',
    intro: '沿路摆下九种防御塔，守住晶塔。攒满能量就放六个大招，陨星、雷霆、冰封，一招清一片。',
    tags: ['塔防', '大招'], screen: '横屏', mins: 15, more: '键盘鼠标更顺手',
    record: () => { const s = read('echo_td'), n = s && Array.isArray(s.stars) ? s.stars.filter((x) => x > 0).length : 0; return n ? '已通关 <b>' + n + ' / 4</b> 关' : ''; },
  },
  {
    id: 'tide', no: 2, date: '2026-11-15', name: '清潮', url: 'tide/', cover: 'covers/tide.jpg', pos: '50% 52%',
    intro: '拖动小队左右走位，一边打碎冰块拿队员、武器和巨型帮手，一边清掉涌来的怪潮。怪多、脆、一打一大片。',
    tags: ['射击', '解压'], screen: '竖屏', mins: 5, more: '单手可玩',
    record: () => { const n = +(localStorage.getItem('echo_tide_best') || 0); return n ? '最高击杀 <b>' + n.toLocaleString() + '</b>' : ''; },
  },
  {
    id: 'eat', no: 3, date: '2026-11-15', name: '吃啥拉啥', url: 'eat/', cover: 'covers/eat.jpg', pos: '50% 62%',
    intro: '小兽吞吞一路狂奔，吃到什么就拉出什么：辣椒喷火、冰淇淋冰冻、西瓜拉出巨无霸。用它们砸翻身后追来的馋嘴怪。',
    tags: ['跑酷', '搞笑', '解压'], screen: '竖屏', mins: 4, more: '单手可玩',
    record: () => { const n = +(localStorage.getItem('echo_eat_best') || 0); return n ? '最高得分 <b>' + n.toLocaleString() + '</b>' : ''; },
  },
  {
    id: 'scrub', no: 4, date: '2026-11-15', name: '搓澡大师', url: 'scrub/', cover: 'covers/scrub.jpg', pos: '50% 45%',
    intro: '按住拖动搓澡巾，把顾客背上的泥搓成一根根泥条。躲开痛点、搓掉老泥，限时内搓干净就有小费，三个差评就关门。',
    tags: ['搓澡', '搞笑', '解压'], screen: '竖屏', mins: 4, more: '手指来回搓',
    record: () => { const n = +(localStorage.getItem('echo_scrub_best') || 0); return n ? '最高收入 <b>¥' + n.toLocaleString() + '</b>' : ''; },
  },
  {
    id: 'moyu', no: 5, date: '2026-11-15', name: '摸鱼大师', url: 'moyu/', cover: 'covers/moyu.jpg', pos: '50% 30%',
    intro: '按住就摸鱼，松手就装作在工作。摸得越久赚得越多、花样越离谱，但老板会回头、摄像头会亮红灯、HR 会路过，被盯到三次就开除。',
    tags: ['反应', '搞笑', '职场'], screen: '竖屏', mins: 5, more: '一根手指就能玩',
    record: () => { const n = +(localStorage.getItem('echo_moyu_best') || 0); return n ? '最高摸鱼收入 <b>¥' + n.toLocaleString() + '</b>' : ''; },
  },
  {
    id: 'metro', no: 6, date: '2026-11-15', name: '挤地铁', url: 'metro/', cover: 'covers/metro.jpg', pos: '50% 38%',
    intro: '早高峰站台，车门只开十几秒。按住拖动推手，把乘客一铲一铲塞进车厢，人挤人会变形、会被挤出来。要下车的得先放出来，没塞够就被投诉。',
    tags: ['物理', '搞笑', '解压'], screen: '竖屏', mins: 4, more: '手指推着玩',
    record: () => { const n = +(localStorage.getItem('echo_metro_best') || 0); return n ? '最高得分 <b>' + n.toLocaleString() + '</b>' : ''; },
  },
  {
    id: 'pop', no: 7, date: '2026-11-15', name: '捏泡泡纸', url: 'pop/', cover: 'covers/pop.jpg', pos: '50% 50%',
    intro: '手指划过去，泡泡啪啪啪地爆。限时一张接一张捏下去：金泡加时间，连环泡炸一片，厚泡要捏两下，臭屁泡千万别碰。',
    tags: ['手速', '解压'], screen: '竖屏', mins: 2, more: '划着玩',
    record: () => { const n = +(localStorage.getItem('echo_pop_best') || 0); return n ? '最高得分 <b>' + n.toLocaleString() + '</b>' : ''; },
  },
  {
    id: 'ring', no: 8, date: '2026-11-15', name: '夜市套圈', url: 'ring/', cover: 'covers/ring.jpg', pos: '50% 45%',
    intro: '夜市地摊，10 块钱 12 个圈。按住往上拖瞄准，松手把圈扔出去，圈住什么拿什么。越远的越值钱，大鹅会走，金条会滑，老板还会“脚滑”。',
    tags: ['投掷', '搞笑', '休闲'], screen: '竖屏', mins: 2, more: '拖一下扔一个',
    record: () => { const n = +(localStorage.getItem('echo_ring_best') || 0); return n ? '最高套到 <b>¥' + n.toLocaleString() + '</b>' : ''; },
  },
  {
    id: 'match', no: 9, date: '2026-11-15', name: '相亲角速配', url: 'match/', cover: 'covers/match.jpg', pos: '50% 28%',
    intro: '公园相亲角，大妈报出择偶条件，候选人一张张出来。全都符合往右划，有一条不符合往左划。条件越加越多、越来越绕，判错三次大妈就走人。',
    tags: ['眼力', '搞笑', '反应'], screen: '竖屏', mins: 3, more: '左右划卡片',
    record: () => { const n = +(localStorage.getItem('echo_match_best') || 0); return n ? '最高得分 <b>' + n.toLocaleString() + '</b>' : ''; },
  },
  {
    id: 'smash', no: 10, date: '2026-11-15', name: '怒砸办公室', url: 'smash/', cover: 'covers/smash.jpg', pos: '50% 62%',
    intro: '点哪砸哪，按住划过去一路砸。显示器、奖杯、鱼缸、打卡机、老板椅、保险柜全部碎成渣满地飞，连砸涨倍数，怒气满了暴走一棍一大片。保安到之前尽量砸。',
    tags: ['破坏', '解压', '手速'], screen: '竖屏', mins: 2, more: '点着划着砸',
    record: () => { const n = +(localStorage.getItem('echo_smash_best') || 0); return n ? '最高损失 <b>¥' + n.toLocaleString() + '</b>' : ''; },
  },
  {
    id: 'rider', no: 11, date: '2026-11-16', name: '骑手', url: 'rider/', cover: 'covers/rider.jpg', pos: '50% 58%',
    intro: '骑电动车在老城送外卖，从上午跑到深夜，晴、雨、雾轮着来。平台给每单一个时限：超时扣钱，你越准时，系统给的时间越紧。红灯闯不闯、暴雨天接不接单，自己掂量。',
    tags: ['模拟', '驾驶', '大作感'], screen: '横竖屏', mins: 12, more: '键盘或触屏',
    record: () => { try { const s = JSON.parse(localStorage.getItem('echo_rider')) || {}; return s.best ? '最高日入 <b>¥' + s.best.toFixed(1) + '</b>' : ''; } catch (e) { return ''; } },
  },
  {
    id: 'chip', no: 12, date: '2026-11-16', name: '皮衣老黄', url: 'chip/', cover: 'covers/chip.jpg', pos: '50% 50%',
    intro: '芯片公司核弹厂市值垫底，创始人老黄被请回来救场。12 个季度里搞研发、抢产能、在市场版图上一格一格抢地盘，对手也会来抢你的。发布会上参数吹多大自己定，吹过头就翻车。人物和公司纯属虚构。',
    tags: ['策略', '回合制', '商战'], screen: '竖屏', mins: 6, more: '点着玩，要动脑',
    record: () => { const n = +(localStorage.getItem('echo_chip_best') || 0); return n ? '最高市值 <b>' + n.toLocaleString() + ' 亿</b>' : ''; },
  },  {
    id: 'gz', no: 13, date: '2026-11-16', name: '广州漂移', url: 'gz/', cover: 'covers/gz.jpg', pos: '50% 55%',
    intro: '雨后的广州夜晚，骑着电鸡甩尾送外卖。一条环线从猎德大桥进珠江新城，绕过中山纪念堂，过海珠桥钻进骑楼老街和城中村，再从广州塔脚下回来。漂移攒小费，松手喷出去，撞了汤会洒，倒计时走完就收工。',
    tags: ['竞速', '漂移', '大作感'], screen: '横竖屏', mins: 3, more: '键盘或触屏',
    record: () => { const n = +(localStorage.getItem('echo_gz_best') || 0); return n ? '最高收入 <b>¥' + n.toLocaleString() + '</b>' : ''; },
  },  {
    id: 'merit', no: 14, date: '2026-11-20', name: '天师摇人', url: 'merit/', cover: 'covers/merit.jpg', pos: '50% 40%',
    intro: '拉一把八卦功德机，三个连成线就请出一件法器：桃木剑、糯米炮、雷公符、镇宅狮、招财猫。跳僵、纸人、飞头蛮、铁棺尸、白无常、鬼新娘从鬼门关一波波闯出来，最后是千年旱魃。同类法器拖到一起炼化，叠三层渡劫觉醒；三个天师印连线，钟馗下来清场。',
    tags: ['塔防', '老虎机', '合成'], screen: '横竖屏', mins: 6, more: '鼠标或触屏',
    record: () => { const n = +(localStorage.getItem('echo_merit_best') || 0); return n ? '最高功德 <b>' + n.toLocaleString() + '</b>' : ''; },
  },
];
