import { Router } from 'express'
import productRoutes from './productRoutes'
import categoryRoutes from './categoryRoutes'
import inventoryRoutes from './inventoryRoutes'
import orderRoutes from './orderRoutes'

const router = Router()

router.use('/products', productRoutes)
router.use('/categories', categoryRoutes)
router.use('/inventory', inventoryRoutes)
router.use('/orders', orderRoutes)

export default router
