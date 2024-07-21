// src/routers/contacts.js
import { Router } from "express";
import { 
    createContactController,
    deleteContactController,
    getAllContactsController,
    getContactByIdController, 
    patchContactController
} from "../controllers/contacts.js";
import { validateBody } from "../middlewares/validateBody.js";
import { createContactSchema } from "../validation/contacts.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.get('/', ctrlWrapper(getAllContactsController));

router.get('/:contactId', isValidId, ctrlWrapper(getContactByIdController));

router.post('/', validateBody(createContactSchema), ctrlWrapper(createContactController));

router.patch('/:contactId', isValidId, validateBody(createContactSchema), ctrlWrapper(patchContactController));

router.delete('/:contactId' ,isValidId, ctrlWrapper(deleteContactController));

export default router;