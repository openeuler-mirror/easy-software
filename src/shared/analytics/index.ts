import { OpenAnalytics, OpenEventKeys, getClientInfo } from '@opensig/open-analytics';
import { reportAnalytics } from '@/api/api-analytics';

export const oa = new OpenAnalytics({
  appKey: 'easysoftware',
  request: (data) => {
    reportAnalytics(data);
  },
});

export const enableOA = () => {
  oa.setHeader(getClientInfo());
  oa.enableReporting(true);
};

export const disableOA = () => {
  oa.enableReporting(false);
};

export const reportPV = ($referrer?: string) => {
  oa.report(OpenEventKeys.PV, $referrer ? () => ({ $referrer }) : undefined);
};

export const reportPerformance = () => {
  oa.report(OpenEventKeys.LCP);
  oa.report(OpenEventKeys.INP);
  oa.report(OpenEventKeys.PageBasePerformance);
};
