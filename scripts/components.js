// ホログラムエフェクトコンポーネント
AFRAME.registerComponent('hologram-effect', {
  schema: {
    color: { type: 'color', default: '#00a2ff' },  // 青色の光
    opacity: { type: 'number', default: 0.7 },     // 透明度
    glowIntensity: { type: 'number', default: 0.5 } // 発光の強さ
  },
  
  init: function() {
    // 基本的なマテリアル設定
    this.el.setAttribute('material', {
      color: this.data.color,
      opacity: this.data.opacity,
      transparent: true,
      shader: 'standard',
      emissive: this.data.color,
      emissiveIntensity: this.data.glowIntensity,
      side: 'double'  // 両面から見えるように
    });
    
    // スキャンラインエフェクト
    this.addScanlines();
    
    // グリッチエフェクト
    this.setupGlitchEffect();
    
    // 輝きのパルスアニメーション
    this.el.setAttribute('animation__glow', {
      property: 'material.emissiveIntensity',
      from: this.data.glowIntensity,
      to: this.data.glowIntensity * 1.5,
      dur: 2000,
      dir: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
    
    // 不透明度のパルスアニメーション
    this.el.setAttribute('animation__opacity', {
      property: 'material.opacity',
      from: this.data.opacity,
      to: this.data.opacity * 0.8,
      dur: 2500,
      dir: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
  },
  
  // スキャンラインの追加
  addScanlines: function() {
    const scanlineContainer = document.createElement('a-entity');
    scanlineContainer.setAttribute('position', '0 0 0.001');  // ロゴの前面に配置
    
    // 水平スキャンライン
    const hScanline = document.createElement('a-plane');
    const width = 2;  // ロゴのサイズに応じて調整
    const height = 0.01;
    
    hScanline.setAttribute('width', width);
    hScanline.setAttribute('height', height);
    hScanline.setAttribute('material', {
      color: this.data.color,
      opacity: 0.3,
      transparent: true
    });
    
    hScanline.setAttribute('animation', {
      property: 'position.y',
      from: -1,
      to: 1,
      dur: 3000,
      loop: true,
      easing: 'linear'
    });
    
    scanlineContainer.appendChild(hScanline);
    this.el.appendChild(scanlineContainer);
  },
  
  // ランダムなグリッチエフェクト
  setupGlitchEffect: function() {
    // 5-10秒ごとにグリッチ発生
    this.glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {  // 30%の確率でグリッチ発生
        this.triggerGlitch();
      }
    }, 5000);
  },
  
  // グリッチエフェクトの実行
  triggerGlitch: function() {
    const el = this.el;
    const originalPosition = el.getAttribute('position');
    const originalOpacity = this.data.opacity;
    
    // 位置の小さなランダム変化
    const offsetX = (Math.random() * 0.04 - 0.02).toFixed(3);
    const offsetY = (Math.random() * 0.04 - 0.02).toFixed(3);
    
    // グリッチエフェクトのアニメーション
    const glitchDuration = 100 + Math.random() * 100;
    
    // 位置の変更
    el.setAttribute('animation__glitchPos', {
      property: 'position',
      to: `${parseFloat(originalPosition.x) + parseFloat(offsetX)} ${parseFloat(originalPosition.y) + parseFloat(offsetY)} ${originalPosition.z}`,
      dur: glitchDuration,
      easing: 'easeInOutQuad'
    });
    
    // 不透明度の変更
    el.setAttribute('animation__glitchOpacity', {
      property: 'material.opacity',
      to: originalOpacity * 1.5,
      dur: glitchDuration,
      easing: 'easeInOutQuad'
    });
    
    // 元に戻す
    setTimeout(() => {
      el.setAttribute('animation__resetPos', {
        property: 'position',
        to: `${originalPosition.x} ${originalPosition.y} ${originalPosition.z}`,
        dur: glitchDuration,
        easing: 'easeInOutQuad'
      });
      
      el.setAttribute('animation__resetOpacity', {
        property: 'material.opacity',
        to: originalOpacity,
        dur: glitchDuration,
        easing: 'easeInOutQuad'
      });
    }, glitchDuration);
    
    // 複数回のグリッチを連続して発生させる
    if (Math.random() > 0.5) {
      setTimeout(() => {
        this.triggerGlitch();
      }, glitchDuration * 2);
    }
  },
  
  // コンポーネント削除時のクリーンアップ
  remove: function() {
    if (this.glitchInterval) {
      clearInterval(this.glitchInterval);
    }
  }
});

// オープニングアニメーションコンポーネント
AFRAME.registerComponent('opening-animation', {
  init: function() {
    // マーカーが認識されたときのイベントリスナー
    const markerEl = document.querySelector('[mindar-image-target]');
    markerEl.addEventListener('targetFound', this.startAnimation.bind(this));
    
    // ロゴエンティティの参照を保持
    this.logoEntity = this.el;
    
    // アニメーションの状態
    this.animationState = 'waiting';
    
    // 初期状態では非表示
    this.logoEntity.setAttribute('visible', false);
  },
  
  startAnimation: function() {
    if (this.animationState !== 'waiting') return;
    this.animationState = 'starting';
    
    // ロゴを初期位置に配置
    this.logoEntity.setAttribute('scale', '0.2 0.2 0.2');
    this.logoEntity.setAttribute('position', '0 0.05 0');
    this.logoEntity.setAttribute('rotation', '0 0 0');
    this.logoEntity.setAttribute('visible', true);
    
    // 強い光のフラッシュエフェクト
    const flashEntity = document.createElement('a-plane');
    flashEntity.setAttribute('position', '0 0 -0.01');
    flashEntity.setAttribute('scale', '5 5 5');
    flashEntity.setAttribute('color', '#00a2ff');
    flashEntity.setAttribute('opacity', '0.7');
    flashEntity.setAttribute('animation', {
      property: 'opacity',
      from: '0.7',
      to: '0',
      dur: 1000,
      easing: 'easeOutQuad'
    });
    document.querySelector('[mindar-image-target]').appendChild(flashEntity);
    
    // 1. 浮かび上がるアニメーション
    this.logoEntity.setAttribute('animation__rise', {
      property: 'position',
      from: '0 0.05 0',
      to: '0 0.2 0',
      dur: 1000,
      easing: 'easeOutQuad'
    });
    
    // アニメーションの連鎖
    setTimeout(() => this.growAnimation(), 1000);
  },
  
  growAnimation: function() {
    if (this.animationState !== 'starting') return;
    this.animationState = 'growing';
    
    // 2. 拡大と回転のアニメーション
    this.logoEntity.setAttribute('animation__grow', {
      property: 'scale',
      from: '0.2 0.2 0.2',
      to: '1.5 1.5 1.5',
      dur: 2000,
      easing: 'easeInOutQuad'
    });
    
    this.logoEntity.setAttribute('animation__rotate', {
      property: 'rotation',
      from: '0 0 0',
      to: '0 360 0',
      dur: 2000,
      easing: 'easeInOutQuad'
    });
    
    // アニメーションの連鎖
    setTimeout(() => this.floatAnimation(), 2500);
  },
  
  floatAnimation: function() {
    if (this.animationState !== 'growing') return;
    this.animationState = 'floating';
    
    // 3. ふわふわ浮遊するアニメーション
    this.logoEntity.setAttribute('animation__float', {
      property: 'position',
      from: '0 0.2 0',
      to: '0 0.3 0',
      dur: 2000,
      dir: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
    
    // 微妙な回転
    this.logoEntity.setAttribute('animation__rotateFloat', {
      property: 'rotation',
      from: '0 0 -2',
      to: '0 10 2',
      dur: 3000,
      dir: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
    
    // アニメーションの連鎖
    setTimeout(() => this.flyAwayAnimation(), 5000);
  },
  
  flyAwayAnimation: function() {
    if (this.animationState !== 'floating') return;
    this.animationState = 'flying';
    
    // 浮遊アニメーションを停止
    this.logoEntity.removeAttribute('animation__float');
    this.logoEntity.removeAttribute('animation__rotateFloat');
    
    // 4. 通り抜けるアニメーション
    this.logoEntity.setAttribute('animation__flyaway', {
      property: 'position',
      from: this.logoEntity.getAttribute('position'),
      to: '0 0.2 -3',  // カメラ方向に飛んでいく
      dur: 1500,
      easing: 'easeInQuad'
    });
    
    // 光るエフェクトの増強
    this.logoEntity.setAttribute('animation__glow', {
      property: 'components.hologram-effect.data.glowIntensity',
      from: '0.5',
      to: '2',
      dur: 1000,
      easing: 'easeInQuad'
    });
    
    // サイズ拡大（カメラに近づくので大きく見える）
    this.logoEntity.setAttribute('animation__enlarge', {
      property: 'scale',
      from: this.logoEntity.getAttribute('scale'),
      to: '3 3 3',
      dur: 1500,
      easing: 'easeInQuad'
    });
    
    // 次のステップに移行
    setTimeout(() => this.transitionToNextStep(), 2000);
  },
  
  transitionToNextStep: function() {
    if (this.animationState !== 'flying') return;
    this.animationState = 'completed';
    
    // ロゴを非表示に
    this.logoEntity.setAttribute('visible', false);
    
    // パーティクルエフェクトの表示（オプション）
    const particleEntity = document.createElement('a-entity');
    particleEntity.setAttribute('position', '0 0 -1');
    particleEntity.setAttribute('particle-system', {
      preset: 'dust',
      particleCount: 100,
      color: '#00a2ff',
      size: 0.2,
      texture: 'https://cdn.glitch.me/d5169f5e-9e1d-4f22-9785-2c61b2afa997%2Fparticle.png',
      blending: 'additive',
      randomize: true
    });
    document.querySelector('[mindar-image-target]').appendChild(particleEntity);
    
    // 1秒後にパーティクルを消去
    setTimeout(() => {
      particleEntity.parentNode.removeChild(particleEntity);
    }, 3000);
    
    // Step 1のコンテンツを表示
    this.showStep1Content();
  },
  
  showStep1Content: function() {
    // 実際のステップ1のコンテンツを表示する処理をここに実装
    // 例: ステップガイドコンポーネントの呼び出し
    const event = new CustomEvent('show-step', { detail: { step: 1 } });
    document.dispatchEvent(event);
  }
});

// パーティクルシステムコンポーネント（A-Frameには標準で含まれていないため、簡易的な実装）
AFRAME.registerComponent('particle-system', {
  schema: {
    preset: { type: 'string', default: 'dust' },
    particleCount: { type: 'int', default: 100 },
    color: { type: 'color', default: '#00a2ff' },
    size: { type: 'number', default: 0.1 },
    texture: { type: 'string', default: '' },
    blending: { type: 'string', default: 'normal' },
    randomize: { type: 'boolean', default: true }
  },
  
  init: function() {
    this.particles = [];
    
    // パーティクルの生成
    for (let i = 0; i < this.data.particleCount; i++) {
      this.createParticle();
    }
  },
  
  createParticle: function() {
    const particle = document.createElement('a-plane');
    
    // ランダムな位置を設定
    const posX = (Math.random() * 2 - 1).toFixed(2);
    const posY = (Math.random() * 2 - 1).toFixed(2);
    const posZ = (Math.random() * 0.5).toFixed(2);
    
    particle.setAttribute('position', `${posX} ${posY} ${posZ}`);
    particle.setAttribute('width', this.data.size);
    particle.setAttribute('height', this.data.size);
    particle.setAttribute('material', {
      color: this.data.color,
      transparent: true,
      opacity: Math.random() * 0.5 + 0.25,
      shader: 'flat',
      src: this.data.texture || null
    });
    
    // パーティクルのアニメーション
    const duration = 1000 + Math.random() * 2000;
    const delay = Math.random() * 1000;
    
    // 位置アニメーション
    particle.setAttribute('animation__position', {
      property: 'position',
      from: `${posX} ${posY} ${posZ}`,
      to: `${posX * 1.5} ${posY * 1.5} ${posZ - 0.5}`,
      dur: duration,
      delay: delay,
      easing: 'easeOutQuad'
    });
    
    // 不透明度アニメーション
    particle.setAttribute('animation__opacity', {
      property: 'material.opacity',
      from: Math.random() * 0.5 + 0.25,
      to: 0,
      dur: duration,
      delay: delay,
      easing: 'easeOutQuad'
    });
    
    this.el.appendChild(particle);
    this.particles.push(particle);
    
    // アニメーション終了後に削除
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
      const index = this.particles.indexOf(particle);
      if (index !== -1) {
        this.particles.splice(index, 1);
      }
    }, duration + delay);
  },
  
  // コンポーネント削除時のクリーンアップ
  remove: function() {
    this.particles.forEach(particle => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
    this.particles = [];
  }
});