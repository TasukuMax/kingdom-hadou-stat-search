const CHARACTERS = [
  {
    name: "オルド",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/546513",
    attack: 712,
    defense: 634,
    war: 696,
    strategy: 538,
    charm: 642
  },
  {
    name: "バジオウ",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519318",
    attack: 799,
    defense: 755,
    war: 738,
    strategy: 435,
    charm: 729
  },
  {
    name: "信(臨時千人将)",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/533475",
    attack: 783,
    defense: 686,
    war: 712,
    strategy: 390,
    charm: 712
  },
  {
    name: "呉慶",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/527706",
    attack: 729,
    defense: 799,
    war: 783,
    strategy: 747,
    charm: 503
  },
  {
    name: "呉鳳明",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/549059",
    attack: 677,
    defense: 755,
    war: 642,
    strategy: 783,
    charm: 634
  },
  {
    name: "嬴政",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519317",
    attack: 660,
    defense: 651,
    war: 703,
    strategy: 729,
    charm: 825
  },
  {
    name: "廉頗",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/541917",
    attack: 808,
    defense: 799,
    war: 825,
    strategy: 738,
    charm: 799
  },
  {
    name: "摎",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/537926",
    attack: 808,
    defense: 677,
    war: 808,
    strategy: 755,
    charm: 773
  },
  {
    name: "李牧",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/546515",
    attack: 609,
    defense: 712,
    war: 686,
    strategy: 860,
    charm: 738
  },
  {
    name: "楊端和",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519321",
    attack: 825,
    defense: 834,
    war: 808,
    strategy: 686,
    charm: 842
  },
  {
    name: "汗明",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/546514",
    attack: 842,
    defense: 677,
    war: 703,
    strategy: 547,
    charm: 712
  },
  {
    name: "王翦",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/546512",
    attack: 747,
    defense: 755,
    war: 668,
    strategy: 834,
    charm: 677
  },
  {
    name: "王賁",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/533477",
    attack: 677,
    defense: 642,
    war: 764,
    strategy: 538,
    charm: 712
  },
  {
    name: "王騎",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519322",
    attack: 842,
    defense: 842,
    war: 825,
    strategy: 755,
    charm: 825
  },
  {
    name: "羌瘣",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519316",
    attack: 764,
    defense: 651,
    war: 747,
    strategy: 529,
    charm: 468
  },
  {
    name: "蒙恬",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/533476",
    attack: 625,
    defense: 696,
    war: 581,
    strategy: 721,
    charm: 738
  },
  {
    name: "蒙驁",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/536784",
    attack: 668,
    defense: 783,
    war: 642,
    strategy: 660,
    charm: 738
  },
  {
    name: "輪虎",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/533474",
    attack: 808,
    defense: 616,
    war: 634,
    strategy: 738,
    charm: 642
  },
  {
    name: "騰",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519319",
    attack: 790,
    defense: 816,
    war: 808,
    strategy: 634,
    charm: 721
  },
  {
    name: "麃公",
    tenpu: 900,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519320",
    attack: 825,
    defense: 816,
    war: 790,
    strategy: 634,
    charm: 816
  },
  {
    name: "シュンメン",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519309",
    attack: 729,
    defense: 572,
    war: 597,
    strategy: 464,
    charm: 555
  },
  {
    name: "タジフ",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519311",
    attack: 738,
    defense: 622,
    war: 613,
    strategy: 323,
    charm: 472
  },
  {
    name: "ランカイ",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519310",
    attack: 812,
    defense: 754,
    war: 605,
    strategy: 74,
    charm: 182
  },
  {
    name: "介子坊",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/533478",
    attack: 729,
    defense: 680,
    war: 597,
    strategy: 489,
    charm: 464
  },
  {
    name: "信(童)",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519315",
    attack: 705,
    defense: 646,
    war: 671,
    strategy: 356,
    charm: 680
  },
  {
    name: "壁",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519313",
    attack: 581,
    defense: 680,
    war: 605,
    strategy: 547,
    charm: 563
  },
  {
    name: "姜燕",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/533479",
    attack: 622,
    defense: 514,
    war: 680,
    strategy: 664,
    charm: 605
  },
  {
    name: "宮元",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/527705",
    attack: 563,
    defense: 522,
    war: 655,
    strategy: 671,
    charm: 563
  },
  {
    name: "成恢",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/546516",
    attack: 597,
    defense: 456,
    war: 505,
    strategy: 671,
    charm: 489
  },
  {
    name: "成蟜",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519308",
    attack: 406,
    defense: 381,
    war: 522,
    strategy: 754,
    charm: 356
  },
  {
    name: "漂",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519314",
    attack: 605,
    defense: 671,
    war: 572,
    strategy: 664,
    charm: 713
  },
  {
    name: "縛虎申",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/524924",
    attack: 713,
    defense: 505,
    war: 646,
    strategy: 547,
    charm: 505
  },
  {
    name: "臨武君",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/546517",
    attack: 729,
    defense: 622,
    war: 605,
    strategy: 480,
    charm: 581
  },
  {
    name: "録嗚未",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519312",
    attack: 729,
    defense: 721,
    war: 630,
    strategy: 480,
    charm: 613
  },
  {
    name: "関常",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/533487",
    attack: 597,
    defense: 680,
    war: 555,
    strategy: 597,
    charm: 514
  },
  {
    name: "陸仙",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/533488",
    attack: 671,
    defense: 630,
    war: 622,
    strategy: 505,
    charm: 547
  },
  {
    name: "項翼",
    tenpu: 850,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/546546",
    attack: 721,
    defense: 588,
    war: 613,
    strategy: 415,
    charm: 539
  },
  {
    name: "オギコ",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/546547",
    attack: 591,
    defense: 543,
    war: 454,
    strategy: 119,
    charm: 591
  },
  {
    name: "バミュウ",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/546518",
    attack: 583,
    defense: 566,
    war: 527,
    strategy: 640,
    charm: 439
  },
  {
    name: "ムタ",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/522277",
    attack: 623,
    defense: 566,
    war: 607,
    strategy: 607,
    charm: 320
  },
  {
    name: "同金",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519299",
    attack: 671,
    defense: 663,
    war: 599,
    strategy: 447,
    charm: 527
  },
  {
    name: "向",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519293",
    attack: 351,
    defense: 463,
    war: 359,
    strategy: 495,
    charm: 631
  },
  {
    name: "尚鹿",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519297",
    attack: 591,
    defense: 566,
    war: 575,
    strategy: 486,
    charm: 614
  },
  {
    name: "干央",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519305",
    attack: 679,
    defense: 694,
    war: 566,
    strategy: 463,
    charm: 551
  },
  {
    name: "徐完",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519294",
    attack: 623,
    defense: 607,
    war: 519,
    strategy: 454,
    charm: 335
  },
  {
    name: "昌文君",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519301",
    attack: 591,
    defense: 607,
    war: 623,
    strategy: 646,
    charm: 575
  },
  {
    name: "楚水",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519302",
    attack: 575,
    defense: 583,
    war: 646,
    strategy: 543,
    charm: 527
  },
  {
    name: "河了貂",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519307",
    attack: 447,
    defense: 495,
    war: 560,
    strategy: 640,
    charm: 646
  },
  {
    name: "渕",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519306",
    attack: 551,
    defense: 640,
    war: 566,
    strategy: 511,
    charm: 560
  },
  {
    name: "玄峰",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/533480",
    attack: 447,
    defense: 560,
    war: 655,
    strategy: 687,
    charm: 423
  },
  {
    name: "瑠衣",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/540104",
    attack: 374,
    defense: 391,
    war: 391,
    strategy: 591,
    charm: 726
  },
  {
    name: "白亀西",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519298",
    attack: 431,
    defense: 439,
    war: 495,
    strategy: 431,
    charm: 663
  },
  {
    name: "紫夏",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519291",
    attack: 439,
    defense: 431,
    war: 471,
    strategy: 720,
    charm: 663
  },
  {
    name: "蒙毅",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519296",
    attack: 374,
    defense: 623,
    war: 591,
    strategy: 646,
    charm: 566
  },
  {
    name: "陽",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519292",
    attack: 367,
    defense: 400,
    war: 374,
    strategy: 511,
    charm: 631
  },
  {
    name: "隆国",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519300",
    attack: 551,
    defense: 599,
    war: 640,
    strategy: 591,
    charm: 566
  },
  {
    name: "魏加",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519295",
    attack: 623,
    defense: 431,
    war: 607,
    strategy: 503,
    charm: 406
  },
  {
    name: "鱗坊",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519304",
    attack: 655,
    defense: 687,
    war: 566,
    strategy: 471,
    charm: 527
  },
  {
    name: "黄離弦",
    tenpu: 800,
    sourceUrl: "https://gamewith.jp/kingdom-hadou/519303",
    attack: 640,
    defense: 543,
    war: 519,
    strategy: 447,
    charm: 480
  },
];
