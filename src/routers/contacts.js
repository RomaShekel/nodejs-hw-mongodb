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

const router = Router();

router.get('/contacts', ctrlWrapper(getAllContactsController));

router.get('/contacts/:contactId', isValidId, ctrlWrapper(getContactByIdController));

router.post('/contacts', validateBody(createContactSchema), ctrlWrapper(createContactController));

router.patch('/contacts/:contactId', isValidId, validateBody(createContactSchema), ctrlWrapper(patchContactController));

router.delete('/contacts/:contactId' ,isValidId, ctrlWrapper(deleteContactController));

export default router;