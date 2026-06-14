import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../db/db.js";
import Customer from "../models/customers.model.js";
import Order from "../models/order.model.js";

dotenv.config();

const FIRST_NAMES = [
    "Aarav", "Aisha", "Arjun", "Diya", "Ishaan", "Kabir", "Meera",
    "Neha", "Priya", "Rahul", "Riya", "Rohan", "Saanvi", "Vikram"
];
const LAST_NAMES = [
    "Desai", "Gupta", "Iyer", "Joshi", "Kapoor", "Khan", "Mehta",
    "Patel", "Rao", "Shah", "Sharma", "Singh", "Verma"
];
const PRODUCTS = [
    { name: "Wireless Earbuds", price: 2499 },
    { name: "Smart Watch", price: 4999 },
    { name: "Laptop Stand", price: 1599 },
    { name: "Mechanical Keyboard", price: 3499 },
    { name: "USB-C Hub", price: 2199 },
    { name: "Desk Lamp", price: 1299 },
    { name: "Phone Case", price: 799 },
    { name: "Power Bank", price: 1899 }
];

const getArgument = (name, fallback) => {
    const prefix = `--${name}=`;
    const argument = process.argv.find((value) => value.startsWith(prefix));

    return argument ? argument.slice(prefix.length) : fallback;
};

const customerCount = Number.parseInt(getArgument("customers", "50"), 10);
const seedValue = Number.parseInt(getArgument("seed", "2026"), 10);

if (!Number.isInteger(customerCount) || customerCount < 1 || customerCount > 10000) {
    throw new Error("--customers must be an integer between 1 and 10000");
}

if (!Number.isInteger(seedValue)) {
    throw new Error("--seed must be an integer");
}

let randomState = seedValue >>> 0;

const random = () => {
    randomState = (randomState * 1664525 + 1013904223) >>> 0;
    return randomState / 4294967296;
};

const randomInteger = (minimum, maximum) => {
    return Math.floor(random() * (maximum - minimum + 1)) + minimum;
};

const randomItem = (items) => items[randomInteger(0, items.length - 1)];
const roundCurrency = (value) => Math.round(value * 100) / 100;

const createOrder = (customerId) => {
    const itemCount = randomInteger(1, 3);
    const items = Array.from({ length: itemCount }, () => {
        const product = randomItem(PRODUCTS);

        return {
            product: product.name,
            quantity: randomInteger(1, 3),
            unitPrice: product.price
        };
    });

    const amount = roundCurrency(
        items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    );
    const daysAgo = randomInteger(0, 365);

    return {
        customerId,
        items,
        amount,
        status: "completed",
        orderedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    };
};

const seedDatabase = async () => {
    await connectDB();

    try {
        const customers = await Customer.insertMany(
            Array.from({ length: customerCount }, () => ({
                name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
                orderCount: 0,
                totalSpent: 0,
                daysSinceLastOrder: 365,
                emailSubscribed: random() < 0.7
            }))
        );

        const orders = customers.flatMap((customer) => {
            const orderCount = randomInteger(0, 8);

            return Array.from(
                { length: orderCount },
                () => createOrder(customer._id)
            );
        });

        if (orders.length > 0) {
            await Order.insertMany(orders);
        }

        const ordersByCustomer = new Map();

        for (const order of orders) {
            const customerId = order.customerId.toString();
            const customerOrders = ordersByCustomer.get(customerId) || [];
            customerOrders.push(order);
            ordersByCustomer.set(customerId, customerOrders);
        }

        await Customer.bulkWrite(
            customers.map((customer) => {
                const customerOrders =
                    ordersByCustomer.get(customer._id.toString()) || [];
                const latestOrder = customerOrders.reduce(
                    (latest, order) =>
                        !latest || order.orderedAt > latest.orderedAt
                            ? order
                            : latest,
                    null
                );
                const daysSinceLastOrder = latestOrder
                    ? Math.floor(
                        (Date.now() - latestOrder.orderedAt.getTime()) /
                        (24 * 60 * 60 * 1000)
                    )
                    : 365;

                return {
                    updateOne: {
                        filter: { _id: customer._id },
                        update: {
                            $set: {
                                orderCount: customerOrders.length,
                                totalSpent: roundCurrency(
                                    customerOrders.reduce(
                                        (total, order) => total + order.amount,
                                        0
                                    )
                                ),
                                daysSinceLastOrder
                            }
                        }
                    }
                };
            })
        );

        console.log(
            `Seeded ${customers.length} customers and ${orders.length} orders.`
        );
    } finally {
        await mongoose.disconnect();
    }
};

seedDatabase().catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
});
