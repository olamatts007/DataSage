// ─────────────────────────────────────────────────────────────────────────────
// Invoice-first workflow helpers — pure functions, no UI.
// Invoices are the MSME's daily sales action; finalising one posts the
// corresponding income into the ledger, grouped per VAT treatment so the
// VAT engine stays exact (a single tx can only carry one treatment).
// ─────────────────────────────────────────────────────────────────────────────

import { Invoice, Transaction, VatTreatment } from './types'
import { uid } from './format'
import { NTA2025 } from './rules'

export interface InvoiceTotals { subtotal: number; vat: number; total: number }

export function invoiceTotals(inv: Invoice): InvoiceTotals {
  const line = (qty: number, price: number) => Math.round(qty * price * 100) / 100
  const subtotal = inv.items.reduce((s, it) => s + line(it.qty, it.unitPrice), 0)
  const vat = inv.vatApplied
    ? inv.items.reduce((s, it) => s + (it.vat === 'standard' ? line(it.qty, it.unitPrice) * NTA2025.vat.rate : 0), 0)
    : 0
  const r = (n: number) => Math.round(n * 100) / 100
  return { subtotal: r(subtotal), vat: r(vat), total: r(subtotal + vat) }
}

export function nextInvoiceNumber(invoices: Invoice[], year: number): string {
  const seq = invoices.filter((i) => i.number.startsWith(`INV-${year}-`)).length + 1
  const n = `INV-${year}-${String(seq).padStart(4, '0')}`
  // absolute guard against collisions after deletions
  return invoices.some((i) => i.number === n) ? `${n}A` : n
}

/** ledger entries for a finalised invoice — one income tx per VAT-treatment group */
export function invoiceLedgerEntries(inv: Invoice): Transaction[] {
  const groups = new Map<VatTreatment, number>()
  for (const it of inv.items) {
    groups.set(it.vat, (groups.get(it.vat) ?? 0) + Math.round(it.qty * it.unitPrice * 100) / 100)
  }
  const entries: Transaction[] = []
  for (const [vat, amount] of groups) {
    if (amount <= 0) continue
    entries.push({
      id: uid(),
      date: inv.issuedAt,
      type: 'income',
      category: inv.items[0]?.description.toLowerCase().includes('service') ? 'General services rendered' : 'Product / goods sales',
      description: `Invoice ${inv.number} — ${inv.customerName}${groups.size > 1 ? ` (${vat.replace('_', '-')} lines)` : ''}`,
      amount: Math.round(amount * 100) / 100,
      vat,
      whtRate: 0,
      partyName: inv.customerName,
      partyHasTIN: !!inv.customerTin.trim(),
      nonDeductible: false,
      isDisposal: false,
      costBasis: 0,
      whtCertReceived: false,
    })
  }
  return entries
}

export function invoiceWhatsAppText(inv: Invoice, businessName: string): string {
  const t = invoiceTotals(inv)
  const lines = [
    `*Invoice ${inv.number}* — ${businessName}`,
    `Customer: ${inv.customerName}`,
    `Amount due: ₦${t.total.toLocaleString('en-NG')}${inv.vatApplied ? ' (incl. 7.5% VAT)' : ''}`,
    inv.dueAt ? `Due date: ${inv.dueAt}` : `Due: on receipt`,
    `Items: ${inv.items.length}`,
  ]
  if (inv.notes.trim()) lines.push(`Note: ${inv.notes}`)
  lines.push('— Generated with TaxSage · tax compliance for Nigerian MSMEs')
  return lines.join('\n')
}

export function invoiceWhatsAppLink(inv: Invoice, businessName: string): string {
  return `https://wa.me/?text=${encodeURIComponent(invoiceWhatsAppText(inv, businessName))}`
}
