import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { generateBuiltinClashConfig } from '../../functions/modules/subscription/builtin-clash-generator.js';
import { resolveSafeDnsConfig } from '../../functions/modules/subscription/safe-dns.js';

describe('IPv6 解析开关', () => {
    const aaaaOnlyNode = 'vless://0956c0a0-92f1-4ec2-802c-247c91566a6e@speedtest6.example.com:8443?security=reality&pbk=k&sid=86&sni=example.com&type=tcp#mo-v6';

    it('默认关闭 IPv6（保持既有行为）', () => {
        const parsed = yaml.load(generateBuiltinClashConfig(aaaaOnlyNode));
        expect(parsed.ipv6).toBe(false);
        expect(parsed.dns.ipv6).toBe(false);
    });

    it('ipv6=true 时顶层与 DNS 均启用', () => {
        const parsed = yaml.load(generateBuiltinClashConfig(aaaaOnlyNode, { ipv6: true }));
        expect(parsed.ipv6).toBe(true);
        expect(parsed.dns.ipv6).toBe(true);
    });

    it('resolveSafeDnsConfig 跟随 ipv6 选项', () => {
        expect(resolveSafeDnsConfig('', { ipv6: true }).ipv6).toBe(true);
        expect(resolveSafeDnsConfig('').ipv6).toBe(false);
    });
});
