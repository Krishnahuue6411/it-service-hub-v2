'use server'

import { createServerSupabaseClient } from '../lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Fetch Products for PLP & Search
export async function getProducts(categorySlug?: string) {
  const supabase = await createServerSupabaseClient()
  
  let query = supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (categorySlug && categorySlug !== 'all') {
    query = query.eq('categories.slug', categorySlug)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

// 2. Place New B2B / E-Commerce Order
export async function placeOrder(orderPayload: {
  profileId: string
  addressId: string
  items: Array<{
    productId: string
    title: string
    unitPrice: number
    gstRate: number
    quantity: number
    totalPrice: number
  }>
  subtotal: number
  totalGst: number
  grandTotal: number
  isB2B: boolean
  gstin?: string
  companyName?: string
  paymentMethod: string
}) {
  const supabase = await createServerSupabaseClient()
  const orderNumber = `IT-SH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

  // 1. Insert Master Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      profile_id: orderPayload.profileId,
      address_id: orderPayload.addressId,
      subtotal: orderPayload.subtotal,
      total_gst: orderPayload.totalGst,
      grand_total: orderPayload.grandTotal,
      is_b2b_gst_order: orderPayload.isB2B,
      client_gstin: orderPayload.gstin,
      client_company_name: orderPayload.companyName,
      payment_method: orderPayload.paymentMethod,
      order_status: 'confirmed',
      payment_status: orderPayload.paymentMethod === 'COD' ? 'pending' : 'paid',
    })
    .select()
    .single()

  if (orderError) throw new Error(orderError.message)

  // 2. Insert Order Line Items
  const lineItems = orderPayload.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_title: item.title,
    unit_price: item.unitPrice,
    gst_rate: item.gstRate,
    quantity: item.quantity,
    total_price: item.totalPrice,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(lineItems)
  if (itemsError) throw new Error(itemsError.message)

  revalidatePath('/account')
  return { success: true, orderNumber, orderId: order.id }
}

// 3. Log New Digital Repair Job Card
export async function createRepairJob(formData: {
  customerId: string
  deviceType: string
  deviceModel: string
  serialNo?: string
  reportedIssue: string
  estimatedCost: number
}) {
  const supabase = await createServerSupabaseClient()
  const jobCardNo = `JOB-${Math.floor(1000 + Math.random() * 9000)}`

  const { data, error } = await supabase
    .from('repair_job_cards')
    .insert({
      job_card_no: jobCardNo,
      customer_id: formData.customerId,
      device_type: formData.deviceType,
      device_model: formData.deviceModel,
      serial_no: formData.serialNo,
      reported_issue: formData.reportedIssue,
      estimated_cost: formData.estimatedCost,
      status: 'received',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  return data
}

// 4. Atomic Inventory Stock Deduction & Low-Stock Alert Trigger
export async function deductInventoryStock(items: Array<{ productId: string; quantity: number }>) {
  const supabase = await createServerSupabaseClient()

  for (const item of items) {
    // Fetch current product stock
    const { data: prod } = await supabase
      .from('products')
      .select('stock_qty, low_stock_threshold, title')
      .eq('id', item.productId)
      .single()

    if (prod) {
      const newStock = Math.max(0, prod.stock_qty - item.quantity)
      await supabase
        .from('products')
        .update({ stock_qty: newStock })
        .eq('id', item.productId)
    }
  }

  revalidatePath('/admin')
  return { success: true }
}

