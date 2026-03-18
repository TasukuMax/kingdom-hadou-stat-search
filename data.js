const CHARACTERS = [
  {
    "name": "オルド",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/546513",
    "skills": [
      "猛者",
      "統制",
      "山読",
      "雄心"
    ],
    "attack": 712,
    "defense": 634,
    "war": 696,
    "strategy": 538,
    "conditionalSkills": [
      {
        "name": "山読",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、自身と同じ個性を持つ武将の人数×1.5%、部隊の防御と対物が上昇",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/546520"
      },
      {
        "name": "雄心",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、自身と同じ個性を持つ武将の人数×1%、部隊の攻撃、防御上昇",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543329"
      }
    ],
    "conditionTags": [
      "main"
    ]
  },
  {
    "name": "バジオウ",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519318",
    "skills": [
      "豪傑",
      "練武",
      "戦士",
      "扶助"
    ],
    "attack": 799,
    "defense": 755,
    "war": 738,
    "strategy": 435,
    "conditionalSkills": [
      {
        "name": "戦士",
        "conditions": [
          "main",
          "vice"
        ],
        "initialEffect": "自身が主将か、副将で主将と共通する個性が合計3個以上の場合、部隊の攻撃速度+10%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543325"
      },
      {
        "name": "扶助",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543332"
      }
    ],
    "conditionTags": [
      "main",
      "vice",
      "aide"
    ]
  },
  {
    "name": "信(臨時千人将)",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/533475",
    "skills": [
      "鋭鋒",
      "練武",
      "大勇",
      "不屈"
    ],
    "attack": 783,
    "defense": 686,
    "war": 712,
    "strategy": 390,
    "conditionalSkills": [
      {
        "name": "大勇",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、部隊の攻撃、戦威、対物+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543334"
      }
    ],
    "conditionTags": [
      "main"
    ]
  },
  {
    "name": "呉慶",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/527706",
    "skills": [
      "頑健",
      "開智",
      "報復",
      "後備"
    ],
    "attack": 729,
    "defense": 799,
    "war": 783,
    "strategy": 747,
    "conditionalSkills": [
      {
        "name": "報復",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、反撃による与ダメージ+100% 反撃時、反撃対象の1部隊の攻撃を10%低下(6秒)",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543317"
      },
      {
        "name": "後備",
        "conditions": [
          "back"
        ],
        "initialEffect": "自身が陣形の後列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543341"
      }
    ],
    "conditionTags": [
      "back",
      "main"
    ]
  },
  {
    "name": "呉鳳明",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/549059",
    "skills": [
      "聡明",
      "開智",
      "堅靭",
      "攻城"
    ],
    "attack": 677,
    "defense": 755,
    "war": 642,
    "strategy": 783,
    "conditionalSkills": [
      {
        "name": "堅靭",
        "conditions": [
          "main",
          "vice"
        ],
        "initialEffect": "自身が主将か副将の場合、自部隊の兵力が30％以下になった際に1度だけ、自身1部隊に通常攻撃回避100％を付与（10秒）",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/549060"
      }
    ],
    "conditionTags": [
      "main",
      "vice"
    ]
  },
  {
    "name": "嬴政",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519317",
    "skills": [
      "威風",
      "統制",
      "雄心",
      "堅実"
    ],
    "attack": 660,
    "defense": 651,
    "war": 703,
    "strategy": 729,
    "conditionalSkills": [
      {
        "name": "雄心",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、自身と同じ個性を持つ武将の人数×1%、部隊の攻撃、防御上昇",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543329"
      }
    ],
    "conditionTags": [
      "main"
    ]
  },
  {
    "name": "廉頗",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/541917",
    "skills": [
      "威風",
      "洞察",
      "伝熱",
      "尖撃"
    ],
    "attack": 808,
    "defense": 799,
    "war": 825,
    "strategy": 738,
    "conditionalSkills": [
      {
        "name": "伝熱",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、交戦開始時、軍勢内の攻撃速度上昇が付与されていない部隊に攻撃速度上昇10%を付与（10秒）",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543312"
      }
    ],
    "conditionTags": [
      "main"
    ]
  },
  {
    "name": "摎",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/537926",
    "skills": [
      "雄心",
      "練武",
      "戦神子",
      "攻陣"
    ],
    "attack": 808,
    "defense": 677,
    "war": 808,
    "strategy": 755,
    "conditionalSkills": [
      {
        "name": "雄心",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、自身と同じ個性を持つ武将の人数×1%、部隊の攻撃、防御上昇",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543329"
      },
      {
        "name": "戦神子",
        "conditions": [
          "main",
          "vice"
        ],
        "initialEffect": "自身が主将で、副将と共通する個性が合計3個以上の場合、部隊の戦威+10% 軍勢内全部隊の機動+10%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543313"
      },
      {
        "name": "攻陣",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543345"
      }
    ],
    "conditionTags": [
      "front",
      "main",
      "vice"
    ]
  },
  {
    "name": "李牧",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/546515",
    "skills": [
      "掃討",
      "開智",
      "才賢",
      "俊才"
    ],
    "attack": 609,
    "defense": 712,
    "war": 686,
    "strategy": 860,
    "conditionalSkills": [
      {
        "name": "才賢",
        "conditions": [
          "main"
        ],
        "initialEffect": "自紙が主将の場合、交戦開始時、攻撃対象の部隊に攻撃速度低下が付与されていなければ、攻撃速度低下50％を付与（12秒）",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/546522"
      },
      {
        "name": "俊才",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の際、部隊の防御、戦威、策略+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543315"
      }
    ],
    "conditionTags": [
      "main"
    ]
  },
  {
    "name": "楊端和",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519321",
    "skills": [
      "鋭鋒",
      "練武",
      "死王",
      "枢機"
    ],
    "attack": 825,
    "defense": 834,
    "war": 808,
    "strategy": 686,
    "conditionalSkills": [
      {
        "name": "死王",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、部隊の会心発生率+10% 交戦開始時、自身1部隊に攻撃速度上昇20%を付与（15秒）",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543326"
      },
      {
        "name": "枢機",
        "conditions": [
          "middle"
        ],
        "initialEffect": "自身が陣形の中列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543342"
      }
    ],
    "conditionTags": [
      "middle",
      "main"
    ]
  },
  {
    "name": "汗明",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/546514",
    "skills": [
      "尖撃",
      "練武",
      "巨人",
      "大勇"
    ],
    "attack": 842,
    "defense": 677,
    "war": 703,
    "strategy": 547,
    "conditionalSkills": [
      {
        "name": "巨人",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、交戦開始時、自部隊に攻撃上昇が付与されていなければ、自身1部隊に攻撃上昇15％を付与（25秒）",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/546521"
      },
      {
        "name": "大勇",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、部隊の攻撃、戦威、対物+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543334"
      }
    ],
    "conditionTags": [
      "main"
    ]
  },
  {
    "name": "王翦",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/546512",
    "skills": [
      "聡明",
      "洞察",
      "不敗",
      "衆兵"
    ],
    "attack": 747,
    "defense": 755,
    "war": 668,
    "strategy": 834,
    "conditionalSkills": [
      {
        "name": "不敗",
        "conditions": [
          "main",
          "vice"
        ],
        "initialEffect": "自身が主将か、護タイプ部隊の副将の場合、攻撃対象以外からの被ダメージ₋3% （自身が主将の場合、さらに₋7%）",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/546519"
      },
      {
        "name": "衆兵",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、部隊の兵力+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543335"
      }
    ],
    "conditionTags": [
      "main",
      "vice"
    ]
  },
  {
    "name": "王賁",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/533477",
    "skills": [
      "尖撃",
      "統制",
      "俊才",
      "攻陣"
    ],
    "attack": 677,
    "defense": 642,
    "war": 764,
    "strategy": 538,
    "conditionalSkills": [
      {
        "name": "俊才",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の際、部隊の防御、戦威、策略+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543315"
      },
      {
        "name": "攻陣",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543345"
      }
    ],
    "conditionTags": [
      "front",
      "main"
    ]
  },
  {
    "name": "王騎",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519322",
    "skills": [
      "威風",
      "統制",
      "怪鳥",
      "尖撃"
    ],
    "attack": 842,
    "defense": 842,
    "war": 825,
    "strategy": 755,
    "conditionalSkills": [
      {
        "name": "怪鳥",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、陣形効果算出の際 闘タイプとしても扱う",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543328"
      }
    ],
    "conditionTags": [
      "main"
    ]
  },
  {
    "name": "羌瘣",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519316",
    "skills": [
      "聡明",
      "開智",
      "攻陣",
      "助勢"
    ],
    "attack": 764,
    "defense": 651,
    "war": 747,
    "strategy": 529,
    "conditionalSkills": [
      {
        "name": "攻陣",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543345"
      },
      {
        "name": "助勢",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の戦威+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543331"
      }
    ],
    "conditionTags": [
      "front",
      "vice",
      "aide"
    ]
  },
  {
    "name": "蒙恬",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/533476",
    "skills": [
      "猛者",
      "開智",
      "雄心",
      "枢機"
    ],
    "attack": 625,
    "defense": 696,
    "war": 581,
    "strategy": 721,
    "conditionalSkills": [
      {
        "name": "雄心",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、自身と同じ個性を持つ武将の人数×1%、部隊の攻撃、防御上昇",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543329"
      },
      {
        "name": "枢機",
        "conditions": [
          "middle"
        ],
        "initialEffect": "自身が陣形の中列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543342"
      }
    ],
    "conditionTags": [
      "middle",
      "main"
    ]
  },
  {
    "name": "蒙驁",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/536784",
    "skills": [
      "頑健",
      "人望",
      "白老",
      "守壁"
    ],
    "attack": 668,
    "defense": 783,
    "war": 642,
    "strategy": 660,
    "conditionalSkills": [
      {
        "name": "白老",
        "conditions": [
          "main",
          "vice"
        ],
        "initialEffect": "自身が主将か、副将で主将と共通する個性が合計2個以上の場合、交戦開始時、自部隊に堅固が付与されていなければ、堅固5%を付与(10秒)",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543314"
      },
      {
        "name": "守壁",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543344"
      }
    ],
    "conditionTags": [
      "front",
      "main",
      "vice"
    ]
  },
  {
    "name": "輪虎",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/533474",
    "skills": [
      "掃討",
      "糧道",
      "飛槍",
      "俊才"
    ],
    "attack": 808,
    "defense": 616,
    "war": 634,
    "strategy": 738,
    "conditionalSkills": [
      {
        "name": "飛槍",
        "conditions": [
          "main",
          "vice"
        ],
        "initialEffect": "自身が主将か、副将で主将と共通する個性が合計3個以上の場合、部隊の攻撃速度、策略+5％",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543316"
      },
      {
        "name": "俊才",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の際、部隊の防御、戦威、策略+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543315"
      }
    ],
    "conditionTags": [
      "main",
      "vice"
    ]
  },
  {
    "name": "騰",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519319",
    "skills": [
      "猛者",
      "統制",
      "腹心",
      "破壁"
    ],
    "attack": 790,
    "defense": 816,
    "war": 808,
    "strategy": 634,
    "conditionalSkills": [
      {
        "name": "腹心",
        "conditions": [
          "main",
          "vice"
        ],
        "initialEffect": "自身が主将か、副将で主将と共通する個性が合計3個以上の場合、部隊の攻撃、防御、策略+3%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543324"
      },
      {
        "name": "破壁",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の対物+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543343"
      }
    ],
    "conditionTags": [
      "front",
      "main",
      "vice"
    ]
  },
  {
    "name": "麃公",
    "rarity": "SSR",
    "tenpu": 900,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519320",
    "skills": [
      "尖撃",
      "洞察",
      "炎将",
      "逆境"
    ],
    "attack": 825,
    "defense": 816,
    "war": 790,
    "strategy": 634,
    "conditionalSkills": [
      {
        "name": "炎将",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、部隊の攻撃+5% （自部隊が種火状態の場合5%、炎状態の場合10%、大炎状態の場合15%効果上昇）",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543327"
      }
    ],
    "conditionTags": [
      "main"
    ]
  },
  {
    "name": "シュンメン",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519309",
    "skills": [
      "掃討",
      "開智",
      "猛者",
      "攻陣"
    ],
    "attack": 729,
    "defense": 572,
    "war": 597,
    "strategy": 464,
    "conditionalSkills": [
      {
        "name": "攻陣",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543345"
      }
    ],
    "conditionTags": [
      "front"
    ]
  },
  {
    "name": "タジフ",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519311",
    "skills": [
      "鋭鋒",
      "統制",
      "攻城",
      "威風"
    ],
    "attack": 738,
    "defense": 622,
    "war": 613,
    "strategy": 323,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "ランカイ",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519310",
    "skills": [
      "攻城",
      "練武",
      "守壁",
      "鋭鋒"
    ],
    "attack": 812,
    "defense": 754,
    "war": 605,
    "strategy": 74,
    "conditionalSkills": [
      {
        "name": "守壁",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543344"
      }
    ],
    "conditionTags": [
      "front"
    ]
  },
  {
    "name": "介子坊",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/533478",
    "skills": [
      "尖撃",
      "練武",
      "発揚",
      "攻城"
    ],
    "attack": 729,
    "defense": 680,
    "war": 597,
    "strategy": 489,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "信(童)",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519315",
    "skills": [
      "逆境",
      "練武",
      "攻陣",
      "尖撃"
    ],
    "attack": 705,
    "defense": 646,
    "war": 671,
    "strategy": 356,
    "conditionalSkills": [
      {
        "name": "攻陣",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543345"
      }
    ],
    "conditionTags": [
      "front"
    ]
  },
  {
    "name": "壁",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519313",
    "skills": [
      "堅実",
      "人望",
      "不屈",
      "奮戦"
    ],
    "attack": 581,
    "defense": 680,
    "war": 605,
    "strategy": 547,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "姜燕",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/533479",
    "skills": [
      "猛者",
      "洞察",
      "助勢",
      "扶助"
    ],
    "attack": 622,
    "defense": 514,
    "war": 680,
    "strategy": 664,
    "conditionalSkills": [
      {
        "name": "助勢",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の戦威+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543331"
      },
      {
        "name": "扶助",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543332"
      }
    ],
    "conditionTags": [
      "vice",
      "aide"
    ]
  },
  {
    "name": "宮元",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/527705",
    "skills": [
      "尖撃",
      "開智",
      "堅実",
      "鋭鋒"
    ],
    "attack": 563,
    "defense": 522,
    "war": 655,
    "strategy": 671,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "成恢",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/546516",
    "skills": [
      "掃討",
      "開智",
      "黒弓",
      "助勢"
    ],
    "attack": 597,
    "defense": 456,
    "war": 505,
    "strategy": 671,
    "conditionalSkills": [
      {
        "name": "助勢",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の戦威+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543331"
      }
    ],
    "conditionTags": [
      "vice",
      "aide"
    ]
  },
  {
    "name": "成蟜",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519308",
    "skills": [
      "枢機",
      "糧道",
      "衆兵",
      "威風"
    ],
    "attack": 406,
    "defense": 381,
    "war": 522,
    "strategy": 754,
    "conditionalSkills": [
      {
        "name": "枢機",
        "conditions": [
          "middle"
        ],
        "initialEffect": "自身が陣形の中列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543342"
      },
      {
        "name": "衆兵",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、部隊の兵力+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543335"
      }
    ],
    "conditionTags": [
      "middle",
      "main"
    ]
  },
  {
    "name": "漂",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519314",
    "skills": [
      "逆境",
      "洞察",
      "守壁",
      "扶助"
    ],
    "attack": 605,
    "defense": 671,
    "war": 572,
    "strategy": 664,
    "conditionalSkills": [
      {
        "name": "守壁",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543344"
      },
      {
        "name": "扶助",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543332"
      }
    ],
    "conditionTags": [
      "front",
      "vice",
      "aide"
    ]
  },
  {
    "name": "縛虎申",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/524924",
    "skills": [
      "掃討",
      "練武",
      "逆境",
      "猛者"
    ],
    "attack": 713,
    "defense": 505,
    "war": 646,
    "strategy": 547,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "臨武君",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/546517",
    "skills": [
      "鋭鋒",
      "人望",
      "攻陣",
      "頑健"
    ],
    "attack": 729,
    "defense": 622,
    "war": 605,
    "strategy": 480,
    "conditionalSkills": [
      {
        "name": "攻陣",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543345"
      }
    ],
    "conditionTags": [
      "front"
    ]
  },
  {
    "name": "録嗚未",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519312",
    "skills": [
      "尖撃",
      "練武",
      "大勇",
      "猛者"
    ],
    "attack": 729,
    "defense": 721,
    "war": 630,
    "strategy": 480,
    "conditionalSkills": [
      {
        "name": "大勇",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、部隊の攻撃、戦威、対物+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543334"
      }
    ],
    "conditionTags": [
      "main"
    ]
  },
  {
    "name": "関常",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/533487",
    "skills": [
      "尖撃",
      "統制",
      "頑健",
      "俊才"
    ],
    "attack": 597,
    "defense": 680,
    "war": 555,
    "strategy": 597,
    "conditionalSkills": [
      {
        "name": "俊才",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の際、部隊の防御、戦威、策略+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543315"
      }
    ],
    "conditionTags": [
      "main"
    ]
  },
  {
    "name": "陸仙",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/533488",
    "skills": [
      "鋭鋒",
      "開智",
      "猛者",
      "発揚"
    ],
    "attack": 671,
    "defense": 630,
    "war": 622,
    "strategy": 505,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "項翼",
    "rarity": "SSR",
    "tenpu": 850,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/546546",
    "skills": [
      "発揚",
      "練武",
      "大勇",
      "掃討"
    ],
    "attack": 721,
    "defense": 588,
    "war": 613,
    "strategy": 415,
    "conditionalSkills": [
      {
        "name": "大勇",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、部隊の攻撃、戦威、対物+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543334"
      }
    ],
    "conditionTags": [
      "main"
    ]
  },
  {
    "name": "オギコ",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/546547",
    "skills": [
      "助勢",
      "糧道",
      "奇矯",
      "雄心"
    ],
    "attack": 591,
    "defense": 543,
    "war": 454,
    "strategy": 119,
    "conditionalSkills": [
      {
        "name": "助勢",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の戦威+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543331"
      },
      {
        "name": "雄心",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、自身と同じ個性を持つ武将の人数×1%、部隊の攻撃、防御上昇",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543329"
      }
    ],
    "conditionTags": [
      "main",
      "vice",
      "aide"
    ]
  },
  {
    "name": "バミュウ",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/546518",
    "skills": [
      "扶助",
      "糧道",
      "鋭鋒",
      "守壁"
    ],
    "attack": 583,
    "defense": 566,
    "war": 527,
    "strategy": 640,
    "conditionalSkills": [
      {
        "name": "扶助",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543332"
      },
      {
        "name": "守壁",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543344"
      }
    ],
    "conditionTags": [
      "front",
      "vice",
      "aide"
    ]
  },
  {
    "name": "ムタ",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/522277",
    "skills": [
      "鋭鋒",
      "練武",
      "掃討",
      "大勇"
    ],
    "attack": 623,
    "defense": 566,
    "war": 607,
    "strategy": 607,
    "conditionalSkills": [
      {
        "name": "大勇",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、部隊の攻撃、戦威、対物+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543334"
      }
    ],
    "conditionTags": [
      "main"
    ]
  },
  {
    "name": "同金",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519299",
    "skills": [
      "鋭鋒",
      "統制",
      "破壁",
      "扶助"
    ],
    "attack": 671,
    "defense": 663,
    "war": 599,
    "strategy": 447,
    "conditionalSkills": [
      {
        "name": "破壁",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の対物+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543343"
      },
      {
        "name": "扶助",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543332"
      }
    ],
    "conditionTags": [
      "front",
      "vice",
      "aide"
    ]
  },
  {
    "name": "向",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519293",
    "skills": [
      "堅実",
      "糧道",
      "献身",
      "扶助"
    ],
    "attack": 351,
    "defense": 463,
    "war": 359,
    "strategy": 495,
    "conditionalSkills": [
      {
        "name": "献身",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543333"
      },
      {
        "name": "扶助",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543332"
      }
    ],
    "conditionTags": [
      "vice",
      "aide"
    ]
  },
  {
    "name": "尚鹿",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519297",
    "skills": [
      "頑健",
      "洞察",
      "枢機",
      "奮戦"
    ],
    "attack": 591,
    "defense": 566,
    "war": 575,
    "strategy": 486,
    "conditionalSkills": [
      {
        "name": "枢機",
        "conditions": [
          "middle"
        ],
        "initialEffect": "自身が陣形の中列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543342"
      }
    ],
    "conditionTags": [
      "middle"
    ]
  },
  {
    "name": "干央",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519305",
    "skills": [
      "鋭鋒",
      "統制",
      "奮戦",
      "不屈"
    ],
    "attack": 679,
    "defense": 694,
    "war": 566,
    "strategy": 463,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "徐完",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519294",
    "skills": [
      "鋭鋒",
      "練武",
      "豪傑",
      "奮戦"
    ],
    "attack": 623,
    "defense": 607,
    "war": 519,
    "strategy": 454,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "昌文君",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519301",
    "skills": [
      "尖撃",
      "洞察",
      "防陣",
      "堅実"
    ],
    "attack": 591,
    "defense": 607,
    "war": 623,
    "strategy": 646,
    "conditionalSkills": [
      {
        "name": "防陣",
        "conditions": [
          "back"
        ],
        "initialEffect": "自身が陣形の後列にいる場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543340"
      }
    ],
    "conditionTags": [
      "back"
    ]
  },
  {
    "name": "楚水",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519302",
    "skills": [
      "掃討",
      "統制",
      "助勢",
      "奮戦"
    ],
    "attack": 575,
    "defense": 583,
    "war": 646,
    "strategy": 543,
    "conditionalSkills": [
      {
        "name": "助勢",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の戦威+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543331"
      }
    ],
    "conditionTags": [
      "vice",
      "aide"
    ]
  },
  {
    "name": "河了貂",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519307",
    "skills": [
      "聡明",
      "糧道",
      "後備",
      "扶助"
    ],
    "attack": 447,
    "defense": 495,
    "war": 560,
    "strategy": 640,
    "conditionalSkills": [
      {
        "name": "後備",
        "conditions": [
          "back"
        ],
        "initialEffect": "自身が陣形の後列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543341"
      },
      {
        "name": "扶助",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543332"
      }
    ],
    "conditionTags": [
      "back",
      "vice",
      "aide"
    ]
  },
  {
    "name": "渕",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519306",
    "skills": [
      "頑健",
      "糧道",
      "堅実",
      "守壁"
    ],
    "attack": 551,
    "defense": 640,
    "war": 566,
    "strategy": 511,
    "conditionalSkills": [
      {
        "name": "守壁",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543344"
      }
    ],
    "conditionTags": [
      "front"
    ]
  },
  {
    "name": "玄峰",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/533480",
    "skills": [
      "発揚",
      "糧道",
      "献策",
      "衆兵"
    ],
    "attack": 447,
    "defense": 560,
    "war": 655,
    "strategy": 687,
    "conditionalSkills": [
      {
        "name": "献策",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の策略+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543330"
      },
      {
        "name": "衆兵",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、部隊の兵力+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543335"
      }
    ],
    "conditionTags": [
      "main",
      "vice",
      "aide"
    ]
  },
  {
    "name": "瑠衣",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/540104",
    "skills": [
      "堅実",
      "洞察",
      "威風",
      "献身"
    ],
    "attack": 374,
    "defense": 391,
    "war": 391,
    "strategy": 591,
    "conditionalSkills": [
      {
        "name": "献身",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543333"
      }
    ],
    "conditionTags": [
      "vice",
      "aide"
    ]
  },
  {
    "name": "白亀西",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519298",
    "skills": [
      "威風",
      "人望",
      "衆兵",
      "防陣"
    ],
    "attack": 431,
    "defense": 439,
    "war": 495,
    "strategy": 431,
    "conditionalSkills": [
      {
        "name": "衆兵",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、部隊の兵力+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543335"
      },
      {
        "name": "防陣",
        "conditions": [
          "back"
        ],
        "initialEffect": "自身が陣形の後列にいる場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543340"
      }
    ],
    "conditionTags": [
      "back",
      "main"
    ]
  },
  {
    "name": "紫夏",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519291",
    "skills": [
      "不屈",
      "人望",
      "雄心",
      "献策"
    ],
    "attack": 439,
    "defense": 431,
    "war": 471,
    "strategy": 720,
    "conditionalSkills": [
      {
        "name": "雄心",
        "conditions": [
          "main"
        ],
        "initialEffect": "自身が主将の場合、自身と同じ個性を持つ武将の人数×1%、部隊の攻撃、防御上昇",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543329"
      },
      {
        "name": "献策",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の策略+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543330"
      }
    ],
    "conditionTags": [
      "main",
      "vice",
      "aide"
    ]
  },
  {
    "name": "蒙毅",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519296",
    "skills": [
      "攻城",
      "開智",
      "防陣",
      "威風"
    ],
    "attack": 374,
    "defense": 623,
    "war": 591,
    "strategy": 646,
    "conditionalSkills": [
      {
        "name": "防陣",
        "conditions": [
          "back"
        ],
        "initialEffect": "自身が陣形の後列にいる場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543340"
      }
    ],
    "conditionTags": [
      "back"
    ]
  },
  {
    "name": "陽",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519292",
    "skills": [
      "聡明",
      "糧道",
      "扶助",
      "枢機"
    ],
    "attack": 367,
    "defense": 400,
    "war": 374,
    "strategy": 511,
    "conditionalSkills": [
      {
        "name": "扶助",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543332"
      },
      {
        "name": "枢機",
        "conditions": [
          "middle"
        ],
        "initialEffect": "自身が陣形の中列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543342"
      }
    ],
    "conditionTags": [
      "middle",
      "vice",
      "aide"
    ]
  },
  {
    "name": "隆国",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519300",
    "skills": [
      "聡明",
      "開智",
      "守壁",
      "助勢"
    ],
    "attack": 551,
    "defense": 599,
    "war": 640,
    "strategy": 591,
    "conditionalSkills": [
      {
        "name": "守壁",
        "conditions": [
          "front"
        ],
        "initialEffect": "自身が陣形の前列にいる場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543344"
      },
      {
        "name": "助勢",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の戦威+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543331"
      }
    ],
    "conditionTags": [
      "front",
      "vice",
      "aide"
    ]
  },
  {
    "name": "魏加",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519295",
    "skills": [
      "尖撃",
      "練武",
      "後備",
      "堅実"
    ],
    "attack": 623,
    "defense": 431,
    "war": 607,
    "strategy": 503,
    "conditionalSkills": [
      {
        "name": "後備",
        "conditions": [
          "back"
        ],
        "initialEffect": "自身が陣形の後列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543341"
      }
    ],
    "conditionTags": [
      "back"
    ]
  },
  {
    "name": "鱗坊",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519304",
    "skills": [
      "頑健",
      "開智",
      "献策",
      "豪傑"
    ],
    "attack": 655,
    "defense": 687,
    "war": 566,
    "strategy": 471,
    "conditionalSkills": [
      {
        "name": "献策",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の策略+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543330"
      }
    ],
    "conditionTags": [
      "vice",
      "aide"
    ]
  },
  {
    "name": "黄離弦",
    "rarity": "SSR",
    "tenpu": 800,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519303",
    "skills": [
      "発揚",
      "練武",
      "後備",
      "防陣"
    ],
    "attack": 640,
    "defense": 543,
    "war": 519,
    "strategy": 447,
    "conditionalSkills": [
      {
        "name": "後備",
        "conditions": [
          "back"
        ],
        "initialEffect": "自身が陣形の後列にいる場合、部隊の攻撃+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543341"
      },
      {
        "name": "防陣",
        "conditions": [
          "back"
        ],
        "initialEffect": "自身が陣形の後列にいる場合、部隊の防御+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543340"
      }
    ],
    "conditionTags": [
      "back"
    ]
  },
  {
    "name": "カク備",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519279",
    "skills": [
      "攻城",
      "人望"
    ],
    "attack": 493,
    "defense": 487,
    "war": 461,
    "strategy": 493,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "丁之",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519276",
    "skills": [
      "鋭鋒",
      "練武"
    ],
    "attack": 422,
    "defense": 435,
    "war": 461,
    "strategy": 396,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "中鉄",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519288",
    "skills": [
      "鋭鋒",
      "練武"
    ],
    "attack": 461,
    "defense": 357,
    "war": 317,
    "strategy": 272,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "去亥",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519283",
    "skills": [
      "豪傑",
      "統制"
    ],
    "attack": 447,
    "defense": 467,
    "war": 305,
    "strategy": 266,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "崇原",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519287",
    "skills": [
      "掃討",
      "練武"
    ],
    "attack": 526,
    "defense": 441,
    "war": 428,
    "strategy": 343,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "来輝",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519277",
    "skills": [
      "奮戦",
      "糧道"
    ],
    "attack": 455,
    "defense": 480,
    "war": 447,
    "strategy": 415,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "松左",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519285",
    "skills": [
      "猛者",
      "開智"
    ],
    "attack": 467,
    "defense": 480,
    "war": 441,
    "strategy": 435,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "沛浪",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519290",
    "skills": [
      "豪傑",
      "統制"
    ],
    "attack": 415,
    "defense": 441,
    "war": 376,
    "strategy": 390,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "田有",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519289",
    "skills": [
      "攻城",
      "糧道"
    ],
    "attack": 526,
    "defense": 467,
    "war": 350,
    "strategy": 376,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "田永",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519286",
    "skills": [
      "頑健",
      "統制"
    ],
    "attack": 506,
    "defense": 487,
    "war": 382,
    "strategy": 357,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "番陽",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519281",
    "skills": [
      "頑健",
      "統制"
    ],
    "attack": 422,
    "defense": 461,
    "war": 441,
    "strategy": 382,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "石",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519282",
    "skills": [
      "聡明",
      "糧道"
    ],
    "attack": 357,
    "defense": 435,
    "war": 363,
    "strategy": 441,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "竜川",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519284",
    "skills": [
      "威風",
      "糧道"
    ],
    "attack": 538,
    "defense": 461,
    "war": 350,
    "strategy": 357,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "肆氏",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519278",
    "skills": [
      "聡明",
      "開智"
    ],
    "attack": 331,
    "defense": 396,
    "war": 422,
    "strategy": 577,
    "conditionalSkills": [],
    "conditionTags": []
  },
  {
    "name": "胡漸",
    "rarity": "SR",
    "tenpu": 650,
    "sourceUrl": "https://gamewith.jp/kingdom-hadou/519280",
    "skills": [
      "献策",
      "統制"
    ],
    "attack": 402,
    "defense": 467,
    "war": 376,
    "strategy": 396,
    "conditionalSkills": [
      {
        "name": "献策",
        "conditions": [
          "vice",
          "aide"
        ],
        "initialEffect": "自身が副将か補佐の場合、部隊の策略+4%",
        "sourceUrl": "https://gamewith.jp/kingdom-hadou/543330"
      }
    ],
    "conditionTags": [
      "vice",
      "aide"
    ]
  }
];
