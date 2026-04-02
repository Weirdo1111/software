import type { RecoveryWord } from "@/lib/games/word-game-recovery";

export type WordGameBankId = "general" | "cs" | "math" | "civil" | "mechanical" | "transport";

type LexiconSeed = {
  word: string;
  meaningEn: string;
  meaningZh: string;
};

const toEntries = (seeds: LexiconSeed[], bankLabelEn: string, bankLabelZh: string): RecoveryWord[] =>
  seeds.map((seed) => ({
    word: seed.word,
    meaningEn: seed.meaningEn,
    meaningZh: seed.meaningZh,
    examples: [
      {
        en: `The term "${seed.word}" appears in this ${bankLabelEn} lesson.`,
        zh: `在这个${bankLabelZh}课程中会出现术语“${seed.word}”。`,
      },
    ],
    uk: `UK /${seed.word}/`,
    us: `US /${seed.word}/`,
  }));

const CS_SEEDS: LexiconSeed[] = [
  { word: "algorithm", meaningEn: "A step-by-step method for solving a problem.", meaningZh: "用于解决问题的分步方法。" },
  { word: "data structure", meaningEn: "A way to organize and store data.", meaningZh: "组织和存储数据的方式。" },
  { word: "database", meaningEn: "An organized collection of data.", meaningZh: "有组织的数据集合。" },
  { word: "api", meaningEn: "A set of rules for software communication.", meaningZh: "软件之间通信的一组规则。" },
  { word: "protocol", meaningEn: "A formal rule for data exchange.", meaningZh: "数据交换的正式规则。" },
  { word: "encryption", meaningEn: "Converting data into secure coded form.", meaningZh: "将数据转换为安全编码形式。" },
  { word: "compiler", meaningEn: "A tool that translates source code to executable code.", meaningZh: "将源代码翻译为可执行代码的工具。" },
  { word: "runtime", meaningEn: "The period when a program is running.", meaningZh: "程序运行时的阶段或环境。" },
  { word: "debugging", meaningEn: "Finding and fixing software errors.", meaningZh: "查找并修复软件错误。" },
  { word: "recursion", meaningEn: "A function calling itself.", meaningZh: "函数调用自身的过程。" },
  { word: "hash table", meaningEn: "A key-value data structure using hash functions.", meaningZh: "使用哈希函数的键值数据结构。" },
  { word: "queue", meaningEn: "A FIFO data structure.", meaningZh: "先进先出数据结构。" },
  { word: "stack", meaningEn: "A LIFO data structure.", meaningZh: "后进先出数据结构。" },
  { word: "binary tree", meaningEn: "A tree where each node has up to two children.", meaningZh: "每个节点最多有两个子节点的树结构。" },
  { word: "graph", meaningEn: "A structure of nodes and edges.", meaningZh: "由节点和边组成的结构。" },
  { word: "network", meaningEn: "Connected devices that exchange data.", meaningZh: "可交换数据的互联设备系统。" },
  { word: "bandwidth", meaningEn: "Maximum data transfer capacity.", meaningZh: "最大数据传输能力。" },
  { word: "latency", meaningEn: "Delay in data transmission.", meaningZh: "数据传输的延迟。" },
  { word: "cloud computing", meaningEn: "Using remote servers for computing services.", meaningZh: "使用远程服务器提供计算服务。" },
  { word: "virtualization", meaningEn: "Creating virtual versions of computing resources.", meaningZh: "创建计算资源的虚拟版本。" },
  { word: "container", meaningEn: "A lightweight package for applications and dependencies.", meaningZh: "封装应用及依赖的轻量化单元。" },
  { word: "microservice", meaningEn: "A small independent service in a larger system.", meaningZh: "大型系统中的独立小型服务。" },
  { word: "machine learning", meaningEn: "Algorithms that learn patterns from data.", meaningZh: "从数据中学习模式的算法方法。" },
  { word: "inference", meaningEn: "Model prediction after training.", meaningZh: "模型训练后的预测过程。" },
  { word: "dataset", meaningEn: "A collection of data samples.", meaningZh: "数据样本集合。" },
  { word: "feature", meaningEn: "An input variable used by a model.", meaningZh: "模型使用的输入变量。" },
  { word: "model", meaningEn: "A mathematical representation for prediction or analysis.", meaningZh: "用于预测或分析的数学表示。" },
  { word: "pipeline", meaningEn: "A sequence of processing steps.", meaningZh: "按顺序执行的一组处理步骤。" },
  { word: "caching", meaningEn: "Storing data temporarily for faster access.", meaningZh: "临时存储数据以加快访问。" },
  { word: "concurrency", meaningEn: "Handling multiple tasks at the same time.", meaningZh: "同时处理多个任务的能力。" },
];

const MATH_SEEDS: LexiconSeed[] = [
  { word: "equation", meaningEn: "A statement that two expressions are equal.", meaningZh: "表示两个表达式相等的式子。" },
  { word: "variable", meaningEn: "A symbol that can represent different values.", meaningZh: "可表示不同数值的符号。" },
  { word: "function", meaningEn: "A relation mapping input to output.", meaningZh: "将输入映射到输出的关系。" },
  { word: "domain", meaningEn: "The set of allowed input values.", meaningZh: "允许输入值的集合。" },
  { word: "range", meaningEn: "The set of output values.", meaningZh: "输出值的集合。" },
  { word: "derivative", meaningEn: "The rate of change of a function.", meaningZh: "函数变化率。" },
  { word: "integral", meaningEn: "Accumulated quantity over an interval.", meaningZh: "区间上的累积量。" },
  { word: "limit", meaningEn: "A value approached by a function.", meaningZh: "函数趋近的值。" },
  { word: "matrix", meaningEn: "A rectangular array of numbers.", meaningZh: "由数字组成的矩形阵列。" },
  { word: "vector", meaningEn: "A quantity with magnitude and direction.", meaningZh: "具有大小和方向的量。" },
  { word: "determinant", meaningEn: "A scalar value associated with a square matrix.", meaningZh: "与方阵相关的标量值。" },
  { word: "eigenvalue", meaningEn: "A scalar linked to an eigenvector transformation.", meaningZh: "与特征向量变换对应的标量。" },
  { word: "probability", meaningEn: "How likely an event is to happen.", meaningZh: "事件发生的可能性。" },
  { word: "distribution", meaningEn: "How values are spread.", meaningZh: "数值分布情况。" },
  { word: "mean", meaningEn: "The arithmetic average.", meaningZh: "算术平均数。" },
  { word: "median", meaningEn: "The middle value in ordered data.", meaningZh: "有序数据中的中间值。" },
  { word: "variance", meaningEn: "Average squared deviation from the mean.", meaningZh: "与均值偏差平方的平均值。" },
  { word: "standard deviation", meaningEn: "Square root of variance.", meaningZh: "方差的平方根。" },
  { word: "correlation", meaningEn: "Strength of relationship between variables.", meaningZh: "变量间关系强度。" },
  { word: "regression", meaningEn: "A method for modeling variable relationships.", meaningZh: "建立变量关系模型的方法。" },
  { word: "theorem", meaningEn: "A proven mathematical statement.", meaningZh: "已证明的数学命题。" },
  { word: "proof", meaningEn: "Logical argument establishing truth.", meaningZh: "证明命题成立的逻辑论证。" },
  { word: "set", meaningEn: "A collection of distinct elements.", meaningZh: "由不同元素组成的集合。" },
  { word: "subset", meaningEn: "A set contained within another set.", meaningZh: "包含于另一集合中的集合。" },
  { word: "sequence", meaningEn: "An ordered list of numbers.", meaningZh: "按顺序排列的数列。" },
  { word: "series", meaningEn: "A sum of terms in a sequence.", meaningZh: "数列各项的求和。" },
  { word: "logarithm", meaningEn: "Inverse operation of exponentiation.", meaningZh: "指数运算的逆运算。" },
  { word: "polynomial", meaningEn: "An expression made of variables and coefficients.", meaningZh: "由变量和系数组成的代数式。" },
  { word: "gradient", meaningEn: "Vector of partial derivatives.", meaningZh: "偏导数组成的向量。" },
  { word: "optimization", meaningEn: "Finding the best value under constraints.", meaningZh: "在约束下寻找最优值。" },
];

const CIVIL_SEEDS: LexiconSeed[] = [
  { word: "foundation", meaningEn: "The lowest load-bearing part of a structure.", meaningZh: "结构中最底部的承重部分。" },
  { word: "footing", meaningEn: "A widened base supporting a foundation.", meaningZh: "支撑基础的扩展底座。" },
  { word: "beam", meaningEn: "A horizontal structural member carrying loads.", meaningZh: "承受荷载的水平构件。" },
  { word: "column", meaningEn: "A vertical structural member carrying compression.", meaningZh: "承受压力的竖向构件。" },
  { word: "slab", meaningEn: "A flat concrete surface such as a floor or roof.", meaningZh: "如楼板或屋面的平板构件。" },
  { word: "reinforcement", meaningEn: "Steel added to concrete to improve strength.", meaningZh: "用于提高强度的混凝土内钢筋。" },
  { word: "concrete", meaningEn: "A building material of cement, water, and aggregate.", meaningZh: "由水泥、水和骨料组成的建筑材料。" },
  { word: "aggregate", meaningEn: "Sand, gravel, or crushed stone in concrete.", meaningZh: "混凝土中的砂石骨料。" },
  { word: "mortar", meaningEn: "A mix used to bond masonry units.", meaningZh: "用于砌体粘结的砂浆。" },
  { word: "rebar", meaningEn: "Steel bar used to reinforce concrete.", meaningZh: "用于加固混凝土的钢筋。" },
  { word: "formwork", meaningEn: "Temporary molds for shaping concrete.", meaningZh: "浇筑混凝土的临时模板。" },
  { word: "pile", meaningEn: "A deep foundation element transferring load to soil.", meaningZh: "将荷载传递至土层的深基础构件。" },
  { word: "retaining wall", meaningEn: "A wall that holds back soil.", meaningZh: "用于挡土的墙体。" },
  { word: "drainage", meaningEn: "System for removing excess water.", meaningZh: "排除多余水分的系统。" },
  { word: "culvert", meaningEn: "A structure allowing water to pass under roads.", meaningZh: "让水流穿过道路下方的涵洞结构。" },
  { word: "pavement", meaningEn: "Engineered surface for roads.", meaningZh: "道路的工程化路面结构。" },
  { word: "asphalt", meaningEn: "Bituminous material used in road surfacing.", meaningZh: "用于路面铺筑的沥青材料。" },
  { word: "geotechnical", meaningEn: "Related to soil and rock engineering behavior.", meaningZh: "与土体和岩体工程性质相关。" },
  { word: "compaction", meaningEn: "Densifying soil to improve stability.", meaningZh: "通过压实提高土体稳定性。" },
  { word: "excavation", meaningEn: "Removing soil or rock for construction.", meaningZh: "为施工进行土石开挖。" },
  { word: "surveying", meaningEn: "Measuring land positions and elevations.", meaningZh: "测量地面位置和高程。" },
  { word: "contour", meaningEn: "A line connecting points of equal elevation.", meaningZh: "连接相同高程点的线。" },
  { word: "grade", meaningEn: "Slope or incline of a surface.", meaningZh: "地表或道路的坡度。" },
  { word: "truss", meaningEn: "A framework of connected members forming triangles.", meaningZh: "由三角形单元组成的杆系结构。" },
  { word: "shear force", meaningEn: "Internal force parallel to a cross section.", meaningZh: "平行于截面的内部力。" },
  { word: "bending moment", meaningEn: "Moment causing a member to bend.", meaningZh: "使构件发生弯曲的内力矩。" },
  { word: "seismic design", meaningEn: "Design approach for earthquake resistance.", meaningZh: "针对抗震性能的设计方法。" },
  { word: "load path", meaningEn: "Route through which loads transfer to ground.", meaningZh: "荷载传递到地基的路径。" },
  { word: "water supply", meaningEn: "System delivering clean water.", meaningZh: "输送清洁用水的系统。" },
  { word: "wastewater", meaningEn: "Used water requiring collection and treatment.", meaningZh: "需要收集处理的污水。" },
];

const MECHANICAL_SEEDS: LexiconSeed[] = [
  { word: "thermodynamics", meaningEn: "Study of heat, work, and energy.", meaningZh: "研究热、功和能量关系的学科。" },
  { word: "heat transfer", meaningEn: "Movement of thermal energy.", meaningZh: "热能传递过程。" },
  { word: "fluid mechanics", meaningEn: "Study of fluids in motion or at rest.", meaningZh: "研究流体静止与运动规律的学科。" },
  { word: "statics", meaningEn: "Analysis of forces in equilibrium.", meaningZh: "研究平衡状态受力的学科。" },
  { word: "dynamics", meaningEn: "Study of motion under forces.", meaningZh: "研究受力运动规律的学科。" },
  { word: "kinematics", meaningEn: "Description of motion without forces.", meaningZh: "不考虑受力的运动描述。" },
  { word: "stress", meaningEn: "Internal force per unit area.", meaningZh: "单位面积上的内力。" },
  { word: "strain", meaningEn: "Relative deformation of a material.", meaningZh: "材料相对变形量。" },
  { word: "torque", meaningEn: "Rotational effect of a force.", meaningZh: "力引起的转动效应。" },
  { word: "friction", meaningEn: "Resistance between contacting surfaces.", meaningZh: "接触表面间的阻力。" },
  { word: "bearing", meaningEn: "Element supporting relative motion.", meaningZh: "支撑相对运动的机械元件。" },
  { word: "gearbox", meaningEn: "System that changes torque and speed.", meaningZh: "改变扭矩和转速的传动系统。" },
  { word: "shaft", meaningEn: "Rotating member transmitting power.", meaningZh: "传递动力的旋转轴。" },
  { word: "piston", meaningEn: "Sliding part in a cylinder.", meaningZh: "气缸内往复滑动的部件。" },
  { word: "valve", meaningEn: "Device controlling fluid flow.", meaningZh: "控制流体流动的装置。" },
  { word: "turbine", meaningEn: "Machine extracting energy from fluid flow.", meaningZh: "从流体中提取能量的机械。" },
  { word: "compressor", meaningEn: "Machine that increases fluid pressure.", meaningZh: "提高流体压力的机械。" },
  { word: "nozzle", meaningEn: "Component directing and accelerating flow.", meaningZh: "导向并加速流体的部件。" },
  { word: "fatigue", meaningEn: "Damage from repeated loading cycles.", meaningZh: "循环载荷引起的疲劳损伤。" },
  { word: "creep", meaningEn: "Slow deformation under constant stress.", meaningZh: "恒定应力下的缓慢变形。" },
  { word: "welding", meaningEn: "Joining materials by heat or pressure.", meaningZh: "通过热或压力连接材料。" },
  { word: "machining", meaningEn: "Manufacturing by removing material.", meaningZh: "通过去除材料进行加工。" },
  { word: "tolerance", meaningEn: "Allowed dimensional variation.", meaningZh: "允许的尺寸偏差范围。" },
  { word: "cad", meaningEn: "Computer-aided design tools.", meaningZh: "计算机辅助设计工具。" },
  { word: "cam", meaningEn: "Computer-aided manufacturing tools.", meaningZh: "计算机辅助制造工具。" },
  { word: "finite element analysis", meaningEn: "Numerical method for engineering simulation.", meaningZh: "用于工程仿真的数值分析方法。" },
  { word: "vibration", meaningEn: "Oscillatory motion around equilibrium.", meaningZh: "围绕平衡位置的振动运动。" },
  { word: "control system", meaningEn: "System regulating output behavior.", meaningZh: "调节输出行为的系统。" },
  { word: "hydraulics", meaningEn: "Power transmission using liquids.", meaningZh: "利用液体进行动力传递。" },
  { word: "pneumatics", meaningEn: "Power transmission using compressed gas.", meaningZh: "利用压缩气体进行动力传递。" },
];

const TRANSPORT_SEEDS: LexiconSeed[] = [
  { word: "intersection", meaningEn: "Point where roads meet.", meaningZh: "道路交汇的节点。" },
  { word: "roundabout", meaningEn: "Circular intersection with yield control.", meaningZh: "采用让行控制的环形交叉口。" },
  { word: "corridor", meaningEn: "Main transport route area.", meaningZh: "主要交通走廊区域。" },
  { word: "transit", meaningEn: "Public transport services.", meaningZh: "公共交通服务。" },
  { word: "headway", meaningEn: "Time gap between vehicles.", meaningZh: "车辆之间的时间间隔。" },
  { word: "ridership", meaningEn: "Number of passengers using transit.", meaningZh: "公共交通乘客数量。" },
  { word: "capacity", meaningEn: "Maximum volume a facility can handle.", meaningZh: "设施可承载的最大流量。" },
  { word: "congestion", meaningEn: "Traffic demand exceeding available capacity.", meaningZh: "交通需求超过通行能力的拥堵状态。" },
  { word: "signal timing", meaningEn: "Allocation of green and red intervals.", meaningZh: "信号灯各相位时长配置。" },
  { word: "detour", meaningEn: "Alternative route around a closure.", meaningZh: "绕开封闭路段的替代路线。" },
  { word: "freight", meaningEn: "Goods transported by road, rail, air, or sea.", meaningZh: "通过多种方式运输的货物。" },
  { word: "logistics", meaningEn: "Planning and management of movement and storage.", meaningZh: "运输与仓储的计划和管理。" },
  { word: "intermodal", meaningEn: "Using multiple transport modes in one trip.", meaningZh: "一次运输中使用多种交通方式。" },
  { word: "terminal", meaningEn: "Facility where trips begin, end, or transfer.", meaningZh: "起终点或换乘设施。" },
  { word: "timetable", meaningEn: "Planned departure and arrival schedule.", meaningZh: "计划发到时间表。" },
  { word: "dispatch", meaningEn: "Control and assignment of vehicles.", meaningZh: "车辆调度与任务分配。" },
  { word: "wayfinding", meaningEn: "Information helping users navigate spaces.", meaningZh: "帮助出行者导航的导向信息。" },
  { word: "crosswalk", meaningEn: "Designated pedestrian crossing area.", meaningZh: "指定的人行横道区域。" },
  { word: "lane", meaningEn: "Single stream path on a road.", meaningZh: "道路上的单股通行通道。" },
  { word: "ramp metering", meaningEn: "Signal control at freeway entry ramps.", meaningZh: "高速入口匝道信号控制。" },
  { word: "tolling", meaningEn: "Charging users for road use.", meaningZh: "对道路使用进行收费。" },
  { word: "bypass", meaningEn: "Route diverting traffic around busy centers.", meaningZh: "绕开拥挤中心区的通道。" },
  { word: "overpass", meaningEn: "Bridge carrying one road over another.", meaningZh: "跨越其他道路的立交桥。" },
  { word: "underpass", meaningEn: "Road or walkway passing below another route.", meaningZh: "下穿其他通道的道路或通道。" },
  { word: "pavement marking", meaningEn: "Painted guidance lines and symbols on roads.", meaningZh: "道路上的标线与标识。" },
  { word: "incident management", meaningEn: "Response process for crashes and disruptions.", meaningZh: "事故与突发事件的处置流程。" },
  { word: "travel demand", meaningEn: "Amount of required travel in a system.", meaningZh: "交通系统中的出行需求总量。" },
  { word: "trip generation", meaningEn: "Estimation of trips produced by land uses.", meaningZh: "土地利用产生出行量的估算。" },
  { word: "mobility", meaningEn: "Ability to move people and goods efficiently.", meaningZh: "高效移动人和货物的能力。" },
  { word: "resilience", meaningEn: "Ability to recover from transport disruptions.", meaningZh: "交通系统从中断中恢复的能力。" },
];

const BANK_POOLS = {
  cs: toEntries(CS_SEEDS, "Computer Science", "计算机"),
  math: toEntries(MATH_SEEDS, "Mathematics", "数学"),
  civil: toEntries(CIVIL_SEEDS, "Civil Engineering", "土木工程"),
  mechanical: toEntries(MECHANICAL_SEEDS, "Mechanical Engineering", "机械工程"),
  transport: toEntries(TRANSPORT_SEEDS, "Transportation Engineering", "交通工程"),
};

const mergeUniquePools = (...pools: RecoveryWord[][]) => {
  const merged: RecoveryWord[] = [];
  for (const pool of pools) {
    for (const entry of pool) {
      if (merged.some((item) => item.word === entry.word)) continue;
      merged.push(entry);
    }
  }
  return merged;
};

const GENERAL_POOL = mergeUniquePools(
  BANK_POOLS.cs.slice(0, 6),
  BANK_POOLS.math.slice(0, 6),
  BANK_POOLS.civil.slice(0, 6),
  BANK_POOLS.mechanical.slice(0, 6),
  BANK_POOLS.transport.slice(0, 6),
).slice(0, 30);

const hasText = (value: string | undefined) => typeof value === "string" && value.trim().length > 0;

const isValidRecoveryWord = (entry: RecoveryWord) => {
  if (!hasText(entry.word) || !hasText(entry.meaningEn) || !hasText(entry.meaningZh)) return false;
  if (!hasText(entry.uk) || !hasText(entry.us)) return false;
  if (!Array.isArray(entry.examples) || entry.examples.length === 0) return false;
  return entry.examples.some((example) => hasText(example.en) && hasText(example.zh));
};

const sanitizePool = (bank: WordGameBankId, pool: RecoveryWord[]) => {
  const seen = new Set<string>();
  const valid: RecoveryWord[] = [];

  for (const entry of pool) {
    const key = entry.word.trim().toLowerCase();
    if (!isValidRecoveryWord(entry)) {
      console.warn(`[word-game-lexicon] Skipped invalid entry in bank "${bank}": "${entry.word}"`);
      continue;
    }
    if (seen.has(key)) {
      console.warn(`[word-game-lexicon] Skipped duplicate entry in bank "${bank}": "${entry.word}"`);
      continue;
    }
    seen.add(key);
    valid.push(entry);
  }

  return valid;
};

const RAW_POOLS: Record<WordGameBankId, RecoveryWord[]> = {
  general: GENERAL_POOL,
  cs: BANK_POOLS.cs,
  math: BANK_POOLS.math,
  civil: BANK_POOLS.civil,
  mechanical: BANK_POOLS.mechanical,
  transport: BANK_POOLS.transport,
};

export const WORD_GAME_POOLS: Record<WordGameBankId, RecoveryWord[]> = {
  general: sanitizePool("general", RAW_POOLS.general),
  cs: sanitizePool("cs", RAW_POOLS.cs),
  math: sanitizePool("math", RAW_POOLS.math),
  civil: sanitizePool("civil", RAW_POOLS.civil),
  mechanical: sanitizePool("mechanical", RAW_POOLS.mechanical),
  transport: sanitizePool("transport", RAW_POOLS.transport),
};

export const WORD_GAME_POOL_COUNTS: Record<WordGameBankId, number> = {
  general: WORD_GAME_POOLS.general.length,
  cs: WORD_GAME_POOLS.cs.length,
  math: WORD_GAME_POOLS.math.length,
  civil: WORD_GAME_POOLS.civil.length,
  mechanical: WORD_GAME_POOLS.mechanical.length,
  transport: WORD_GAME_POOLS.transport.length,
};

export function getWordGamePool(bank: string): RecoveryWord[] {
  const key = bank as WordGameBankId;
  return WORD_GAME_POOLS[key] ?? WORD_GAME_POOLS.general;
}
