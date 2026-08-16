import { z } from 'zod';
export declare const TYPERT: {
    package: string;
    face: string;
    schemas: never[];
    invocations: ({
        id: string;
        service: string;
        namespace: string;
        method: string;
        invocation: {
            kind: string;
        };
        parameters: {
            name: string;
            wire: string;
            source: string;
            codec: {
                mode: string;
                typeSymbol: string;
                schema: z.ZodObject<{
                    enabled: z.ZodBoolean;
                    closeBehavior: z.ZodUnion<readonly [z.ZodLiteral<"tray">, z.ZodLiteral<"quit">]>;
                    menu: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        label: z.ZodString;
                    }, z.core.$strip>>>;
                }, z.core.$strip>;
            };
        }[];
        result: {
            mode: string;
            typeSymbol: string;
            schema: z.ZodObject<{
                available: z.ZodBoolean;
                enabled: z.ZodBoolean;
                closeBehavior: z.ZodUnion<readonly [z.ZodLiteral<"tray">, z.ZodLiteral<"quit">]>;
                windowVisible: z.ZodBoolean;
            }, z.core.$strip>;
        };
        sourceLocation: {
            file: string;
            line: number;
            column: number;
        };
    } | {
        id: string;
        service: string;
        namespace: string;
        method: string;
        invocation: {
            kind: string;
        };
        parameters: never[];
        result: {
            mode: string;
            typeSymbol: string;
            schema: z.ZodVoid;
        };
        sourceLocation: {
            file: string;
            line: number;
            column: number;
        };
    })[];
    model: {
        services: never[];
        events: never[];
        objects: never[];
    };
};
//# sourceMappingURL=typert.d.ts.map