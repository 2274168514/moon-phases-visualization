// ==================== 本地月相序列图片系统 ====================

// 本地月相序列图片映射配置 - 基于用户重新排列的16张图片
const LOCAL_MOON_PHASES = {
    // 用户重新排列的月相序列图片
    phaseFiles: [
        '0-新月.jpg',         // 新月 (0%照明度)
        '1-娥眉月.jpg',       // 娥眉月1
        '2-娥眉月.jpg',       // 娥眉月2
        '3-娥眉月.jpg',       // 娥眉月3
        '4-上弦月.jpg',       // 上弦月
        '5-盈凸月.jpg',       // 盈凸月1
        '6-盈凸月.jpg',       // 盈凸月2
        '7-盈凸月.jpg',       // 盈凸月3
        '8-满月.jpg',         // 满月 ⭐ (100%照明度)
        '9-亏凸月.jpg',       // 亏凸月1
        '10-亏凸月.jpg',      // 亏凸月2
        '11-下弦月.jpg',      // 下弦月
        '12-残月.jpg',        // 残月1
        '13-残月.jpg',        // 残月2
        '14-残月.jpg',        // 残月3
        '15-新月.jpg'         // 回到新月 (周期结束)
    ],

    // 根据月相索引获取对应的图片文件
    getPhaseFileByIndex: function(phaseIndex) {
        const index = parseInt(phaseIndex) || 0;
        return this.phaseFiles[index] || this.phaseFiles[0];
    },

    // 根据月龄和照明度映射到图片 - 与moon-visualization-final.js保持一致
    getPhaseFile: function(illumination, age) {
        const illum = parseFloat(illumination) || 0;
        const moonAge = parseFloat(age) || 0;

        // 使用与主系统相同的月相判断逻辑
        // 新月：月龄0-1.5天
        if (moonAge >= 0 && moonAge < 1.5) {
            return '0-新月.jpg';
        }
        // 娥眉月：月龄1.5-7.5天
        else if (moonAge >= 1.5 && moonAge < 4.0) {
            return '1-娥眉月.jpg';
        } else if (moonAge >= 4.0 && moonAge < 6.5) {
            return '2-娥眉月.jpg';
        } else if (moonAge >= 6.5 && moonAge < 9.0) {
            return '3-娥眉月.jpg';
        }
        // 上弦月：月龄9.0-11.5天
        else if (moonAge >= 9.0 && moonAge < 11.5) {
            return '4-上弦月.jpg';
        }
        // 盈凸月：月龄11.5-14.5天（满月前）
        else if (moonAge >= 11.5 && moonAge < 13.0) {
            return '5-盈凸月.jpg';
        } else if (moonAge >= 13.0 && moonAge < 14.5) {
            return '6-盈凸月.jpg';
        } else if (moonAge >= 14.5 && moonAge < 15.5) {
            return '7-盈凸月.jpg';
        }
        // 满月：月龄14.5-16.5天
        else if (moonAge >= 14.5 && moonAge < 16.5) {
            return '8-满月.jpg';
        }
        // 亏凸月：满月后16.5-22.5天
        else if (moonAge >= 16.5 && moonAge < 19.5) {
            return '9-亏凸月.jpg';
        } else if (moonAge >= 19.5 && moonAge < 22.5) {
            return '10-亏凸月.jpg';
        }
        // 下弦月：月龄22.5-26.5天
        else if (moonAge >= 22.5 && moonAge < 26.5) {
            return '11-下弦月.jpg';
        }
        // 残月：月龄26.5-29.53天
        else if (moonAge >= 26.5 && moonAge < 28.0) {
            return '12-残月.jpg';
        } else if (moonAge >= 28.0 && moonAge < 29.0) {
            return '13-残月.jpg';
        } else if (moonAge >= 29.0 || moonAge < 0) {
            return '14-残月.jpg';
        }

        return '0-新月.jpg'; // 默认新月
    },

    // 获取月相名称 - 基于月龄判断
    getPhaseName: function(illumination, age = 0) {
        const illum = parseFloat(illumination) || 0;
        const moonAge = parseFloat(age) || 0;

        // 使用与主系统相同的月相判断逻辑
        // 新月：月龄0-1.5天
        if (moonAge >= 0 && moonAge < 1.5) {
            return '新月';
        }
        // 娥眉月：月龄1.5-7.5天
        else if (moonAge >= 1.5 && moonAge < 4.0) {
            return '娥眉月';
        } else if (moonAge >= 4.0 && moonAge < 6.5) {
            return '娥眉月';
        } else if (moonAge >= 6.5 && moonAge < 9.0) {
            return '娥眉月';
        }
        // 上弦月：月龄9.0-11.5天
        else if (moonAge >= 9.0 && moonAge < 11.5) {
            return '上弦月';
        }
        // 盈凸月：月龄11.5-14.5天（满月前）
        else if (moonAge >= 11.5 && moonAge < 13.0) {
            return '盈凸月';
        } else if (moonAge >= 13.0 && moonAge < 14.5) {
            return '盈凸月';
        } else if (moonAge >= 14.5 && moonAge < 15.5) {
            return '盈凸月';
        }
        // 满月：月龄14.5-16.5天
        else if (moonAge >= 14.5 && moonAge < 16.5) {
            return '满月';
        }
        // 亏凸月：满月后16.5-22.5天
        else if (moonAge >= 16.5 && moonAge < 19.5) {
            return '亏凸月';
        } else if (moonAge >= 19.5 && moonAge < 22.5) {
            return '亏凸月';
        }
        // 下弦月：月龄22.5-26.5天
        else if (moonAge >= 22.5 && moonAge < 26.5) {
            return '下弦月';
        }
        // 残月：月龄26.5-29.53天
        else if (moonAge >= 26.5 && moonAge < 28.0) {
            return '残月';
        } else if (moonAge >= 28.0 && moonAge < 29.0) {
            return '残月';
        } else if (moonAge >= 29.0 || moonAge < 0) {
            return '残月';
        }

        return '新月'; // 默认新月
    }
};

// 本地月相图片加载器
class LocalMoonPhaseLoader {
    constructor() {
        this.cache = new Map();
        this.basePath = '月相序列图/';
    }

    // 根据照明度和月龄获取对应的月相图片
    getMoonPhaseForIllumination(illumination, age = 0) {
        const fileName = LOCAL_MOON_PHASES.getPhaseFile(illumination, age);
        const phaseName = LOCAL_MOON_PHASES.getPhaseName(illumination, age);

        return {
            name: phaseName,
            files: [fileName],
            description: `${phaseName} - 照明度: ${illumination}%`
        };
    }

    // 获取月相图片URL
    getMoonPhaseImageUrl(illumination, age, preferIndex = 0) {
        const fileName = LOCAL_MOON_PHASES.getPhaseFile(illumination, age);
        return this.basePath + fileName;
    }

    // 获取月相名称
    getMoonPhaseName(illumination) {
        return LOCAL_MOON_PHASES.getPhaseName(illumination);
    }

    // 预加载月相图片
    async preloadMoonPhaseImage(illumination, preferIndex = 0, age = 0) {
        const url = this.getMoonPhaseImageUrl(illumination, age, preferIndex);

        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            const timeout = setTimeout(() => {
                console.warn(`本地月相图片加载超时: ${url}`);
                resolve(this.createFallbackImage(illumination));
            }, 5000);

            img.onload = () => {
                clearTimeout(timeout);
                this.cache.set(url, img);
                console.log(`✅ 本地月相图片加载成功: ${url}`);
                resolve(img);
            };

            img.onerror = () => {
                clearTimeout(timeout);
                console.warn(`❌ 本地月相图片加载失败: ${url}`);
                resolve(this.createFallbackImage(illumination));
            };

            img.src = url;
        });
    }

    // 创建后备图片
    createFallbackImage(illumination) {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        // 绘制基础圆形
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(100, 100, 90, 0, Math.PI * 2);
        ctx.fill();

        // 根据照明度绘制月相
        const illuminationPercent = parseFloat(illumination) || 0;
        ctx.fillStyle = '#f8f8f8';

        if (illuminationPercent < 12.5) {
            // 新月到娥眉月
            const angle = (illuminationPercent / 12.5) * Math.PI / 3;
            ctx.beginPath();
            ctx.arc(100, 100, 90, -angle, angle);
            ctx.arc(70, 100, 60, angle, -angle, true);
            ctx.fill();
        } else if (illuminationPercent < 37.5) {
            // 娥眉月到上弦月
            const progress = (illuminationPercent - 12.5) / 25;
            const angle = Math.PI / 3 + progress * Math.PI / 6;
            ctx.beginPath();
            ctx.arc(100, 100, 90, -angle, angle);
            if (progress < 0.5) {
                ctx.arc(70, 100, 60, angle, -angle, true);
            }
            ctx.fill();
        } else if (illuminationPercent < 62.5) {
            // 上弦月到满月前
            const progress = (illuminationPercent - 37.5) / 25;
            const startAngle = -Math.PI / 2 + progress * Math.PI / 4;
            const endAngle = Math.PI / 2 - progress * Math.PI / 4;
            ctx.beginPath();
            ctx.arc(100, 100, 90, startAngle, endAngle);
            ctx.fill();
        } else if (illuminationPercent < 87.5) {
            // 满月系列
            const progress = (illuminationPercent - 62.5) / 25;
            ctx.beginPath();
            if (progress < 0.5) {
                // 满月
                ctx.arc(100, 100, 90, 0, Math.PI * 2);
            } else {
                // 开始亏缺
                const angle = (progress - 0.5) * Math.PI / 2;
                ctx.arc(100, 100, 90, angle, Math.PI * 2 - angle);
            }
            ctx.fill();
        } else {
            // 下弦月到残月
            const progress = (illuminationPercent - 87.5) / 12.5;
            const angle = Math.PI - progress * Math.PI / 3;
            ctx.beginPath();
            ctx.arc(100, 100, 90, angle, Math.PI * 2 - angle);
            ctx.arc(130, 100, 60, Math.PI * 2 - angle, angle, true);
            ctx.fill();
        }

        // 添加表面细节
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.beginPath();
        ctx.arc(80, 80, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(120, 120, 6, 0, Math.PI * 2);
        ctx.fill();

        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    // 创建月相图片元素（替代原来的圆形）
    async createLocalMoonPhaseElement(illumination, size = 60, preferIndex = 0, age = 0) {
        const phase = this.getMoonPhaseForIllumination(illumination, age);

        // 创建容器
        const container = document.createElement('div');
        container.style.width = `${size}px`;
        container.style.height = `${size}px`;
        container.style.position = 'relative';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.borderRadius = '50%';
        container.style.overflow = 'hidden';
        container.style.background = '#1a1a2e';
        container.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';

        try {
            // 加载本地月相图片
            const img = await this.preloadMoonPhaseImage(illumination, preferIndex, age);

            // 创建图片元素 - 简化居中方案
            const moonImg = document.createElement('img');
            moonImg.src = img.src || (img instanceof HTMLImageElement ? img.src : '');

            // 简单居中方案 - 使用flexbox居中
            moonImg.style.width = `${size}px`;
            moonImg.style.height = `${size}px`;
            moonImg.style.objectFit = 'cover';
            moonImg.style.objectPosition = 'center center';
            moonImg.style.borderRadius = '50%';
            moonImg.style.display = 'block';
            moonImg.style.margin = 'auto';
            moonImg.style.transition = 'transform 0.3s ease';

            // 添加悬停效果
            moonImg.addEventListener('mouseenter', () => {
                moonImg.style.transform = 'scale(1.05)';
            });

            moonImg.addEventListener('mouseleave', () => {
                moonImg.style.transform = 'scale(1)';
            });

            container.appendChild(moonImg);

            // 添加光晕效果
            const glowEffect = document.createElement('div');
            glowEffect.style.position = 'absolute';
            glowEffect.style.top = '0';
            glowEffect.style.left = '0';
            glowEffect.style.width = '100%';
            glowEffect.style.height = '100%';
            glowEffect.style.borderRadius = '50%';
            glowEffect.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
            glowEffect.style.pointerEvents = 'none';
            container.appendChild(glowEffect);

            // 添加数据属性用于调试
            container.dataset.moonPhase = phase.name;
            container.dataset.illumination = illumination;
            container.dataset.imageFile = this.getMoonPhaseImageUrl(illumination, preferIndex);

        } catch (error) {
            console.warn('本地月相图片创建失败，使用后备方案:', error);
            container.innerHTML = `
                <div style="width: 100%; height: 100%; border-radius: 50%; background: #1a1a2e; display: flex; align-items: center; justify-content: center; color: #666; font-size: 10px; text-align: center;">
                    ${phase.name}
                </div>
            `;
        }

        return container;
    }

    // 批量预加载所有月相图片
    async preloadAllLocalPhases() {
        const results = {};
        const illuminations = [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];

        for (const illumination of illuminations) {
            try {
                const img = await this.preloadMoonPhaseImage(illumination, 0);
                const phase = this.getMoonPhaseForIllumination(illumination);
                results[phase.name] = img;
            } catch (error) {
                console.warn(`预加载失败 - 照明度${illumination}%:`, error);
            }
        }

        console.log(`✅ 本地月相图片预加载完成，共加载 ${Object.keys(results).length} 个月相阶段`);
        return results;
    }

    // 清理缓存
    clearCache() {
        this.cache.clear();
    }
}

// 创建全局实例
const localMoonPhaseLoader = new LocalMoonPhaseLoader();

// 导出到全局
window.LocalMoonPhaseLoader = LocalMoonPhaseLoader;
window.localMoonPhaseLoader = localMoonPhaseLoader;
window.LOCAL_MOON_PHASES = LOCAL_MOON_PHASES;

// 兼容性函数：替代原有的圆形元素创建
window.createLocalMoonPhaseElement = async function(illumination, size = 60, preferIndex = 0, age = 0) {
    return await localMoonPhaseLoader.createLocalMoonPhaseElement(illumination, size, preferIndex, age);
};

console.log('🌙 本地月相序列图片系统已加载 - 基于2024年1月真实月相数据');
console.log('📁 图片路径: 月相序列图/');
console.log('📋 用户排列序列: 0-新月.jpg → 1-娥眉月.jpg → ... → 8-满月.jpg → ... → 15-新月.jpg');
console.log('🎯 精确数据映射:');
console.log('  1月11日(0.54%) → 0-新月.jpg (新月)');
console.log('  1月25日(99.28%) → 8-满月.jpg (满月)');
console.log('  1月1日(78.03%) → 10-亏凸月.jpg (亏凸月)');
console.log('🔄 验证: 1月1日现在应该正确显示亏凸月图片');