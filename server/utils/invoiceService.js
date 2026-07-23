import Invoice from '../models/Invoice.model.js';
import Deal from '../models/Deal.model.js';
import Customer from '../models/Customer.model.js';
import Company from '../models/Company.model.js';

/**
 * Auto-generate invoice from a closed-won deal
 */
export const autoGenerateInvoiceFromDeal = async (deal, createdBy) => {
  try {
    // Check if invoice already exists for this deal
    const existingInvoice = await Invoice.findOne({ deal: deal._id });
    if (existingInvoice) {
      return existingInvoice;
    }

    // Get customer and company
    const customer = await Customer.findById(deal.customer);
    if (!customer) {
      throw new Error('Customer not found for deal');
    }

    const company = deal.company ? await Company.findById(deal.company) : null;

    // Calculate invoice items from deal products or use deal value
    let items = [];
    let subtotal = 0;
    let tax = 0;
    let discount = 0;

    if (deal.products && deal.products.length > 0) {
      items = deal.products.map(product => {
        const itemTotal = (product.unitPrice * product.quantity) - (product.discount || 0);
        subtotal += itemTotal;
        tax += (product.tax || 0);
        discount += (product.discount || 0);

        return {
          name: product.name,
          description: product.description || '',
          quantity: product.quantity,
          unitPrice: product.unitPrice,
          discount: product.discount || 0,
          tax: product.tax || 0,
          totalPrice: itemTotal + (product.tax || 0),
          productId: product.productId || null,
          metadata: product.metadata || {}
        };
      });
    } else {
      // If no products, create a single item from deal value
      items = [{
        name: deal.name,
        description: deal.description || '',
        quantity: 1,
        unitPrice: deal.value,
        discount: 0,
        tax: 0,
        totalPrice: deal.value,
        metadata: {}
      }];
      subtotal = deal.value;
    }

    const total = subtotal + tax - discount;

    // Calculate due date (default: 30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Get billing address from customer
    const billingAddress = customer.address ? {
      street: customer.address.street || '',
      city: customer.address.city || '',
      state: customer.address.state || '',
      zipCode: customer.address.zipCode || '',
      country: customer.address.country || 'United States'
    } : null;

    // Create invoice
    const invoice = new Invoice({
      deal: deal._id,
      customer: customer._id,
      company: company ? company._id : null,
      project: deal.projectId,
      items: items,
      subtotal: subtotal,
      tax: tax,
      discount: discount,
      total: total,
      currency: deal.currency || 'USD',
      status: 'draft',
      issueDate: new Date(),
      dueDate: dueDate,
      paidAmount: 0,
      remainingAmount: total,
      billingAddress: billingAddress,
      createdBy: createdBy._id || createdBy,
      updatedBy: createdBy._id || createdBy
    });

    await invoice.save();

    return invoice;
  } catch (error) {
    console.error('Error auto-generating invoice from deal:', error);
    throw error;
  }
};

