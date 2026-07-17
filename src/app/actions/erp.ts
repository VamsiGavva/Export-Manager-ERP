"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getSessionUserId } from "@/lib/auth"

export interface ActionResponse {
  success: boolean
  error?: string
  data?: any
}

// Helper to get authenticated user ID or throw
function requireUserId(): string {
  const userId = getSessionUserId()
  if (!userId) {
    throw new Error("Unauthorized. Please sign in.")
  }
  return userId
}

// ==========================================
// CITIES ACTIONS
// ==========================================
export async function getCities(): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    const cities = await prisma.city.findMany({
      where: { userId },
      include: {
        agents: true,
        shipments: true
      },
      orderBy: { name: "asc" }
    })
    return { success: true, data: cities }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function createCity(name: string, country: string): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    if (!name || !country) {
      return { success: false, error: "City name and country are required" }
    }

    const city = await prisma.city.create({
      data: {
        userId,
        name: name.trim(),
        country: country.trim()
      }
    })

    revalidatePath("/cities")
    revalidatePath("/")
    return { success: true, data: city }
  } catch (e: any) {
    if (e.code === "P2002") {
      return { success: false, error: "A city with this name already exists" }
    }
    return { success: false, error: e.message }
  }
}

export async function updateCity(id: string, name: string, country: string): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    if (!name || !country) {
      return { success: false, error: "City name and country are required" }
    }

    const city = await prisma.city.update({
      where: { id, userId },
      data: {
        name: name.trim(),
        country: country.trim()
      }
    })

    revalidatePath("/cities")
    revalidatePath("/")
    return { success: true, data: city }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function deleteCity(id: string): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    await prisma.city.delete({
      where: { id, userId }
    })

    revalidatePath("/cities")
    revalidatePath("/")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ==========================================
// AGENTS ACTIONS
// ==========================================
export async function getAgents(cityId?: string): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    const agents = await prisma.agent.findMany({
      where: {
        userId,
        ...(cityId ? { cityId } : {})
      },
      include: {
        city: true,
        shipments: true,
        statements: true
      },
      orderBy: { name: "asc" }
    })
    return { success: true, data: agents }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function createAgent(data: {
  cityId: string
  name: string
  phone?: string
  email?: string
  address?: string
  commissionType: string
  commissionValue: number
}): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    if (!data.cityId || !data.name || !data.commissionType || data.commissionValue === undefined) {
      return { success: false, error: "Missing required fields" }
    }

    const agent = await prisma.agent.create({
      data: {
        userId,
        cityId: data.cityId,
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        commissionType: data.commissionType,
        commissionValue: Number(data.commissionValue)
      }
    })

    revalidatePath("/agents")
    revalidatePath("/")
    return { success: true, data: agent }
  } catch (e: any) {
    if (e.code === "P2002") {
      return { success: false, error: "An agent with this name already exists" }
    }
    return { success: false, error: e.message }
  }
}

export async function updateAgent(
  id: string,
  data: {
    cityId: string
    name: string
    phone?: string
    email?: string
    address?: string
    commissionType: string
    commissionValue: number
  }
): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    const agent = await prisma.agent.update({
      where: { id, userId },
      data: {
        cityId: data.cityId,
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        commissionType: data.commissionType,
        commissionValue: Number(data.commissionValue)
      }
    })

    revalidatePath("/agents")
    revalidatePath("/")
    return { success: true, data: agent }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function deleteAgent(id: string): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    await prisma.agent.delete({
      where: { id, userId }
    })

    revalidatePath("/agents")
    revalidatePath("/")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ==========================================
// SHIPMENTS ACTIONS
// ==========================================
export async function getShipments(): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    const shipments = await prisma.shipment.findMany({
      where: { userId },
      include: {
        city: true,
        agent: true,
        sale: true
      },
      orderBy: { createdAt: "desc" }
    })
    return { success: true, data: shipments }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function createShipment(data: {
  shipmentNo: string
  cityId: string
  agentId: string
  product: string
  purchasePrice: number
  labourPrice: number
  bags: number
  lorryCharges: number
  otherCharges: number
}): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    if (
      !data.shipmentNo ||
      !data.cityId ||
      !data.agentId ||
      !data.product ||
      data.purchasePrice === undefined ||
      data.labourPrice === undefined ||
      !data.bags
    ) {
      return { success: false, error: "Missing required fields" }
    }

    const totalInvestment =
      data.purchasePrice * data.bags +
      data.labourPrice * data.bags +
      (data.lorryCharges || 0) +
      (data.otherCharges || 0)

    const breakEvenPrice = totalInvestment / data.bags

    const shipment = await prisma.shipment.create({
      data: {
        userId,
        shipmentNo: data.shipmentNo.toUpperCase().trim(),
        cityId: data.cityId,
        agentId: data.agentId,
        product: data.product.trim(),
        purchasePrice: Number(data.purchasePrice),
        labourPrice: Number(data.labourPrice),
        bags: Number(data.bags),
        lorryCharges: Number(data.lorryCharges || 0),
        otherCharges: Number(data.otherCharges || 0),
        totalInvestment,
        breakEvenPrice,
        status: "Waiting for Sale"
      }
    })

    revalidatePath("/shipments")
    revalidatePath("/agent-sales")
    revalidatePath("/")
    return { success: true, data: shipment }
  } catch (e: any) {
    if (e.code === "P2002") {
      return { success: false, error: "A shipment with this number already exists" }
    }
    return { success: false, error: e.message }
  }
}

export async function deleteShipment(id: string): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    await prisma.shipment.delete({
      where: { id, userId }
    })

    revalidatePath("/shipments")
    revalidatePath("/agent-sales")
    revalidatePath("/")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ==========================================
// SALES ACTIONS
// ==========================================
export async function recordSale(data: {
  shipmentId: string
  sellingPrice: number
  bagsSold: number
}): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    if (!data.shipmentId || !data.sellingPrice || !data.bagsSold) {
      return { success: false, error: "Missing required fields" }
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: data.shipmentId, userId },
      include: { agent: true }
    })

    if (!shipment) {
      return { success: false, error: "Shipment not found" }
    }

    if (shipment.status === "Sold") {
      return { success: false, error: "This shipment has already been sold" }
    }

    const saleAmount = data.sellingPrice * data.bagsSold

    // Calculate commission
    let commission = 0
    const agent = shipment.agent
    if (agent.commissionType === "Percentage") {
      commission = saleAmount * (agent.commissionValue / 100)
    } else if (agent.commissionType === "Fixed") {
      commission = agent.commissionValue
    } else if (agent.commissionType === "PerBag") {
      commission = agent.commissionValue * data.bagsSold
    }

    const netSale = saleAmount - commission
    const profit = netSale - shipment.totalInvestment

    // Run within a transaction: Create Sale, Update Shipment Status, and Add Statement Debit
    const result = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          userId,
          shipmentId: data.shipmentId,
          sellingPrice: Number(data.sellingPrice),
          bagsSold: Number(data.bagsSold),
          saleAmount,
          commission,
          netSale,
          profit
        }
      })

      await tx.shipment.update({
        where: { id: data.shipmentId, userId },
        data: { status: "Sold" }
      })

      // Fetch running balance before logging this debit
      const lastStatement = await tx.statement.findFirst({
        where: { agentId: shipment.agentId, userId },
        orderBy: { transactionDate: "desc" }
      })
      const previousBalance = lastStatement ? lastStatement.runningBalance : 0
      const runningBalance = previousBalance + netSale // Debits increase the balance

      await tx.statement.create({
        data: {
          userId,
          agentId: shipment.agentId,
          shipmentId: shipment.id,
          transactionType: "Shipment",
          description: `Sold ${shipment.product} - Inv #${shipment.shipmentNo}`,
          debit: netSale,
          credit: 0,
          runningBalance
        }
      })

      return newSale
    })

    revalidatePath("/shipments")
    revalidatePath("/agent-sales")
    revalidatePath("/statements")
    revalidatePath("/reports")
    revalidatePath("/")

    return { success: true, data: result }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function deleteSale(id: string): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    const sale = await prisma.sale.findUnique({
      where: { id, userId },
      include: { shipment: true }
    })

    if (!sale) {
      return { success: false, error: "Sale not found" }
    }

    await prisma.$transaction(async (tx) => {
      // Delete corresponding statement entries linked to this shipment
      await tx.statement.deleteMany({
        where: { shipmentId: sale.shipmentId, agentId: sale.shipment.agentId, userId }
      })

      // Delete the sale record
      await tx.sale.delete({
        where: { id, userId }
      })

      // Re-mark shipment as waiting
      await tx.shipment.update({
        where: { id: sale.shipmentId, userId },
        data: { status: "Waiting for Sale" }
      })

      // Re-calculate running balances for this agent
      const statements = await tx.statement.findMany({
        where: { agentId: sale.shipment.agentId, userId },
        orderBy: { transactionDate: "asc" }
      })

      let balance = 0
      for (const statement of statements) {
        if (statement.transactionType === "Shipment") {
          balance += statement.debit
        } else {
          balance -= statement.credit
        }
        await tx.statement.update({
          where: { id: statement.id, userId },
          data: { runningBalance: balance }
        })
      }
    })

    revalidatePath("/shipments")
    revalidatePath("/agent-sales")
    revalidatePath("/statements")
    revalidatePath("/reports")
    revalidatePath("/")

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ==========================================
// STATEMENT & PAYMENT ACTIONS
// ==========================================
export async function getLedgerHistory(agentId: string): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    if (!agentId) return { success: false, error: "Agent ID is required" }

    const statements = await prisma.statement.findMany({
      where: { agentId, userId },
      orderBy: { transactionDate: "asc" }
    })

    return { success: true, data: statements }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function recordPayment(data: {
  agentId: string
  amount: number
  paymentDate: string
  paymentMode: string
  referenceNo?: string
  remarks?: string
}): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    if (!data.agentId || !data.amount || !data.paymentDate || !data.paymentMode) {
      return { success: false, error: "Missing required fields" }
    }

    const result = await prisma.$transaction(async (tx) => {
      const lastStatement = await tx.statement.findFirst({
        where: { agentId: data.agentId, userId },
        orderBy: { transactionDate: "desc" }
      })

      const previousBalance = lastStatement ? lastStatement.runningBalance : 0
      const creditAmount = Number(data.amount)
      const runningBalance = previousBalance - creditAmount // Credits reduce the outstanding balance

      const description = `Payment Received [${data.paymentMode}] ${
        data.referenceNo ? `- Ref: ${data.referenceNo}` : ""
      } ${data.remarks ? `(${data.remarks})` : ""}`

      return await tx.statement.create({
        data: {
          userId,
          agentId: data.agentId,
          transactionType: "Payment",
          description,
          debit: 0,
          credit: creditAmount,
          runningBalance,
          transactionDate: new Date(data.paymentDate)
        }
      })
    })

    revalidatePath("/statements")
    revalidatePath("/reports")
    revalidatePath("/")

    return { success: true, data: result }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function deleteStatementTransaction(id: string): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    const statement = await prisma.statement.findUnique({
      where: { id, userId }
    })

    if (!statement) {
      return { success: false, error: "Transaction record not found" }
    }

    // Handled differently: if it is linked to a shipment sale, we require deleting the sale itself
    if (statement.transactionType === "Shipment") {
      return {
        success: false,
        error: "This record is tied to a Shipment Sale. Please delete the Sale from the 'Agent Sales' page instead."
      }
    }

    await prisma.$transaction(async (tx) => {
      // Delete payment transaction
      await tx.statement.delete({
        where: { id, userId }
      })

      // Re-calculate running balances for this agent
      const statements = await tx.statement.findMany({
        where: { agentId: statement.agentId, userId },
        orderBy: { transactionDate: "asc" }
      })

      let balance = 0
      for (const st of statements) {
        if (st.transactionType === "Shipment") {
          balance += st.debit
        } else {
          balance -= st.credit
        }
        await tx.statement.update({
          where: { id: st.id, userId },
          data: { runningBalance: balance }
        })
      }
    })

    revalidatePath("/statements")
    revalidatePath("/reports")
    revalidatePath("/")

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ==========================================
// REPORTS ACTIONS
// ==========================================
export async function getReportsData(): Promise<ActionResponse> {
  try {
    const userId = requireUserId()
    const shipments = await prisma.shipment.findMany({
      where: { userId },
      include: {
        city: true,
        agent: true,
        sale: true
      },
      orderBy: { createdAt: "desc" }
    })

    const statements = await prisma.statement.findMany({
      where: { userId },
      include: { agent: true },
      orderBy: { transactionDate: "desc" }
    })

    return {
      success: true,
      data: {
        shipments,
        statements
      }
    }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ==========================================
// DASHBOARD ACTIONS
// ==========================================
export async function getDashboardData(): Promise<ActionResponse> {
  try {
    const userId = requireUserId()

    // 1. Core aggregates
    const totalShipments = await prisma.shipment.count({ where: { userId } })

    const shipments = await prisma.shipment.findMany({
      where: { userId },
      include: { sale: true }
    })

    const totalInvestment = shipments.reduce((sum, s) => sum + s.totalInvestment, 0)
    const totalSales = shipments.reduce((sum, s) => sum + (s.sale?.netSale || 0), 0)
    const totalProfit = shipments.reduce((sum, s) => sum + (s.sale?.profit || 0), 0)

    // Outstanding vs Advances
    // We group balances per agent
    const agents = await prisma.agent.findMany({
      where: { userId },
      include: {
        statements: {
          orderBy: { transactionDate: "desc" },
          take: 1
        }
      }
    })

    let pendingAmount = 0
    let advanceAmount = 0

    agents.forEach((agent) => {
      const balance = agent.statements[0]?.runningBalance || 0
      if (balance > 0) {
        pendingAmount += balance
      } else if (balance < 0) {
        advanceAmount += Math.abs(balance)
      }
    })

    // Recent Shipments (limit 5)
    const recentShipments = await prisma.shipment.findMany({
      where: { userId },
      include: { city: true, agent: true, sale: true },
      orderBy: { createdAt: "desc" },
      take: 5
    })

    // Profit trends (grouping by date)
    const sales = await prisma.sale.findMany({
      where: { userId },
      orderBy: { soldAt: "asc" }
    })

    const profitGraphData = sales.map((sale) => ({
      date: new Date(sale.soldAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      profit: sale.profit,
      sales: sale.netSale
    }))

    // City performance (Group investments / profits)
    const citiesList = await prisma.city.findMany({
      where: { userId },
      include: {
        shipments: {
          include: { sale: true }
        }
      }
    })

    const cityPerformance = citiesList.map((city) => {
      const investment = city.shipments.reduce((sum, s) => sum + s.totalInvestment, 0)
      const profit = city.shipments.reduce((sum, s) => sum + (s.sale?.profit || 0), 0)
      return {
        name: city.name,
        investment,
        profit
      }
    })

    // Agent performance (Group outstanding vs advance)
    const agentPerformance = agents.map((agent) => {
      const balance = agent.statements[0]?.runningBalance || 0
      return {
        name: agent.name,
        balance
      }
    })

    return {
      success: true,
      data: {
        summary: {
          totalShipments,
          totalInvestment,
          totalSales,
          totalProfit,
          pendingAmount,
          advanceAmount
        },
        recentShipments,
        profitGraphData,
        cityPerformance,
        agentPerformance
      }
    }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ==========================================
// SEED MOCK DATA & MAINTENANCE
// ==========================================
export async function seedMockData(): Promise<ActionResponse> {
  try {
    const userId = requireUserId()

    // Verify if there are existing cities or agents for this user
    const cityCount = await prisma.city.count({ where: { userId } })
    if (cityCount > 0) {
      return { success: false, error: "Database already contains data for this user. Clear database first." }
    }

    // Step 1: Create Cities
    const mumbai = await prisma.city.create({ data: { userId, name: "Mumbai", country: "India" } })
    const delhi = await prisma.city.create({ data: { userId, name: "Delhi", country: "India" } })
    const ahmedabad = await prisma.city.create({ data: { userId, name: "Ahmedabad", country: "India" } })

    // Step 2: Create Agents
    const rawat = await prisma.agent.create({
      data: {
        userId,
        cityId: mumbai.id,
        name: "Rawat & Sons Corp",
        email: "rawat@mumbai.com",
        phone: "+91 98765 43210",
        address: "APMC Market-II, Vashi, Navi Mumbai",
        commissionType: "Percentage",
        commissionValue: 5.0 // 5%
      }
    })

    const patel = await prisma.agent.create({
      data: {
        userId,
        cityId: ahmedabad.id,
        name: "Patel Agro Corp",
        email: "contact@patelagro.com",
        phone: "+91 76543 21098",
        address: "Grain Market, Kalupur, Ahmedabad",
        commissionType: "PerBag",
        commissionValue: 20.0 // ₹20 Per Bag
      }
    })

    const goyal = await prisma.agent.create({
      data: {
        userId,
        cityId: delhi.id,
        name: "Goyal Traders Ltd",
        email: "goyal@delhi.com",
        phone: "+91 87654 32109",
        address: "Naya Bazar, Old Delhi",
        commissionType: "Fixed",
        commissionValue: 8000.0 // ₹8000 Flat Commission
      }
    })

    // Step 3: Create Shipments & Sales inside transactions
    // Shipment 1: Mumbai (Rawat) - Sold
    const shp1 = await prisma.shipment.create({
      data: {
        userId,
        shipmentNo: "SHP2026001",
        cityId: mumbai.id,
        agentId: rawat.id,
        product: "Premium Basmati Rice",
        purchasePrice: 1200,
        labourPrice: 40,
        bags: 500,
        lorryCharges: 35000,
        otherCharges: 5000,
        totalInvestment: 1200 * 500 + 40 * 500 + 35000 + 5000, // 660,000
        breakEvenPrice: 1320,
        status: "Sold"
      }
    })

    const saleAmount1 = 1500 * 500 // 750,000
    const commission1 = saleAmount1 * 0.05 // 37,500
    const netSale1 = saleAmount1 - commission1 // 712,500
    const profit1 = netSale1 - shp1.totalInvestment // 52,500

    await prisma.sale.create({
      data: {
        userId,
        shipmentId: shp1.id,
        sellingPrice: 1500,
        bagsSold: 500,
        saleAmount: saleAmount1,
        commission: commission1,
        netSale: netSale1,
        profit: profit1,
        soldAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    })

    await prisma.statement.create({
      data: {
        userId,
        agentId: rawat.id,
        shipmentId: shp1.id,
        transactionType: "Shipment",
        description: `Sold Premium Basmati Rice - Inv #SHP2026001`,
        debit: netSale1,
        credit: 0,
        runningBalance: netSale1,
        transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    })

    // Shipment 2: Ahmedabad (Patel) - Sold
    const shp2 = await prisma.shipment.create({
      data: {
        userId,
        shipmentNo: "SHP2026002",
        cityId: ahmedabad.id,
        agentId: patel.id,
        product: "Groundnut Kernels",
        purchasePrice: 950,
        labourPrice: 30,
        bags: 800,
        lorryCharges: 42000,
        otherCharges: 8000,
        totalInvestment: 950 * 800 + 30 * 800 + 42000 + 8000, // 834,000
        breakEvenPrice: 1042.5,
        status: "Sold"
      }
    })

    const saleAmount2 = 1100 * 800 // 880,000
    const commission2 = 20 * 800 // 16,000
    const netSale2 = saleAmount2 - commission2 // 864,000
    const profit2 = netSale2 - shp2.totalInvestment // 30,000

    await prisma.sale.create({
      data: {
        userId,
        shipmentId: shp2.id,
        sellingPrice: 1100,
        bagsSold: 800,
        saleAmount: saleAmount2,
        commission: commission2,
        netSale: netSale2,
        profit: profit2,
        soldAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    })

    await prisma.statement.create({
      data: {
        userId,
        agentId: patel.id,
        shipmentId: shp2.id,
        transactionType: "Shipment",
        description: `Sold Groundnut Kernels - Inv #SHP2026002`,
        debit: netSale2,
        credit: 0,
        runningBalance: netSale2,
        transactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    })

    // Shipment 3: Delhi (Goyal) - Waiting
    await prisma.shipment.create({
      data: {
        userId,
        shipmentNo: "SHP2026003",
        cityId: delhi.id,
        agentId: goyal.id,
        product: "Organic Soybean Bags",
        purchasePrice: 1100,
        labourPrice: 35,
        bags: 600,
        lorryCharges: 29000,
        otherCharges: 4000,
        totalInvestment: 1100 * 600 + 35 * 600 + 29000 + 4000, // 714,000
        breakEvenPrice: 1190,
        status: "Waiting for Sale"
      }
    })

    // Step 4: Record manual credits to statement history (Payment Logs)
    // Rawat pays ₹500,000
    await prisma.statement.create({
      data: {
        userId,
        agentId: rawat.id,
        transactionType: "Payment",
        description: "Payment Received [Bank Transfer] - Ref: UTR987349283",
        debit: 0,
        credit: 500000,
        runningBalance: netSale1 - 500000, // 212,500
        transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    })

    // Patel pays ₹900,000 (creates an advance balance of -₹36,000!)
    await prisma.statement.create({
      data: {
        userId,
        agentId: patel.id,
        transactionType: "Payment",
        description: "Payment Received [Cheque] - Ref: CHQ554019",
        debit: 0,
        credit: 900000,
        runningBalance: netSale2 - 900000, // -36,000
        transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    })

    revalidatePath("/")
    revalidatePath("/cities")
    revalidatePath("/agents")
    revalidatePath("/shipments")
    revalidatePath("/agent-sales")
    revalidatePath("/statements")
    revalidatePath("/reports")

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function resetDatabase(): Promise<ActionResponse> {
  try {
    const userId = requireUserId()

    // Delete only this user's records to preserve multi-tenant isolation!
    await prisma.statement.deleteMany({ where: { userId } })
    await prisma.sale.deleteMany({ where: { userId } })
    await prisma.shipment.deleteMany({ where: { userId } })
    await prisma.agent.deleteMany({ where: { userId } })
    await prisma.city.deleteMany({ where: { userId } })

    revalidatePath("/")
    revalidatePath("/cities")
    revalidatePath("/agents")
    revalidatePath("/shipments")
    revalidatePath("/agent-sales")
    revalidatePath("/statements")
    revalidatePath("/reports")

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
