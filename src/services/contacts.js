// src/services/contacts.js

import { SORT_ORDER } from "../constants/index.js";
import { ContactsCollection } from "../db/model/contact.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js"

export const getAllContacts = async ({
    page = 1,
    perPage = 10,
    sortOrder = SORT_ORDER.ASC,
    sortBy = '_id',
    userId,
}) => {
   const limit = perPage;
   const skip = (page - 1) * perPage;

   const contactsQuery = ContactsCollection.find({userId: userId});
   const contactsCount = await ContactsCollection.find()
   .merge(contactsQuery)
   .countDocuments();

   const contacts = await contactsQuery
   .skip(skip)
   .limit(limit)
   .sort({[sortBy]:sortOrder})
   .exec();

   const paginationData = calculatePaginationData(contactsCount, page, perPage);

   return {
    data: {
        data: contacts,
        ...paginationData,
    }
   }
};

export const getContactById = async (contactId, userId) => {
    const contact = await ContactsCollection.findOne({userId:userId, _id:contactId});
    return contact;
}

export const createContact = async (payload) => {
    const contact = await ContactsCollection.create(payload);
    return contact;
}

export const deleteContact = async (contactId, userId) => {
    const isContact = await ContactsCollection.findById(contactId);

    if (!isContact) {
        return null;
    }

    const contact = await ContactsCollection.deleteOne({
        userId:userId,
        _id:contactId,
    });
    return contact;
}

export const upsertContact = async (userId, contactId, payload, options = {}) => {
    const rawResult = await ContactsCollection.findOneAndUpdate(
        { userId:userId, _id:contactId }, 
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