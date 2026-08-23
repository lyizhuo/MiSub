import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { urlToClashProxy } from '../../functions/utils/url-to-clash.js';
import { convertClashProxyToUrl } from '../../functions/utils/clash-to-url.js';
import { generateProxiesOnly } from '../../functions/modules/subscription/builtin-clash-generator.js';

const MLKEM = 'mlkem768x25519plus.native.0rtt.jBasRllk5OR7J9-vFUCPMbWdl1nOkgkUv9VXMToRlzE';

const PQ_VLESS_URL =
    'vless://0956c0a0-92f1-4ec2-802c-247c91566a6e@speedtest.example.com:8443?' +
    [
        `encryption=${encodeURIComponent(MLKEM)}`,
        'flow=xtls-rprx-vision',
        'fp=firefox',
        'pbk=XBIcjTqmpwbwOSXVtiqIDvKlzTmpAu9p7A8yWQpfkWI',
        'security=reality',
        'sid=56603b',
        'sni=dsej.gov.mo',
        'type=tcp'
    ].join('&') + '#mo-v4';

describe('VLESS encryption (post-quantum) preservation', () => {
    it('应保留 vless URL 中的 mlkem768 加密参数', () => {
        const proxy = urlToClashProxy(PQ_VLESS_URL);
        expect(proxy).not.toBeNull();
        expect(proxy.encryption).toBe(MLKEM);
        expect(proxy['reality-opts']['public-key']).toBe('XBIcjTqmpwbwOSXVtiqIDvKlzTmpAu9p7A8yWQpfkWI');
    });

    it('encryption=none 不应写入 Clash 字段', () => {
        const url = PQ_VLESS_URL.replace(`encryption=${encodeURIComponent(MLKEM)}&`, 'encryption=none&');
        const proxy = urlToClashProxy(url);
        expect(proxy.encryption).toBeUndefined();
    });

    it('内置 Clash 生成器输出应包含加密字段', () => {
        const parsed = yaml.load(generateProxiesOnly(PQ_VLESS_URL));
        expect(parsed.proxies[0].encryption).toBe(MLKEM);
    });

    it('clash-to-url 往返应还原加密参数', () => {
        const proxy = urlToClashProxy(PQ_VLESS_URL);
        const roundTripped = convertClashProxyToUrl({ ...proxy, name: 'mo-v4' });
        expect(roundTripped).toContain(`encryption=${encodeURIComponent(MLKEM)}`);

        // 再解析一次，字段不丢失
        const reparsed = urlToClashProxy(roundTripped);
        expect(reparsed.encryption).toBe(MLKEM);
    });

    it('无加密字段时仍默认输出 encryption=none', () => {
        const proxy = urlToClashProxy(PQ_VLESS_URL.replace(`encryption=${encodeURIComponent(MLKEM)}&`, ''));
        delete proxy.encryption;
        const url = convertClashProxyToUrl({ ...proxy, name: 'plain' });
        expect(url).toContain('encryption=none');
    });
});
