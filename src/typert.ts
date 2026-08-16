/* Adapted from the generated Typert artifact by scripts/extract-plugin.mjs — do not edit; re-extract from the source package. */
import { z } from 'zod'

const _deepseek_ai_dsh_host_tray_tray_configure_parameter_0$schema = z.object({
  'enabled': z.boolean(),
  'closeBehavior': z.union([z.literal("tray"), z.literal("quit")]),
  'menu': z.array(z.object({
  'id': z.string(),
  'label': z.string(),
})).optional(),
})
const _deepseek_ai_dsh_host_tray_tray_configure_result$schema = z.object({
  'available': z.boolean(),
  'enabled': z.boolean(),
  'closeBehavior': z.union([z.literal("tray"), z.literal("quit")]),
  'windowVisible': z.boolean(),
})
const _deepseek_ai_dsh_host_tray_tray_getStatus_result$schema = z.object({
  'available': z.boolean(),
  'enabled': z.boolean(),
  'closeBehavior': z.union([z.literal("tray"), z.literal("quit")]),
  'windowVisible': z.boolean(),
})
const _deepseek_ai_dsh_host_tray_tray_quit_result$schema = z.void()
const _deepseek_ai_dsh_host_tray_tray_showWindow_result$schema = z.object({
  'available': z.boolean(),
  'enabled': z.boolean(),
  'closeBehavior': z.union([z.literal("tray"), z.literal("quit")]),
  'windowVisible': z.boolean(),
})

export const TYPERT = {
  package: 'dsh-tray',
  face: 'host',
  schemas: [
  ],
  invocations: [
    {
      id: 'dsh-tray#tray/configure',
      service: 'tray',
      namespace: 'tray',
      method: 'configure',
      invocation: { kind: 'direct' },
      parameters: [
        {
          name: 'request',
          wire: 'request',
          source: 'json',
          codec: {
            mode: 'strict',
            typeSymbol: 'dsh-tray/types#TrayConfigureRequest',
            schema: _deepseek_ai_dsh_host_tray_tray_configure_parameter_0$schema,
          },
        },
      ],
      result: {
        mode: 'strict',
        typeSymbol: 'dsh-tray/types#TrayStatusView',
        schema: _deepseek_ai_dsh_host_tray_tray_configure_result$schema,
      },
      sourceLocation: {"file":"dsh-tray/src/index.ts","line":89,"column":9},
    },
    {
      id: 'dsh-tray#tray/getStatus',
      service: 'tray',
      namespace: 'tray',
      method: 'getStatus',
      invocation: { kind: 'direct' },
      parameters: [
      ],
      result: {
        mode: 'strict',
        typeSymbol: 'dsh-tray/types#TrayStatusView',
        schema: _deepseek_ai_dsh_host_tray_tray_getStatus_result$schema,
      },
      sourceLocation: {"file":"dsh-tray/src/index.ts","line":77,"column":9},
    },
    {
      id: 'dsh-tray#tray/quit',
      service: 'tray',
      namespace: 'tray',
      method: 'quit',
      invocation: { kind: 'direct' },
      parameters: [
      ],
      result: {
        mode: 'strict',
        typeSymbol: 'dsh-tray#tray/quit:result',
        schema: _deepseek_ai_dsh_host_tray_tray_quit_result$schema,
      },
      sourceLocation: {"file":"dsh-tray/src/index.ts","line":112,"column":9},
    },
    {
      id: 'dsh-tray#tray/showWindow',
      service: 'tray',
      namespace: 'tray',
      method: 'showWindow',
      invocation: { kind: 'direct' },
      parameters: [
      ],
      result: {
        mode: 'strict',
        typeSymbol: 'dsh-tray/types#TrayStatusView',
        schema: _deepseek_ai_dsh_host_tray_tray_showWindow_result$schema,
      },
      sourceLocation: {"file":"dsh-tray/src/index.ts","line":102,"column":9},
    },
  ],
  model: {
    "services": [],
    "events": [],
    "objects": []
  },
}
