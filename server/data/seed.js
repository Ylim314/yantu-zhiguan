/** 新用户初始科目数据，与原前端 Mock 数据保持一致。 */
export const seedSubjects = [
  { name: '数据结构', category: '408', targetHours: 150, finishedHours: 93, color: '#409EFF', description: '涵盖线性表、树、图、查找、排序等核心内容，配合王道课后习题与真题训练' },
  { name: '计算机组成原理', category: '408', targetHours: 130, finishedHours: 58, color: '#67C23A', description: '重点攻克数据表示、CPU、存储系统、总线与I/O，结合唐朔飞教材与王道辅导书' },
  { name: '操作系统', category: '408', targetHours: 120, finishedHours: 46, color: '#E6A23C', description: '进程管理、内存管理、文件系统、I/O管理，以汤小丹教材为主配合王道习题' },
  { name: '计算机网络', category: '408', targetHours: 100, finishedHours: 28, color: '#F56C6C', description: '体系结构、物理层到应用层逐层深入，使用谢希仁教材与王道真题解析' },
  { name: '数学二', category: '公共课', targetHours: 200, finishedHours: 110, color: '#9B59B6', description: '高等数学与线性代数，张宇基础30讲+强化18讲，配合1000题与李林880题' },
  { name: '英语二', category: '公共课', targetHours: 120, finishedHours: 48, color: '#1ABC9C', description: '单词每日背诵+真题阅读精读，写作模板积累，使用红宝书与黄皮书真题解析' },
  { name: '政治', category: '公共课', targetHours: 80, finishedHours: 12, color: '#E74C3C', description: '马原、毛中特、史纲、思修与当代，暑假开始系统学习，配合肖秀荣1000题' },
]

/** 新用户初始任务数据。subjectName 在入库时转换为科目外键。 */
export const seedTasks = [
  { title: '完成二叉树与二叉排序树专题', subjectName: '数据结构', type: '刷题', priority: '高', status: '进行中', deadline: '2026-06-10', estimatedMinutes: 120, actualMinutes: 45, description: '完成王道课后二叉树遍历、BST构造与平衡树相关题目共25道' },
  { title: '学习图的存储与遍历', subjectName: '数据结构', type: '看课', priority: '高', status: '未开始', deadline: '2026-06-15', estimatedMinutes: 90, actualMinutes: 0, description: '观看王道考研图论基础课，掌握邻接矩阵与邻接表、BFS与DFS' },
  { title: '复盘排序算法时间复杂度', subjectName: '数据结构', type: '复盘', priority: '中', status: '已完成', deadline: '2026-06-05', estimatedMinutes: 60, actualMinutes: 70, description: '整理各排序算法的时空复杂度对比表，重做易错选择题' },
  { title: '完成Cache映射方式专题', subjectName: '计算机组成原理', type: '刷题', priority: '高', status: '进行中', deadline: '2026-06-12', estimatedMinutes: 100, actualMinutes: 30, description: '直接映射、全相联映射、组相联映射计算题，王道辅导书P87-P94' },
  { title: '学习浮点数表示与运算', subjectName: '计算机组成原理', type: '看课', priority: '中', status: '已完成', deadline: '2026-06-03', estimatedMinutes: 80, actualMinutes: 95, description: 'IEEE754标准单精度与双精度浮点数编码，观看唐朔飞配套视频' },
  { title: '整理CPU数据通路笔记', subjectName: '计算机组成原理', type: '整理笔记', priority: '中', status: '未开始', deadline: '2026-06-20', estimatedMinutes: 60, actualMinutes: 0, description: '将单周期CPU与多周期CPU数据通路整理为思维导图' },
  { title: '进程同步经典问题练习', subjectName: '操作系统', type: '刷题', priority: '高', status: '进行中', deadline: '2026-06-14', estimatedMinutes: 90, actualMinutes: 20, description: '生产者消费者、读者写者、哲学家进餐等PV操作经典题目' },
  { title: '背诵页面置换算法', subjectName: '操作系统', type: '背诵', priority: '中', status: '未开始', deadline: '2026-06-18', estimatedMinutes: 45, actualMinutes: 0, description: 'OPT、FIFO、LRU、CLOCK算法的流程与Belady异常' },
  { title: 'TCP三次握手与四次挥手模拟测试', subjectName: '计算机网络', type: '模拟测试', priority: '高', status: '未开始', deadline: '2026-06-25', estimatedMinutes: 60, actualMinutes: 0, description: '限时完成TCP连接管理专题30道选择题与2道大题' },
  { title: '学习IP子网划分', subjectName: '计算机网络', type: '看课', priority: '高', status: '已延期', deadline: '2026-06-02', estimatedMinutes: 80, actualMinutes: 50, description: '子网掩码、CIDR、路由聚合的计算方法，观看王道网络层课程' },
  { title: '高数多元函数微分强化', subjectName: '数学二', type: '刷题', priority: '高', status: '进行中', deadline: '2026-06-09', estimatedMinutes: 150, actualMinutes: 80, description: '张宇1000题多元函数偏导数与极值部分，完成B组提高题' },
  { title: '线性代数特征值专题复盘', subjectName: '数学二', type: '复盘', priority: '中', status: '已完成', deadline: '2026-06-06', estimatedMinutes: 60, actualMinutes: 55, description: '回顾特征值与特征向量的求解方法，重做错题' },
  { title: '英语二真题2018年阅读精读', subjectName: '英语二', type: '刷题', priority: '高', status: '未开始', deadline: '2026-06-16', estimatedMinutes: 120, actualMinutes: 0, description: '完成2018年英语二四篇阅读理解并逐篇分析出题逻辑与长难句' },
  { title: '背诵考研英语高频词汇Unit12-14', subjectName: '英语二', type: '背诵', priority: '中', status: '进行中', deadline: '2026-06-08', estimatedMinutes: 40, actualMinutes: 25, description: '红宝书Unit12至Unit14共150个高频词汇，配合词根词缀记忆法' },
  { title: '马原唯物辩证法章节学习', subjectName: '政治', type: '看课', priority: '低', status: '未开始', deadline: '2026-07-01', estimatedMinutes: 90, actualMinutes: 0, description: '观看徐涛马原强化班唯物辩证法三大规律部分，做配套笔记' },
]

/** 新用户初始错题数据。 */
export const seedMistakes = [
  { title: 'AVL树旋转后高度更新遗漏', subjectName: '数据结构', chapter: '第5章 树与二叉树', difficulty: '困难', reason: '执行LL旋转后忘记更新原根节点与新根节点的高度值，导致后续判断失衡', solution: '每次旋转后必须从下往上依次更新height字段，先更新子节点再更新父节点', reviewCount: 3, nextReviewDate: '2026-06-10', tags: ['AVL树', '旋转操作', '高度计算'] },
  { title: 'KMP算法next数组手算出错', subjectName: '数据结构', chapter: '第4章 串', difficulty: '困难', reason: '对next数组的定义理解不够清晰，j回退后忘记继续比较而是直接赋值', solution: '严格按照"前缀等于后缀"的最长长度来手算，画出每个位置的前后缀对比图', reviewCount: 5, nextReviewDate: '2026-06-08', tags: ['KMP', '字符串匹配', 'next数组'] },
  { title: 'Cache组相联映射地址划分错误', subjectName: '计算机组成原理', chapter: '第4章 存储器层次结构', difficulty: '中等', reason: '将Tag、Index、Offset位数算错，特别是组数与每组行数的区分混淆', solution: '先算块内地址位数(log2块大小)，再算组地址位数(log2组数)，剩余为Tag位数', reviewCount: 2, nextReviewDate: '2026-06-12', tags: ['Cache', '地址映射', '组相联'] },
  { title: '流水线冒险类型判断混淆', subjectName: '计算机组成原理', chapter: '第5章 中央处理器', difficulty: '中等', reason: '数据冒险与控制冒险的区分不清，特别是分支指令引起的是哪种冒险', solution: '数据冒险=指令间数据依赖(RAW/WAR/WAW)；控制冒险=分支指令改变PC值导致的不确定', reviewCount: 1, nextReviewDate: '2026-06-15', tags: ['流水线', '冒险', 'CPU'] },
  { title: 'PV操作信号量初值设定错误', subjectName: '操作系统', chapter: '第2章 进程管理', difficulty: '困难', reason: '生产者消费者问题中，缓冲区为n时误将mutex和empty的初值搞混', solution: 'mutex初值=1(互斥)，empty初值=n(空缓冲区数)，full初值=0(满缓冲区数)', reviewCount: 4, nextReviewDate: '2026-06-09', tags: ['PV操作', '信号量', '进程同步'] },
  { title: '银行家算法安全性检查漏步骤', subjectName: '操作系统', chapter: '第3章 死锁', difficulty: '中等', reason: '在找可执行进程时，忘记将已分配资源回收加入Available，导致后续判断全部不安全', solution: '找到一个满足Need<=Available的进程后，假定其执行完并释放全部资源，更新Available后再找下一个', reviewCount: 2, nextReviewDate: '2026-06-14', tags: ['死锁', '银行家算法', '安全性检查'] },
  { title: 'TCP拥塞窗口慢启动计算', subjectName: '计算机网络', chapter: '第5章 传输层', difficulty: '中等', reason: '慢启动阶段cwnd每次翻倍与拥塞避免阶段线性增长的切换点(ssthresh)判断失误', solution: 'cwnd < ssthresh时为慢启动(指数增长)，cwnd >= ssthresh时为拥塞避免(线性增长+1 MSS/RTT)', reviewCount: 3, nextReviewDate: '2026-06-11', tags: ['TCP', '拥塞控制', '慢启动'] },
  { title: '子网划分与路由聚合方向搞反', subjectName: '计算机网络', chapter: '第4章 网络层', difficulty: '困难', reason: '子网划分是"借主机位做子网位"，路由聚合是"合并相同前缀"，做题时两个方向搞混', solution: '子网划分：从主机位高位借位，子网掩码变长；路由聚合：找多个子网的公共前缀，子网掩码变短', reviewCount: 1, nextReviewDate: '2026-06-18', tags: ['子网划分', 'CIDR', '路由聚合'] },
  { title: '二重积分交换积分次序出错', subjectName: '数学二', chapter: '高数第九章 二重积分', difficulty: '中等', reason: '画积分区域图时上下界写反，导致交换次序后积分限错误', solution: '先根据原积分限画出积分区域D，再从另一个方向确定新的内外层积分限，最后代入验证', reviewCount: 2, nextReviewDate: '2026-06-13', tags: ['二重积分', '积分次序', '积分区域'] },
  { title: '英语阅读中"it"指代判断错误', subjectName: '英语二', chapter: '阅读理解专题', difficulty: '简单', reason: '长难句中代词it的指代对象判断错误，导致对句意理解偏差', solution: '回溯最近的单数名词作为it的候选指代，结合上下文逻辑验证是否通顺', reviewCount: 1, nextReviewDate: '2026-06-09', tags: ['长难句', '代词指代', '阅读理解'] },
]

/** 新用户初始学习计划数据。 */
export const seedPlans = [
  { date: '2026-06-07', title: '数据结构 - 图的遍历专题', subjectName: '数据结构', timeRange: '08:00-10:00', status: '已完成', remark: '完成了BFS和DFS的手动模拟，明天做配套习题' },
  { date: '2026-06-07', title: '数学二 - 多元函数微分', subjectName: '数学二', timeRange: '10:30-12:30', status: '已完成', remark: '完成了张宇1000题B组前15题' },
  { date: '2026-06-07', title: '英语二 - 单词与阅读', subjectName: '英语二', timeRange: '14:00-15:30', status: '进行中', remark: 'Unit12单词已背完，正在精读2017年Text1' },
  { date: '2026-06-07', title: '计算机组成原理 - Cache专题', subjectName: '计算机组成原理', timeRange: '16:00-17:30', status: '未开始', remark: '重点练习组相联映射的地址划分与命中率计算' },
  { date: '2026-06-08', title: '操作系统 - PV操作刷题', subjectName: '操作系统', timeRange: '08:00-10:00', status: '未开始', remark: '完成王道辅导书进程同步章节综合题' },
  { date: '2026-06-08', title: '数学二 - 线性代数复盘', subjectName: '数学二', timeRange: '10:30-12:00', status: '未开始', remark: '复盘矩阵的秩与线性方程组解的结构' },
  { date: '2026-06-08', title: '计算机网络 - IP子网划分', subjectName: '计算机网络', timeRange: '14:00-16:00', status: '未开始', remark: '补完上次延期的子网划分课程，做配套练习' },
  { date: '2026-06-08', title: '政治 - 马原导论', subjectName: '政治', timeRange: '16:30-17:30', status: '未开始', remark: '开始徐涛强化班马原部分，做好笔记' },
  { date: '2026-06-09', title: '数据结构 - 图论综合习题', subjectName: '数据结构', timeRange: '08:00-10:00', status: '未开始', remark: '完成王道图论章节历年真题与模拟题' },
  { date: '2026-06-09', title: '数学二 - 高数强化训练', subjectName: '数学二', timeRange: '10:30-13:00', status: '未开始', remark: '张宇强化18讲第8讲配套习题，限时2.5小时' },
]

/** 新用户默认个人资料。 */
export const seedProfile = {
  targetSchool: '计算机相关院校',
  targetMajor: '计算机技术',
  examYear: 2027,
  dailyTargetHours: 8,
  avatar: '',
  motto: '稳住节奏，持续复盘',
}
