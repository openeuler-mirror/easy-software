
/**
 * 获取浏览器的 User-Agent
 * @returns {string} 返回浏览器的 User-Agent
 */
export const getUA = () => {
  if ('navigator' in globalThis && navigator.userAgent) {
    return navigator.userAgent;
  } else {
    return '';
  }
};

const enum OS {
  WINDOWS = 'windows',
  MAC_OS = 'macOS',
  IOS = 'ios',
  HARMONY_OS = 'harmonyOS',
  ANDROID = 'android',
}

// 参考 https://github.com/faisalman/ua-parser-js/blob/master/src/main/ua-parser.js
const osTesters = [
  {
    name: OS.WINDOWS,
    testers: [/Windows/i],
  },
  {
    name: OS.MAC_OS,
    testers: [/(mac os x) ?([\w. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], // MacOS平台的正则表达式示例
  },
  {
    name: OS.IOS,
    testers: [
      /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, // iOS
      /(?:ios;fbsv|iphone.+ios)([\d.]+)/i,
      /cfnetwork\/.+darwin/i,
    ],
  },
  {
    name: OS.HARMONY_OS,
    testers: [/droid ([\w.]+)\b.+harmonyos/i],
  },
  {
    name: OS.ANDROID,
    testers: [/android/i],
  },
];

const enum FEATURES {
  TOUCH_POINTS = 'touchPoints',
}

const featureDetections = Object.freeze({
  // 用于分辨 Mac OS 和 ipad OS
  [FEATURES.TOUCH_POINTS]: () => navigator.maxTouchPoints || 0,
});

/**
 * 获取 OS
 * @returns {string} 返回 OS 类型
 */
export const getOS = () => {
  // 获取不到默认返回 windows
  const ua = getUA();
  if (!ua) {
    return OS.WINDOWS;
  }
  const osItem = osTesters.find((t) => {
    const { testers } = t;
    const matched = testers.some((reg) => reg.test(ua));
    return matched;
  });
  if (osItem) {
    const { name } = osItem;
    if (OS.MAC_OS === name) {
      const maxTouchPoints = featureDetections[FEATURES.TOUCH_POINTS]();
      if (maxTouchPoints > 2) {
        return OS.IOS;
      }
    }
    return name;
  } else {
    return OS.WINDOWS;
  }
};