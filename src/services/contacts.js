// src/services/contacts.js

import { ContactsCollection } from "../db/contact.js";

export const getAllContacts = async () => {
    const contacts = await ContactsCollection.find();
    return contacts;
};

export const getContactById = async (contactId) => {
    const contact = await ContactsCollection.findById(contactId);
    return contact;
}

export const createContact = async (payload) => {
    const contact = await ContactsCollection.create(payload);
    return contact;
}

export const deleteContact = async (contactId) => {
    const contact = await ContactsCollection.findByIdAndDelete({
        _id:contactId,
    });
    return contact;
}

export const upsertContact = async (contactId, payload, options = {}) => {
    const rawResult = await ContactsCollection.findByIdAndUpdate(
        { _id:contactId }, 
        payload,
        {
          new: true,
          includeResultMetadata: true,
          ...options,
        },
      );
    
      if (!rawResult || !rawResult.value) return null;
    
      return {
        contact: rawResult.value,
        isNew: Boolean(rawResult?.lastErrorObject?.upserted),
      };
}