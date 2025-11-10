/**
 * 农历计算模块
 * 提供阳历与农历之间的转换功能，以及农历日期的详细显示
 */

class LunarCalendar {
    constructor() {
        this.init();
    }

    init() {
        // 农历数据表 (1900-2100年)
        // 每年用4个字节表示：
        // 字节1：月份信息（1-12月，每月30天或29天）
        // 字节2：闰月信息（0表示无闰月，1-12表示闰几月）
        // 字节3：正月的天数（30或29）
        // 字节4：该年正月初一对应的公历月份和日期

        // 2024年农历数据
        this.lunarInfo = [
            // 简化的2024年数据
            0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
            0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
            // ... 更多年份数据
        ];

        // 2024年具体农历数据
        this.lunar2024 = {
            months: [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], // 正常月份天数
            leapMonth: 2, // 闰二月
            leapMonthDays: 29, // 闰二月天数
            newYearDate: { month: 2, day: 10 } // 2024年春节是2月10日
        };

        // 农历月份名称
        this.lunarMonths = [
            '正月', '二月', '三月', '四月', '五月', '六月',
            '七月', '八月', '九月', '十月', '冬月', '腊月'
        ];

        // 农历日期名称
        this.lunarDays = [
            '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
            '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
            '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
        ];

        // 二十四节气
        this.solarTerms = [
            '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
            '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
            '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
            '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
        ];

        // 2024年二十四节气日期 (简化数据)
        this.solarTerms2024 = {
            '立春': { month: 2, day: 4 },
            '雨水': { month: 2, day: 19 },
            '惊蛰': { month: 3, day: 5 },
            '春分': { month: 3, day: 20 },
            '清明': { month: 4, day: 4 },
            '谷雨': { month: 4, day: 19 },
            '立夏': { month: 5, day: 5 },
            '小满': { month: 5, day: 21 },
            '芒种': { month: 6, day: 5 },
            '夏至': { month: 6, day: 21 },
            '小暑': { month: 7, day: 6 },
            '大暑': { month: 7, day: 22 },
            '立秋': { month: 8, day: 7 },
            '处暑': { month: 8, day: 22 },
            '白露': { month: 9, day: 7 },
            '秋分': { month: 9, day: 22 },
            '寒露': { month: 10, day: 8 },
            '霜降': { month: 10, day: 23 },
            '立冬': { month: 11, day: 7 },
            '小雪': { month: 11, day: 22 },
            '大雪': { month: 12, day: 7 },
            '冬至': { month: 12, day: 21 }
        };
    }

    /**
     * 将公历日期转换为农历日期 - 基于moon age改进版本
     * @param {number} year - 公历年份
     * @param {number} month - 公历月份 (1-12)
     * @param {number} day - 公历日期
     * @param {number} moonAge - 月龄（可选，从data.json获取）
     * @returns {Object} 农历日期信息
     */
    solarToLunar(year, month, day, moonAge = null) {
        if (year !== 2024) {
            // 对于2024年以外的年份，使用简化计算
            return this.simplifiedSolarToLunar(year, month, day);
        }

        let lunarDate;

        // 如果有moon age数据，优先使用
        if (moonAge !== null && moonAge !== undefined) {
            lunarDate = this.calculateLunarFromMoonAge(moonAge, month, day);
        } else {
            lunarDate = this.calculateLunarDate2024(month, day);
        }

        const solarTerm = this.getSolarTerm(month, day);

        // 确保数据有效性
        const safeMonth = Math.max(1, Math.min(12, lunarDate.month));
        const safeDay = Math.max(1, Math.min(30, lunarDate.day));

        return {
            year: year,
            month: safeMonth,
            day: safeDay,
            isLeapMonth: lunarDate.isLeapMonth || false,
            monthName: this.lunarMonths[safeMonth - 1] || '未知',
            dayName: this.lunarDays[safeDay - 1] || '未知',
            solarTerm: solarTerm,
            zodiac: this.getChineseZodiac(year),
            fullDate: this.formatLunarDate({
                month: safeMonth,
                day: safeDay,
                isLeapMonth: lunarDate.isLeapMonth || false,
                monthName: this.lunarMonths[safeMonth - 1] || '未知',
                dayName: this.lunarDays[safeDay - 1] || '未知'
            }, solarTerm)
        };
    }

    /**
     * 计算2024年的农历日期
     * @param {number} solarMonth - 公历月份
     * @param {number} solarDay - 公历日期
     * @returns {Object} 农历日期
     */
    calculateLunarDate2024(solarMonth, solarDay) {
        const newYearDate = this.lunar2024.newYearDate;

        // 计算距离春节的天数
        let daysSinceNewYear = 0;

        if (solarMonth < newYearDate.month ||
            (solarMonth === newYearDate.month && solarDay < newYearDate.day)) {
            // 还没到春节，计算上一年的
            return this.calculatePreviousYearLunar(solarMonth, solarDay);
        }

        // 计算当年
        const months = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 2024是闰年

        for (let m = newYearDate.month; m < solarMonth; m++) {
            daysSinceNewYear += months[m - 1];
        }
        daysSinceNewYear += (solarDay - newYearDate.day);

        // 根据天数计算农历月份和日期
        return this.calculateLunarFromDays(daysSinceNewYear);
    }

    /**
     * 根据天数计算农历月日
     * @param {number} daysSinceNewYear - 距离春节的天数
     * @returns {Object} 农历月日
     */
    calculateLunarFromDays(daysSinceNewYear) {
        let remainingDays = daysSinceNewYear;
        let lunarMonth = 1;
        let isLeapMonth = false;

        // 遍历农历月份
        for (let i = 0; i < this.lunar2024.months.length; i++) {
            const monthDays = this.lunar2024.months[i];

            // 如果是闰月位置
            if (i + 1 === this.lunar2024.leapMonth && this.lunar2024.leapMonth > 0) {
                // 先处理正常月份
                if (remainingDays < monthDays) {
                    return {
                        month: i + 1,
                        day: remainingDays + 1,
                        isLeapMonth: false
                    };
                }
                remainingDays -= monthDays;

                // 再处理闰月
                if (remainingDays < this.lunar2024.leapMonthDays) {
                    return {
                        month: this.lunar2024.leapMonth,
                        day: remainingDays + 1,
                        isLeapMonth: true
                    };
                }
                remainingDays -= this.lunar2024.leapMonthDays;
            } else {
                // 处理正常月份
                if (remainingDays < monthDays) {
                    return {
                        month: i + 1,
                        day: remainingDays + 1,
                        isLeapMonth: false
                    };
                }
                remainingDays -= monthDays;
            }
        }

        // 如果超出范围，返回最后一天
        return {
            month: 12,
            day: 29,
            isLeapMonth: false
        };
    }

    /**
     * 计算上一年的农历日期
     */
    calculatePreviousYearLunar(month, day) {
        // 简化处理，假设上一年的最后一天是农历腊月二十九
        return {
            month: 12,
            day: 29 - (31 - day), // 简化计算
            isLeapMonth: false
        };
    }

    /**
     * 简化的阳历转农历（适用于2024年以外）
     */
    simplifiedSolarToLunar(year, month, day) {
        // 使用简化的算法，基于春节日期估算
        const springFestival = this.getSpringFestivalDate(year);
        const dayOfYear = this.getDayOfYear(year, month, day);
        const springFestivalDayOfYear = this.getDayOfYear(year, springFestival.month, springFestival.day);

        let lunarDayOfYear;
        if (dayOfYear >= springFestivalDayOfYear) {
            lunarDayOfYear = dayOfYear - springFestivalDayOfYear + 1;
        } else {
            lunarDayOfYear = 354 + dayOfYear - springFestivalDayOfYear + 1; // 假设农历年354天
        }

        const lunarMonth = Math.floor((lunarDayOfYear - 1) / 29) + 1;
        const lunarDay = ((lunarDayOfYear - 1) % 29) + 1;

        return {
            year: year,
            month: Math.min(lunarMonth, 12),
            day: lunarDay,
            isLeapMonth: false,
            monthName: this.lunarMonths[Math.min(lunarMonth - 1, 11)],
            dayName: this.lunarDays[lunarDay - 1],
            solarTerm: null,
            zodiac: this.getChineseZodiac(year),
            fullDate: this.formatLunarDate({ month: Math.min(lunarMonth, 12), day: lunarDay, isLeapMonth: false })
        };
    }

    /**
     * 获取春节日期
     */
    getSpringFestivalDate(year) {
        // 简化的春节日期表
        const springFestivalDates = {
            2024: { month: 2, day: 10 },
            2025: { month: 1, day: 29 },
            2023: { month: 1, day: 22 }
        };
        return springFestivalDates[year] || { month: 2, day: 10 };
    }

    /**
     * 计算一年中的第几天
     */
    getDayOfYear(year, month, day) {
        const daysInMonth = [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let dayOfYear = 0;
        for (let i = 1; i < month; i++) {
            dayOfYear += daysInMonth[i - 1];
        }
        dayOfYear += day;
        return dayOfYear;
    }

    /**
     * 判断是否为闰年
     */
    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    /**
     * 获取节气信息
     */
    getSolarTerm(month, day) {
        if (this.lunar2024 && this.solarTerms2024) {
            for (const [term, date] of Object.entries(this.solarTerms2024)) {
                if (date.month === month && date.day === day) {
                    return term;
                }
            }
        }
        return null;
    }

    /**
     * 获取生肖
     */
    getChineseZodiac(year) {
        const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
        return zodiacs[(year - 4) % 12];
    }

    /**
     * 格式化农历日期显示
     */
    formatLunarDate(lunarDate, solarTerm) {
        let result = '';

        if (solarTerm) {
            result += solarTerm + ' ';
        }

        result += lunarDate.monthName;
        if (lunarDate.isLeapMonth) {
            result += '(闰)';
        }
        result += lunarDate.dayName;

        return result;
    }

    /**
     * 获取农历月份的别称
     */
    getLunarMonthAlias(month) {
        const aliases = [
            '孟春', '仲春', '季春', '孟夏', '仲夏', '季夏',
            '孟秋', '仲秋', '季秋', '孟冬', '仲冬', '季冬'
        ];
        return aliases[month - 1] || '';
    }

    /**
     * 获取传统节日信息
     */
    getTraditionalFestival(month, day, isLeapMonth) {
        const festivals = {
            '1-1': '春节',
            '1-15': '元宵节',
            '2-2': '龙抬头',
            '3-3': '上巳节',
            '5-5': '端午节',
            '7-7': '七夕节',
            '7-15': '中元节',
            '8-15': '中秋节',
            '9-9': '重阳节',
            '10-1': '寒衣节',
            '10-15': '下元节',
            '12-8': '腊八节',
            '12-23': '小年',
            '12-30': '除夕'
        };

        const key = `${month}-${day}`;
        return festivals[key] || '';
    }

    /**
     * 获取完整的农历信息
     */
    getFullLunarInfo(year, month, day) {
        const lunar = this.solarToLunar(year, month, day);
        const festival = this.getTraditionalFestival(lunar.month, lunar.day, lunar.isLeapMonth);
        const monthAlias = this.getLunarMonthAlias(lunar.month);

        return {
            ...lunar,
            festival: festival,
            monthAlias: monthAlias,
            displayText: this.createDisplayText(lunar, festival, monthAlias)
        };
    }

    /**
     * 创建显示文本
     */
    createDisplayText(lunar, festival, monthAlias) {
        let text = '';

        if (festival) {
            text = festival;
        } else if (lunar.solarTerm) {
            text = lunar.solarTerm;
        } else {
            text = `${lunar.monthName}${lunar.dayName}`;
        }

        return {
            main: text,
            full: `${lunar.year}年 ${lunar.monthName}${lunar.dayName}`,
            zodiac: `${lunar.zodiac}年`,
            details: festival ? `传统节日：${festival}` : ''
        };
    }

    /**
     * 基于月龄计算农历日期
     * @param {number} moonAge - 月龄（0-29.5天）
     * @param {number} month - 公历月份
     * @param {number} day - 公历日期
     * @returns {Object} 农历日期
     */
    calculateLunarFromMoonAge(moonAge, month, day) {
        // 月龄0-1是新月（初一），15左右是满月（十五）
        // 月龄天数约等于农历日期
        let lunarDay = Math.round(moonAge) + 1; // 转换为1-30的范围

        // 特殊处理满月前后
        if (moonAge >= 14.5 && moonAge <= 15.5) {
            lunarDay = 15; // 十五（满月）
        }

        // 确保农历日期在有效范围内
        lunarDay = Math.max(1, Math.min(30, lunarDay));

        // 根据公历日期估算农历月份
        const lunarMonth = this.estimateLunarMonth(month, day);

        return {
            month: lunarMonth,
            day: lunarDay,
            isLeapMonth: false
        };
    }

    /**
     * 根据公历日期估算农历月份
     * @param {number} month - 公历月份
     * @param {number} day - 公历日期
     * @returns {number} 农历月份
     */
    estimateLunarMonth(month, day) {
        // 2024年春节是2月10日（正月初一）
        const springFestival = { month: 2, day: 10 };

        // 计算距离春节的天数
        const dayOfYear = this.getDayOfYear(2024, month, day);
        const springFestivalDayOfYear = this.getDayOfYear(2024, springFestival.month, springFestival.day);

        let daysSinceSpringFestival;
        if (dayOfYear >= springFestivalDayOfYear) {
            daysSinceSpringFestival = dayOfYear - springFestivalDayOfYear;
        } else {
            // 春节之前的日期，按上一年的农历计算
            return 12; // 假设是腊月
        }

        // 估算农历月份（每月约29.5天）
        const estimatedMonth = Math.floor(daysSinceSpringFestival / 29.5) + 1;

        // 处理闰月（2024年闰二月）
        if (estimatedMonth >= 2) {
            return Math.min(estimatedMonth + 1, 12); // 考虑闰二月的影响
        }

        return Math.max(1, Math.min(estimatedMonth, 12));
    }
}

// 导出模块
window.LunarCalendar = LunarCalendar;

// 如果直接运行此文件，进行测试
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LunarCalendar;
}