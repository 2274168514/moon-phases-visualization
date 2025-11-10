// 月相可视化系统 - 最终版本
(function() {
    'use strict';

    // 全局变量 - 默认显示2024年的数据
    let currentMonth = 0; // 一月
    let currentYear = 2024; // 数据只包含2024年
    let monthData = [];
    let currentParameter = 'illumination'; // 当前参数
    let currentChartType = 'line'; // 当前图表类型

    // 农历计算器
    let lunarCalendar = null;

    // 农历切换状态
    let isLunarMode = false;

    // DOM元素
    const elements = {};

    // 月相名称映射 - 基于真实月相数据
    const moonPhaseNames = {
        0: '新月',
        1: '娥眉月',
        2: '娥眉月',
        3: '娥眉月',
        4: '上弦月',
        5: '盈凸月',
        6: '盈凸月',
        7: '盈凸月',
        8: '满月',
        9: '亏凸月',
        10: '亏凸月',
        11: '下弦月',
        12: '残月',
        13: '残月',
        14: '残月',
        15: '新月'
    };

    // 初始化函数（支持异步加载）
    async function init() {
        console.log('🌙 初始化月相可视化系统...');

        // 初始化农历计算器
        if (typeof LunarCalendar !== 'undefined') {
            lunarCalendar = new LunarCalendar();
            console.log('📅 农历计算器初始化完成');
        } else {
            console.warn('⚠️ 农历计算器未加载');
        }

        // 获取DOM元素
        getElements();

        // 绑定事件
        bindEvents();

        // 加载数据（异步）
        await loadData();
    }

    // 获取DOM元素
    function getElements() {
        elements.yearSelect = document.getElementById('year-select');
        elements.monthSelect = document.getElementById('month-select');
        elements.gridView = document.getElementById('grid-view');
        elements.timelineView = document.getElementById('timeline-view');
        elements.gridViewBtn = document.getElementById('grid-view-btn');
        elements.timelineViewBtn = document.getElementById('timeline-view-btn');
        elements.moonGrid = document.getElementById('moon-grid');
        elements.gridTitle = document.getElementById('grid-title');
        elements.timelineContainer = document.getElementById('timeline-container');
        elements.lunarToggle = document.getElementById('lunar-toggle');
        elements.overviewMap = document.getElementById('overview-map');
        elements.monthOverlay = document.getElementById('month-overlay');
        elements.yearOverviewMap = document.getElementById('year-overview-map');

        // 主图表元素
        elements.mainChart = document.getElementById('main-chart');
        elements.chartTitle = document.getElementById('chart-title');

        // 控制元素
        elements.parameterSelect = document.getElementById('parameter-select');
        elements.chartTypeSelect = document.getElementById('chart-type-select');

        // 参数介绍元素
        elements.parameterContent = document.getElementById('parameter-content');
    }

    // 绑定事件
    function bindEvents() {
        // 年月选择事件
        if (elements.yearSelect) {
            elements.yearSelect.addEventListener('change', handleDateChange);
        }
        if (elements.monthSelect) {
            elements.monthSelect.addEventListener('change', handleDateChange);
        }

        // 视图切换事件
        if (elements.gridViewBtn) {
            elements.gridViewBtn.addEventListener('click', () => switchView('grid'));
        }
        if (elements.timelineViewBtn) {
            elements.timelineViewBtn.addEventListener('click', () => switchView('timeline'));
        }

        // 图表控制事件
        if (elements.parameterSelect) {
            elements.parameterSelect.addEventListener('change', handleParameterChange);
        }
        if (elements.chartTypeSelect) {
            elements.chartTypeSelect.addEventListener('change', handleChartTypeChange);
        }

        // 农历切换事件
        if (elements.lunarToggle) {
            elements.lunarToggle.addEventListener('click', toggleLunarMode);
        }

        // 年度概览图月份选择事件
        if (elements.yearOverviewMap) {
            initOverviewMap();
        }
    }

    // 处理日期变化（支持异步加载）
    async function handleDateChange() {
        currentYear = parseInt(elements.yearSelect.value);
        currentMonth = parseInt(elements.monthSelect.value);
        await loadData();
    }

    // 处理参数变化
    function handleParameterChange() {
        currentParameter = elements.parameterSelect.value;
        updateChartTitle();
        renderMainChart();
        updateParameterContent(currentParameter);
    }

    // 处理图表类型变化
    function handleChartTypeChange() {
        currentChartType = elements.chartTypeSelect.value;
        renderMainChart();
    }

    
    // 更新参数内容
    function updateParameterContent(parameter) {
        const parameterData = {
            illumination: {
                title: '月相照明度变化',
                description: '显示月亮表面被太阳照亮部分的比例变化。照明度从0%（新月）到100%（满月）周期性变化，反映了月相的完整周期。',
                details: [
                    '<strong>新月：</strong>照明度0%，月亮完全不可见',
                    '<strong>上弦月：</strong>照明度50%，右半部分可见',
                    '<strong>满月：</strong>照明度100%，整个月面可见',
                    '<strong>下弦月：</strong>照明度50%，左半部分可见'
                ]
            },
            distance: {
                title: '地月距离变化',
                description: '显示地球与月球之间的距离变化。月球轨道是椭圆形的，导致地月距离在近地点和远地点之间变化。',
                details: [
                    '<strong>近地点：</strong>约363,300公里，月球看起来最大',
                    '<strong>远地点：</strong>约405,500公里，月球看起来最小',
                    '<strong>平均距离：</strong>约384,400公里',
                    '<strong>影响：</strong>距离变化影响潮汐强度和月球视大小'
                ]
            },
            diameter: {
                title: '视直径变化',
                description: '显示月球在天空中看起来的角度大小变化。视直径随地月距离变化而改变，影响观测效果。',
                details: [
                    '<strong>最大视直径：</strong>约33.5角分（近地点）',
                    '<strong>最小视直径：</strong>约29.4角分（远地点）',
                    '<strong>平均视直径：</strong>约31.1角分',
                    '<strong>视觉差异：</strong>近地点时月球比远地点时大约14%'
                ]
            },
            distribution: {
                title: '月相分布统计',
                description: '统计不同月相在选定月份中的出现次数和分布情况，帮助了解月相的规律性。',
                details: [
                    '<strong>统计方式：</strong>按照月相的8个主要阶段分类',
                    '<strong>新月阶段：</strong>包括新月和残月',
                    '<strong>上弦月阶段：</strong>包括娥眉月和上弦月',
                    '<strong>满月阶段：</strong>满月前后时期',
                    '<strong>下弦月阶段：</strong>包括下弦月和残月'
                ]
            },
            relationship: {
                title: '照明度-距离关系',
                description: '分析月相照明度与地月距离之间的相关性，探索两个重要参数之间的关系模式。',
                details: [
                    '<strong>相关性：</strong>照明度与距离无直接因果关系',
                    '<strong>周期性：</strong>两个参数都具有周期性变化',
                    '<strong>观测时机：</strong>满月时若恰逢近地点，称为超级月亮',
                    '<strong>科学价值：</strong>帮助理解月球运动规律'
                ]
            }
        };

        const data = parameterData[parameter];
        if (data) {
            elements.parameterContent.innerHTML = `
                <div class="parameter-item" data-parameter="${parameter}">
                    <h4>${data.title}</h4>
                    <p>${data.description}</p>
                    <ul>
                        ${data.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
    }

    // 加载数据（支持异步更新）
    async function loadData() {
        console.log(`📅 加载 ${currentYear}年${currentMonth + 1}月 数据...`);

        try {
            // 加载真实月相数据
            if (!window.allMoonData) {
                const response = await fetch('data.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                window.allMoonData = data;
                console.log(`✅ 成功加载月相数据，共 ${data.length} 条记录`);
            }

            // 生成月份数据（使用真实数据）
            monthData = generateMonthData(currentYear, currentMonth);

        } catch (error) {
            console.warn('⚠️ 无法加载真实数据，使用计算数据:', error);
            // 生成计算数据作为后备
            monthData = generateMonthData(currentYear, currentMonth);
        }

        // 更新视图（异步）
        await updateAllViews();
        updateStatistics();
    }

    // 生成月份数据
    function generateMonthData(year, month) {
        // 如果有真实数据且是2024年，使用真实数据
        if (window.allMoonData && year === 2024) {
            return generateRealMonthData(year, month);
        }

        // 否则使用计算数据
        return generateCalculatedMonthData(year, month);
    }

    // 使用真实月相数据生成月份数据 - 增强版，确保使用更多真实数据
    function generateRealMonthData(year, month) {
        const data = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        console.log(`🔍 正在处理 ${year}年${month + 1}月 的真实数据...`);

        // 筛选指定月份的所有数据
        const monthlyData = window.allMoonData.filter(item => {
            const itemDate = new Date(item.time);
            return itemDate.getFullYear() === year &&
                   itemDate.getMonth() === month;
        });

        console.log(`📈 找到 ${monthlyData.length} 条月相记录`);

        // 按日期组织数据，使用每日多个数据点的平均值
        const dailyData = {};
        monthlyData.forEach(item => {
            const date = new Date(item.time);
            const day = date.getDate();

            if (!dailyData[day]) {
                dailyData[day] = {
                    phase: [],
                    age: [],
                    distance: [],
                    diameter: [],
                    subsolar: [],
                    subearth: [],
                    posangle: []
                };
            }

            dailyData[day].phase.push(item.phase);
            dailyData[day].age.push(item.age);
            dailyData[day].distance.push(item.distance);
            dailyData[day].diameter.push(item.diameter);
            dailyData[day].subsolar.push(item.subsolar);
            dailyData[day].subearth.push(item.subearth);
            dailyData[day].posangle.push(item.posangle);
        });

        for (let day = 1; day <= daysInMonth; day++) {
            if (dailyData[day] && dailyData[day].phase.length > 0) {
                // 计算当天的平均值
                const avgPhase = d3.mean(dailyData[day].phase);
                const avgAge = d3.mean(dailyData[day].age);
                const avgDistance = d3.mean(dailyData[day].distance);
                const avgDiameter = d3.mean(dailyData[day].diameter);

                // 使用中午12点的数据作为代表
                const noonIndex = Math.floor(dailyData[day].phase.length / 2);
                const noonData = {
                    phase: dailyData[day].phase[noonIndex],
                    age: dailyData[day].age[noonIndex],
                    distance: dailyData[day].distance[noonIndex],
                    diameter: dailyData[day].diameter[noonIndex],
                    subsolar: dailyData[day].subsolar[noonIndex],
                    subearth: dailyData[day].subearth[noonIndex],
                    posangle: dailyData[day].posangle[noonIndex]
                };

                const moonPhase = getMoonPhase(avgPhase, avgAge);
                data.push({
                    day: day,
                    date: new Date(year, month, day),
                    moonAge: avgAge,
                    illumination: avgPhase,
                    phaseName: moonPhaseNames[moonPhase],
                    distance: avgDistance,
                    diameter: avgDiameter,
                    phaseIndex: moonPhase,
                    // 添加额外的真实数据
                    subsolarLon: noonData.subsolar.lon,
                    subsolarLat: noonData.subsolar.lat,
                    subearthLon: noonData.subearth.lon,
                    subearthLat: noonData.subearth.lat,
                    positionAngle: noonData.posangle,
                    // 保存原始数据点用于详细交互
                    dailyRecords: dailyData[day].phase.length
                });
            } else {
                // 如果某天完全没有数据，使用计算数据作为后备
                console.warn(`⚠️ ${day}日缺少真实数据，使用计算数据`);
                const date = new Date(year, month, day);
                const moonAge = calculateMoonAge(date);
                const illumination = calculateIllumination(moonAge);
                const moonPhase = getMoonPhase(illumination, moonAge);
                const distance = calculateDistance(date);
                const diameter = calculateDiameter(distance);

                data.push({
                    day: day,
                    date: date,
                    moonAge: moonAge,
                    illumination: illumination,
                    phaseName: moonPhaseNames[moonPhase],
                    distance: distance,
                    diameter: diameter,
                    phaseIndex: moonPhase,
                    isSimulated: true,
                    dailyRecords: 0
                });
            }
        }

        console.log(`✅ ${year}年${month + 1}月真实数据处理完成，共 ${data.length} 天，其中 ${data.filter(d => !d.isSimulated).length} 天使用真实数据`);
        return data;
    }

    // 使用计算公式生成月份数据
    function generateCalculatedMonthData(year, month) {
        const data = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const moonAge = calculateMoonAge(date);
            const illumination = calculateIllumination(moonAge);
            const moonPhase = getMoonPhase(illumination, moonAge);
            const distance = calculateDistance(date);
            const diameter = calculateDiameter(distance);

            data.push({
                day: day,
                date: date,
                moonAge: moonAge,
                illumination: illumination,
                phaseName: moonPhaseNames[moonPhase],
                distance: distance,
                diameter: diameter,
                phaseIndex: moonPhase
            });
        }

        return data;
    }

    // 计算月龄
    function calculateMoonAge(date) {
        // 简化的月龄计算
        const knownNewMoon = new Date(2000, 0, 6, 18, 14); // 已知新月时间
        const synodicMonth = 29.53059; // 朔望月周期

        const daysSince = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
        const moonAge = daysSince % synodicMonth;

        return Math.max(0, moonAge);
    }

    // 计算照明度
    function calculateIllumination(moonAge) {
        const phaseAngle = (moonAge / 29.53059) * 2 * Math.PI;
        const illumination = (1 - Math.cos(phaseAngle)) / 2;
        return Math.round(illumination * 1000) / 10;
    }

    // 获取月相索引 - 基于月龄和照明度的综合判断
    function getMoonPhase(illumination, age) {
        const illum = parseFloat(illumination) || 0;
        const moonAge = parseFloat(age) || 0;

        // 月相周期：29.53天
        // 基于真实数据的月龄判断

        // 新月：月龄0-1.5天
        if (moonAge >= 0 && moonAge < 1.5) {
            return 0;
        }
        // 娥眉月：月龄1.5-7.5天
        else if (moonAge >= 1.5 && moonAge < 4.0) {
            return 1;  // 娥眉月1
        } else if (moonAge >= 4.0 && moonAge < 6.5) {
            return 2;  // 娥眉月2
        } else if (moonAge >= 6.5 && moonAge < 9.0) {
            return 3;  // 娥眉月3
        }
        // 上弦月：月龄9.0-11.5天
        else if (moonAge >= 9.0 && moonAge < 11.5) {
            return 4;  // 上弦月
        }
        // 盈凸月：月龄11.5-14.5天（满月前）
        else if (moonAge >= 11.5 && moonAge < 13.0) {
            return 5;  // 盈凸月1
        } else if (moonAge >= 13.0 && moonAge < 14.5) {
            return 6;  // 盈凸月2
        } else if (moonAge >= 14.5 && moonAge < 15.5) {
            return 7;  // 盈凸月3
        }
        // 满月：月龄14.5-16.5天
        else if (moonAge >= 14.5 && moonAge < 16.5) {
            return 8;  // 满月
        }
        // 亏凸月：满月后16.5-22.5天
        else if (moonAge >= 16.5 && moonAge < 19.5) {
            return 9;  // 亏凸月1
        } else if (moonAge >= 19.5 && moonAge < 22.5) {
            return 10; // 亏凸月2
        }
        // 下弦月：月龄22.5-26.5天
        else if (moonAge >= 22.5 && moonAge < 26.5) {
            return 11; // 下弦月
        }
        // 残月：月龄26.5-29.53天
        else if (moonAge >= 26.5 && moonAge < 28.0) {
            return 12; // 残月1
        } else if (moonAge >= 28.0 && moonAge < 29.0) {
            return 13; // 残月2
        } else if (moonAge >= 29.0 || moonAge < 0) {
            return 14; // 残月3（或周期结束前）
        }

        return 0; // 默认新月
    }

    // 计算地月距离
    function calculateDistance(date) {
        // 简化的距离计算，基于月龄变化
        const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const perigee = 356500; // 近地点距离
        const apogee = 406700; // 远地点距离

        const variation = Math.sin((dayOfYear / 27.3) * 2 * Math.PI) * (apogee - perigee) / 2;
        const distance = perigee + (apogee - perigee) / 2 + variation;

        return Math.round(distance);
    }

    // 计算视直径
    function calculateDiameter(distance) {
        // 基于距离计算视直径
        const meanDiameter = 31.1; // 平均视直径
        const actualDiameter = meanDiameter * (384400 / distance);
        return Math.round(actualDiameter * 100) / 100;
    }

    // 更新所有视图（支持异步加载）
    async function updateAllViews() {
        await updateGridView();
        updateTimelineView();
        updateChartTitle();
        renderMainChart();
    }

    // 更新网格视图（支持异步加载本地月相图片）
    async function updateGridView() {
        if (!elements.moonGrid) return;

        elements.moonGrid.innerHTML = '';

        // 显示加载状态
        elements.moonGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: #93c5fd;">正在加载月相图片...</div>';

        // 异步创建所有月相卡片
        const moonCards = await Promise.all(
            monthData.map(async (day) => {
                try {
                    return await createMoonCard(day);
                } catch (error) {
                    console.warn(`创建月相卡片失败: ${day.day}日`, error);
                    // 创建后备卡片
                    const card = document.createElement('div');
                    card.className = 'moon-card';
                    card.innerHTML = `
                        <div class="moon-day">${day.day}日</div>
                        <div class="moon-phase-svg">
                            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="20" r="18" fill="#1a1a2e"/>
                                <text x="20" y="25" text-anchor="middle" fill="#666" font-size="10">${day.phaseName}</text>
                            </svg>
                        </div>
                        <div class="moon-phase-name">${day.phaseName}</div>
                        <div class="moon-illumination">${day.illumination.toFixed(1)}%</div>
                    `;
                    return card;
                }
            })
        );

        // 清除加载状态并添加所有卡片
        elements.moonGrid.innerHTML = '';
        moonCards.forEach(card => {
            elements.moonGrid.appendChild(card);
        });

        // 更新标题
        if (elements.gridTitle) {
            elements.gridTitle.textContent = `${currentYear}年${currentMonth + 1}月 月相观测记录`;
        }

        console.log(`✅ 网格视图更新完成，共显示 ${moonCards.length} 个月相卡片`);
    }

    // 创建月相卡片（使用本地月相图片）- 增加动态加载效果
    async function createMoonCard(dayData) {
        const card = document.createElement('div');
        card.className = 'moon-card';

        // 添加加载中的CSS样式（只添加一次）
        const styleId = 'moon-loading-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .moon-phase-svg {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 40px;
                }

                .moon-phase-svg.loading {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 40px;
                }

                .moon-loader {
                    position: relative;
                    width: 30px;
                    height: 30px;
                }

                .moon-loader-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 2px solid transparent;
                    border-top: 2px solid #60a5fa;
                    border-radius: 50%;
                    animation: moon-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                }

                .moon-loader-ring:nth-child(1) {
                    animation-delay: -0.45s;
                }

                .moon-loader-ring:nth-child(2) {
                    animation-delay: -0.3s;
                }

                .moon-loader-ring:nth-child(3) {
                    animation-delay: -0.15s;
                }

                @keyframes moon-spin {
                    0% {
                        transform: rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: rotate(360deg);
                        opacity: 0;
                    }
                }

                .moon-phase-image {
                    animation: moon-fadeIn 0.6s ease-out;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    object-position: center center;
                    display: block;
                    margin: auto;
                }

                @keyframes moon-fadeIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.8) rotate(-10deg);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.05) rotate(5deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                }

                .moon-card {
                    animation: card-slideIn 0.5s ease-out;
                    animation-fill-mode: both;
                }

                .moon-card:nth-child(1) { animation-delay: 0.05s; }
                .moon-card:nth-child(2) { animation-delay: 0.1s; }
                .moon-card:nth-child(3) { animation-delay: 0.15s; }
                .moon-card:nth-child(4) { animation-delay: 0.2s; }
                .moon-card:nth-child(5) { animation-delay: 0.25s; }
                .moon-card:nth-child(6) { animation-delay: 0.3s; }
                .moon-card:nth-child(7) { animation-delay: 0.35s; }
                .moon-card:nth-child(8) { animation-delay: 0.4s; }
                .moon-card:nth-child(9) { animation-delay: 0.45s; }
                .moon-card:nth-child(10) { animation-delay: 0.5s; }
                .moon-card:nth-child(11) { animation-delay: 0.55s; }
                .moon-card:nth-child(12) { animation-delay: 0.6s; }
                .moon-card:nth-child(13) { animation-delay: 0.65s; }
                .moon-card:nth-child(14) { animation-delay: 0.7s; }
                .moon-card:nth-child(15) { animation-delay: 0.75s; }
                .moon-card:nth-child(16) { animation-delay: 0.8s; }
                .moon-card:nth-child(17) { animation-delay: 0.85s; }
                .moon-card:nth-child(18) { animation-delay: 0.9s; }
                .moon-card:nth-child(19) { animation-delay: 0.95s; }
                .moon-card:nth-child(20) { animation-delay: 1.0s; }
                .moon-card:nth-child(21) { animation-delay: 1.05s; }
                .moon-card:nth-child(22) { animation-delay: 1.1s; }
                .moon-card:nth-child(23) { animation-delay: 1.15s; }
                .moon-card:nth-child(24) { animation-delay: 1.2s; }
                .moon-card:nth-child(25) { animation-delay: 1.25s; }
                .moon-card:nth-child(26) { animation-delay: 1.3s; }
                .moon-card:nth-child(27) { animation-delay: 1.35s; }
                .moon-card:nth-child(28) { animation-delay: 1.4s; }
                .moon-card:nth-child(29) { animation-delay: 1.45s; }
                .moon-card:nth-child(30) { animation-delay: 1.5s; }
                .moon-card:nth-child(31) { animation-delay: 1.55s; }

                @keyframes card-slideIn {
                    0% {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .moon-phase-svg svg {
                    animation: svg-drawIn 0.8s ease-out;
                }

                @keyframes svg-drawIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.1);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .loading-pulse {
                    animation: pulse 1.5s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.4;
                    }
                    50% {
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        card.innerHTML = `
            <div class="moon-day">${dayData.day}日</div>
            <div class="moon-phase-svg loading" id="moon-phase-${dayData.day}">
                <!-- 加载动画 -->
                <div class="moon-loader">
                    <div class="moon-loader-ring"></div>
                    <div class="moon-loader-ring"></div>
                    <div class="moon-loader-ring"></div>
                    <div class="moon-loader-ring"></div>
                </div>
            </div>
            <div class="moon-phase-name">${dayData.phaseName}</div>
            <div class="moon-illumination">${dayData.illumination.toFixed(1)}%</div>
        `;

        // 异步加载月相图片，错开加载时间创造连续效果
        setTimeout(async () => {
            const moonContainer = card.querySelector(`#moon-phase-${dayData.day}`);
            if (!moonContainer) return;

            try {
                let moonElement;

                // 优先使用本地月相图片，如果不可用则使用SVG
                if (window.localMoonPhaseLoader) {
                    try {
                        // 根据日期选择不同的图片变体
                        const preferIndex = (dayData.day - 1) % 2; // 交替使用不同的图片变体
                        moonElement = await window.localMoonPhaseLoader.createLocalMoonPhaseElement(
                            dayData.illumination,
                            40,
                            preferIndex,
                            dayData.moonAge
                        );
                        console.log(`✅ 使用本地月相图片: ${dayData.day}日 - ${dayData.phaseName}`);

                        // 为图片元素添加动画类
                        if (moonElement.tagName === 'IMG') {
                            moonElement.className = 'moon-phase-image';
                        } else {
                            moonElement.classList.add('moon-phase-image');
                        }
                    } catch (error) {
                        console.warn(`本地月相图片加载失败，使用SVG后备: ${dayData.day}日`, error);
                        const moonSvg = createMoonPhaseSvg(dayData.illumination, dayData.phaseIndex, 40);
                        moonElement = createSvgContainer(moonSvg);
                    }
                } else {
                    // 后备方案：使用SVG
                    const moonSvg = createMoonPhaseSvg(dayData.illumination, dayData.phaseIndex, 40);
                    moonElement = createSvgContainer(moonSvg);
                }

                // 清除加载动画
                moonContainer.classList.remove('loading');
                moonContainer.innerHTML = '';

                // 添加月相元素
                moonContainer.appendChild(moonElement);

                // 添加成功加载的视觉反馈
                moonContainer.style.animation = 'moon-fadeIn 0.6s ease-out';

            } catch (error) {
                console.error(`月相元素创建失败: ${dayData.day}日`, error);

                // 显示错误状态
                moonContainer.classList.remove('loading');
                moonContainer.innerHTML = `
                    <div style="text-align: center; color: #ef4444; font-size: 10px;">
                        <div style="margin-bottom: 4px;">⚠️</div>
                        <div>加载失败</div>
                    </div>
                `;
                moonContainer.classList.add('loading-pulse');
            }
        }, 100 + (dayData.day * 50)); // 错开加载时间，创造连续加载效果

        // 添加悬停事件
        card.addEventListener('mouseenter', (e) => showHoverPanel(e, dayData));
        card.addEventListener('mouseleave', hideHoverPanel);

        return card;
    }

    // 创建SVG容器（用于后备方案）
    function createSvgContainer(svgContent) {
        const container = document.createElement('div');
        container.innerHTML = svgContent;
        return container.firstElementChild;
    }

    // 创建月相SVG
    function createMoonPhaseSvg(illumination, phaseIndex, size) {
        const radius = size / 2;
        const centerX = size / 2;
        const centerY = size / 2;

        let shadowPath = '';

        if (phaseIndex === 0) { // 新月
            shadowPath = `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="rgba(0,0,0,0.95)"/>`;
        } else if (phaseIndex === 4) { // 满月
            // 满月没有阴影
        } else if (phaseIndex < 4) { // 上半月
            const shadowWidth = radius * 2 * (1 - illumination / 100);
            const d = `M ${centerX + radius - shadowWidth} ${centerY - radius}
                      A ${radius} ${radius} 0 1 1 ${centerX + radius - shadowWidth} ${centerY + radius}
                      A ${shadowWidth/2} ${radius} 0 1 0 ${centerX + radius - shadowWidth} ${centerY - radius}`;
            shadowPath = `<path d="${d}" fill="rgba(0,0,0,0.8)"/>`;
        } else { // 下半月
            const shadowWidth = radius * 2 * (1 - illumination / 100);
            const d = `M ${centerX - radius + shadowWidth} ${centerY - radius}
                      A ${radius} ${radius} 0 1 0 ${centerX - radius + shadowWidth} ${centerY + radius}
                      A ${shadowWidth/2} ${radius} 0 1 1 ${centerX - radius + shadowWidth} ${centerY - radius}`;
            shadowPath = `<path d="${d}" fill="rgba(0,0,0,0.8)"/>`;
        }

        return `
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="moon-gradient-${phaseIndex}">
                        <stop offset="0%" style="stop-color:#f8f8f8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#d0d0d0;stop-opacity:1" />
                    </radialGradient>
                </defs>
                <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="url(#moon-gradient-${phaseIndex})"/>
                ${shadowPath}
            </svg>
        `;
    }

    // 更新时间线视图
    function updateTimelineView() {
        if (!elements.timelineContainer) return;

        elements.timelineContainer.innerHTML = '';

        const timelineSvg = d3.select(elements.timelineContainer)
            .append('svg')
            .attr('width', '100%')
            .attr('height', 200);

        const width = elements.timelineContainer.clientWidth;
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = 200 - margin.top - margin.bottom;

        const xScale = d3.scaleLinear()
            .domain([1, monthData.length])
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([innerHeight, 0]);

        const g = timelineSvg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // 添加轴线
        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale).ticks(monthData.length))
            .attr('color', '#94a3b8');

        g.append('g')
            .call(d3.axisLeft(yScale))
            .attr('color', '#94a3b8');

        // 绘制照明度曲线
        const line = d3.line()
            .x(d => xScale(d.day))
            .y(d => yScale(d.illumination))
            .curve(d3.curveNatural);

        g.append('path')
            .datum(monthData)
            .attr('fill', 'none')
            .attr('stroke', '#3b82f6')
            .attr('stroke-width', 2)
            .attr('d', line);

        // 添加数据点
        g.selectAll('.dot')
            .data(monthData)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(d.day))
            .attr('cy', d => yScale(d.illumination))
            .attr('r', 3)
            .attr('fill', '#60a5fa')
            .on('mouseenter', (event, d) => showTooltip(event, d))
            .on('mouseleave', hideTooltip);
    }

    // 更新图表标题
    function updateChartTitle() {
        if (!elements.chartTitle) return;

        const titles = {
            'illumination': '月相照明度变化',
            'distance': '地月距离变化',
            'diameter': '视直径变化',
            'distribution': '月相分布统计',
            'relationship': '照明度-距离关系'
        };

        elements.chartTitle.textContent = titles[currentParameter] || '数据分析';
    }

    // 渲染主图表
    function renderMainChart() {
        if (!elements.mainChart || !monthData.length) return;

        // 清空现有内容
        elements.mainChart.innerHTML = '';

        console.log(`📊 渲染主图表: ${currentParameter} - ${currentChartType}`);

        switch (currentChartType) {
            case 'line':
                renderLineChart();
                break;
            case 'scatter':
                renderScatterChart();
                break;
            case 'bar':
                renderBarChart();
                break;
            case 'area':
                renderAreaChart();
                break;
            default:
                renderLineChart();
                break;
        }
    }

    // 获取图表配置
    function getChartConfig() {
        const container = elements.mainChart;
        const containerWidth = container.clientWidth || 538;
        const containerHeight = container.clientHeight || 280;

        const margin = { top: 20, right: 30, bottom: 45, left: 60 };
        const width = Math.max(100, containerWidth - margin.left - margin.right);
        const height = Math.max(100, containerHeight - margin.top - margin.bottom);

        return { container, margin, width, height };
    }

    // 渲染折线图
    function renderLineChart() {
        const { container, margin, width, height } = getChartConfig();

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        let xScale, yScale, lineData, yAxisLabel;

        switch (currentParameter) {
            case 'illumination':
                xScale = d3.scaleLinear().domain([1, monthData.length]).range([0, width]);
                yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
                lineData = monthData.map(d => ({ x: d.day, y: d.illumination }));
                yAxisLabel = '照明度 (%)';
                break;
            case 'distance':
                xScale = d3.scaleLinear().domain([1, monthData.length]).range([0, width]);
                yScale = d3.scaleLinear().domain(d3.extent(monthData, d => d.distance)).range([height, 0]);
                lineData = monthData.map(d => ({ x: d.day, y: d.distance }));
                yAxisLabel = '距离 (km)';
                break;
            case 'diameter':
                xScale = d3.scaleLinear().domain([1, monthData.length]).range([0, width]);
                yScale = d3.scaleLinear().domain(d3.extent(monthData, d => d.diameter)).range([height, 0]);
                lineData = monthData.map(d => ({ x: d.day, y: d.diameter }));
                yAxisLabel = '视直径 (")';
                break;
            case 'distribution':
                renderPhaseDistributionChart(g, width, height);
                return;
            case 'relationship':
                renderIlluminationDistanceChart(g, width, height);
                return;
                        default:
                return;
        }

        // 创建线条生成器
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveMonotoneX);

        // 添加渐变 - 使用更美观的颜色
        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', 'line-gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        gradient.append('stop')
            .attr('offset', '0%')
            .style('stop-color', '#60a5fa')
            .style('stop-opacity', 0.8);

        gradient.append('stop')
            .attr('offset', '50%')
            .style('stop-color', '#3b82f6')
            .style('stop-opacity', 0.5);

        gradient.append('stop')
            .attr('offset', '100%')
            .style('stop-color', '#1e40af')
            .style('stop-opacity', 0.1);

        // 添加区域
        if (currentParameter === 'illumination') {
            const area = d3.area()
                .x(d => xScale(d.x))
                .y0(height)
                .y1(d => yScale(d.y))
                .curve(d3.curveMonotoneX);

            g.append('path')
                .datum(lineData)
                .attr('fill', 'url(#line-gradient)')
                .attr('d', area);
        }

        // 添加路径动画的CSS样式（如果还没有添加）
        const pathAnimationStyleId = 'chart-path-animations';
        if (!document.getElementById(pathAnimationStyleId)) {
            const pathStyle = document.createElement('style');
            pathStyle.id = pathAnimationStyleId;
            pathStyle.textContent = `
                .chart-line-animated {
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                    animation: drawLine 0.8s ease-out forwards;
                }

                @keyframes drawLine {
                    to {
                        stroke-dashoffset: 0;
                    }
                }

                .chart-dots-appear {
                    opacity: 0;
                    animation: dotsAppear 0.3s ease-out forwards;
                }

                @keyframes dotsAppear {
                    to {
                        opacity: 1;
                    }
                }

                .chart-area-animated {
                    opacity: 0;
                    animation: areaGrow 1s ease-out forwards;
                }

                @keyframes areaGrow {
                    0% {
                        opacity: 0;
                    }
                    50% {
                        opacity: 0.6;
                    }
                    100% {
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(pathStyle);
        }

        // 添加数据点（增强交互）
        const dots = g.selectAll('.dot')
            .data(lineData)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', 5)
            .attr('fill', '#60a5fa')
            .attr('stroke', '#1e40af')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .style('opacity', 0) // 初始设置透明度为0，准备动画
            .on('mouseenter', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 8)
                    .attr('fill', '#93c5fd');
                showTooltip(event, d);
            })
            .on('mouseleave', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 5)
                    .attr('fill', '#60a5fa');
                hideTooltip();
            })
            .on('click', function(event, d) {
                // 点击事件：高亮显示该天的详细信息
                highlightDayDetails(d);
            });

        // 绘制线条（添加动态绘制效果）
        const chartLine = g.append('path')
            .datum(lineData)
            .attr('fill', 'none')
            .attr('stroke', '#3b82f6')
            .attr('stroke-width', 3)
            .attr('d', line)
            .classed('chart-line-animated', true);

        // 为面积添加动画
        if (currentParameter === 'illumination') {
            g.select('path[fill*="url(#line-gradient)"]')
                .classed('chart-area-animated', true);
        }

        // 延迟显示数据点，让它们在线条绘制完成后依次出现
        dots.each(function(d, i) {
            const dot = d3.select(this);
            setTimeout(() => {
                dot
                    .classed('chart-dots-appear', true);
            }, 800 + (i * 30)); // 延迟0.8秒开始，每个点间隔30ms
        });

        // 移除缩放功能 - 禁用所有zoom行为以防止意外的拖拽和缩放
        // 注：月相数据图表不需要缩放功能，所有数据都应该可见

        // 添加坐标轴
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(Math.min(10, monthData.length)))
            .attr('color', '#94a3b8')
            .attr('font-size', '12px');

        g.append('g')
            .call(d3.axisLeft(yScale).ticks(6))
            .attr('color', '#94a3b8')
            .attr('font-size', '12px');

        // 添加Y轴标签
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('fill', '#94a3b8')
            .style('font-size', '12px')
            .text(yAxisLabel);
    }

    // 渲染散点图
    function renderScatterChart() {
        const { container, margin, width, height } = getChartConfig();

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        let xScale, yScale, scatterData, colorScale;

        switch (currentParameter) {
            case 'illumination':
                xScale = d3.scaleLinear().domain([1, monthData.length]).range([0, width]);
                yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
                scatterData = monthData.map(d => ({ x: d.day, y: d.illumination }));
                colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 100]);
                break;
            case 'distance':
                xScale = d3.scaleLinear().domain([1, monthData.length]).range([0, width]);
                yScale = d3.scaleLinear().domain(d3.extent(monthData, d => d.distance)).range([height, 0]);
                scatterData = monthData.map(d => ({ x: d.day, y: d.distance }));
                colorScale = d3.scaleSequential(d3.interpolatePurples).domain(d3.extent(monthData, d => d.distance));
                break;
            case 'diameter':
                xScale = d3.scaleLinear().domain([1, monthData.length]).range([0, width]);
                yScale = d3.scaleLinear().domain(d3.extent(monthData, d => d.diameter)).range([height, 0]);
                scatterData = monthData.map(d => ({ x: d.day, y: d.diameter }));
                colorScale = d3.scaleSequential(d3.interpolateGreens).domain(d3.extent(monthData, d => d.diameter));
                break;
            case 'relationship':
                renderIlluminationDistanceScatter(g, width, height);
                return;
            default:
                return;
        }

        // 添加散点动画样式
        const scatterAnimationStyleId = 'chart-scatter-animations';
        if (!document.getElementById(scatterAnimationStyleId)) {
            const scatterStyle = document.createElement('style');
            scatterStyle.id = scatterAnimationStyleId;
            scatterStyle.textContent = `
                .scatter-dot-animated {
                    animation: scatterAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }

                @keyframes scatterAppear {
                    0% {
                        opacity: 0;
                        transform: scale(0) rotate(0deg);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.1) rotate(180deg);
                    }
                    100% {
                        opacity: 0.8;
                        transform: scale(1) rotate(360deg);
                    }
                }
            `;
            document.head.appendChild(scatterStyle);
        }

        // 添加散点（带动画效果）
        g.selectAll('.dot')
            .data(scatterData)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', 0) // 初始半径为0
            .attr('fill', d => colorScale(d.y))
            .attr('opacity', 0)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .style('cursor', 'pointer')
            .on('mouseenter', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 8)
                    .attr('opacity', 1);
                showTooltip(event, d);
            })
            .on('mouseleave', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 5)
                    .attr('opacity', 0.8);
                hideTooltip();
            })
            .on('click', function(event, d) {
                highlightDayDetails(d);
            })
            .transition()
            .duration(300)
            .delay((d, i) => i * 20) // 错开动画时间
            .attr('r', 5)
            .attr('opacity', 0.8);

        // 添加坐标轴
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(Math.min(10, monthData.length)))
            .attr('color', '#94a3b8')
            .attr('font-size', '12px');

        g.append('g')
            .call(d3.axisLeft(yScale).ticks(6))
            .attr('color', '#94a3b8')
            .attr('font-size', '12px');
    }

    // 渲染柱状图
    function renderBarChart() {
        const { container, margin, width, height } = getChartConfig();

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        switch (currentParameter) {
            case 'illumination':
                renderIlluminationBars(g, width, height);
                break;
            case 'distance':
                renderDistanceBars(g, width, height);
                break;
            case 'diameter':
                renderDiameterBars(g, width, height);
                break;
            case 'distribution':
                renderPhaseDistributionChart(g, width, height);
                break;
                        default:
                renderIlluminationBars(g, width, height);
                break;
        }
    }

    // 渲染面积图
    function renderAreaChart() {
        const { container, margin, width, height } = getChartConfig();

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        if (currentParameter === 'illumination') {
            const xScale = d3.scaleLinear().domain([1, monthData.length]).range([0, width]);
            const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

            const area = d3.area()
                .x(d => xScale(d.day))
                .y0(height)
                .y1(d => yScale(d.illumination))
                .curve(d3.curveMonotoneX);

            const gradient = svg.append('defs')
                .append('linearGradient')
                .attr('id', 'area-gradient')
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '0%')
                .attr('y2', '100%');

            gradient.append('stop')
                .attr('offset', '0%')
                .style('stop-color', '#3b82f6')
                .style('stop-opacity', 0.8);

            gradient.append('stop')
                .attr('offset', '100%')
                .style('stop-color', '#3b82f6')
                .style('stop-opacity', 0.1);

            g.append('path')
                .datum(monthData)
                .attr('fill', 'url(#area-gradient)')
                .attr('d', area);

            // 添加坐标轴
            g.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(xScale).ticks(Math.min(10, monthData.length)))
                .attr('color', '#94a3b8')
                .attr('font-size', '12px');

            g.append('g')
                .call(d3.axisLeft(yScale).ticks(6))
                .attr('color', '#94a3b8')
                .attr('font-size', '12px');
        } else {
            // 其他参数使用面积图版本的折线图
            renderLineChart();
        }
    }

    // 切换视图
    function switchView(viewType) {
        if (!elements.gridView || !elements.timelineView) return;

        if (viewType === 'grid') {
            elements.gridView.classList.remove('hidden');
            elements.timelineView.classList.add('hidden');
            elements.gridViewBtn.classList.add('active');
            elements.timelineViewBtn.classList.remove('active');
        } else if (viewType === 'timeline') {
            elements.gridView.classList.add('hidden');
            elements.timelineView.classList.remove('hidden');
            elements.gridViewBtn.classList.remove('active');
            elements.timelineViewBtn.classList.add('active');
        }
    }

    // 更新统计信息
    function updateStatistics() {
        if (!elements.avgIllumination || !elements.fullMoonCount || !elements.observationDays) return;

        const avgIllumination = d3.mean(monthData, d => d.illumination);
        const fullMoonCount = monthData.filter(d => d.phaseName === '满月').length;
        const observationDays = monthData.length;

        elements.avgIllumination.textContent = `${avgIllumination.toFixed(1)}%`;
        elements.fullMoonCount.textContent = `${fullMoonCount}次`;
        elements.observationDays.textContent = `${observationDays}天`;
    }

    // 显示悬浮面板
    function showHoverPanel(event, dayData) {
        const hoverPanel = document.getElementById('hover-panel');
        if (!hoverPanel) return;

        const hoverMoon = document.getElementById('hover-moon');
        const hoverPhaseName = document.getElementById('hover-phase-name');
        const hoverDate = document.getElementById('hover-date');
        const hoverLunarDate = document.getElementById('hover-lunar-date');
        const hoverIllumination = document.getElementById('hover-illumination');
        const hoverDistance = document.getElementById('hover-distance');
        const hoverProgress = document.getElementById('hover-progress');

        // 显示月相
        if (hoverMoon) {
            hoverMoon.innerHTML = createMoonPhaseSvg(dayData.illumination, dayData.phaseIndex, 80);
        }
        if (hoverPhaseName) {
            hoverPhaseName.textContent = dayData.phaseName;
        }
        if (hoverDate) {
            hoverDate.textContent = `${dayData.date.getFullYear()}-${String(dayData.date.getMonth() + 1).padStart(2, '0')}-${String(dayData.day).padStart(2, '0')}`;
        }
        if (hoverIllumination) {
            hoverIllumination.textContent = `${dayData.illumination.toFixed(1)}%`;
        }
        if (hoverDistance) {
            hoverDistance.textContent = `${(dayData.distance / 1000).toFixed(0)} km`;
        }
        if (hoverProgress) {
            const progress = (dayData.day / monthData.length) * 100;
            hoverProgress.textContent = `${progress.toFixed(1)}%`;
        }

        // 显示农历信息
        if (lunarCalendar && hoverLunarDate) {
            // 传递moon age数据来提高农历计算准确性
            const moonAge = dayData.moonAge || null;
            const lunarInfo = lunarCalendar.solarToLunar(
                dayData.date.getFullYear(),
                dayData.date.getMonth() + 1,
                dayData.day,
                moonAge
            );

            let lunarText = lunarInfo.monthName + lunarInfo.dayName;
            if (lunarInfo.isLeapMonth) {
                lunarText = '闰' + lunarText;
            }
            hoverLunarDate.textContent = lunarText;
        } else {
            // 如果农历计算器未加载，显示默认值
            if (hoverLunarDate) hoverLunarDate.textContent = '农历信息加载中...';
        }

        hoverPanel.classList.remove('hidden');
    }

    // 隐藏悬浮面板
    function hideHoverPanel() {
        const hoverPanel = document.getElementById('hover-panel');
        if (hoverPanel) {
            hoverPanel.classList.add('hidden');
        }
    }

    // 显示增强的工具提示
    function showTooltip(event, data) {
        // 移除现有的工具提示
        hideTooltip();

        // 获取对应的天数据
        const dayData = monthData.find(d => d.day === (data.day || data.x));
        if (!dayData) return;

        const tooltip = d3.select('body').append('div')
            .attr('class', 'enhanced-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(30, 41, 59, 0.98)')
            .style('color', '#ffffff')
            .style('padding', '12px')
            .style('border-radius', '8px')
            .style('font-size', '13px')
            .style('pointer-events', 'none')
            .style('z-index', '2000')
            .style('border', '1px solid rgba(59, 130, 246, 0.3)')
            .style('box-shadow', '0 8px 32px rgba(0, 0, 0, 0.4)')
            .style('backdrop-filter', 'blur(10px)')
            .style('min-width', '200px');

        // 根据当前参数显示不同的信息
        let tooltipContent = `
            <div style="border-bottom: 1px solid rgba(59, 130, 246, 0.2); padding-bottom: 8px; margin-bottom: 8px;">
                <strong style="color: #60a5fa; font-size: 14px;">${dayData.date.getFullYear()}年${dayData.date.getMonth() + 1}月${dayData.day}日</strong>
            </div>
        `;

        // 根据当前参数类型显示特定信息
        switch (currentParameter) {
            case 'illumination':
                tooltipContent += `
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span style="color: #94a3b8;">月相:</span>
                        <strong style="color: #60a5fa;">${dayData.phaseName}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span style="color: #94a3b8;">照明度:</span>
                        <strong style="color: #3b82f6;">${dayData.illumination.toFixed(1)}%</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span style="color: #94a3b8;">月龄:</span>
                        <strong style="color: #8b5cf6;">${dayData.moonAge.toFixed(1)}天</strong>
                    </div>
                `;
                break;
            case 'distance':
                tooltipContent += `
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span style="color: #94a3b8;">地月距离:</span>
                        <strong style="color: #a855f7;">${(dayData.distance / 1000).toFixed(0)} km</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span style="color: #94a3b8;">距平均:</span>
                        <strong style="color: ${dayData.distance > 384400 ? '#ef4444' : '#10b981'};">
                            ${((dayData.distance - 384400) / 1000).toFixed(0)} km
                        </strong>
                    </div>
                `;
                break;
            case 'diameter':
                tooltipContent += `
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span style="color: #94a3b8;">视直径:</span>
                        <strong style="color: #10b981;">${dayData.diameter.toFixed(2)}"</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span style="color: #94a3b8;">照明度:</span>
                        <strong style="color: #3b82f6;">${dayData.illumination.toFixed(1)}%</strong>
                    </div>
                `;
                break;
            case 'distribution':
                // 处理月相分布图表的特殊数据
                if (data.name && data.count !== undefined) {
                    tooltipContent += `
                        <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                            <span style="color: #94a3b8;">出现次数:</span>
                            <strong style="color: #3b82f6;">${data.count} 次</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                            <span style="color: #94a3b8;">占比:</span>
                            <strong style="color: #a855f7;">${data.percentage}%</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                            <span style="color: #94a3b8;">平均照明度:</span>
                            <strong style="color: #10b981;">${data.avgIllumination}%</strong>
                        </div>
                    `;
                    break;
                }
                // fallthrough for other distribution data
            default:
                tooltipContent += `
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span style="color: #94a3b8;">月相:</span>
                        <strong style="color: #60a5fa;">${dayData.phaseName}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span style="color: #94a3b8;">照明度:</span>
                        <strong style="color: #3b82f6;">${dayData.illumination.toFixed(1)}%</strong>
                    </div>
                `;
        }

        // 添加额外信息
        if (dayData.dailyRecords > 0) {
            tooltipContent += `
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(59, 130, 246, 0.2); font-size: 11px;">
                    <span style="color: #64748b;">基于 ${dayData.dailyRecords} 条真实记录</span>
                </div>
            `;
        } else if (dayData.isSimulated) {
            tooltipContent += `
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(239, 68, 68, 0.2); font-size: 11px;">
                    <span style="color: #ef4444;">* 计算数据</span>
                </div>
            `;
        }

        tooltip.html(tooltipContent);

        // 智能定位，避免超出屏幕
        const tooltipNode = tooltip.node();
        const tooltipRect = tooltipNode.getBoundingClientRect();
        let left = event.pageX + 15;
        let top = event.pageY - 10;

        if (left + tooltipRect.width > window.innerWidth) {
            left = event.pageX - tooltipRect.width - 15;
        }
        if (top + tooltipRect.height > window.innerHeight) {
            top = event.pageY - tooltipRect.height - 10;
        }

        tooltip.style('left', left + 'px')
            .style('top', top + 'px');

        // 添加淡入动画
        tooltip.style('opacity', 0)
            .transition()
            .duration(200)
            .style('opacity', 1);
    }

    // 隐藏工具提示
    function hideTooltip() {
        d3.selectAll('.enhanced-tooltip')
            .transition()
            .duration(150)
            .style('opacity', 0)
            .remove();
    }

    // 高亮显示选中日期的详细信息
    function highlightDayDetails(data) {
        const dayData = monthData.find(d => d.day === (data.day || data.x));
        if (!dayData) return;

        // 创建详细信息面板
        const existingPanel = d3.select('.detail-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const detailPanel = d3.select('body').append('div')
            .attr('class', 'detail-panel')
            .style('position', 'fixed')
            .style('top', '50%')
            .style('left', '50%')
            .style('transform', 'translate(-50%, -50%)')
            .style('background', 'rgba(30, 41, 59, 0.98)')
            .style('border', '2px solid rgba(59, 130, 246, 0.4)')
            .style('border-radius', '12px')
            .style('padding', '24px')
            .style('min-width', '400px')
            .style('max-width', '500px')
            .style('box-shadow', '0 20px 60px rgba(0, 0, 0, 0.5)')
            .style('backdrop-filter', 'blur(20px)')
            .style('z-index', '3000');

        let detailContent = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #60a5fa; font-size: 18px; font-weight: 600;">
                    ${dayData.date.getFullYear()}年${dayData.date.getMonth() + 1}月${dayData.day}日 详细信息
                </h3>
                <button onclick="this.parentElement.parentElement.remove()"
                        style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 0; line-height: 1;">
                    ×
                </button>
            </div>
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: center;">
                <div style="grid-column: 1 / -1; display: flex; justify-content: center; margin-bottom: 16px;">
                    <div id="detail-moon-container-${dayData.day}" style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;">
                        <!-- 加载动画 -->
                        <div class="detail-moon-loader">
                            <div class="detail-loader-ring"></div>
                            <div class="detail-loader-ring"></div>
                            <div class="detail-loader-ring"></div>
                        </div>
                    </div>
                </div>
                <div style="color: #94a3b8;">月相名称:</div>
                <div style="color: #60a5fa; font-weight: 600; font-size: 16px;">${dayData.phaseName}</div>

                <div style="color: #94a3b8;">照明度:</div>
                <div style="color: #3b82f6; font-weight: 600;">
                    ${dayData.illumination.toFixed(1)}%
                    <div style="background: rgba(59, 130, 246, 0.2); height: 4px; border-radius: 2px; margin-top: 4px;">
                        <div style="background: #3b82f6; height: 100%; width: ${dayData.illumination}%; border-radius: 2px; transition: width 0.5s ease;"></div>
                    </div>
                </div>

                <div style="color: #94a3b8;">月龄:</div>
                <div style="color: #8b5cf6; font-weight: 600;">${dayData.moonAge.toFixed(1)} 天</div>

                <div style="color: #94a3b8;">地月距离:</div>
                <div style="color: #a855f7; font-weight: 600;">
                    ${(dayData.distance / 1000).toFixed(0)} km
                    <span style="color: ${dayData.distance > 384400 ? '#ef4444' : '#10b981'}; font-size: 12px;">
                        (${dayData.distance > 384400 ? '+' : ''}${((dayData.distance - 384400) / 1000).toFixed(0)} km)
                    </span>
                </div>

                <div style="color: #94a3b8;">视直径:</div>
                <div style="color: #10b981; font-weight: 600;">${dayData.diameter.toFixed(2)} 角分</div>
        `;

        // 添加真实数据标识
        if (dayData.dailyRecords > 0) {
            detailContent += `
                <div style="color: #94a3b8;">数据来源:</div>
                <div style="color: #64748b; font-size: 14px;">
                    ✅ ${dayData.dailyRecords} 条真实观测记录
                </div>
            `;
        } else if (dayData.isSimulated) {
            detailContent += `
                <div style="color: #94a3b8;">数据来源:</div>
                <div style="color: #ef4444; font-size: 14px;">
                    ⚠️ 基于计算模型
                </div>
            `;
        }

        // 添加交互按钮
        detailContent += `
            <div style="grid-column: 1 / -1; margin-top: 16px; display: flex; gap: 8px; justify-content: center;">
                <button onclick="navigator.clipboard.writeText('${JSON.stringify(dayData, null, 2)}'); alert('数据已复制到剪贴板!')"
                        style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                    📋 复制数据
                </button>
                <button onclick="window.open('https://www.timeanddate.com/moon/phases/${new Date().getFullYear()}', '_blank')"
                        style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                    🔗 查看详情
                </button>
            </div>
        `;

        detailPanel.html(detailContent);

        // 添加详细信息面板的样式（如果还没有添加）
        const detailStyleId = 'detail-panel-styles';
        if (!document.getElementById(detailStyleId)) {
            const detailStyle = document.createElement('style');
            detailStyle.id = detailStyleId;
            detailStyle.textContent = `
                .detail-moon-loader {
                    position: relative;
                    width: 40px;
                    height: 40px;
                }

                .detail-loader-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 3px solid transparent;
                    border-top: 3px solid #60a5fa;
                    border-radius: 50%;
                    animation: detail-spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                }

                .detail-loader-ring:nth-child(1) {
                    animation-delay: -0.33s;
                }

                .detail-loader-ring:nth-child(2) {
                    animation-delay: -0.16s;
                }

                @keyframes detail-spin {
                    0% {
                        transform: rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: rotate(360deg);
                        opacity: 0;
                    }
                }

                .detail-moon-image {
                    animation: detail-moonFadeIn 0.8s ease-out;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                }

                @keyframes detail-moonFadeIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.6) rotate(-15deg);
                    }
                    50% {
                        opacity: 0.9;
                        transform: scale(1.1) rotate(8deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                }
            `;
            document.head.appendChild(detailStyle);
        }

        // 添加淡入动画
        detailPanel.style('opacity', 0)
            .transition()
            .duration(300)
            .style('opacity', 1);

        // 异步加载详细信息面板中的月相图片
        setTimeout(async () => {
            const moonContainer = document.getElementById(`detail-moon-container-${dayData.day}`);
            if (!moonContainer) return;

            try {
                let moonElement;

                // 尝试使用本地月相图片
                if (window.localMoonPhaseLoader) {
                    try {
                        const preferIndex = (dayData.day - 1) % 2;
                        moonElement = await window.localMoonPhaseLoader.createLocalMoonPhaseElement(
                            dayData.illumination,
                            120,
                            preferIndex,
                            dayData.moonAge
                        );

                        if (moonElement.tagName === 'IMG') {
                            moonElement.className = 'detail-moon-image';
                        } else {
                            moonElement.classList.add('detail-moon-image');
                        }
                    } catch (error) {
                        console.warn(`详细信息面板本地图片加载失败: ${dayData.day}日`, error);
                        const moonSvg = createMoonPhaseSvg(dayData.illumination, dayData.phaseIndex, 120);
                        moonElement = createSvgContainer(moonSvg);
                    }
                } else {
                    // 后备方案：使用SVG
                    const moonSvg = createMoonPhaseSvg(dayData.illumination, dayData.phaseIndex, 120);
                    moonElement = createSvgContainer(moonSvg);
                }

                // 清除加载动画并显示月相
                moonContainer.innerHTML = '';
                moonContainer.appendChild(moonElement);

            } catch (error) {
                console.error(`详细信息面板月相元素创建失败: ${dayData.day}日`, error);
                moonContainer.innerHTML = `
                    <div style="text-align: center; color: #ef4444; font-size: 12px;">
                        <div style="margin-bottom: 8px;">⚠️</div>
                        <div>图片加载失败</div>
                    </div>
                `;
            }
        }, 200); // 延迟200ms加载，创造更好的视觉效果

        // 点击背景关闭
        d3.select('body').append('div')
            .attr('class', 'detail-panel-backdrop')
            .style('position', 'fixed')
            .style('top', 0)
            .style('left', 0)
            .style('width', '100%')
            .style('height', '100%')
            .style('background', 'rgba(0, 0, 0, 0.5)')
            .style('z-index', '2999')
            .on('click', function() {
                d3.selectAll('.detail-panel, .detail-panel-backdrop').remove();
            });
    }

    // 辅助图表渲染函数
    function renderIlluminationBars(g, width, height) {
        const xScale = d3.scaleBand()
            .domain(monthData.map(d => d.day))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        // 添加柱状图动画样式
        const barAnimationStyleId = 'chart-bar-animations';
        if (!document.getElementById(barAnimationStyleId)) {
            const barStyle = document.createElement('style');
            barStyle.id = barAnimationStyleId;
            barStyle.textContent = `
                .bar-animated {
                    animation: barGrow 1s ease-out forwards;
                }

                @keyframes barGrow {
                    0% {
                        transform: scaleY(0);
                        transform-origin: bottom;
                    }
                    100% {
                        transform: scaleY(1);
                        transform-origin: bottom;
                    }
                }

                .bar-stagger {
                    animation-delay: var(--stagger-delay, 0s);
                }
            `;
            document.head.appendChild(barStyle);
        }

        g.selectAll('.bar')
            .data(monthData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.day))
            .attr('y', height) // 从底部开始
            .attr('width', xScale.bandwidth())
            .attr('height', 0) // 初始高度为0
            .attr('fill', '#3b82f6')
            .style('transform-origin', 'bottom')
            .style('--stagger-delay', d => `${d.day * 0.03}s`) // 计算延迟时间
            .on('mouseenter', (event, d) => showTooltip(event, d))
            .on('mouseleave', hideTooltip)
            .transition()
            .duration(400)
            .delay((d, i) => i * 15) // 错开动画时间
            .attr('y', d => yScale(d.illumination))
            .attr('height', d => height - yScale(d.illumination));

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(Math.min(10, monthData.length)))
            .attr('color', '#94a3b8')
            .attr('font-size', '12px');

        g.append('g')
            .call(d3.axisLeft(yScale).ticks(6))
            .attr('color', '#94a3b8')
            .attr('font-size', '12px');
    }

    function renderDistanceBars(g, width, height) {
        const xScale = d3.scaleBand()
            .domain(monthData.map(d => d.day))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(monthData, d => d.distance))
            .range([height, 0]);

        g.selectAll('.bar')
            .data(monthData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.day))
            .attr('y', d => yScale(d.distance))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d.distance))
            .attr('fill', '#a855f7')
            .on('mouseenter', (event, d) => showTooltip(event, d))
            .on('mouseleave', hideTooltip);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(Math.min(10, monthData.length)))
            .attr('color', '#94a3b8')
            .attr('font-size', '12px');

        g.append('g')
            .call(d3.axisLeft(yScale).ticks(6))
            .attr('color', '#94a3b8')
            .attr('font-size', '12px');
    }

    function renderDiameterBars(g, width, height) {
        const xScale = d3.scaleBand()
            .domain(monthData.map(d => d.day))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(monthData, d => d.diameter))
            .range([height, 0]);

        g.selectAll('.bar')
            .data(monthData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.day))
            .attr('y', d => yScale(d.diameter))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d.diameter))
            .attr('fill', '#10b981')
            .on('mouseenter', (event, d) => showTooltip(event, d))
            .on('mouseleave', hideTooltip);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(Math.min(10, monthData.length)))
            .attr('color', '#94a3b8')
            .attr('font-size', '12px');

        g.append('g')
            .call(d3.axisLeft(yScale).ticks(6))
            .attr('color', '#94a3b8')
            .attr('font-size', '12px');
    }

    function renderPhaseDistributionChart(g, width, height) {
        const phaseCounts = {};
        monthData.forEach(d => {
            phaseCounts[d.phaseName] = (phaseCounts[d.phaseName] || 0) + 1;
        });

        const data = Object.entries(phaseCounts).map(([name, count]) => ({ name, count }));

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count)])
            .range([height, 0]);

        const colors = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

        g.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.name))
            .attr('y', d => yScale(d.count))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d.count))
            .attr('fill', (d, i) => colors[i % colors.length])
            .attr('rx', 4) // 圆角
            .style('cursor', 'pointer')
            .on('mouseenter', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 0.8)
                    .attr('stroke', '#ffffff')
                    .attr('stroke-width', 2);

                // 显示详细的月相分布信息
                const phaseData = monthData.filter(item => item.phaseName === d.name);
                const avgIllumination = d3.mean(phaseData, item => item.illumination);

                showTooltip(event, {
                    ...d,
                    avgIllumination: avgIllumination.toFixed(1),
                    percentage: ((d.count / monthData.length) * 100).toFixed(1)
                });
            })
            .on('mouseleave', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 1)
                    .attr('stroke-width', 0);
                hideTooltip();
            })
            .on('click', function(event, d) {
                // 点击显示该月相的所有日期
                showPhaseDates(d.name);
            });

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .attr('color', '#94a3b8')
            .attr('font-size', '10px');

        g.append('g')
            .call(d3.axisLeft(yScale).ticks(6))
            .attr('color', '#94a3b8')
            .attr('font-size', '12px');
    }

    function renderIlluminationDistanceChart(g, width, height) {
        const xScale = d3.scaleLinear()
            .domain(d3.extent(monthData, d => d.distance))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        g.selectAll('.dot')
            .data(monthData)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(d.distance))
            .attr('cy', d => yScale(d.illumination))
            .attr('r', 5)
            .attr('fill', '#a855f7')
            .attr('opacity', 0.8)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .on('mouseenter', (event, d) => showTooltip(event, d))
            .on('mouseleave', hideTooltip);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => `${(d/1000).toFixed(0)}k`))
            .attr('color', '#94a3b8')
            .attr('font-size', '12px');

        g.append('g')
            .call(d3.axisLeft(yScale).ticks(6))
            .attr('color', '#94a3b8')
            .attr('font-size', '12px');

        // 添加坐标轴标签
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - 50)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('fill', '#94a3b8')
            .style('font-size', '12px')
            .text('照明度 (%)');

        g.append('text')
            .attr('transform', `translate(${width / 2}, ${height + 40})`)
            .style('text-anchor', 'middle')
            .style('fill', '#94a3b8')
            .style('font-size', '12px')
            .text('地月距离 (千公里)');
    }

    
    function renderIlluminationDistanceScatter(g, width, height) {
        renderIlluminationDistanceChart(g, width, height);
    }

    // 显示特定月相的所有日期
    function showPhaseDates(phaseName) {
        const phaseData = monthData.filter(d => d.phaseName === phaseName);

        if (phaseData.length === 0) return;

        // 创建月相日期列表面板
        const existingPanel = d3.select('.phase-dates-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const datesPanel = d3.select('body').append('div')
            .attr('class', 'phase-dates-panel')
            .style('position', 'fixed')
            .style('top', '50%')
            .style('left', '50%')
            .style('transform', 'translate(-50%, -50%)')
            .style('background', 'rgba(30, 41, 59, 0.98)')
            .style('border', '2px solid rgba(59, 130, 246, 0.4)')
            .style('border-radius', '12px')
            .style('padding', '24px')
            .style('min-width', '350px')
            .style('max-width', '450px')
            .style('max-height', '60vh')
            .style('overflow-y', 'auto')
            .style('box-shadow', '0 20px 60px rgba(0, 0, 0, 0.5)')
            .style('backdrop-filter', 'blur(20px)')
            .style('z-index', '3000');

        let datesContent = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #60a5fa; font-size: 18px; font-weight: 600;">
                    ${phaseName} 日期列表
                </h3>
                <button onclick="this.parentElement.parentElement.remove(); d3.selectAll('.phase-dates-backdrop').remove();"
                        style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 0; line-height: 1;">
                    ×
                </button>
            </div>
            <div style="color: #94a3b8; margin-bottom: 16px;">
                共找到 <span style="color: #60a5fa; font-weight: 600;">${phaseData.length}</span> 个${phaseName}日期
            </div>
            <div style="display: grid; gap: 8px;">
        `;

        // 按日期排序
        phaseData.sort((a, b) => a.day - b.day);

        phaseData.forEach((day, index) => {
            datesContent += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; cursor: pointer; transition: all 0.2s ease; animation: phase-item-slideIn 0.4s ease-out; animation-delay: ${index * 0.05}s; animation-fill-mode: both;"
                     onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'"
                     onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'"
                     onclick="d3.selectAll('.phase-dates-panel, .phase-dates-backdrop').remove(); highlightDayDetails({day: ${day.day}});">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div id="phase-list-moon-${day.day}" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                            <!-- 小型加载动画 -->
                            <div class="phase-list-loader">
                                <div class="phase-list-loader-ring"></div>
                            </div>
                        </div>
                        <div>
                            <div style="color: #ffffff; font-weight: 600; font-size: 14px;">
                                ${day.date.getMonth() + 1}月${day.day}日
                            </div>
                            <div style="color: #94a3b8; font-size: 12px;">
                                月龄 ${day.moonAge.toFixed(1)}天
                            </div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #3b82f6; font-weight: 600; font-size: 14px;">
                            ${day.illumination.toFixed(1)}%
                        </div>
                        <div style="color: #a855f7; font-size: 12px;">
                            ${(day.distance / 1000).toFixed(0)} km
                        </div>
                    </div>
                </div>
            `;
        });

        // 添加月相列表的样式和加载逻辑
        datesContent += `
            <style>
                .phase-list-loader {
                    position: relative;
                    width: 20px;
                    height: 20px;
                }

                .phase-list-loader-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 1.5px solid transparent;
                    border-top: 1.5px solid #60a5fa;
                    border-radius: 50%;
                    animation: phase-list-spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                }

                @keyframes phase-list-spin {
                    0% {
                        transform: rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: rotate(360deg);
                        opacity: 0;
                    }
                }

                .phase-list-moon-image {
                    animation: phase-list-moonFadeIn 0.5s ease-out;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                }

                @keyframes phase-list-moonFadeIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.7) rotate(-8deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                }

                @keyframes phase-item-slideIn {
                    0% {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            </style>
        `;

      datesContent += `
            </div>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(59, 130, 246, 0.2); text-align: center; color: #64748b; font-size: 12px;">
                💡 点击任意日期查看详细信息
            </div>
        `;

        datesPanel.html(datesContent);

        // 异步加载月相列表中的小图片
        phaseData.forEach(day => {
            setTimeout(async () => {
                const moonContainer = document.getElementById(`phase-list-moon-${day.day}`);
                if (!moonContainer) return;

                try {
                    let moonElement;

                    if (window.localMoonPhaseLoader) {
                        try {
                            const preferIndex = (day.day - 1) % 2;
                            moonElement = await window.localMoonPhaseLoader.createLocalMoonPhaseElement(
                                day.illumination,
                                30,
                                preferIndex,
                                day.moonAge
                            );

                            if (moonElement.tagName === 'IMG') {
                                moonElement.className = 'phase-list-moon-image';
                            } else {
                                moonElement.classList.add('phase-list-moon-image');
                            }
                        } catch (error) {
                            const moonSvg = createMoonPhaseSvg(day.illumination, day.phaseIndex, 30);
                            moonElement = createSvgContainer(moonSvg);
                        }
                    } else {
                        const moonSvg = createMoonPhaseSvg(day.illumination, day.phaseIndex, 30);
                        moonElement = createSvgContainer(moonSvg);
                    }

                    moonContainer.innerHTML = '';
                    moonContainer.appendChild(moonElement);

                } catch (error) {
                    moonContainer.innerHTML = '<div style="color: #ef4444; font-size: 8px;">⚠️</div>';
                }
            }, 100 + (day.day * 30)); // 错开加载时间
        });

        // 添加淡入动画
        datesPanel.style('opacity', 0)
            .transition()
            .duration(300)
            .style('opacity', 1);

        // 点击背景关闭
        d3.select('body').append('div')
            .attr('class', 'phase-dates-backdrop')
            .style('position', 'fixed')
            .style('top', 0)
            .style('left', 0)
            .style('width', '100%')
            .style('height', '100%')
            .style('background', 'rgba(0, 0, 0, 0.5)')
            .style('z-index', '2999')
            .on('click', function() {
                d3.selectAll('.phase-dates-panel, .phase-dates-backdrop').remove();
            });
    }

    // 设置当前日期
    function setCurrentDate() {
        if (elements.yearSelect) {
            elements.yearSelect.value = currentYear;
        }
        if (elements.monthSelect) {
            elements.monthSelect.value = currentMonth;
        }
        if (elements.parameterSelect) {
            elements.parameterSelect.value = currentParameter;
        }
        if (elements.chartTypeSelect) {
            elements.chartTypeSelect.value = currentChartType;
        }
    }

    // 切换农历/阳历模式
    function toggleLunarMode() {
        isLunarMode = !isLunarMode;

        // 更新按钮状态和样式
        if (elements.lunarToggle) {
            if (isLunarMode) {
                elements.lunarToggle.classList.add('active');
                elements.lunarToggle.textContent = '阳历'; // 当前显示农历，点击后切换到阳历
            } else {
                elements.lunarToggle.classList.remove('active');
                elements.lunarToggle.textContent = '农历'; // 当前显示阳历，点击后切换到农历
            }
        }

        // 更新月相格子中的日期显示
        updateDayDisplay();
    }

    // 更新日期显示
    function updateDayDisplay() {
        if (!elements.moonGrid) return;

        const moonCards = elements.moonGrid.querySelectorAll('.moon-card');
        moonCards.forEach((card, index) => {
            const dayElement = card.querySelector('.moon-day');
            if (dayElement) {
                const dayNumber = index + 1;

                if (isLunarMode) {
                    // 显示农历日期
                    const lunarInfo = getLunarDateForDay(dayNumber);
                    dayElement.textContent = lunarInfo;
                    dayElement.style.color = '#94a3b8'; // 农历日期用灰色，与阳历一致
                } else {
                    // 显示阳历日期
                    dayElement.textContent = `${dayNumber}日`;
                    dayElement.style.color = '#94a3b8'; // 阳历日期用灰色
                }
            }
        });
    }

    // 获取指定日期的农历信息
    function getLunarDateForDay(day) {
        if (!lunarCalendar || !monthData || monthData.length === 0) {
            return '未知';
        }

        const dayData = monthData[day - 1];
        if (!dayData || !dayData.date) {
            return '未知';
        }

        try {
            // 使用moon age数据提高准确性
            const moonAge = dayData.moonAge || null;
            const lunarInfo = lunarCalendar.solarToLunar(
                dayData.date.getFullYear(),
                dayData.date.getMonth() + 1,
                dayData.day,
                moonAge
            );

            // 返回简化的农历日期格式
            let lunarText = lunarInfo.monthName.replace('正月', '正月')
                                .replace('二月', '二月')
                                .replace('三月', '三月')
                                .replace('四月', '四月')
                                .replace('五月', '五月')
                                .replace('六月', '六月')
                                .replace('七月', '七月')
                                .replace('八月', '八月')
                                .replace('九月', '九月')
                                .replace('十月', '十月')
                                .replace('冬月', '冬月')
                                .replace('腊月', '腊月');

            // 添加闰月标识
            if (lunarInfo.isLeapMonth) {
                lunarText = '闰' + lunarText;
            }

            // 添加日期
            lunarText += lunarInfo.dayName.replace('初一', '初')
                                   .replace('初二', '初二')
                                   .replace('初三', '初三')
                                   .replace('初四', '初四')
                                   .replace('初五', '初五')
                                   .replace('初六', '初六')
                                   .replace('初七', '初七')
                                   .replace('初八', '初八')
                                   .replace('初九', '初九')
                                   .replace('初十', '初十')
                                   .replace('十一', '十一')
                                   .replace('十二', '十二')
                                   .replace('十三', '十三')
                                   .replace('十四', '十四')
                                   .replace('十五', '十五')
                                   .replace('十六', '十六')
                                   .replace('十七', '十七')
                                   .replace('十八', '十八')
                                   .replace('十九', '十九')
                                   .replace('二十', '二十')
                                   .replace('廿一', '廿一')
                                   .replace('廿二', '廿二')
                                   .replace('廿三', '廿三')
                                   .replace('廿四', '廿四')
                                   .replace('廿五', '廿五')
                                   .replace('廿六', '廿六')
                                   .replace('廿七', '廿七')
                                   .replace('廿八', '廿八')
                                   .replace('廿九', '廿九')
                                   .replace('三十', '三十');

            // 简化长名称
            if (lunarText.length > 8) {
                lunarText = lunarText.substring(0, 6) + '..';
            }

            return lunarText;
        } catch (error) {
            console.warn('农历日期计算失败:', error);
            return '未知';
        }
    }

    // 初始化年度概览图
    function initOverviewMap() {
        if (!elements.yearOverviewMap) return;

        const areas = elements.yearOverviewMap.querySelectorAll('area');

        // 为每个月份区域添加点击事件
        areas.forEach(area => {
            const month = parseInt(area.getAttribute('data-month'));

            area.addEventListener('click', function() {
                selectMonth(month);
            });

            // 添加鼠标悬停效果
            area.addEventListener('mouseenter', function() {
                showMonthTooltip(this, month);
            });

            area.addEventListener('mouseleave', function() {
                hideMonthTooltip();
            });
        });

        // 设置当前月份的高亮
        updateMonthHighlight();
    }

    // 选择月份
    async function selectMonth(month) {
        if (month >= 0 && month <= 11) {
            currentMonth = month;

            // 更新下拉框（如果存在）
            if (elements.monthSelect) {
                elements.monthSelect.value = month;
            }

            // 重新加载数据
            await loadData();

            // 更新高亮显示
            updateMonthHighlight();

            console.log(`📅 切换到${month + 1}月`);
        }
    }

    // 更新月份高亮显示
    function updateMonthHighlight() {
        if (!elements.monthOverlay) return;

        // 清除所有高亮
        elements.monthOverlay.innerHTML = '';

        // 创建月份覆盖块
        const monthWidth = 29; // 适应350px宽度的月份块
        const monthHeight = 32; // 概览图高度

        for (let i = 0; i < 12; i++) {
            const rect = document.createElement('div');
            rect.className = i === currentMonth ? 'area-rect active' : 'area-rect';
            rect.style.left = `${i * monthWidth + 3}px`;
            rect.style.top = '2px';
            rect.style.width = `${monthWidth - 6}px`;
            rect.style.height = `${monthHeight - 4}px`;
            rect.setAttribute('data-month', i);
            rect.style.display = 'flex';
            rect.style.alignItems = 'center';
            rect.style.justifyContent = 'center';
            rect.style.fontSize = '9px';
            rect.style.color = '#e0f2fe';
            rect.style.fontWeight = '600';
            rect.style.borderRadius = '3px';
            rect.style.pointerEvents = 'auto';
            rect.style.zIndex = '10';
            rect.style.lineHeight = '1';
            rect.textContent = (i + 1);

            // 添加点击事件
            rect.addEventListener('click', function() {
                selectMonth(i);
            });

            elements.monthOverlay.appendChild(rect);
        }
    }

    // 显示月份提示
    function showMonthTooltip(area, month) {
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];

        // 这里可以添加提示框显示功能
        // 由于布局限制，暂时用控制台输出
        console.log(`悬停: ${monthNames[month]}`);
    }

    // 隐藏月份提示
    function hideMonthTooltip() {
        // 隐藏提示框
    }

    // 页面加载完成后初始化（支持异步加载）
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('🌙 月相可视化系统加载完成');
        setCurrentDate();
        await init();
    });

})();