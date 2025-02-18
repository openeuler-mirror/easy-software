<script setup lang="ts">
import { computed } from 'vue';
import { useLocale } from '@/composables/useLocale';
import { getYearByOffset } from '@/utils/common';
import { OPENEULER, OPENATOM, OPENEULER_CONTACT } from '@/data/config';

import LogoFooter from '@/assets/footer/footer-logo2.png';
import LogoFooter1 from '@/assets/footer-logo1.png';
import LogoAtom from '@/assets/footer/atom-logo.svg';
import FooterBg from '@/assets/footer/footer-bg.png';
import FooterBgMo from '@/assets/footer/footer-bg-mo.png';

// 公众号、小助手
import CodeTitleXzs from '@/assets/footer/img-xzs.png';
import CodeTitleGzh from '@/assets/footer/img-gzh.png';
import CodeImgXzs from '@/assets/footer/code-xzs.png';
import CodeImgZgz from '@/assets/footer/code-zgz.png';

const { t, isZh } = useLocale();

// 隐私链接
const linksData2 = {
  zh: [
    {
      NAME: '品牌',
      URL: OPENEULER + '/zh/other/brand/',
    },
    {
      NAME: '隐私政策',
      URL: OPENEULER + '/zh/other/privacy/',
    },
    {
      NAME: '法律声明',
      URL: OPENEULER + '/zh/other/legal/',
    },
    {
      NAME: '关于cookies',
      URL: OPENEULER + '/zh/other/cookies/',
    },
  ],
  en: [
    {
      NAME: 'Trademark',
      URL: OPENEULER + '/en/other/brand/',
    },
    {
      NAME: 'Privacy Policy',
      URL: OPENEULER + '/en/other/privacy/',
    },
    {
      NAME: 'Legal Notice',
      URL: OPENEULER + '/en/other/legal/',
    },
    {
      NAME: 'About Cookies',
      URL: OPENEULER + '/en/other/cookies/',
    },
  ],
};

const footLink = computed(() => (isZh.value ? linksData2.zh : linksData2.en));

// 公众号、小助手
const footerCodeList = [
  {
    img: CodeTitleXzs,
    code: CodeImgXzs,
    label: t('common.FOOTER.QR_CODE'),
  },
  {
    img: CodeTitleGzh,
    code: CodeImgZgz,
    label: t('common.FOOTER.QR_ASSISTANT'),
  },
];

// 背景
const footBg = {
  pc: `url(${FooterBg})`,
  mo: `url(${FooterBgMo})`,
};
</script>

<template>
  <div class="footer">
    <div class="footer-inner">
      <div class="atom">
        <p class="atom-text">{{ t('common.FOOTER.ATOM_TEXT') }}</p>
        <a :href="OPENATOM" target="_blank" rel="noopener noreferrer">
          <img :src="LogoAtom" class="atom-logo" alt="" />
        </a>
      </div>
      <div class="footer-content">
        <div class="footer-logo">
          <img class="show-pc" :src="LogoFooter" alt="" />
          <img class="show-mo" :src="LogoFooter1" alt="" />
          <p>
            <a class="email" :href="`mailto:${OPENEULER_CONTACT}`" target="_blank" rel="noopener noreferrer"> {{ OPENEULER_CONTACT }} </a>
          </p>
        </div>
        <div class="footer-option">
          <div class="footer-option-item">
            <a v-for="link in footLink" :key="link.URL" class="link" :href="link.URL" target="_blank">{{ link.NAME }}</a>
          </div>
          <p class="copyright">{{ t('common.FOOTER.COPY_RIGHT', { year: getYearByOffset() }) }}</p>
          <p class="license">
            <span>{{ t('common.FOOTER.LICENSED_1') }}</span>
            {{ t('common.FOOTER.LICENSED_2') }}
          </p>
        </div>
        <div class="footer-right">
          <div v-if="isZh" class="code-box">
            <span v-for="(item, index) in footerCodeList" :key="index" class="code-pop">
              <img :src="item.img" class="code-img" alt="" />
              <div class="code-layer">
                <img :src="item.code" alt="" />
                <p class="txt">{{ item.label }}</p>
              </div>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$color: #fff;
.footer {
  background: #1e1e1e;
  min-height: var(--layout-footer-height);

  .footer-inner {
    width: var(--layout-content-max-width);
    padding: 0 var(--layout-content-padding);
    margin: 0 auto;
  }
  :deep(.app-content) {
    padding-bottom: 0;
  }
  .cookie-privacy {
    width: 100%;
    height: 48px;
    background-color: var(--o-color-bg1);
    color: var(--o-color-text3);
    @include tip1;
    line-height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 999;
    box-shadow: var(--o-shadow-1);
    text-align: center;
    @media screen and (max-width: 1000px) {
      display: inline-block;
    }
    a {
      cursor: pointer;
      text-decoration: solid;
      white-space: pre;
    }
    .icon {
      cursor: pointer;
      vertical-align: middle;
      margin-left: 16px;
      width: 24px;
      height: 24px;
      background: var(--o-color-greyblack3);
      border-radius: 50%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      svg {
        font-size: 20px;
        color: var(--el-color-white);
      }
      @media screen and (max-width: 1000px) {
        width: 20px;
        height: 20px;
        margin-left: 12px;
      }
    }
  }
  .atom {
    text-align: center;
    padding: 32px 0 24px;
    position: relative;
    border-bottom: 1px solid rgba(229, 229, 229, 0.12);
    @media (max-width: 1440px) {
      padding: 24px 0;
    }

    &-text {
      @include h4;
      font-weight: 400;
      color: $color;
    }
    &-logo {
      height: 48px;
      margin-top: 16px;
      @media (max-width: 1100px) {
        height: 30px;
      }
    }
  }

  .footer-content {
    background: v-bind('footBg.pc') no-repeat bottom center;
    @media (max-width: 767px) {
      background: v-bind('footBg.mo') no-repeat bottom center;
    }
    display: flex;
    align-items: end;
    justify-content: space-between;
    padding: 18px 0 32px;
    position: relative;
    min-height: 118px;
    @media (max-width: 1436px) {
      padding: 24px 0;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    }
  }
  &-logo {
    flex: 1;
    img {
      height: 46px;
    }
    .show-pc {
      display: block;
    }
    .show-mo {
      display: none;
    }
    @media (max-width: 1436px) {
      text-align: center;
      margin: 16px 0;
      .show-pc {
        display: none;
      }
      .show-mo {
        display: inline-block;
        height: 20px;
      }
    }
  }

  .copyright {
    @include tip1;
    color: $color;
    margin-top: 16px;
    @media (max-width: 1436px) {
      margin-top: 8px;
    }
  }
  .license {
    @include tip1;
    color: $color;
    margin-top: 16px;
    span {
      color: #777;
    }
    @media (max-width: 1400px) {
      margin-top: 8px;
    }
  }

  .footer-option {
    text-align: center;
    .link {
      color: $color;
      font-size: var(--o-font_size-tip1);
      display: inline-block;
      padding: 0 12px;
      border-right: 1px solid $color;
      cursor: pointer;
      line-height: 18px;
      &:last-child {
        border-right: 0;
      }
      @media (max-width: 1436px) {
        padding: 0 6px;
        font-size: var(--o-font_size-tip2);
      }
    }
    @media (max-width: 1436px) {
      order: -1;
    }
  }

  .footer-right {
    flex: 1;
    .code-box {
      display: flex;
      justify-content: right;
      .code-pop + .code-pop {
        margin-left: 16px;
      }
      .code-pop {
        position: relative;
        height: 20px;
        display: block;
        > img {
          height: 100%;
          object-fit: cover;
        }
        .code-layer {
          position: absolute;
          top: -105px;
          left: -32px;
          z-index: 99;
          display: none;
          background: #fff;
          padding: 6px;
          img {
            width: 78px;
            height: 78px;
          }
          .txt {
            font-size: 12px;
            color: $color;
            display: none;
          }
          &::after {
            border: 10px solid transparent;
            content: '';
            border-top-color: #fff;
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            display: block;
          }
          @media (max-width: 800px) {
            display: block;
            position: initial;
            background: none;
            padding: 0;
            text-align: center;
            &::after {
              display: none !important;
            }
            .txt {
              display: block;
            }
          }
        }
        &:hover {
          .code-layer {
            display: block;
          }
        }
        @media (max-width: 800px) {
          height: auto;
          > img {
            display: none;
          }
        }
      }
      @media (max-width: 1436px) {
        justify-content: center;
      }
      @media (max-width: 1100px) {
        margin-top: 24px;
      }
    }
    .footer-links {
      display: flex;
      justify-content: right;
      align-items: center;

      .links-logo + .links-logo {
        margin-left: 10px;
      }
      .links-logo {
        height: 14px;
        cursor: pointer;
        &:first-child {
          height: 18px;
        }
        img {
          height: 100%;
          object-fit: cover;
        }
      }
      @media (max-width: 1100px) {
        justify-content: center;
      }
      @media (max-width: 800px) {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        text-align: center;
        margin-top: 40px;
        gap: 10px;
        .img {
          height: 16px;
        }
      }
      &.iszh {
        .links-logo + .links-logo {
          margin-left: 10px;
        }
        .links-logo {
          height: 14px;

          &:first-child {
            height: 18px;
          }
        }
        @media (max-width: 800px) {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          text-align: center;
          margin-top: 40px;
          .img {
            height: 16px;
          }
        }
      }
    }

    p {
      color: $color;
      @include tip1;
      margin-top: 8px;
    }
  }

  .email {
    color: $color;
    @include tip1;
  }
}
</style>
