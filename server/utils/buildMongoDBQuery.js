const ALLOWED_FIELDS = new Set([
    "orderCount",
    "totalSpent",
    "daysSinceLastOrder",
    "emailSubscribed"
]);

const OPERATOR_MAP = {
    "==": "$eq",
    "!=": "$ne",
    ">": "$gt",
    "<": "$lt",
    ">=": "$gte",
    "<=": "$lte"
};

const buildMongoDBQuery = (filters = []) => {
    if (!Array.isArray(filters)) {
        throw new TypeError("Filters must be an array");
    }

    const conditions = filters.map(({ field, operator, value }) => {
        if (!ALLOWED_FIELDS.has(field)) {
            throw new Error(`Unsupported filter field: ${field}`);
        }

        const mongoOperator = OPERATOR_MAP[operator];

        if (!mongoOperator) {
            throw new Error(`Unsupported filter operator: ${operator}`);
        }

        return {
            [field]: {
                [mongoOperator]: value
            }
        };
    });

    if (conditions.length === 0) {
        return {};
    }

    return {
        $and: conditions
    };
};

export { buildMongoDBQuery };
