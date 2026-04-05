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
exports.PbirProject = exports.VISUAL_BUCKETS = exports.AggregationFunction = void 0;
exports.generateId = generateId;
exports.columnRef = columnRef;
exports.aggregationRef = aggregationRef;
exports.measureRef = measureRef;
exports.buildQueryRef = buildQueryRef;
exports.buildNativeQueryRef = buildNativeQueryRef;
exports.buildAutoFilters = buildAutoFilters;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
// --- ID generation ---
function generateId() {
    return crypto.randomBytes(10).toString("hex"); // 20 hex chars like PBI uses
}
// --- Aggregation function mapping ---
exports.AggregationFunction = {
    Sum: 0,
    Avg: 1,
    Count: 2,
    Min: 3,
    Max: 4,
    CountNonNull: 5,
    Median: 6,
    StandardDeviation: 7,
    Variance: 8,
};
// --- Visual type buckets mapping ---
// Maps visualType to their expected data role buckets
exports.VISUAL_BUCKETS = {
    barChart: ["Category", "Y", "Series", "Gradient"],
    clusteredBarChart: ["Category", "Y", "Series", "Gradient"],
    hundredPercentStackedBarChart: ["Category", "Y", "Series"],
    columnChart: ["Category", "Y", "Series", "Gradient"],
    clusteredColumnChart: ["Category", "Y", "Series", "Gradient"],
    hundredPercentStackedColumnChart: ["Category", "Y", "Series"],
    lineChart: ["Category", "Y", "Y2", "Series"],
    areaChart: ["Category", "Y", "Y2", "Series"],
    stackedAreaChart: ["Category", "Y", "Series"],
    hundredPercentStackedAreaChart: ["Category", "Y", "Series"],
    lineClusteredColumnComboChart: ["Category", "Y", "Y2", "Series"],
    lineStackedColumnComboChart: ["Category", "Y", "Y2", "Series"],
    ribbonChart: ["Category", "Y", "Series"],
    waterfallChart: ["Category", "Y", "Breakdown"],
    scatterChart: ["Category", "X", "Y", "Size", "Series"],
    pieChart: ["Category", "Y", "Series"],
    donutChart: ["Category", "Y", "Series"],
    treemap: ["Group", "Values", "Details"],
    map: ["Category", "Size", "Series"],
    filledMap: ["Location", "Legend", "Values"],
    pivotTable: ["Rows", "Columns", "Values"],
    tableEx: ["Values"],
    card: ["Values"],
    cardVisual: ["Data", "Rows"],
    multiRowCard: ["Values"],
    kpi: ["Indicator", "TrendLine", "Goal"],
    gauge: ["Y", "MinValue", "MaxValue", "TargetValue"],
    decompositionTreeVisual: ["Analyze", "ExplainBy"],
    slicer: ["Values"],
    listSlicer: ["Values"],
    textSlicer: ["Values"],
    advancedSlicerVisual: ["Values"],
    funnel: ["Category", "Y"],
    textbox: [],
    basicShape: [],
    shape: [],
    image: [],
    actionButton: [],
};
// --- PBIR path helpers ---
class PbirProject {
    reportPath;
    constructor(reportPath) {
        this.reportPath = reportPath;
    }
    get definitionPath() {
        return path.join(this.reportPath, "definition");
    }
    get reportJsonPath() {
        return path.join(this.definitionPath, "report.json");
    }
    get pagesPath() {
        return path.join(this.definitionPath, "pages");
    }
    get pagesJsonPath() {
        return path.join(this.pagesPath, "pages.json");
    }
    get versionJsonPath() {
        return path.join(this.definitionPath, "version.json");
    }
    pagePath(pageId) {
        return path.join(this.pagesPath, pageId);
    }
    pageJsonPath(pageId) {
        return path.join(this.pagePath(pageId), "page.json");
    }
    visualsPath(pageId) {
        return path.join(this.pagePath(pageId), "visuals");
    }
    visualPath(pageId, visualId) {
        return path.join(this.visualsPath(pageId), visualId);
    }
    visualJsonPath(pageId, visualId) {
        return path.join(this.visualPath(pageId, visualId), "visual.json");
    }
    // --- Read operations ---
    readJson(filePath) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    writeJson(filePath, data) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
    getReport() {
        return this.readJson(this.reportJsonPath);
    }
    getPagesMetadata() {
        return this.readJson(this.pagesJsonPath);
    }
    getPage(pageId) {
        return this.readJson(this.pageJsonPath(pageId));
    }
    getVisual(pageId, visualId) {
        return this.readJson(this.visualJsonPath(pageId, visualId));
    }
    listPageIds() {
        return this.getPagesMetadata().pageOrder;
    }
    listVisualIds(pageId) {
        const visualsDir = this.visualsPath(pageId);
        if (!fs.existsSync(visualsDir))
            return [];
        return fs
            .readdirSync(visualsDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
    }
    // --- Write operations ---
    savePagesMetadata(meta) {
        this.writeJson(this.pagesJsonPath, meta);
    }
    savePage(pageId, page) {
        this.writeJson(this.pageJsonPath(pageId), page);
    }
    saveVisual(pageId, visualId, visual) {
        this.writeJson(this.visualJsonPath(pageId, visualId), visual);
    }
    saveReport(report) {
        this.writeJson(this.reportJsonPath, report);
    }
    deletePage(pageId) {
        fs.rmSync(this.pagePath(pageId), { recursive: true, force: true });
    }
    deleteVisual(pageId, visualId) {
        fs.rmSync(this.visualPath(pageId, visualId), {
            recursive: true,
            force: true,
        });
    }
}
exports.PbirProject = PbirProject;
// --- Field reference builders ---
function columnRef(entity, property) {
    return {
        Column: {
            Expression: { SourceRef: { Entity: entity } },
            Property: property,
        },
    };
}
function aggregationRef(entity, property, func = 0) {
    return {
        Aggregation: {
            Expression: {
                Column: {
                    Expression: { SourceRef: { Entity: entity } },
                    Property: property,
                },
            },
            Function: func,
        },
    };
}
function measureRef(entity, property) {
    return {
        Measure: {
            Expression: { SourceRef: { Entity: entity } },
            Property: property,
        },
    };
}
// Build a queryRef string from a field
function buildQueryRef(field) {
    if (field.Column) {
        return `${field.Column.Expression.SourceRef.Entity}.${field.Column.Property}`;
    }
    if (field.Aggregation) {
        const funcName = Object.entries(exports.AggregationFunction).find(([, v]) => v === field.Aggregation.Function)?.[0] || "Sum";
        const col = field.Aggregation.Expression.Column;
        return `${funcName}(${col.Expression.SourceRef.Entity}.${col.Property})`;
    }
    if (field.Measure) {
        return `${field.Measure.Expression.SourceRef.Entity}.${field.Measure.Property}`;
    }
    return "";
}
// Build a nativeQueryRef (display name) from a field
function buildNativeQueryRef(field) {
    if (field.Column) {
        return field.Column.Property;
    }
    if (field.Aggregation) {
        const funcName = Object.entries(exports.AggregationFunction).find(([, v]) => v === field.Aggregation.Function)?.[0] || "Sum";
        return `${funcName} of ${field.Aggregation.Expression.Column.Property}`;
    }
    if (field.Measure) {
        return field.Measure.Property;
    }
    return "";
}
// Build auto-filters for a visual based on its field bindings
function buildAutoFilters(queryState) {
    const filters = [];
    for (const bucket of Object.values(queryState)) {
        for (const proj of bucket.projections) {
            const filterType = proj.field.Aggregation ? "Advanced" : "Categorical";
            filters.push({
                name: generateId(),
                field: JSON.parse(JSON.stringify(proj.field)),
                type: filterType,
            });
        }
    }
    return filters;
}
