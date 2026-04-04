#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const pbir_js_1 = require("./pbir.js");
// --- Discover report path ---
function findReportFolder(basePath) {
    // Look for *.Report folders
    if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
        // Check if basePath itself is a .Report folder
        if (basePath.endsWith(".Report") && fs.existsSync(path.join(basePath, "definition"))) {
            return basePath;
        }
        // Search children
        const entries = fs.readdirSync(basePath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory() && entry.name.endsWith(".Report")) {
                const candidate = path.join(basePath, entry.name);
                if (fs.existsSync(path.join(candidate, "definition"))) {
                    return candidate;
                }
            }
        }
    }
    return null;
}
// --- Parse field specification from user input ---
function parseFieldSpec(spec) {
    if (spec.type === "measure") {
        return (0, pbir_js_1.measureRef)(spec.entity, spec.property);
    }
    if (spec.type === "aggregation") {
        const func = pbir_js_1.AggregationFunction[spec.aggregation || "Sum"] ?? 0;
        return (0, pbir_js_1.aggregationRef)(spec.entity, spec.property, func);
    }
    return (0, pbir_js_1.columnRef)(spec.entity, spec.property);
}
// --- Helper: Build formatting props in PBIR literal format ---
function buildFormattingProps(properties) {
    const props = {};
    for (const [key, value] of Object.entries(properties)) {
        if (typeof value === "string" && value.startsWith("#")) {
            props[key] = { solid: { color: { expr: { Literal: { Value: `'${value}'` } } } } };
        }
        else {
            let literalValue;
            if (typeof value === "boolean") {
                literalValue = value ? "true" : "false";
            }
            else if (typeof value === "number") {
                literalValue = `${value}D`;
            }
            else {
                literalValue = `'${value}'`;
            }
            props[key] = { expr: { Literal: { Value: literalValue } } };
        }
    }
    return props;
}
// --- Helper: Apply formatting array to a target object ---
function applyFormattingToTarget(targetObj, formatting) {
    for (const fmt of formatting) {
        const props = buildFormattingProps(fmt.properties);
        const existing = targetObj[fmt.category];
        if (Array.isArray(existing) && existing.length > 0) {
            const existingProps = existing[0].properties || {};
            existing[0].properties = { ...existingProps, ...props };
        }
        else {
            targetObj[fmt.category] = [{ properties: props }];
        }
    }
}
// --- Helper: Apply data colors to a visual ---
function applyDataColors(visual, colors, defaultTransparency) {
    if (!visual.visual.objects) {
        visual.visual.objects = {};
    }
    const dataPoints = [];
    for (const c of colors) {
        const entry = {
            properties: {
                fill: { solid: { color: { expr: { Literal: { Value: `'${c.color}'` } } } } },
            },
        };
        if (c.seriesName) {
            entry.selector = { metadata: c.seriesName };
        }
        dataPoints.push(entry);
    }
    if (defaultTransparency !== undefined) {
        dataPoints.push({
            properties: {
                transparency: { expr: { Literal: { Value: `${defaultTransparency}D` } } },
            },
        });
    }
    visual.visual.objects.dataPoint = dataPoints;
}
function createAndSaveVisual(project, pageId, spec, baseZ) {
    const visualId = (0, pbir_js_1.generateId)();
    const { x = 0, y = 0, width: rawWidth, height: rawHeight, bindings, autoFilters = true, slicerMode, shapeType, shapeRotation = 0, fillColor, textContent, textColor, textAlign, textSize, textBold, title, containerFormat, visualFormat, dataColors } = spec;
    // Normalise basicShape → shape
    const visualType = spec.visualType === "basicShape" ? "shape" : spec.visualType;
    const slicerDefaultTypes = new Set(["slicer", "listSlicer", "textSlicer", "advancedSlicerVisual"]);
    const width = rawWidth ?? (slicerDefaultTypes.has(visualType) ? 168 : 280);
    const height = rawHeight ?? (slicerDefaultTypes.has(visualType) ? 65 : 280);
    const zVal = baseZ;
    // Build query state from bindings
    const queryState = {};
    if (bindings && bindings.length > 0) {
        for (const binding of bindings) {
            let bucketName = binding.bucket;
            if (bucketName === "Fields") {
                const validBuckets = pbir_js_1.VISUAL_BUCKETS[visualType];
                if (validBuckets && validBuckets.length > 0 && !validBuckets.includes("Fields")) {
                    bucketName = validBuckets[0];
                }
            }
            const projections = binding.fields.map((fieldSpec, i) => {
                const field = parseFieldSpec(fieldSpec);
                const isFirst = i === 0 && (bucketName === "Category" || (visualType === "slicer" && bucketName === "Values"));
                return {
                    field,
                    queryRef: (0, pbir_js_1.buildQueryRef)(field),
                    nativeQueryRef: (0, pbir_js_1.buildNativeQueryRef)(field),
                    ...(isFirst ? { active: true } : {}),
                };
            });
            queryState[bucketName] = { projections };
        }
    }
    // Build sort definition
    let sortDefinition;
    if (queryState.Category?.projections?.[0]) {
        sortDefinition = {
            sort: [{ field: JSON.parse(JSON.stringify(queryState.Category.projections[0].field)), direction: "Ascending" }],
            isDefaultSort: true,
        };
    }
    if (!sortDefinition && visualType === "slicer" && queryState.Values?.projections?.[0]) {
        sortDefinition = {
            sort: [{ field: JSON.parse(JSON.stringify(queryState.Values.projections[0].field)), direction: "Ascending" }],
        };
    }
    // Build visual objects (for slicers, shapes, textboxes)
    let visualObjects;
    if (visualType === "slicer") {
        const mode = slicerMode || "Dropdown";
        // Dropdown: add strictSingleSelect=true (matches PBI default for dropdowns)
        // Basic: just set mode, no extra selection properties
        visualObjects = mode === "Dropdown"
            ? {
                data: [{ properties: { mode: { expr: { Literal: { Value: `'${mode}'` } } } } }],
                selection: [{ properties: { strictSingleSelect: { expr: { Literal: { Value: "true" } } } } }],
            }
            : {
                data: [{ properties: { mode: { expr: { Literal: { Value: `'${mode}'` } } } } }],
            };
    }
    else if (visualType === "shape") {
        const tile = shapeType || "rectangle";
        const color = fillColor || "#D9D9D9";
        const shapeObjs = {
            shape: [{ properties: { tileShape: { expr: { Literal: { Value: `'${tile}'` } } } } }],
            rotation: [{ properties: { shapeAngle: { expr: { Literal: { Value: `${shapeRotation}L` } } } } }],
            fill: [{ properties: { fillColor: { solid: { color: { expr: { Literal: { Value: `'${color}'` } } } } } }, selector: { id: "default" } }],
            outline: [{ properties: { show: { expr: { Literal: { Value: "false" } } } } }],
        };
        if (textContent) {
            const textStyle = {};
            if (textColor)
                textStyle.color = textColor;
            if (textBold)
                textStyle.fontWeight = "bold";
            if (textSize)
                textStyle.fontSize = `${textSize}pt`;
            shapeObjs.general = [{ properties: { paragraphs: [{ textRuns: [{ value: textContent, ...(Object.keys(textStyle).length ? { textStyle } : {}) }], horizontalTextAlignment: textAlign || "center" }] } }];
        }
        visualObjects = shapeObjs;
    }
    else if (visualType === "textbox") {
        const text = textContent || "";
        const textStyle = {};
        if (textColor)
            textStyle.color = textColor;
        if (textBold)
            textStyle.fontWeight = "bold";
        if (textSize)
            textStyle.fontSize = `${textSize}pt`;
        visualObjects = {
            general: [{ properties: { paragraphs: [{ textRuns: [{ value: text, ...(Object.keys(textStyle).length ? { textStyle } : {}) }], horizontalTextAlignment: textAlign || "left" }] } }],
        };
    }
    const visual = {
        $schema: "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.7.0/schema.json",
        name: visualId,
        position: { x, y, z: zVal, height, width, tabOrder: zVal },
        visual: {
            visualType,
            ...(Object.keys(queryState).length > 0 ? { query: { queryState, ...(sortDefinition ? { sortDefinition } : {}) } } : {}),
            ...(visualObjects ? { objects: visualObjects } : {}),
            drillFilterOtherVisuals: true,
        },
    };
    // Add title
    if (title) {
        visual.visual.visualContainerObjects = {
            title: [{ properties: { text: { expr: { Literal: { Value: `'${title}'` } } } } }],
        };
    }
    // Apply default font (fontSize 8, Segoe UI) to title — overridable by containerFormat
    if (!visual.visual.visualContainerObjects)
        visual.visual.visualContainerObjects = {};
    applyFormattingToTarget(visual.visual.visualContainerObjects, [
        { category: "title", properties: { fontSize: 8, fontFamily: "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif" } },
    ]);
    // Apply inline container formatting
    if (containerFormat && containerFormat.length > 0) {
        applyFormattingToTarget(visual.visual.visualContainerObjects, containerFormat);
    }
    // Apply default font to visual-level objects (axes, labels, legend for charts; items/header for slicers)
    const defaultVisualFont = { fontSize: 8, fontFamily: "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif" };
    const slicerTypes = new Set(["slicer", "listSlicer", "textSlicer", "advancedSlicerVisual"]);
    const nonDataTypes = new Set(["textbox", "basicShape", "shape", "image", "actionButton"]);
    if (!nonDataTypes.has(visualType)) {
        if (!visual.visual.objects)
            visual.visual.objects = {};
        if (slicerTypes.has(visualType)) {
            applyFormattingToTarget(visual.visual.objects, [
                { category: "items", properties: { textSize: 8, fontFamily: "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif" } },
                { category: "header", properties: { textSize: 8, fontFamily: "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif" } },
            ]);
        }
        else {
            applyFormattingToTarget(visual.visual.objects, [
                { category: "categoryAxis", properties: defaultVisualFont },
                { category: "valueAxis", properties: defaultVisualFont },
                { category: "labels", properties: defaultVisualFont },
                { category: "legend", properties: defaultVisualFont },
            ]);
        }
    }
    // Apply inline visual formatting
    if (visualFormat && visualFormat.length > 0) {
        if (!visual.visual.objects)
            visual.visual.objects = {};
        applyFormattingToTarget(visual.visual.objects, visualFormat);
    }
    // Apply inline data colors
    if (dataColors && dataColors.length > 0) {
        applyDataColors(visual, dataColors);
    }
    // Add auto-filters
    if (autoFilters && Object.keys(queryState).length > 0) {
        visual.filterConfig = { filters: (0, pbir_js_1.buildAutoFilters)(queryState) };
    }
    project.saveVisual(pageId, visualId, visual);
    return { visualId, visualType };
}
// --- Theme presets ---
const THEME_PRESETS = {
    dark: {
        containerFormat: [
            { category: "title", properties: { fontSize: 10, fontFamily: "'Segoe UI Semibold', wf_segoe-ui_semibold, helvetica, arial, sans-serif" } },
            { category: "background", properties: { show: true, color: "#161B22", transparency: 0 } },
            { category: "border", properties: { show: true, color: "#30363D", radius: 8 } },
            { category: "visualHeader", properties: { show: false } },
        ],
        slicerContainerFormat: [
            { category: "title", properties: { fontSize: 8 } },
            { category: "background", properties: { show: true, color: "#0D1117", transparency: 0 } },
            { category: "border", properties: { show: true, color: "#30363D", radius: 6 } },
            { category: "visualHeader", properties: { show: false } },
        ],
        dataColors: ["#58A6FF", "#3FB950", "#D29922", "#F85149", "#BC8CFF", "#79C0FF", "#56D364", "#E3B341", "#FF7B72", "#D2A8FF"],
    },
    light: {
        containerFormat: [
            { category: "title", properties: { fontSize: 10, fontFamily: "'Segoe UI Semibold', wf_segoe-ui_semibold, helvetica, arial, sans-serif" } },
            { category: "background", properties: { show: true, color: "#FFFFFF", transparency: 0 } },
            { category: "border", properties: { show: true, color: "#E0E0E0", radius: 8 } },
            { category: "visualHeader", properties: { show: false } },
            { category: "dropShadow", properties: { show: true, position: "Outer" } },
        ],
        dataColors: ["#4A90D9", "#50B748", "#F5A623", "#D0021B", "#9013FE", "#417505", "#BD10E0", "#B8E986", "#7ED321", "#4A4A4A"],
    },
    corporate: {
        containerFormat: [
            { category: "title", properties: { fontSize: 10, fontFamily: "'Segoe UI Semibold', wf_segoe-ui_semibold, helvetica, arial, sans-serif" } },
            { category: "background", properties: { show: true, color: "#FFFFFF", transparency: 0 } },
            { category: "border", properties: { show: true, color: "#D1D5DB", radius: 6 } },
            { category: "visualHeader", properties: { show: false } },
            { category: "padding", properties: { top: 6, bottom: 6, left: 8, right: 8 } },
        ],
        dataColors: ["#1F3864", "#2E75B6", "#4BACC6", "#9BBB59", "#F79646", "#8064A2", "#C0504D", "#4F81BD", "#C4BD97", "#3B3838"],
    },
    "blue-purple": {
        containerFormat: [
            { category: "title", properties: { fontSize: 10, fontFamily: "'Segoe UI Semibold', wf_segoe-ui_semibold, helvetica, arial, sans-serif" } },
            { category: "background", properties: { show: true, color: "#FFFFFF", transparency: 0 } },
            { category: "border", properties: { show: true, color: "#6C63FF", radius: 10 } },
            { category: "visualHeader", properties: { show: false } },
            { category: "dropShadow", properties: { show: true, position: "Outer" } },
        ],
        dataColors: ["#6C63FF", "#A78BFA", "#3B82F6", "#818CF8", "#C084FC", "#6366F1", "#8B5CF6", "#4338CA", "#7C3AED", "#2563EB"],
    },
};
// --- Process stability ---
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
process.on("uncaughtException", (err) => console.error("[uncaughtException]", err));
process.on("unhandledRejection", (reason) => console.error("[unhandledRejection]", reason));
// --- Tool handler wrapper — returns isError response instead of crashing ---
function safe(fn
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    return async (args) => {
        try {
            return await fn(args);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return { content: [{ type: "text", text: JSON.stringify({ success: false, error: msg }) }], isError: true };
        }
    };
}
// --- Main ---
async function main() {
    let reportPath = null;
    let _project = null;
    // Proxy that auto-validates — all existing `project.xxx` calls work unchanged
    const project = new Proxy({}, {
        get(_target, prop) {
            if (!_project) {
                throw new Error("No report connected. Use the set_report tool to connect to a .Report folder first.");
            }
            const val = _project[prop];
            return typeof val === "function" ? val.bind(_project) : val;
        },
    });
    function connectReport(targetPath) {
        const resolved = findReportFolder(path.resolve(targetPath));
        if (!resolved) {
            return { success: false, error: `No .Report folder found at: ${targetPath}` };
        }
        reportPath = resolved;
        _project = new pbir_js_1.PbirProject(reportPath);
        console.error(`Connected to report: ${reportPath}`);
        return { success: true, reportPath };
    }
    // Connect to initial report if provided as CLI arg
    const reportArg = process.argv[2];
    if (reportArg) {
        const result = connectReport(reportArg);
        if (!result.success) {
            console.error(result.error);
            console.error("Starting without a report. Use set_report tool to connect.");
        }
    }
    else {
        console.error("No report path provided. Use set_report tool to connect to a report.");
    }
    const server = new mcp_js_1.McpServer({
        name: "powerbi-report-mcp",
        version: "0.2.1",
    });
    // Auto-wrap all tool handlers with safe() for error resilience
    const _tool = server.tool.bind(server);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    server.tool = (name, desc, schema, handler) => _tool(name, desc, schema, safe(handler));
    // ============================================================
    // TOOL: set_report — switch report at runtime
    // ============================================================
    server.tool("set_report", "Connect to a different Power BI report (.Report folder or parent .pbip project folder). Use this to switch reports mid-session without restarting the server.", {
        path: zod_1.z.string().describe("Absolute path to the .Report folder or the parent folder containing a .pbip project"),
    }, async ({ path: targetPath }) => {
        const result = connectReport(targetPath);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    });
    // ============================================================
    // TOOL: get_report — show currently connected report
    // ============================================================
    server.tool("get_report", "Show the currently connected report path.", {}, async () => {
        return {
            content: [{ type: "text", text: JSON.stringify({ reportPath: reportPath || "No report connected" }) }],
        };
    });
    // ============================================================
    // RESOURCE: PBIR format instructions
    // ============================================================
    server.resource("pbir-instructions", "resource://pbir-instructions", () => ({
        contents: [
            {
                uri: "resource://pbir-instructions",
                mimeType: "text/markdown",
                text: PBIR_INSTRUCTIONS,
            },
        ],
    }));
    // ============================================================
    // TOOL: list_pages
    // ============================================================
    server.tool("list_pages", "List all pages in the report with their details", {}, async () => {
        const meta = project.getPagesMetadata();
        const pages = meta.pageOrder.map((id) => {
            const page = project.getPage(id);
            const visualCount = project.listVisualIds(id).length;
            return {
                id,
                displayName: page.displayName,
                width: page.width,
                height: page.height,
                displayOption: page.displayOption,
                visualCount,
                isActive: id === meta.activePageName,
            };
        });
        return { content: [{ type: "text", text: JSON.stringify(pages, null, 2) }] };
    });
    // ============================================================
    // TOOL: create_page
    // ============================================================
    server.tool("create_page", "Create a new page in the report", {
        displayName: zod_1.z.string().describe("Display name for the page"),
        width: zod_1.z.number().optional().default(1280).describe("Page width (default 1280)"),
        height: zod_1.z.number().optional().default(720).describe("Page height (default 720)"),
        displayOption: zod_1.z
            .enum(["FitToPage", "FitToWidth", "ActualSize"])
            .optional()
            .default("FitToPage"),
    }, async ({ displayName, width, height, displayOption }) => {
        const pageId = (0, pbir_js_1.generateId)();
        const page = {
            $schema: "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/2.1.0/schema.json",
            name: pageId,
            displayName,
            displayOption,
            height,
            width,
        };
        project.savePage(pageId, page);
        const meta = project.getPagesMetadata();
        meta.pageOrder.push(pageId);
        project.savePagesMetadata(meta);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ success: true, pageId, displayName }, null, 2),
                },
            ],
        };
    });
    // ============================================================
    // TOOL: rename_page
    // ============================================================
    server.tool("rename_page", "Rename an existing page", {
        pageId: zod_1.z.string().describe("The page ID to rename"),
        displayName: zod_1.z.string().describe("New display name"),
    }, async ({ pageId, displayName }) => {
        const page = project.getPage(pageId);
        page.displayName = displayName;
        project.savePage(pageId, page);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, pageId, displayName }) }] };
    });
    // ============================================================
    // TOOL: delete_page
    // ============================================================
    server.tool("delete_page", "Delete a page and all its visuals", {
        pageId: zod_1.z.string().describe("The page ID to delete"),
    }, async ({ pageId }) => {
        const meta = project.getPagesMetadata();
        meta.pageOrder = meta.pageOrder.filter((id) => id !== pageId);
        if (meta.activePageName === pageId && meta.pageOrder.length > 0) {
            meta.activePageName = meta.pageOrder[0];
        }
        project.savePagesMetadata(meta);
        project.deletePage(pageId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deletedPageId: pageId }) }] };
    });
    // ============================================================
    // TOOL: reorder_pages
    // ============================================================
    server.tool("reorder_pages", "Set the page order", {
        pageOrder: zod_1.z.array(zod_1.z.string()).describe("Array of page IDs in desired order"),
    }, async ({ pageOrder }) => {
        const meta = project.getPagesMetadata();
        meta.pageOrder = pageOrder;
        project.savePagesMetadata(meta);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, pageOrder }) }] };
    });
    // ============================================================
    // TOOL: set_active_page
    // ============================================================
    server.tool("set_active_page", "Set which page is active (shown on open)", {
        pageId: zod_1.z.string().describe("The page ID to set as active"),
    }, async ({ pageId }) => {
        const meta = project.getPagesMetadata();
        meta.activePageName = pageId;
        project.savePagesMetadata(meta);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, activePageName: pageId }) }] };
    });
    // ============================================================
    // TOOL: list_visuals
    // ============================================================
    server.tool("list_visuals", "List all visuals on a page", {
        pageId: zod_1.z.string().describe("The page ID"),
    }, async ({ pageId }) => {
        const visualIds = project.listVisualIds(pageId);
        const visuals = visualIds.map((id) => {
            const v = project.getVisual(pageId, id);
            return {
                id,
                visualType: v.visual.visualType,
                position: v.position,
                filterCount: v.filterConfig?.filters?.length ?? 0,
            };
        });
        return { content: [{ type: "text", text: JSON.stringify(visuals, null, 2) }] };
    });
    // ============================================================
    // TOOL: get_visual
    // ============================================================
    server.tool("get_visual", "Get the full definition of a visual", {
        pageId: zod_1.z.string().describe("The page ID"),
        visualId: zod_1.z.string().describe("The visual ID"),
    }, async ({ pageId, visualId }) => {
        const visual = project.getVisual(pageId, visualId);
        return { content: [{ type: "text", text: JSON.stringify(visual, null, 2) }] };
    });
    // ============================================================
    // TOOL: add_visual (supports single + batch mode with inline formatting)
    // ============================================================
    const FieldSpecSchema = zod_1.z.object({
        entity: zod_1.z.string().describe("Table/entity name (e.g. 'financials')"),
        property: zod_1.z.string().describe("Column or measure name (e.g. 'Gross Sales')"),
        type: zod_1.z
            .enum(["column", "measure", "aggregation"])
            .describe("'column' for raw column, 'aggregation' for aggregated column, 'measure' for DAX measure"),
        aggregation: zod_1.z
            .string()
            .optional()
            .describe("Aggregation function: Sum, Avg, Count, Min, Max, CountNonNull, Median, StandardDeviation, Variance"),
    });
    const BucketBindingSchema = zod_1.z.object({
        bucket: zod_1.z.string().describe("Data role bucket name (e.g. 'Category', 'Y', 'Series', 'Values', 'Rows')"),
        fields: zod_1.z.array(FieldSpecSchema).describe("Fields to bind to this bucket"),
    });
    const FormatCategorySchema = zod_1.z.object({
        category: zod_1.z.string().describe("Formatting category"),
        properties: zod_1.z.record(zod_1.z.string(), zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()])).describe("Property key-value pairs"),
    });
    const DataColorSchema = zod_1.z.object({
        color: zod_1.z.string().describe("Hex color like '#CD191C'"),
        seriesName: zod_1.z.string().optional().describe("Series metadata selector"),
    });
    const VisualSpecSchema = zod_1.z.object({
        visualType: zod_1.z.string().describe("The visual type"),
        x: zod_1.z.number().optional().default(0).describe("X position"),
        y: zod_1.z.number().optional().default(0).describe("Y position"),
        width: zod_1.z.number().optional().default(280).describe("Width"),
        height: zod_1.z.number().optional().default(280).describe("Height"),
        bindings: zod_1.z.array(BucketBindingSchema).optional().describe("Data bindings"),
        autoFilters: zod_1.z.boolean().optional().default(true),
        slicerMode: zod_1.z.enum(["Basic", "Dropdown"]).optional(),
        shapeType: zod_1.z.enum(["rectangle", "rectangleRounded", "line", "tabCutCorner", "tabCutTopCorners", "tabRoundCorner", "tabRoundTopCorners"]).optional(),
        shapeRotation: zod_1.z.number().optional().default(0),
        fillColor: zod_1.z.string().optional().describe("Fill color for shapes (hex, e.g. '#D9D9D9'). Defaults to #D9D9D9 if not provided."),
        textContent: zod_1.z.string().optional().describe("Text label displayed inside a shape or textbox"),
        textColor: zod_1.z.string().optional().describe("Text color (hex, e.g. '#595959')"),
        textAlign: zod_1.z.enum(["left", "center", "right"]).optional().describe("Horizontal text alignment inside shape/textbox"),
        textSize: zod_1.z.number().optional().describe("Font size in pt (e.g. 10)"),
        textBold: zod_1.z.boolean().optional().describe("Bold text"),
        title: zod_1.z.string().optional(),
        containerFormat: zod_1.z.array(FormatCategorySchema).optional().describe("Inline container formatting (title, background, border, padding, dropShadow, visualHeader)"),
        visualFormat: zod_1.z.array(FormatCategorySchema).optional().describe("Inline visual formatting (axes, legend, labels, lineStyles, etc.)"),
        dataColors: zod_1.z.array(DataColorSchema).optional().describe("Inline data point colors"),
    });
    server.tool("add_visual", `Add one or more visuals to a page with optional inline formatting. Supports single mode (use top-level params) or batch mode (use 'visuals' array). Inline containerFormat, visualFormat, and dataColors eliminate the need for separate format_visual/set_datapoint_colors calls. IMPORTANT chart naming (Power BI convention): 'columnChart'=stacked column (use Series bucket for stack breakdown), 'barChart'=stacked bar (use Series bucket for stack breakdown), 'clusteredColumnChart'=clustered column, 'clusteredBarChart'=clustered bar, 'hundredPercentStackedColumnChart'=100% stacked column, 'hundredPercentStackedBarChart'=100% stacked bar. Visual types: ${Object.keys(pbir_js_1.VISUAL_BUCKETS).join(", ")}.`, {
        pageId: zod_1.z.string().describe("The page ID to add the visual(s) to"),
        // --- Single mode params (used when 'visuals' is not provided) ---
        visualType: zod_1.z.string().optional().describe("Visual type for single mode"),
        x: zod_1.z.number().optional().default(0),
        y: zod_1.z.number().optional().default(0),
        width: zod_1.z.number().optional().default(280),
        height: zod_1.z.number().optional().default(280),
        bindings: zod_1.z.array(BucketBindingSchema).optional(),
        autoFilters: zod_1.z.boolean().optional().default(true),
        slicerMode: zod_1.z.enum(["Basic", "Dropdown"]).optional(),
        shapeType: zod_1.z.enum(["rectangle", "rectangleRounded", "line", "tabCutCorner", "tabCutTopCorners", "tabRoundCorner", "tabRoundTopCorners"]).optional(),
        shapeRotation: zod_1.z.number().optional().default(0),
        textContent: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
        containerFormat: zod_1.z.array(FormatCategorySchema).optional().describe("Inline container formatting"),
        visualFormat: zod_1.z.array(FormatCategorySchema).optional().describe("Inline visual formatting"),
        dataColors: zod_1.z.array(DataColorSchema).optional().describe("Inline data point colors"),
        // --- Batch mode ---
        visuals: zod_1.z.array(VisualSpecSchema).optional().describe("Array of visuals to add (batch mode). When provided, top-level visual params are ignored."),
    }, async (params) => {
        const { pageId } = params;
        // Determine starting z-order
        const existingVisuals = project.listVisualIds(pageId);
        let maxZ = 0;
        for (const vid of existingVisuals) {
            const v = project.getVisual(pageId, vid);
            if (v.position.z > maxZ)
                maxZ = v.position.z;
        }
        // Build list of visual specs
        let specs;
        if (params.visuals && params.visuals.length > 0) {
            specs = params.visuals;
        }
        else if (params.visualType) {
            specs = [{
                    visualType: params.visualType,
                    x: params.x, y: params.y, width: params.width, height: params.height,
                    bindings: params.bindings,
                    autoFilters: params.autoFilters,
                    slicerMode: params.slicerMode,
                    shapeType: params.shapeType,
                    shapeRotation: params.shapeRotation,
                    textContent: params.textContent,
                    title: params.title,
                    containerFormat: params.containerFormat,
                    visualFormat: params.visualFormat,
                    dataColors: params.dataColors,
                }];
        }
        else {
            return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Provide either 'visualType' (single) or 'visuals' array (batch)" }) }] };
        }
        const results = [];
        for (let i = 0; i < specs.length; i++) {
            const result = createAndSaveVisual(project, pageId, specs[i], maxZ + (i + 1) * 1000);
            results.push(result);
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({ success: true, pageId, created: results }, null, 2),
                }],
        };
    });
    // ============================================================
    // TOOL: delete_visual
    // ============================================================
    server.tool("delete_visual", "Delete a visual from a page", {
        pageId: zod_1.z.string().describe("The page ID"),
        visualId: zod_1.z.string().describe("The visual ID to delete"),
    }, async ({ pageId, visualId }) => {
        project.deleteVisual(pageId, visualId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deletedVisualId: visualId }) }] };
    });
    // ============================================================
    // TOOL: move_visual
    // ============================================================
    server.tool("move_visual", "Move and/or resize a visual on a page", {
        pageId: zod_1.z.string().describe("The page ID"),
        visualId: zod_1.z.string().describe("The visual ID"),
        x: zod_1.z.number().optional().describe("New X position"),
        y: zod_1.z.number().optional().describe("New Y position"),
        width: zod_1.z.number().optional().describe("New width"),
        height: zod_1.z.number().optional().describe("New height"),
        z: zod_1.z.number().optional().describe("New z-order (layer)"),
    }, async ({ pageId, visualId, x, y, width, height, z }) => {
        const visual = project.getVisual(pageId, visualId);
        if (x !== undefined)
            visual.position.x = x;
        if (y !== undefined)
            visual.position.y = y;
        if (width !== undefined)
            visual.position.width = width;
        if (height !== undefined)
            visual.position.height = height;
        if (z !== undefined) {
            visual.position.z = z;
            visual.position.tabOrder = z;
        }
        project.saveVisual(pageId, visualId, visual);
        return {
            content: [{ type: "text", text: JSON.stringify({ success: true, position: visual.position }) }],
        };
    });
    // ============================================================
    // TOOL: update_visual_bindings
    // ============================================================
    server.tool("update_visual_bindings", "Update the data bindings of an existing visual. Replaces the query state entirely.", {
        pageId: zod_1.z.string().describe("The page ID"),
        visualId: zod_1.z.string().describe("The visual ID"),
        bindings: zod_1.z.array(BucketBindingSchema).describe("New data bindings"),
        autoFilters: zod_1.z.boolean().optional().default(true),
    }, async ({ pageId, visualId, bindings, autoFilters }) => {
        const visual = project.getVisual(pageId, visualId);
        const vType = visual.visual.visualType;
        const queryState = {};
        for (const binding of bindings) {
            // Remap "Fields" to the correct bucket name for the visual type
            let bucketName = binding.bucket;
            if (bucketName === "Fields") {
                const validBuckets = pbir_js_1.VISUAL_BUCKETS[vType];
                if (validBuckets && validBuckets.length > 0 && !validBuckets.includes("Fields")) {
                    bucketName = validBuckets[0];
                }
            }
            const projections = binding.fields.map((fieldSpec, i) => {
                const field = parseFieldSpec(fieldSpec);
                const isFirst = i === 0 && (bucketName === "Category" || (vType === "slicer" && bucketName === "Values"));
                return {
                    field,
                    queryRef: (0, pbir_js_1.buildQueryRef)(field),
                    nativeQueryRef: (0, pbir_js_1.buildNativeQueryRef)(field),
                    ...(isFirst ? { active: true } : {}),
                };
            });
            queryState[bucketName] = { projections };
        }
        if (!visual.visual.query) {
            visual.visual.query = { queryState };
        }
        else {
            visual.visual.query.queryState = queryState;
        }
        // Rebuild sort from Category
        if (queryState.Category?.projections?.[0]) {
            visual.visual.query.sortDefinition = {
                sort: [
                    {
                        field: JSON.parse(JSON.stringify(queryState.Category.projections[0].field)),
                        direction: "Ascending",
                    },
                ],
                isDefaultSort: true,
            };
        }
        else if (vType === "slicer" && queryState.Values?.projections?.[0]) {
            // Rebuild sort for slicers from Values bucket
            visual.visual.query.sortDefinition = {
                sort: [
                    {
                        field: JSON.parse(JSON.stringify(queryState.Values.projections[0].field)),
                        direction: "Ascending",
                    },
                ],
            };
        }
        else {
            // Clear stale sort definition if no relevant bucket exists
            if (visual.visual.query.sortDefinition) {
                delete visual.visual.query.sortDefinition;
            }
        }
        if (autoFilters) {
            visual.filterConfig = { filters: (0, pbir_js_1.buildAutoFilters)(queryState) };
        }
        project.saveVisual(pageId, visualId, visual);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, visualId }) }] };
    });
    // ============================================================
    // TOOL: change_visual_type
    // ============================================================
    server.tool("change_visual_type", "Change the visual type of an existing visual (e.g. barChart to columnChart) while keeping data bindings", {
        pageId: zod_1.z.string().describe("The page ID"),
        visualId: zod_1.z.string().describe("The visual ID"),
        visualType: zod_1.z.string().describe("The new visual type"),
    }, async ({ pageId, visualId, visualType }) => {
        const visual = project.getVisual(pageId, visualId);
        visual.visual.visualType = visualType;
        project.saveVisual(pageId, visualId, visual);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, visualId, visualType }) }] };
    });
    // ============================================================
    // TOOL: get_report_settings
    // ============================================================
    server.tool("get_report_settings", "Get the report-level settings and theme configuration", {}, async () => {
        const report = project.getReport();
        return { content: [{ type: "text", text: JSON.stringify(report, null, 2) }] };
    });
    // ============================================================
    // TOOL: update_report_settings
    // ============================================================
    server.tool("update_report_settings", "Update report-level settings (merges with existing settings)", {
        settings: zod_1.z
            .record(zod_1.z.string(), zod_1.z.unknown())
            .describe("Settings key-value pairs to merge into report.settings"),
    }, async ({ settings }) => {
        const report = project.getReport();
        report.settings = { ...report.settings, ...settings };
        project.saveReport(report);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, settings: report.settings }) }] };
    });
    // ============================================================
    // TOOL: get_visual_types
    // ============================================================
    server.tool("get_visual_types", "Get a list of available visual types and their data role buckets", {}, async () => {
        return { content: [{ type: "text", text: JSON.stringify(pbir_js_1.VISUAL_BUCKETS, null, 2) }] };
    });
    // ============================================================
    // TOOL: duplicate_visual
    // ============================================================
    server.tool("duplicate_visual", "Duplicate an existing visual, optionally to a different page or position", {
        pageId: zod_1.z.string().describe("Source page ID"),
        visualId: zod_1.z.string().describe("Visual ID to duplicate"),
        targetPageId: zod_1.z.string().optional().describe("Target page ID (defaults to same page)"),
        offsetX: zod_1.z.number().optional().default(20).describe("X offset for the duplicate"),
        offsetY: zod_1.z.number().optional().default(20).describe("Y offset for the duplicate"),
    }, async ({ pageId, visualId, targetPageId, offsetX, offsetY }) => {
        const original = project.getVisual(pageId, visualId);
        const newId = (0, pbir_js_1.generateId)();
        const target = targetPageId || pageId;
        const duplicate = JSON.parse(JSON.stringify(original));
        duplicate.name = newId;
        duplicate.position.x += offsetX;
        duplicate.position.y += offsetY;
        duplicate.position.z += 1000;
        duplicate.position.tabOrder += 1000;
        // Regenerate filter IDs
        if (duplicate.filterConfig?.filters) {
            for (const f of duplicate.filterConfig.filters) {
                f.name = (0, pbir_js_1.generateId)();
            }
        }
        project.saveVisual(target, newId, duplicate);
        return {
            content: [
                { type: "text", text: JSON.stringify({ success: true, newVisualId: newId, targetPageId: target }) },
            ],
        };
    });
    // ============================================================
    // TOOL: set_visual_title
    // ============================================================
    server.tool("set_visual_title", "Set or update the title of a visual. Can set text, visibility, font, size, alignment.", {
        pageId: zod_1.z.string().describe("The page ID"),
        visualId: zod_1.z.string().describe("The visual ID"),
        title: zod_1.z.string().optional().describe("The title text to display"),
        show: zod_1.z.boolean().optional().describe("Whether to show the title (default true)"),
        fontSize: zod_1.z.number().optional().describe("Font size (e.g. 8, 12, 14)"),
        fontFamily: zod_1.z.string().optional().describe("Font family (e.g. \"'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif\")"),
        alignment: zod_1.z.enum(["left", "center", "right"]).optional().describe("Title alignment"),
        titleWrap: zod_1.z.boolean().optional().describe("Whether to wrap the title text"),
    }, async ({ pageId, visualId, title, show, fontSize, fontFamily, alignment, titleWrap }) => {
        const visual = project.getVisual(pageId, visualId);
        if (!visual.visual.visualContainerObjects) {
            visual.visual.visualContainerObjects = {};
        }
        const titleProps = {};
        if (title !== undefined) {
            titleProps.text = { expr: { Literal: { Value: `'${title}'` } } };
        }
        if (show !== undefined) {
            titleProps.show = { expr: { Literal: { Value: show ? "true" : "false" } } };
        }
        if (fontSize !== undefined) {
            titleProps.fontSize = { expr: { Literal: { Value: `${fontSize}D` } } };
        }
        if (fontFamily !== undefined) {
            titleProps.fontFamily = { expr: { Literal: { Value: `'${fontFamily}'` } } };
        }
        if (alignment !== undefined) {
            titleProps.alignment = { expr: { Literal: { Value: `'${alignment}'` } } };
        }
        if (titleWrap !== undefined) {
            titleProps.titleWrap = { expr: { Literal: { Value: titleWrap ? "true" : "false" } } };
        }
        // Merge with existing title properties in visual.visualContainerObjects
        const existing = visual.visual.visualContainerObjects.title;
        if (Array.isArray(existing) && existing.length > 0) {
            const existingProps = existing[0].properties || {};
            existing[0].properties = { ...existingProps, ...titleProps };
        }
        else {
            visual.visual.visualContainerObjects.title = [{ properties: titleProps }];
        }
        project.saveVisual(pageId, visualId, visual);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, pageId, visualId, title, show }) }] };
    });
    // ============================================================
    // TOOL: format_visual
    // ============================================================
    server.tool("format_visual", `Format visual properties. target='visual' for axes/legend/labels/lineStyles/etc. target='container' for title/background/border/padding/dropShadow/visualHeader. Colors starting with # auto-wrap. Numbers use D suffix.`, {
        pageId: zod_1.z.string().describe("The page ID"),
        visualId: zod_1.z.string().describe("The visual ID"),
        formatting: zod_1.z
            .array(FormatCategorySchema)
            .describe("Array of formatting categories and their properties to set"),
        target: zod_1.z
            .enum(["visual", "container"])
            .optional()
            .default("visual")
            .describe("'visual' sets visual.objects, 'container' sets visual.visualContainerObjects"),
    }, async ({ pageId, visualId, formatting, target }) => {
        const visual = project.getVisual(pageId, visualId);
        const targetObj = target === "container"
            ? (visual.visual.visualContainerObjects ??= {})
            : (visual.visual.objects ??= {});
        applyFormattingToTarget(targetObj, formatting);
        project.saveVisual(pageId, visualId, visual);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({ success: true, pageId, visualId, formatted: formatting.map((f) => f.category) }),
                }],
        };
    });
    // ============================================================
    // TOOL: set_datapoint_colors
    // ============================================================
    server.tool("set_datapoint_colors", "Set data point colors for specific series/measures in a visual.", {
        pageId: zod_1.z.string().describe("The page ID"),
        visualId: zod_1.z.string().describe("The visual ID"),
        colors: zod_1.z.array(DataColorSchema).describe("Array of color assignments for data points"),
        defaultTransparency: zod_1.z.number().optional().describe("Default transparency for all data points (0-100)"),
    }, async ({ pageId, visualId, colors, defaultTransparency }) => {
        const visual = project.getVisual(pageId, visualId);
        applyDataColors(visual, colors, defaultTransparency);
        project.saveVisual(pageId, visualId, visual);
        return {
            content: [{ type: "text", text: JSON.stringify({ success: true, pageId, visualId, colorCount: colors.length }) }],
        };
    });
    // ============================================================
    // TOOL: update_page_size
    // ============================================================
    server.tool("update_page_size", "Update the page dimensions", {
        pageId: zod_1.z.string().describe("The page ID"),
        width: zod_1.z.number().optional().describe("New width"),
        height: zod_1.z.number().optional().describe("New height"),
        displayOption: zod_1.z.enum(["FitToPage", "FitToWidth", "ActualSize"]).optional(),
    }, async ({ pageId, width, height, displayOption }) => {
        const page = project.getPage(pageId);
        if (width !== undefined)
            page.width = width;
        if (height !== undefined)
            page.height = height;
        if (displayOption !== undefined)
            page.displayOption = displayOption;
        project.savePage(pageId, page);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, pageId, width: page.width, height: page.height }) }] };
    });
    // ============================================================
    // TOOL: auto_layout
    // ============================================================
    server.tool("auto_layout", "Automatically arrange all visuals on a page in a grid layout", {
        pageId: zod_1.z.string().describe("The page ID"),
        columns: zod_1.z.number().optional().default(3).describe("Number of columns in the grid"),
        padding: zod_1.z.number().optional().default(10).describe("Padding between visuals"),
        marginTop: zod_1.z.number().optional().default(10).describe("Top margin"),
        marginLeft: zod_1.z.number().optional().default(10).describe("Left margin"),
    }, async ({ pageId, columns, padding, marginTop, marginLeft }) => {
        const page = project.getPage(pageId);
        const visualIds = project.listVisualIds(pageId);
        if (visualIds.length === 0) {
            return { content: [{ type: "text", text: JSON.stringify({ success: true, message: "No visuals to layout" }) }] };
        }
        const availableWidth = page.width - marginLeft * 2;
        const availableHeight = page.height - marginTop * 2;
        const rows = Math.ceil(visualIds.length / columns);
        const cellWidth = (availableWidth - padding * (columns - 1)) / columns;
        const cellHeight = (availableHeight - padding * (rows - 1)) / rows;
        let zOrder = 0;
        visualIds.forEach((vid, i) => {
            const row = Math.floor(i / columns);
            const col = i % columns;
            const visual = project.getVisual(pageId, vid);
            visual.position.x = marginLeft + col * (cellWidth + padding);
            visual.position.y = marginTop + row * (cellHeight + padding);
            visual.position.width = cellWidth;
            visual.position.height = cellHeight;
            visual.position.z = zOrder;
            visual.position.tabOrder = zOrder;
            zOrder += 1000;
            project.saveVisual(pageId, vid, visual);
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        layout: { columns, rows, cellWidth, cellHeight, visualCount: visualIds.length },
                    }),
                },
            ],
        };
    });
    // ============================================================
    // TOOL: duplicate_page
    // ============================================================
    server.tool("duplicate_page", "Duplicate an entire page with all its visuals to a new page", {
        pageId: zod_1.z.string().describe("The source page ID to duplicate"),
        displayName: zod_1.z.string().optional().describe("Display name for the new page (defaults to 'Copy of <original>')"),
    }, async ({ pageId, displayName }) => {
        const sourcePage = project.getPage(pageId);
        const newPageId = (0, pbir_js_1.generateId)();
        const newPage = {
            ...JSON.parse(JSON.stringify(sourcePage)),
            name: newPageId,
            displayName: displayName || `Copy of ${sourcePage.displayName}`,
        };
        project.savePage(newPageId, newPage);
        // Add to page order
        const meta = project.getPagesMetadata();
        meta.pageOrder.push(newPageId);
        project.savePagesMetadata(meta);
        // Duplicate all visuals
        const visualIds = project.listVisualIds(pageId);
        const newVisualIds = [];
        for (const vid of visualIds) {
            const original = project.getVisual(pageId, vid);
            const newVid = (0, pbir_js_1.generateId)();
            const duplicate = JSON.parse(JSON.stringify(original));
            duplicate.name = newVid;
            if (duplicate.filterConfig?.filters) {
                for (const f of duplicate.filterConfig.filters) {
                    f.name = (0, pbir_js_1.generateId)();
                }
            }
            project.saveVisual(newPageId, newVid, duplicate);
            newVisualIds.push(newVid);
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({ success: true, newPageId, displayName: newPage.displayName, visualCount: newVisualIds.length }),
                }],
        };
    });
    // ============================================================
    // TOOL: apply_theme
    // ============================================================
    server.tool("apply_theme", `Apply a named theme to all visuals on a page. Available themes: ${Object.keys(THEME_PRESETS).join(", ")}. Applies container formatting, and optionally data colors, to every visual on the page in one call.`, {
        pageId: zod_1.z.string().describe("The page ID"),
        theme: zod_1.z.enum(["dark", "light", "corporate", "blue-purple"]).describe("Theme preset name"),
        applyDataColors: zod_1.z.boolean().optional().default(true).describe("Whether to apply theme data colors to chart visuals"),
    }, async ({ pageId, theme, applyDataColors: applyColors }) => {
        const preset = THEME_PRESETS[theme];
        if (!preset) {
            return { content: [{ type: "text", text: JSON.stringify({ success: false, error: `Unknown theme: ${theme}` }) }] };
        }
        const visualIds = project.listVisualIds(pageId);
        const chartTypes = new Set(["barChart", "clusteredBarChart", "hundredPercentStackedBarChart", "columnChart", "clusteredColumnChart", "hundredPercentStackedColumnChart", "lineChart", "areaChart", "stackedAreaChart", "hundredPercentStackedAreaChart", "lineClusteredColumnComboChart", "lineStackedColumnComboChart", "ribbonChart", "waterfallChart", "scatterChart", "pieChart", "donutChart", "treemap", "funnel"]);
        let formatted = 0;
        for (const vid of visualIds) {
            const visual = project.getVisual(pageId, vid);
            const vType = visual.visual.visualType;
            // Skip textbox/shape — they have their own styling
            if (vType === "textbox" || vType === "shape" || vType === "basicShape" || vType === "image")
                continue;
            // Use slicer-specific formatting if available
            const containerFmt = (vType === "slicer" && preset.slicerContainerFormat)
                ? preset.slicerContainerFormat
                : preset.containerFormat;
            if (!visual.visual.visualContainerObjects)
                visual.visual.visualContainerObjects = {};
            applyFormattingToTarget(visual.visual.visualContainerObjects, containerFmt);
            // Apply chart-specific visual formatting if available
            if (preset.chartVisualFormat && chartTypes.has(vType)) {
                if (!visual.visual.objects)
                    visual.visual.objects = {};
                applyFormattingToTarget(visual.visual.objects, preset.chartVisualFormat);
            }
            // Apply data colors to charts
            if (applyColors && preset.dataColors && chartTypes.has(vType)) {
                const colors = preset.dataColors.map(c => ({ color: c }));
                applyDataColors(visual, colors);
            }
            project.saveVisual(pageId, vid, visual);
            formatted++;
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({ success: true, pageId, theme, visualsFormatted: formatted }),
                }],
        };
    });
    // ============================================================
    // TOOL: reload_report
    // ============================================================
    server.tool("reload_report", "Reload the report in Power BI Desktop by closing and reopening the .pbip file. Use this after making changes to see them in Power BI Desktop.", {}, async () => {
        if (!reportPath) {
            return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "No report connected. Use set_report first." }) }] };
        }
        // Find the .pbip file in the parent directory of the report
        const parentDir = path.dirname(reportPath);
        const pbipFiles = fs.readdirSync(parentDir).filter((f) => f.endsWith(".pbip"));
        if (pbipFiles.length === 0) {
            return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "No .pbip file found" }) }] };
        }
        const pbipPath = path.join(parentDir, pbipFiles[0]);
        try {
            // Kill Power BI Desktop gracefully
            try {
                (0, child_process_1.execSync)('taskkill /IM "PBIDesktop.exe" /F', { stdio: "ignore" });
            }
            catch {
                // PBI Desktop might not be running, that's fine
            }
            // Wait a moment for the process to fully exit
            (0, child_process_1.execSync)("ping -n 3 127.0.0.1 >nul", { stdio: "ignore" });
            // Reopen the .pbip file
            (0, child_process_1.execSync)(`start "" "${pbipPath}"`, { shell: "cmd.exe", stdio: "ignore" });
            return {
                content: [
                    { type: "text", text: JSON.stringify({ success: true, message: `Reopening ${pbipFiles[0]} in Power BI Desktop` }) },
                ],
            };
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return { content: [{ type: "text", text: JSON.stringify({ success: false, error: msg }) }] };
        }
    });
    // ============================================================
    // Start server
    // ============================================================
    const transport = new stdio_js_1.StdioServerTransport();
    console.error(`Power BI Report MCP Server starting...`);
    console.error(`Report path: ${reportPath || "none (use set_report to connect)"}`);
    console.error(`Version: 0.2.1`);
    await server.connect(transport);
}
// --- PBIR instructions resource ---
const PBIR_INSTRUCTIONS = `# Power BI Report (PBIR) Format Guide

You are working with Power BI reports in the PBIR (Power BI Report) format — a folder-based JSON structure.

## Report Structure
\`\`\`
{Name}.Report/
├── definition/
│   ├── report.json          # Report settings, themes, visual styles
│   ├── version.json         # Format version
│   └── pages/
│       ├── pages.json       # Page order and active page
│       └── {pageId}/
│           ├── page.json    # Page display name, size, options
│           └── visuals/
│               └── {visualId}/
│                   └── visual.json  # Visual type, position, data bindings, filters
├── definition.pbir          # Reference to the semantic model
└── StaticResources/         # Themes and static assets
\`\`\`

## Visual Types — Power BI Naming Convention
Power BI uses non-obvious names for column/bar charts. Always use the correct visualType:

| What you want | visualType to use |
|---|---|
| Stacked column chart | columnChart |
| Clustered column chart | clusteredColumnChart |
| 100% stacked column chart | hundredPercentStackedColumnChart |
| Stacked bar chart (horizontal) | barChart |
| Clustered bar chart (horizontal) | clusteredBarChart |
| 100% stacked bar chart (horizontal) | hundredPercentStackedBarChart |

Other common types: lineChart, areaChart, stackedAreaChart, pieChart, donutChart, scatterChart,
lineClusteredColumnComboChart, lineStackedColumnComboChart, ribbonChart, waterfallChart,
pivotTable, tableEx, card, cardVisual, multiRowCard, kpi, gauge, slicer, treemap, map, filledMap,
decompositionTreeVisual, funnel, textbox, basicShape, image, actionButton

## Data Binding Buckets
Each visual type has specific buckets for data binding:
- Stacked/clustered charts: Category (axis), Y (values), Series (stack/legend breakdown)
- Line/area charts: Category (axis), Y (values), Y2 (secondary axis), Series (legend)
- Tables/matrix: Rows, Columns, Values
- Cards: Values
- Slicers: Values
- KPI: Indicator, TrendLine, Goal
- Scatter: Category, X, Y, Size, Series

**Series bucket** — for stacked charts (columnChart, barChart) this is the field that defines each stack segment. Always bind a dimension column (e.g. Segment, Country) to Series to get a proper stacked chart.

## Field Types
- **column**: Direct column reference (for axes, categories, slicers)
- **aggregation**: Aggregated column (Sum, Avg, Count, Min, Max, etc.)
- **measure**: DAX measure reference

## Tips
- Use auto_layout to quickly arrange visuals in a grid
- Use duplicate_visual to clone and modify existing visuals
- Visual z-order controls layering (higher z = on top)
`;
main().catch(console.error);
