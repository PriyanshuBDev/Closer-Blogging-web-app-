"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idSchema = exports.blogSchema = exports.userSchema = void 0;
const zod_1 = require("zod");
exports.userSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(1).optional(),
    password: zod_1.z.string().min(5),
});
exports.blogSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    content: zod_1.z.string().min(1, "Content is required"),
    published: zod_1.z.boolean().optional(),
});
exports.idSchema = zod_1.z.string().uuid();
