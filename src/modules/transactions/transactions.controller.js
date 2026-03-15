const service = require('./transactions.service');
const { listTransactionsSchema } = require('./transactions.validation');

async function getTransactions(req, res, next) {
  try {
    const filters = listTransactionsSchema.parse(req.query);
    const result = await service.getTransactions(req.user.id, filters);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function getTransaction(req, res, next) {
  try {
    const transaction = await service.getTransactionById(req.params.id, req.user.id);
    res.json({ success: true, data: transaction });
  } catch (err) { next(err); }
}

async function createTransaction(req, res, next) {
  try {
    const transaction = await service.createTransaction(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Transacción creada', data: transaction });
  } catch (err) { next(err); }
}

async function updateTransaction(req, res, next) {
  try {
    const transaction = await service.updateTransaction(req.params.id, req.user.id, req.body);
    res.json({ success: true, message: 'Transacción actualizada', data: transaction });
  } catch (err) { next(err); }
}

async function deleteTransaction(req, res, next) {
  try {
    await service.deleteTransaction(req.params.id, req.user.id);
    res.json({ success: true, message: 'Transacción eliminada', data: null });
  } catch (err) { next(err); }
}

module.exports = { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction };
