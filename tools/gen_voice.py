"""用 lemo-opuscar-web 里的火山引擎语音合成，把游戏里所有语音台词生成成 mp3。
用法（在 fableGame 目录下）：
    ../lemo-opuscar-web/.venv/bin/python tools/gen_voice.py [--voice 音色] [--dialect dongbei|shaanxi|sichuan|none] [--only v07,v12] [--out 目录]
清潮（tide/）的语音用广西口音的音色，另起一套台词：
    ../lemo-opuscar-web/.venv/bin/python tools/gen_voice.py --set tide
广西口音没有方言参数，只有「广西远舟」这个 1.0 音色（zh_male_guangxiyuanzhou_moon_bigtts，资源 seed-tts-1.0），1.0 音色不支持语音指令，情绪靠台词和语速带。
输出 voice/<id>.mp3 和 voice/index.json（台词 -> {id, dur}）。台词改了就改下面的 LINES 再跑一遍，没变的句子走缓存不会重新请求。
"""
import os, sys, json, argparse, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TTS = os.path.join(ROOT, '..', 'lemo-opuscar-web', 'core', 'tts', 'tts_volc.py')
OUT = os.path.join(ROOT, 'td', 'voice')
WORK = os.path.join(OUT, '.work')

TOWERS = ['弩塔', '炮塔', '霜塔', '电塔', '光棱塔', '焰塔', '迫击炮', '狙击塔', '增幅塔']
ULTS = ['陨星坠', '雷霆万钧', '极寒领域', '天穹裁决', '虚空奇点', '流光剑阵']
# 每组：(语速, 语音指令, 台词列表)。语音指令是火山 2.0 音色的 context_texts，用自然语言描述情绪和语气
SHOUT = '用特别热血、霸气的语气大声怒吼出来，像游戏里释放终极大招，情绪拉满，尾音拖长'
HYPE = '像游戏解说员喊连杀一样，极度兴奋、夸张地大声喊出来，情绪非常高涨'
GROUPS = [
    ('+0%', SHOUT, ['陨星，坠落！', '雷霆，万钧！', '万物，冰封！', '天穹，裁决！', '虚空，吞噬！', '剑阵，落！']),
    ('+5%', HYPE, ['十连斩', '横扫千军', '所向披靡', '万夫莫敌', '天下无双', '首领已被击败', '大获全胜', '漂亮', '首杀']),
    ('+0%', '欣喜若狂、得意洋洋地大声欢呼', ['胜利']),
    ('+0%', '特别沮丧、懊恼，拖长声音叹着气说', ['失败']),
    ('+10%', '斗志昂扬、充满干劲地大声喊', ['守护晶塔', '升级完成', '最后一波，守住']),
    ('+12%', '语气非常紧张、着急，大声喊着提醒大家', ['晶塔告急', '晶塔正在遭受攻击', '防御塔被震瘫了', '首领来袭', '震地兽来袭，小心防御塔', '空中敌人来袭', '敌军来袭']),
    ('+10%', '干脆利落、带点得意和兴奋地喊', [u + '，就绪' for u in ULTS]),
    ('+0%', '气势十足、越说越激昂地大声宣告', [t + '，觉醒' for t in TOWERS]),
]
LINES = [(t, r, ins) for r, ins, ts in GROUPS for t in ts]

# 清潮的台词。句子和 tide/game.js 里 say() 用的文字必须一字不差
TIDE_WEAPONS = ['连弩', '散射铳', '回旋刃', '雷光炮', '冰晶长枪', '追踪飞弹', '连锁闪电', '烈焰喷射', '棱光射线']
TIDE_ALLIES = ['晶石巨像', '炎翼飞龙', '雷鼓巨龟', '星弓巨灵', '冰潮巨鲸', '晶盾卫士']
TIDE_GROUPS = [
    ('+8%', '', ['蚀潮来了，顶住！', '巨人来了！', '巨人倒下了！', '首领来袭！', '首领已被击败！', '狂热！杀！', '连环爆炸！', '防线告急！', '防线失守了', '新纪录！', '冰块滑走了', '蚀潮更猛了！']),
    ('+10%', '', ['势如破竹！', '横扫千军！', '所向披靡！', '万夫莫敌！', '天下无双！']),
    ('+8%', '', ['队员加一！', '射速提升！', '伤害提升！', '清场冲击！']),
    ('+8%', '', ['新武器，' + w + '！' for w in TIDE_WEAPONS]),
    ('+5%', '', [a + '，出击！' for a in TIDE_ALLIES]),
]
# 吃啥拉啥的台词（eat/game.js 里 say() 用的文字）
EAT_GROUPS = [('+8%', '', ['开吃', '便秘了', '超级加倍', '喷火屎', '巨无霸', '彩虹屎', '哎哟，被咬了', '新纪录', '跑不动了', '一泻千里', '馋嘴怪更多了']),
              ('+12%', '', ['连珠屁', '爆米花屁', '机关枪屁', '火辣屁', '喷火龙屁', '烧腚屁', '冰凉屁', '透心凉屁', '薄荷屁', '惊天响屁', '震楼屁', '崩山屁', '闷雷屁', '滚地雷屁', '大炮屁', '彩虹屁', '七彩祥云屁', '仙女屁', '憋屁', '哑屁', '拖拉机屁', '核弹屁'])]
# 搓澡大师的台词（scrub/game.js 里 say() 用的文字）
SCRUB_GROUPS = [('+8%', '', ['下一位', '搓干净了', '老板大气', '不洗了，走了', '关门大吉', '哎哟，轻点', '泡泡时间', '舒服', '对，就是这里', '手法可以', '用力点，没吃饭吗'])]
# 摸鱼大师的台词（moyu/game.js 里 say() 用的文字）
MOYU_GROUPS = [('+8%', '', ['好好干', '吓死我了', '谁在摸鱼', '扣工资', '上班时间干嘛呢', '你被开除了', '装了摄像头', '小心巡查', '摸鱼真爽', '下班啦']),
               ('+12%', '', ['刷短视频', '喝奶茶', '吃零食', '网购', '看小说', '修指甲', '聊八卦', '追剧', '炒股', '织毛衣', '打游戏', '斗地主', '撸猫', '敷面膜', '睡大觉', '带薪拉屎', '泡个脚', '煮火锅'])]
# 挤地铁的台词（metro/game.js 里 say() 用的文字）
METRO_GROUPS = [('+8%', '', ['车门即将关闭', '往里走，往里走', '别挤了', '先下后上', '挤上去了', '下一趟', '投诉你', '我要下车', '末班车开走了']),
                ('+5%', '', [n + '站到了' for n in ['西二旗', '天通苑', '国贸', '西直门', '人民广场', '徐家汇', '体育西路', '珠江新城', '车公庙', '春熙路', '街道口', '朝阳广场', '金钟', '台北车站', '新宿', '涩谷', '池袋', '梅田', '新道林', '江南', '达达尔', '拉吉夫广场', '裕廊东', '暹罗', '塔夫脱大道', '牛津圆环', '银行', '夏特雷', '共青团', '时代广场', '潘提特兰', '主教座堂', '烈士']])]
# 捏泡泡纸的台词（pop/game.js 里 say() 用的文字）
POP_GROUPS = [('+8%', '', ['开捏', '爽', '手速狂魔', '连环爆', '臭死了', '别捏那个', '捏完了', '下一张', '时间到'])]
# 夜市套圈的台词（ring/game.js 里 say() 用的文字）
RING_GROUPS = [('+8%', '', ['来来来，套圈', '哎呀脚滑了', '亏本了亏本了', '手气可以哦', '套中了', '差一点点', '再来再来', '收摊了'])]
# 相亲角速配的台词（match/game.js 里 say() 用的文字）
MATCH_GROUPS = [('+8%', '', ['我要求不高的', '换个要求', '成了成了', '你这什么眼神', '这么好的你不要', '快点嘛', '不找了，回家'])]
# 怒砸办公室的台词（smash/game.js 里 say() 用的文字）
SMASH_GROUPS = [('+10%', '', ['开砸', '爽', '砸得好', '暴走', '这个值钱', '下一间', '保安来了', '打卡机，砸'])]
# 皮衣老黄的台词（chip/game.js 里 say() 用的文字）
CHIP_GROUPS = [('+8%', '', ['我回来了', '皮衣穿好，开干', '拿下', '这块地盘归我了', '货不够啊', '钱不够啊', '地盘被抢了', '稳住，别慌', '还有一件事', '买得越多，省得越多', '全场起立', '吹过头了', '市值第一了', '又被赶走了', '王者归来'])]
# 广州漂移的台词（gz/game.js 里 say() 用的文字），粤语
GZ_GROUPS = [('+6%', '', ['开工啦', '你嘅外卖到啦', '多谢晒', '好嘢', '犀利', '漂移啊', '哎呀，撞亲啦', '啲汤倒泻晒啦', '快啲啦', '收工啦'])]
# 骑手的台词（rider/sim.js 里 say() 用的文字）：平台的系统提示音是普通话女声，骑手自己的碎碎念是广西口音
RIDER_SYS = '像外卖平台骑手端的系统语音播报，亲切、清晰、语速偏快，带一点机械的客服腔'
RIDER_SYS_GROUPS = [('+12%', RIDER_SYS, ['前方学校路段，请减速慢行', '您已超速', '前方施工，请注意避让', '您已上线，开始接单', '您有新的回声外卖订单', '订单即将超时，请尽快送达', '订单已超时', '已为您优化预计送达时间', '今日冲单奖励已到账', '您收到一条差评', '您收到一笔打赏', '天气恶劣，请注意安全', '电量不足，请及时换电', '到达取餐点', '到达送餐点', '请减速，目的地就在附近'])]
# 骑手遇到的人：妈妈、顾客、站长。用能调情绪的女声，每组一条语气指令
RIDER_NPC_GROUPS = [
    ('-5%', '像妈妈给在外打工的孩子打电话，温柔、心疼、带点唠叨，语速慢，声音有点年纪', ['吃饭没？别太拼了，早点收工。', '下雨了，慢点骑，安全第一。', '钱够不够用？不够跟妈讲。']),
    ('+15%', '饿着肚子等外卖等急了的年轻顾客，非常不耐烦、着急、带着火气质问', ['怎么还没到啊？我都饿死了！', '再不到我就投诉了啊！']),
    ('+0%', '体谅外卖员的顾客，温和、真诚、带着感谢和关心', ['下雨天慢点没关系，注意安全。', '辛苦了，给你拿了瓶水。', '谢谢你啊，这么大雨还送。']),
    ('+5%', '外卖站的站长在电话里训人，严厉、冷淡、有压迫感，公事公办', ['你这周准时率掉了啊，再这样要降级了。']),
    ('+0%', '路口执勤的交警，严肃、干脆、有威严，但不凶', ['你好，例行检查，靠边停一下。', '没问题，走吧，注意安全。', '这次给你警告，下次要罚款了。', '违章了，开罚单。']),
    ('+10%', '开车门不小心撞到人的司机，慌张、连声道歉', ['哎哟对不起对不起，没看到你！']),
    ('+10%', '差点被电动车撞到的路人，又惊又气地喊', ['你怎么骑车的！']),
]
RIDER_GROUPS = [('+8%', '', ['完了，有交警', '又罚款', '吓死我了', '看路啊大哥', '堵死了', '今天手气不错', '这单舒服', '还是有好人的', '妈，我吃了，你别操心', '催什么催，我也想快', '又扣我钱', '唉，不想跑了', '算了，再跑一单', '顶得住', '好累啊', '歇口气先', '又来单了', '这么远才给这点', '出餐快点嘛老板', '哎哟，摔了', '完了，汤洒了', '搞定，下一单', '又超时了', '下雨了，单多起来了', '累死了，收工', '谢谢老板', '这系统，越跑越紧', '您的外卖到了', '爬楼去咯', '红灯，等一下'])]
MERIT_GROUPS = [('+8%', '', ['开坛摇人', '中了中了', '天师来啦', '渡劫成功', '香火不够啦', '又没中', '顶住顶住', '大家伙来啦', '镇妖大捷', '结界破啦'])]
SETS = {'td': dict(groups=GROUPS, out=OUT, voice='zh_female_vv_uranus_bigtts', dialect='shaanxi', resource='seed-tts-2.0'),
        'eat': dict(groups=EAT_GROUPS, out=os.path.join(ROOT, 'eat', 'voice'), voice='zh_male_guangxiyuanzhou_moon_bigtts', dialect='none', resource='seed-tts-1.0'),
        'scrub': dict(groups=SCRUB_GROUPS, out=os.path.join(ROOT, 'scrub', 'voice'), voice='zh_male_guangxiyuanzhou_moon_bigtts', dialect='none', resource='seed-tts-1.0'),
        'moyu': dict(groups=MOYU_GROUPS, out=os.path.join(ROOT, 'moyu', 'voice'), voice='zh_male_guangxiyuanzhou_moon_bigtts', dialect='none', resource='seed-tts-1.0'),
        'metro': dict(groups=METRO_GROUPS, out=os.path.join(ROOT, 'metro', 'voice'), voice='zh_male_guangxiyuanzhou_moon_bigtts', dialect='none', resource='seed-tts-1.0'),
        'pop': dict(groups=POP_GROUPS, out=os.path.join(ROOT, 'pop', 'voice'), voice='zh_male_guangxiyuanzhou_moon_bigtts', dialect='none', resource='seed-tts-1.0'),
        'ring': dict(groups=RING_GROUPS, out=os.path.join(ROOT, 'ring', 'voice'), voice='zh_male_guangxiyuanzhou_moon_bigtts', dialect='none', resource='seed-tts-1.0'),
        'match': dict(groups=MATCH_GROUPS, out=os.path.join(ROOT, 'match', 'voice'), voice='zh_male_guangxiyuanzhou_moon_bigtts', dialect='none', resource='seed-tts-1.0'),
        'smash': dict(groups=SMASH_GROUPS, out=os.path.join(ROOT, 'smash', 'voice'), voice='zh_male_guangxiyuanzhou_moon_bigtts', dialect='none', resource='seed-tts-1.0'),
        'chip': dict(groups=CHIP_GROUPS, out=os.path.join(ROOT, 'chip', 'voice'), voice='zh_male_guangxiyuanzhou_moon_bigtts', dialect='none', resource='seed-tts-1.0'),
        'merit': dict(groups=MERIT_GROUPS, out=os.path.join(ROOT, 'merit', 'voice'), voice='zh_male_guangxiyuanzhou_moon_bigtts', dialect='none', resource='seed-tts-1.0'),
        'gz': dict(groups=GZ_GROUPS, out=os.path.join(ROOT, 'gz', 'voice'), voice='zh_female_wanqudashu_moon_bigtts', dialect='none', resource='seed-tts-1.0'),
        'rider': dict(groups=RIDER_GROUPS, out=os.path.join(ROOT, 'rider', 'voice'), voice='zh_male_guangxiyuanzhou_moon_bigtts', dialect='none', resource='seed-tts-1.0'),
        'rider_npc': dict(groups=RIDER_NPC_GROUPS, out=os.path.join(ROOT, 'rider', 'voice_npc'), voice='zh_female_vv_uranus_bigtts', dialect='none', resource='seed-tts-2.0'),
        'rider_sys': dict(groups=RIDER_SYS_GROUPS, out=os.path.join(ROOT, 'rider', 'voice_sys'), voice='zh_female_vv_uranus_bigtts', dialect='none', resource='seed-tts-2.0'),
        'tide': dict(groups=TIDE_GROUPS, out=os.path.join(ROOT, 'tide', 'voice'), voice='zh_male_guangxiyuanzhou_moon_bigtts', dialect='none', resource='seed-tts-1.0')}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--set', default='td', choices=list(SETS), help='td 塔防 / tide 清潮 / eat 吃啥拉啥')
    ap.add_argument('--voice', default=None)
    ap.add_argument('--resource', default=None)
    ap.add_argument('--dialect', default=None, help='dongbei 东北话 / shaanxi 陕西话 / sichuan 四川话（只有 vv 音色支持）；none 为普通话')
    ap.add_argument('--out', default=None, help='输出目录，试听别的口音时可以指到别处')
    ap.add_argument('--only', default='')
    a = ap.parse_args()
    S = SETS[a.set]
    for k in ('voice', 'dialect', 'out', 'resource'):
        if getattr(a, k) is None: setattr(a, k, S[k])
    lines = [(t, r, ins) for r, ins, ts in S['groups'] for t in ts]
    v2 = a.resource == 'seed-tts-2.0'
    os.makedirs(WORK, exist_ok=True); os.makedirs(a.out, exist_ok=True)
    only = set(filter(None, a.only.split(',')))
    def add(ins):
        d = {'context_texts': [ins]} if v2 and ins else {}
        if v2 and a.dialect != 'none': d['explicit_dialect'] = a.dialect
        return d or None
    items = [{'id': 'v%02d' % i, 'text': t, 'rate': r, 'resource': a.resource, 'additions': add(ins)} for i, (t, r, ins) in enumerate(lines)]
    todo = [x for x in items if not only or x['id'] in only]
    lj = os.path.join(WORK, 'lines.json')
    json.dump(todo, open(lj, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    r = subprocess.run([sys.executable, TTS, lj, WORK, '--voice', a.voice])
    if r.returncode: sys.exit(r.returncode)
    dur = json.load(open(os.path.join(WORK, 'dur.json'), encoding='utf-8'))
    for x in todo:   # 统一响度后转成小体积 mp3
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(WORK, x['id'] + '.wav'), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
                        '-ar', '24000', '-ac', '1', '-b:a', '48k', os.path.join(a.out, x['id'] + '.mp3')], check=True)
    ip = os.path.join(a.out, 'index.json')
    old = json.load(open(ip, encoding='utf-8')) if only and os.path.exists(ip) else {}
    idx = {x['text']: old.get(x['text'], {'id': x['id'], 'dur': 0}) for x in items}
    for x in todo: idx[x['text']] = {'id': x['id'], 'dur': dur[x['id']]}
    json.dump(idx, open(ip, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('done', len(todo), 'lines ->', a.out)


if __name__ == '__main__':
    main()
