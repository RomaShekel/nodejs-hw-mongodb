// src/validation/students.js
import Joi from "joi";

export const createContactSchema = Joi.object({
    name: Joi.string().min(3).max(20).required().messages({
        'string.base': 'Name should be a string',
        'string.min': 'Name should have at least {#limit} characters',
        'string.max': 'Name should have at most {#limit} characters',
        'any.required': 'Name is required!',
    }),
    email: Joi.string().email().min(3).max(20).default(null).messages({
        'string.email': 'Email should be a valid email',
        'string.min': 'Email should have at least {#limit} characters',
        'string.max': 'Email should have at most {#limit} characters',
    }),
    phoneNumber: Joi.number().integer().required().messages({
        'number.base': 'Phone number should be a number',
        'any.required': 'Phone number is required!'
    }),
    isFavourite: Joi.boolean().default(false),
    contactType: Joi.string().valid('home', 'personal', 'work').required().messages({
        'any.only': 'Contact type must be one of [home, personal, work]'
    }),
});
