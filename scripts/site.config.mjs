export const siteOrigin = "https://chos1n11111.github.io/";

export const pages = [
  {
    path: "index.html",
    zhTitle: "朱泽南 | 同济大学人工智能专业本科生",
    zhDescription: "CHOS1N11111 的个人网站，展示教育经历、实习经历、开源项目与研究成果。"
  },
  {
    path: "work/smartsens/index.html",
    zhTitle: "思特威实习经历 | CHOS1N11111",
    zhDescription: "在思特威的软件开发实习经历，主要开发面向 CIS 测试工作流的领域专用 Agent 与可视化桌面软件。"
  },
  {
    path: "work/unisound/index.html",
    zhTitle: "云知声 AI Labs 实习经历 | CHOS1N11111",
    zhDescription: "在云知声 AI Labs 的实习经历，围绕新能源汽车销售数据的自然语言查数 Agent 开展自动化评测与优化。"
  },
  {
    path: "work/hrtps/index.html",
    zhTitle: "上海才历实习经历 | CHOS1N11111",
    zhDescription: "在才历算法部门的实习经历，开发面向 AI 面试与人才测评的 AIGC 自动出题系统。"
  },
  {
    path: "projects/dongqiudipure-android/index.html",
    zhTitle: "DongqiudiPure Android | CHOS1N11111",
    zhDescription: "DongqiudiPure Android 是使用 Kotlin 与 Jetpack Compose 构建的第三方懂球帝客户端，支持足球资讯、赛程赛果、赛事数据与球队和球员资料。本页展示项目介绍与界面截图。"
  },
  {
    path: "projects/tiebapure-android/index.html",
    zhTitle: "TiebaPure Android | CHOS1N11111",
    zhDescription: "TiebaPure Android 是使用 Kotlin 与 Jetpack Compose 原生构建的非官方百度贴吧客户端，支持访客浏览、账户功能与本地阅读管理。本页展示项目介绍与界面截图。"
  },
  {
    path: "projects/adaptive-strategic-ai-mod-for-civilization-vi/index.html",
    zhTitle: "Adaptive Strategic AI mod for Civilization VI | CHOS1N11111",
    zhDescription: "Adaptive Strategic AI 是面向 Civilization VI: Gathering Storm 的 AI 改进模组，通过自适应战略、随时代调整的难度曲线与军事执行改进，提升神级难度的持续竞争性。"
  },
  {
    path: "projects/repopilot-agent/index.html",
    zhTitle: "RepoPilot Agent | CHOS1N11111",
    zhDescription: "RepoPilot Agent 是本地运行、以人工审批为先的编程 Agent，将仓库任务与 GitHub Issue 转化为计划、可审查的 diff 和验证反馈。本页展示项目介绍与界面截图。"
  },
  {
    path: "publications/option-based-hierarchical-uav-networks/index.html",
    zhTitle: "Option-Based Hierarchical UAV Networks | Zhu Zenan",
    zhDescription: "Zhu Zenan 参与的边缘辅助 UAV 网络动态移动群智感知研究，提供摘要、DOI 和引用信息。"
  }
];

export const person = {
  "@type": "Person",
  "@id": `${siteOrigin}#person`,
  name: "Zhu Zenan",
  alternateName: ["朱泽南", "Zenan Zhu", "CHOS1N11111"],
  url: siteOrigin,
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: "Tongji University",
    url: "https://www.tongji.edu.cn/"
  },
  sameAs: [
    "https://github.com/CHOS1N11111",
    "https://www.linkedin.com/in/zenan-zhu/",
    "https://orcid.org/0009-0003-7449-8825"
  ]
};
