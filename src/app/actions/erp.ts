"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// TYPES & INTERFACES
export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// -------------------------------------------------------------
// SEED MOCK DATA HELPER
// -------------------------------------------------------------
export async function seedMockData(): Promise<ActionResponse> {
  try {
    // Check if database has data already
    const cityCount = await prisma.city.count()
    if (cityCount > 0) {
      return { success: true, error: "Database already has data." }
    }

    // 1. Create Cities
    const mumbai = await prisma.city.create({
      data: { name: "Mumbai", country: "India" }
    })
    const delhi = await prisma.city.create({
      data: { name: "Delhi", country: "India" }
    })
    const ahmedabad = await prisma.city.create({
      data: { name: "Ahmedabad", country: "India" }
    })

    // 2. Create Agents
    const abc = await prisma.agent.create({
      data: {
        name: "ABC Traders",
        cityId: mumbai.id,
        phone: "9876543210",
        email: "contact@abctraders.com",
        address: "APMC Market, Vashi, Mumbai",
        commissionType: "Percentage",
        commissionValue: 10.0 // 10%
      }
    })

    const rawat = await prisma.agent.create({
      data: {
        name: "Rawat & Sons",
        cityId: delhi.id,
        phone: "9988776655",
        email: "rawat.delhi@gmail.com",
        address: "Azadpur Mandi, Delhi",
        commissionType: "Fixed",
        commissionValue: 500.0 // ₹500 fixed
      }
    })

    const patel = await prisma.agent.create({
      data: {
        name: "Patel Agro Corp",
        cityId: ahmedabad.id,
        phone: "9123456789",
        email: "patel.agro@yahoo.com",
        address: "Kalupur Market, Ahmedabad",
        commissionType: "PerBag",
        commissionValue: 15.0 // ₹15 per bag
      }
    })

    // 3. Create Shipments, Sales & Statements
    // Shipment 1: Sold by ABC Traders
    const shp1 = await prisma.shipment.create({
      data: {
        shipmentNo: "SHP001",
        cityId: mumbai.id,
        agentId: abc.id,
        product: "Red Onions",
        purchasePrice: 1200, // per bag
        labourPrice: 50, // per bag
        bags: 300,
        lorryCharges: 25000,
        otherCharges: 5000,
        totalInvestment: (1200 * 300) + (50 * 300) + 25000 + 5000, // 360000 + 15000 + 30000 = 405,000
        breakEvenPrice: ((1200 * 300) + (50 * 300) + 25000 + 5000) / 300, // 1350
        status: "Sold"
      }
    })

    const saleAmount1 = 1600 * 300 // 480,000
    const commission1 = saleAmount1 * 0.10 // 48,000
    const netSale1 = saleAmount1 - commission1 // 432,000
    const profit1 = netSale1 - shp1.totalInvestment // 432000 - 405000 = 27,000

    await prisma.sale.create({
      data: {
        shipmentId: shp1.id,
        sellingPrice: 1600,
        bagsSold: 300,
        saleAmount: saleAmount1,
        commission: commission1,
        netSale: netSale1,
        profit: profit1,
        soldAt: new Date(new Date().setDate(new Date().getDate() - 10))
      }
    })

    // Create Statement Debit for ABC Traders
    await prisma.statement.create({
      data: {
        agentId: abc.id,
        shipmentId: shp1.id,
        transactionType: "Shipment",
        description: `Shipment SHP001 Sale (Net)`,
        debit: netSale1,
        credit: 0,
        runningBalance: netSale1, // First transaction
        transactionDate: new Date(new Date().setDate(new Date().getDate() - 10))
      }
    })

    // Payment 1 for ABC Traders (Credit)
    await prisma.statement.create({
      data: {
        agentId: abc.id,
        transactionType: "Payment",
        description: "Payment Received - Bank Transfer",
        debit: 0,
        credit: 300000,
        runningBalance: netSale1 - 300000, // 132,000
        transactionDate: new Date(new Date().setDate(new Date().getDate() - 8))
      }
    })

    // Shipment 2: Sold by ABC Traders
    const shp2 = await prisma.shipment.create({
      data: {
        shipmentNo: "SHP002",
        cityId: mumbai.id,
        agentId: abc.id,
        product: "Premium Garlic",
        purchasePrice: 2000,
        labourPrice: 80,
        bags: 200,
        lorryCharges: 20000,
        otherCharges: 4000,
        totalInvestment: (2000 * 200) + (80 * 200) + 20000 + 4000, // 400000 + 16000 + 24000 = 440,000
        breakEvenPrice: 440000 / 200, // 2200
        status: "Sold"
      }
    })

    const saleAmount2 = 2500 * 200 // 500,000
    const commission2 = saleAmount2 * 0.10 // 50,000
    const netSale2 = saleAmount2 - commission2 // 450,000
    const profit2 = netSale2 - shp2.totalInvestment // 450000 - 440000 = 10,000

    await prisma.sale.create({
      data: {
        shipmentId: shp2.id,
        sellingPrice: 2500,
        bagsSold: 200,
        saleAmount: saleAmount2,
        commission: commission2,
        netSale: netSale2,
        profit: profit2,
        soldAt: new Date(new Date().setDate(new Date().getDate() - 5))
      }
    })

    // Debit for ABC Traders
    await prisma.statement.create({
      data: {
        agentId: abc.id,
        shipmentId: shp2.id,
        transactionType: "Shipment",
        description: `Shipment SHP002 Sale (Net)`,
        debit: netSale2,
        credit: 0,
        runningBalance: (netSale1 - 300000) + netSale2, // 132000 + 450000 = 582,000
        transactionDate: new Date(new Date().setDate(new Date().getDate() - 5))
      }
    })

    // Payment 2 for ABC Traders (Credit - excess payment making a negative balance / advance)
    await prisma.statement.create({
      data: {
        agentId: abc.id,
        transactionType: "Payment",
        description: "Advance Received - Cash",
        debit: 0,
        credit: 682000,
        runningBalance: (netSale1 - 300000 + netSale2) - 682000, // 582000 - 682000 = -100,000 (Advance)
        transactionDate: new Date(new Date().setDate(new Date().getDate() - 2))
      }
    })

    // Shipment 3: Waiting for sale for Rawat & Sons
    await prisma.shipment.create({
      data: {
        shipmentNo: "SHP003",
        cityId: delhi.id,
        agentId: rawat.id,
        product: "Potatoes",
        purchasePrice: 800,
        labourPrice: 30,
        bags: 500,
        lorryCharges: 40000,
        otherCharges: 10000,
        totalInvestment: (800 * 500) + (30 * 500) + 40000 + 10000, // 400000 + 15000 + 50000 = 465,000
        breakEvenPrice: 465000 / 500, // 930
        status: "Waiting for Sale",
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1))
      }
    })

    // Shipment 4: Waiting for sale for Patel Agro Corp
    await prisma.shipment.create({
      data: {
        shipmentNo: "SHP004",
        cityId: ahmedabad.id,
        agentId: patel.id,
        product: "Green Chillies",
        purchasePrice: 1500,
        labourPrice: 60,
        bags: 250,
        lorryCharges: 18000,
        otherCharges: 2000,
        totalInvestment: (1500 * 250) + (60 * 250) + 18000 + 2000, // 375000 + 15000 + 20000 = 410,000
        breakEvenPrice: 410000 / 250, // 1640
        status: "Waiting for Sale",
        createdAt: new Date()
      }
    })

    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    console.error("Seeding error:", error)
    return { success: false, error: error.message }
  }
}

// -------------------------------------------------------------
// CITIES ACTIONS
// -------------------------------------------------------------
export async function getCities(): Promise<ActionResponse> {
  try {
    const cities = await prisma.city.findMany({
      include: {
        agents: {
          include: {
            shipments: {
              include: {
                sale: true
              }
            }
          }
        },
        shipments: {
          include: {
            sale: true
          }
        }
      }
    })

    // Map to include agent count, shipment count, and total profit calculated
    const data = cities.map(city => {
      const agentsCount = city.agents.length
      const shipmentsCount = city.shipments.length
      
      let totalProfit = 0
      city.shipments.forEach(shipment => {
        if (shipment.sale) {
          totalProfit += shipment.sale.profit
        }
      })

      return {
        id: city.id,
        name: city.name,
        country: city.country,
        agentsCount,
        shipmentsCount,
        totalProfit
      }
    })

    return { success: true, data }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function createCity(name: string, country: string): Promise<ActionResponse> {
  try {
    const city = await prisma.city.create({
      data: { name, country }
    })
    revalidatePath("/cities")
    return { success: true, data: city }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function updateCity(id: string, name: string, country: string): Promise<ActionResponse> {
  try {
    const city = await prisma.city.update({
      where: { id },
      data: { name, country }
    })
    revalidatePath("/cities")
    return { success: true, data: city }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function deleteCity(id: string): Promise<ActionResponse> {
  try {
    await prisma.city.delete({ where: { id } })
    revalidatePath("/cities")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// -------------------------------------------------------------
// AGENTS ACTIONS
// -------------------------------------------------------------
export async function getAgents(cityId?: string): Promise<ActionResponse> {
  try {
    const agents = await prisma.agent.findMany({
      where: cityId ? { cityId } : undefined,
      include: {
        city: true,
        shipments: {
          include: {
            sale: true
          }
        },
        statements: {
          orderBy: { transactionDate: 'desc' },
          take: 1
        }
      }
    })

    const data = await Promise.all(agents.map(async (agent) => {
      // Outstanding and Advance Balance are calculated from the latest statement running balance
      const latestStatement = agent.statements[0]
      const runningBalance = latestStatement ? latestStatement.runningBalance : 0

      // If running balance is positive: Agent owes us (Outstanding)
      // If running balance is negative: We owe agent (Advance Balance)
      const outstanding = runningBalance > 0 ? runningBalance : 0
      const advanceBalance = runningBalance < 0 ? Math.abs(runningBalance) : 0

      // Calculate total profit from all sold shipments of this agent
      let totalProfit = 0
      let totalSales = 0
      agent.shipments.forEach(shipment => {
        if (shipment.sale) {
          totalProfit += shipment.sale.profit
          totalSales += shipment.sale.netSale
        }
      })

      // Get total received (Credit entries in statement)
      const paymentSums = await prisma.statement.aggregate({
        where: { agentId: agent.id, transactionType: "Payment" },
        _sum: { credit: true }
      })
      const totalReceived = paymentSums._sum.credit ?? 0

      return {
        id: agent.id,
        name: agent.name,
        cityId: agent.cityId,
        cityName: agent.city.name,
        phone: agent.phone,
        email: agent.email,
        address: agent.address,
        commissionType: agent.commissionType,
        commissionValue: agent.commissionValue,
        outstanding,
        advanceBalance,
        totalProfit,
        totalSales,
        totalReceived
      }
    }))

    return { success: true, data }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function createAgent(
  name: string,
  cityId: string,
  phone: string,
  email: string,
  address: string,
  commissionType: string,
  commissionValue: number
): Promise<ActionResponse> {
  try {
    const agent = await prisma.agent.create({
      data: {
        name,
        cityId,
        phone,
        email,
        address,
        commissionType,
        commissionValue
      }
    })
    revalidatePath("/agents")
    return { success: true, data: agent }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function updateAgent(
  id: string,
  name: string,
  cityId: string,
  phone: string,
  email: string,
  address: string,
  commissionType: string,
  commissionValue: number
): Promise<ActionResponse> {
  try {
    const agent = await prisma.agent.update({
      where: { id },
      data: {
        name,
        cityId,
        phone,
        email,
        address,
        commissionType,
        commissionValue
      }
    })
    revalidatePath("/agents")
    return { success: true, data: agent }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function deleteAgent(id: string): Promise<ActionResponse> {
  try {
    await prisma.agent.delete({ where: { id } })
    revalidatePath("/agents")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// -------------------------------------------------------------
// SHIPMENTS ACTIONS
// -------------------------------------------------------------
export async function getShipments(): Promise<ActionResponse> {
  try {
    const shipments = await prisma.shipment.findMany({
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
    // Automatically calculate totals
    const totalInvestment =
      (data.purchasePrice * data.bags) +
      (data.labourPrice * data.bags) +
      data.lorryCharges +
      data.otherCharges

    const breakEvenPrice = totalInvestment / data.bags

    const shipment = await prisma.shipment.create({
      data: {
        shipmentNo: data.shipmentNo,
        cityId: data.cityId,
        agentId: data.agentId,
        product: data.product,
        purchasePrice: data.purchasePrice,
        labourPrice: data.labourPrice,
        bags: data.bags,
        lorryCharges: data.lorryCharges,
        otherCharges: data.otherCharges,
        totalInvestment,
        breakEvenPrice,
        status: "Waiting for Sale"
      }
    })

    revalidatePath("/shipments")
    revalidatePath("/")
    return { success: true, data: shipment }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function deleteShipment(id: string): Promise<ActionResponse> {
  try {
    await prisma.shipment.delete({ where: { id } })
    revalidatePath("/shipments")
    revalidatePath("/")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// -------------------------------------------------------------
// AGENT SALES ACTIONS
// -------------------------------------------------------------
export async function recordSale(
  shipmentId: string,
  sellingPrice: number,
  bagsSold: number
): Promise<ActionResponse> {
  try {
    // 1. Fetch Shipment & Agent
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { agent: true }
    })

    if (!shipment) {
      return { success: false, error: "Shipment not found" }
    }

    if (shipment.status === "Sold") {
      return { success: false, error: "Shipment already sold" }
    }

    // 2. Perform Calculations
    const saleAmount = sellingPrice * bagsSold
    const agent = shipment.agent

    let commission = 0
    if (agent.commissionType === "Percentage") {
      commission = saleAmount * (agent.commissionValue / 100)
    } else if (agent.commissionType === "Fixed") {
      commission = agent.commissionValue
    } else if (agent.commissionType === "PerBag") {
      commission = agent.commissionValue * bagsSold
    }

    const netSale = saleAmount - commission
    const profit = netSale - shipment.totalInvestment

    // 3. Create Sale record
    const sale = await prisma.sale.create({
      data: {
        shipmentId,
        sellingPrice,
        bagsSold,
        saleAmount,
        commission,
        netSale,
        profit
      }
    })

    // 4. Update Shipment Status
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: "Sold" }
    })

    // 5. Get Latest Running Balance for the Agent
    const latestStatement = await prisma.statement.findFirst({
      where: { agentId: agent.id },
      orderBy: { transactionDate: 'desc' }
    })

    const previousBalance = latestStatement ? latestStatement.runningBalance : 0
    const newRunningBalance = previousBalance + netSale // Net Sale is the Debit

    // 6. Create Statement Debit Entry
    await prisma.statement.create({
      data: {
        agentId: agent.id,
        shipmentId: shipment.id,
        transactionType: "Shipment",
        description: `Shipment ${shipment.shipmentNo} Sale (Net)`,
        debit: netSale,
        credit: 0,
        runningBalance: newRunningBalance
      }
    })

    // 7. Revalidate
    revalidatePath("/shipments")
    revalidatePath("/agent-sales")
    revalidatePath("/statements")
    revalidatePath("/")

    return { success: true, data: sale }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// -------------------------------------------------------------
// STATEMENTS & PAYMENTS ACTIONS
// -------------------------------------------------------------
export async function getStatements(agentId: string): Promise<ActionResponse> {
  try {
    const statements = await prisma.statement.findMany({
      where: { agentId },
      orderBy: { transactionDate: 'asc' },
      include: {
        shipment: true
      }
    })

    return { success: true, data: statements }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function recordPayment(data: {
  agentId: string
  amountReceived: number
  date: string
  paymentMode: string
  referenceNumber?: string
  remarks?: string
}): Promise<ActionResponse> {
  try {
    // 1. Get Latest Running Balance for the Agent
    const latestStatement = await prisma.statement.findFirst({
      where: { agentId: data.agentId },
      orderBy: { transactionDate: 'desc' }
    })

    const previousBalance = latestStatement ? latestStatement.runningBalance : 0
    const newRunningBalance = previousBalance - data.amountReceived // Payments (Credits) reduce outstanding balance

    const description = `Payment Received via ${data.paymentMode} ${
      data.referenceNumber ? `[Ref: ${data.referenceNumber}]` : ""
    } ${data.remarks ? `(${data.remarks})` : ""}`

    // 2. Create Statement Credit Entry
    const statement = await prisma.statement.create({
      data: {
        agentId: data.agentId,
        transactionType: "Payment",
        description,
        debit: 0,
        credit: data.amountReceived,
        runningBalance: newRunningBalance,
        transactionDate: new Date(data.date)
      }
    })

    // 3. Revalidate
    revalidatePath("/statements")
    revalidatePath("/agents")
    revalidatePath("/")

    return { success: true, data: statement }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// -------------------------------------------------------------
// DASHBOARD & REPORTS METRICS
// -------------------------------------------------------------
export async function getDashboardData(): Promise<ActionResponse> {
  try {
    // Seed data if empty
    await seedMockData()

    // 1. Summary Cards
    const totalShipments = await prisma.shipment.count()
    
    const investmentAgg = await prisma.shipment.aggregate({
      _sum: { totalInvestment: true }
    })
    const totalInvestment = investmentAgg._sum.totalInvestment ?? 0

    const salesAgg = await prisma.sale.aggregate({
      _sum: { netSale: true, profit: true }
    })
    const totalSales = salesAgg._sum.netSale ?? 0
    const totalProfit = salesAgg._sum.profit ?? 0

    // Retrieve active agents to compute aggregate pending (outstanding) and advance balances
    const agentsResult = await getAgents()
    let pendingAmount = 0
    let advanceAmount = 0

    if (agentsResult.success && agentsResult.data) {
      agentsResult.data.forEach((agent: any) => {
        pendingAmount += agent.outstanding
        advanceAmount += agent.advanceBalance
      })
    }

    // 2. Recent Shipments
    const recentShipments = await prisma.shipment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        city: true,
        agent: true,
        sale: true
      }
    })

    // 3. Profit Graph Data (grouped by date)
    const sales = await prisma.sale.findMany({
      orderBy: { soldAt: 'asc' },
      include: {
        shipment: true
      }
    })

    const graphDataMap: { [dateStr: string]: { date: string; profit: number; sales: number } } = {}
    sales.forEach(sale => {
      const dateStr = new Date(sale.soldAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
      })
      if (!graphDataMap[dateStr]) {
        graphDataMap[dateStr] = { date: dateStr, profit: 0, sales: 0 }
      }
      graphDataMap[dateStr].profit += sale.profit
      graphDataMap[dateStr].sales += sale.netSale
    })
    const profitGraphData = Object.values(graphDataMap)

    // 4. City-wise Performance
    const citiesResult = await getCities()
    const cityPerformance = citiesResult.success ? citiesResult.data : []

    // 5. Agent-wise Performance
    const agentPerformance = agentsResult.success ? agentsResult.data : []

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

export async function resetDatabase(): Promise<ActionResponse> {
  try {
    await prisma.statement.deleteMany()
    await prisma.sale.deleteMany()
    await prisma.shipment.deleteMany()
    await prisma.agent.deleteMany()
    await prisma.city.deleteMany()

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

