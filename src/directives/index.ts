import type { Directive } from 'vue';
import vCopyCode from './copy-code';

const directives: { [key: string]: Directive } = {
  copyCode: vCopyCode,
};

export default directives;
