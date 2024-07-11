// src/routers/contacts.js
import { Router } from "express";
import { 
    createContactController,
    deleteContactController,
    getAllContactsController,
    getContactByIdController, 
    patchContactController
} from "../controllers/contacts";
import { ctrlWrapper } from "../utils/ctrlWrapper";

const router = Router();

router.get('/contacts', ctrlWrapper(getAllContactsController));

router.get('/contacts/:contactId', ctrlWrapper(getContactByIdController));

router.post('/contacts', ctrlWrapper(createContactController));

router.patch('/contacts/:contactId', ctrlWrapper(patchContactController));

router.delete('/contacts/:contactId', ctrlWrapper(deleteContactController));

export default router;