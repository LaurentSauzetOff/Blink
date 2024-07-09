import { PrismaCLient } from "@prisma/client";

declare global {
    var prisma: PrismaCLient | undefined;
};

export const db = globalThis.prisma || new PrismaCLient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db



