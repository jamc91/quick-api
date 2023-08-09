import XLSX from 'xlsx'

function parseXlsxToJSON (excel) {
  const workbook = XLSX.readFile(excel)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  const data = XLSX.utils.sheet_to_json(worksheet)

  const benefitsType = {
    'Descuento %': 'discount',
    'Descuento Adic %': 'discountAd',
    Diferido: 'deferred'
  }

  const jsonData = data.map(row => {
    const discounts = []
    const nomberOfOptions = Object.keys(row).filter(key => key.includes('Y / O')).length
    let indexOfPaymentMethod = 0
    let benefitsIndex = 0
    let plan = {}

    for (let i = 0; i <= nomberOfOptions; i++) {
      const AND = row[`Y / O_${i}`] || row['Y / O']

      if (AND === 'O') {
        indexOfPaymentMethod++
        discounts.push(plan)
        plan = {}
      } else if (AND === 'Y') {
        plan.payment = row[`Formas de pago_${indexOfPaymentMethod}`] || row['Formas de pago']
        plan.months = row[`Valores MSI_${indexOfPaymentMethod}`] || row['Valores MSI']
        const benefit = row[`Tipo de Beneficio_${benefitsIndex}`] || row['Tipo de Beneficio']
        const value = row[`Valor de Beneficio_${benefitsIndex}`] || row['Valor de Beneficio']

        plan[benefitsType[benefit]] = value

        benefitsIndex++

        if (i === nomberOfOptions - 1) {
          benefitsIndex++
          discounts.push(plan)
          plan = {}
        }
      }
    }
    const planList = discounts.map(plan => formattedPlan(plan))
    return {
      key: row.Clave || 'Sin Letra',
      section: row['Sección'],
      participate: row['Paticipa / No participa'],
      exception: row['Tipo de excepción'] || 'Sin Definir',
      description: row.Descripción || 'Sin Definir',
      plans: planList
    }
  })

  return jsonData
}

function formattedPlan (plan) {
  const { payment, months, discount, discountAd, deferred } = plan
  const discountFormatted = discount.replace('%', '')
  const discountAdFormatted = discountAd.replace('%', '')
  const monthsList = months.split(',').map(month => Number(month) || Number(1))
  const paymentMethod = payment.replace('DILISA', 'Liverpool')
  let description = ''
  if (deferred) {
    description = `Presupuesto Liverpool pague hasta ${deferred}`
  } else if (payment === 'DILISA') {
    description = months === 'No Aplica' ? `Presupuesto ${paymentMethod}` : `Meses sin intereses con Tarjetas ${paymentMethod}`
  } else {
    description = months === 'No Aplica' ? `Presupuesto ${paymentMethod}` : `Meses sin intereses con Tarjetas ${paymentMethod}`
  }

  return { description, months: monthsList, discount: Number(discountFormatted), discountAd: Number(discountAdFormatted) }
}

export { parseXlsxToJSON }
