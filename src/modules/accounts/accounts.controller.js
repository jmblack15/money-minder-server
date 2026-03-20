import * as service from './accounts.service.js';

export async function getAccounts(req, res, next) {
  try {
    const accounts = await service.getAccounts(req.user.id);
    res.json({ success: true, data: accounts });
  } catch (err) { next(err); }
}

export async function getAccount(req, res, next) {
  try {
    const account = await service.getAccountById(req.params.id, req.user.id);
    res.json({ success: true, data: account });
  } catch (err) { next(err); }
}

export async function createAccount(req, res, next) {
  try {
    const account = await service.createAccount(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Cuenta creada', data: account });
  } catch (err) { next(err); }
}

export async function updateAccount(req, res, next) {
  try {
    const account = await service.updateAccount(req.params.id, req.user.id, req.body);
    res.json({ success: true, message: 'Cuenta actualizada', data: account });
  } catch (err) { next(err); }
}

export async function deleteAccount(req, res, next) {
  try {
    await service.deleteAccount(req.params.id, req.user.id);
    res.json({ success: true, message: 'Cuenta desactivada', data: null });
  } catch (err) { next(err); }
}
