/**
 * Active (sellable) batch stock helpers.
 * Active = non-expired batches with quantity > 0, consumed FEFO at purchase time.
 */

const getActiveStock = async (executor, productId) => {
    const queryFn = executor.query ? executor.query.bind(executor) : executor;
    const result = await queryFn(
        `
        SELECT COALESCE(SUM(quantity), 0) AS active_stock
        FROM product_batches
        WHERE product_id = $1
          AND quantity > 0
          AND (expiration_date IS NULL OR expiration_date >= CURRENT_DATE)
        `,
        [productId]
    );
    return Number.parseFloat(result.rows[0]?.active_stock ?? 0);
};

const syncProductStock = async (executor, productId) => {
    const queryFn = executor.query ? executor.query.bind(executor) : executor;
    await queryFn(
        `
        UPDATE products
        SET stock_quantity = (
            SELECT COALESCE(SUM(quantity), 0)
            FROM product_batches
            WHERE product_id = $1
              AND quantity > 0
              AND (expiration_date IS NULL OR expiration_date >= CURRENT_DATE)
        ),
        last_restocked = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [productId]
    );
};

const deductActiveStockFEFO = async (executor, productId, quantity) => {
    const queryFn = executor.query ? executor.query.bind(executor) : executor;
    const requestedQty = Number(quantity);

    if (!Number.isInteger(requestedQty) || requestedQty <= 0) {
        throw new Error('Invalid quantity');
    }

    const batchesRes = await queryFn(
        `
        SELECT id, quantity
        FROM product_batches
        WHERE product_id = $1
          AND quantity > 0
          AND (expiration_date IS NULL OR expiration_date >= CURRENT_DATE)
        ORDER BY
            CASE WHEN expiration_date IS NULL THEN 1 ELSE 0 END,
            expiration_date ASC,
            received_at ASC
        FOR UPDATE
        `,
        [productId]
    );

    let remaining = requestedQty;
    const allocations = [];

    for (const batch of batchesRes.rows) {
        if (remaining <= 0) break;

        const batchQty = Number.parseFloat(batch.quantity);
        const take = Math.min(remaining, batchQty);
        if (take <= 0) continue;

        const newQty = batchQty - take;
        await queryFn('UPDATE product_batches SET quantity = $1 WHERE id = $2', [newQty, batch.id]);

        allocations.push({ batchId: batch.id, quantity: take });
        remaining -= take;
    }

    if (remaining > 0) {
        throw new Error(`Insufficient active stock for product ${productId}`);
    }

    return allocations;
};

const saveOrderDetailAllocations = async (executor, orderDetailId, allocations) => {
    const queryFn = executor.query ? executor.query.bind(executor) : executor;

    for (const allocation of allocations) {
        await queryFn(
            `
            INSERT INTO order_detail_allocations (order_detail_id, batch_id, quantity)
            VALUES ($1, $2, $3)
            `,
            [orderDetailId, allocation.batchId, allocation.quantity]
        );
    }
};

const restoreOrderStock = async (executor, orderId) => {
    const queryFn = executor.query ? executor.query.bind(executor) : executor;

    const itemsRes = await queryFn(
        `
        SELECT od.id, od.product_id, od.quantity
        FROM order_details od
        WHERE od.order_id = $1
        `,
        [orderId]
    );

    const syncedProducts = new Set();

    for (const item of itemsRes.rows) {
        const allocRes = await queryFn(
            `
            SELECT batch_id, quantity
            FROM order_detail_allocations
            WHERE order_detail_id = $1
            `,
            [item.id]
        );

        if (allocRes.rows.length > 0) {
            for (const allocation of allocRes.rows) {
                const batchCheck = await queryFn(
                    'SELECT id FROM product_batches WHERE id = $1',
                    [allocation.batch_id]
                );

                if (batchCheck.rows.length > 0) {
                    await queryFn(
                        'UPDATE product_batches SET quantity = quantity + $1 WHERE id = $2',
                        [allocation.quantity, allocation.batch_id]
                    );
                } else {
                    await queryFn(
                        `
                        INSERT INTO product_batches (product_id, quantity, notes)
                        VALUES ($1, $2, $3)
                        `,
                        [item.product_id, allocation.quantity, `Restored from cancelled order #${orderId}`]
                    );
                }
            }
        } else {
            // Legacy orders placed before batch allocations existed.
            await queryFn(
                `
                INSERT INTO product_batches (product_id, quantity, notes)
                VALUES ($1, $2, $3)
                `,
                [item.product_id, item.quantity, `Restored from cancelled order #${orderId}`]
            );
        }

        syncedProducts.add(item.product_id);
    }

    for (const productId of syncedProducts) {
        await syncProductStock(executor, productId);
    }
};

module.exports = {
    getActiveStock,
    syncProductStock,
    deductActiveStockFEFO,
    saveOrderDetailAllocations,
    restoreOrderStock
};
